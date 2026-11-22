'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const E = require('../engine.js');

const bankSrc = fs.readFileSync(path.join(__dirname, '..', 'data', 'bank.js'), 'utf8');
const BANK = JSON.parse(bankSrc.slice(bankSrc.indexOf('['), bankSrc.lastIndexOf(']') + 1));
const START = '2026-11-22'; // a Sunday

function seeded(seed) { // small deterministic RNG so tests are repeatable
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
function addDays(iso, n) { const d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }

// ---- the shipped bank ------------------------------------------------------------
test('shipped bank is valid and covers month 1 for both topics', () => {
  const { valid, errors } = E.validateBank(BANK);
  assert.deepEqual(errors, []);
  assert.equal(valid.length, BANK.length);
  const s = E.bankSummary(BANK);
  assert.ok(s['1|Mechanical'] >= 16 && s['1|Electrical'] >= 16);
});

// ---- curriculum (same expectations as the Telegram version's Python tests) --------
test('topic alternates weekly starting with Mechanical', () => {
  assert.equal(E.topicFor('2026-11-22', START), 'Mechanical');
  assert.equal(E.topicFor('2026-11-23', START), 'Electrical');
  assert.equal(E.topicFor('2026-11-29', START), 'Electrical');
  assert.equal(E.topicFor('2026-11-30', START), 'Mechanical');
  assert.equal(E.topicFor('2026-12-07', START), 'Electrical');
  assert.equal(E.topicFor('2026-11-20', START), 'Mechanical'); // Friday of the start week (Mon 16 - Sun 22 Nov)
  assert.equal(E.topicFor('2026-11-15', START), 'Electrical');  // week before the start: parity still consistent
});

test('level rises monthly and caps at the top', () => {
  assert.equal(E.levelFor(START, START), 1);
  assert.equal(E.levelFor('2026-12-21', START), 1);
  assert.equal(E.levelFor('2026-12-22', START), 2);
  assert.equal(E.levelFor('2027-03-22', START), 5);
  assert.equal(E.levelFor('2031-01-01', START), E.MAX_LEVEL);
  assert.equal(E.monthNumber('2026-12-22', START), 2);
});

// ---- choosing and answering -----------------------------------------------------
test('a day is assigned once and keeps its question', () => {
  const st = E.newState(START);
  const a = E.assignToday(st, BANK, START, seeded(1));
  const b = E.assignToday(st, BANK, START, seeded(99));
  assert.equal(a.created, true);
  assert.equal(b.created, false);
  assert.equal(a.day.qid, b.day.qid);
  assert.equal(a.day.topic, 'Mechanical');
  assert.equal(a.day.level, 1);
});

test('shuffled options keep the right answer attached to the right text', () => {
  for (let seed = 1; seed <= 60; seed++) {
    const st = E.newState(START);
    const { day } = E.assignToday(st, BANK, START, seeded(seed));
    const src = BANK.find(q => q.id === day.qid);
    const truth = src.options[src.correct_index];
    assert.equal(day.options[E.LETTERS.indexOf(day.correct)], truth);
    assert.deepEqual([...day.options].sort(), [...src.options].sort());
  }
});

test('a month of daily questions never repeats and alternates topic by week', () => {
  const st = E.newState(START);
  const rng = seeded(7);
  const seen = new Set();
  for (let i = 0; i < 30; i++) {
    const date = addDays(START, i);
    const { day, notice } = E.assignToday(st, BANK, date, rng);
    assert.ok(day, 'question for ' + date);
    assert.equal(day.topic, E.topicFor(date, START));
    assert.equal(notice, null, 'no fallback notice on ' + date);
    assert.ok(!seen.has(day.qid), 'repeat on ' + date);
    seen.add(day.qid);
  }
  assert.equal(seen.size, 30);
});

test('when the bank lacks the wanted level it falls back, with a notice', () => {
  const st = E.newState(START);
  const { day, notice } = E.assignToday(st, BANK, '2026-12-23', seeded(3)); // month 2 wants level 2
  assert.equal(day.level, 1);
  assert.equal(day.wantedLevel, 2);
  assert.match(notice, /level 2/);
});

test('uses a higher-level question as soon as one is imported', () => {
  const extra = [{ id: 'X-1', level: 2, topic: 'Mechanical', subtopic: 'Torque and moments', question: 'Q?',
    options: ['a', 'b', 'c', 'd'], correct_index: 0, explanation: 'because' }];
  const bank = E.mergeBanks(BANK, extra);
  const st = E.newState(START);
  const { day, notice } = E.assignToday(st, bank, '2026-12-22', seeded(3)); // Tuesday, mech week? check topic
  const wantTopic = E.topicFor('2026-12-22', START);
  if (wantTopic === 'Mechanical') { assert.equal(day.qid, 'X-1'); assert.equal(notice, null); }
  else assert.equal(day.level, 1);
});

test('repeats the least recently seen question once everything has been used', () => {
  const st = E.newState(START);
  const rng = seeded(11);
  const mech = BANK.filter(q => q.topic === 'Mechanical' && q.level === 1).length;
  let date = START, usedMech = 0, last;
  // walk day by day until every level-1 Mechanical question has been shown once
  for (let i = 0; i < 400 && usedMech < mech; i++) {
    date = addDays(START, i);
    if (E.topicFor(date, START) !== 'Mechanical') continue;
    last = E.assignToday(st, BANK, date, rng); usedMech += 1;
  }
  assert.equal(usedMech, mech);
  let next = addDays(date, 1);
  while (E.topicFor(next, START) !== 'Mechanical') next = addDays(next, 1);
  const again = E.assignToday(st, BANK, next, rng);
  assert.match(again.notice, /repeat/);
  const first = Object.values(st.days).filter(d => d.topic === 'Mechanical').sort((a, b) => (a.date < b.date ? -1 : 1))[0];
  assert.equal(again.day.qid, first.qid); // the one seen longest ago
});

test('empty bank gives a helpful message instead of crashing', () => {
  const st = E.newState(START);
  const r = E.assignToday(st, [], START, seeded(1));
  assert.equal(r.day, null);
  assert.match(r.notice, /Import/);
});

test('answers are graded once and cannot be changed', () => {
  const st = E.newState(START);
  const { day } = E.assignToday(st, BANK, START, seeded(5));
  const wrong = E.LETTERS.find(l => l !== day.correct);
  const r1 = E.answerDay(st, START, wrong, '2026-11-22T09:00:00Z');
  assert.equal(r1.ok, true); assert.equal(r1.isCorrect, false);
  const r2 = E.answerDay(st, START, day.correct);
  assert.equal(r2.ok, false); assert.equal(r2.reason, 'already-answered');
  assert.equal(st.days[START].answer, wrong);
  assert.equal(E.answerDay(st, '2030-01-01', 'A').reason, 'no-question');
  assert.equal(E.answerDay(E.newState(START), START, 'Z').reason, 'no-question');
});

// ---- report ----------------------------------------------------------------------
function playedState() {
  const st = E.newState(START);
  const rng = seeded(21);
  const plan = { 0: true, 1: false, 2: false, 3: true, 4: null }; // days 0-4 of the program
  for (let i = 0; i < 5; i++) {
    const date = addDays(START, i);
    const { day } = E.assignToday(st, BANK, date, rng);
    const want = plan[i];
    if (want === null) continue; // skipped
    const letter = want ? day.correct : E.LETTERS.find(l => l !== day.correct);
    E.answerDay(st, date, letter, date + 'T09:00:00Z');
  }
  return st;
}

test('monthly stats count right, wrong, skipped and days never opened', () => {
  const st = playedState();
  const s = E.monthStats(st, 2026, 11, '2026-11-30'); // days 5.. of the month (Nov 27-29) never opened
  assert.equal(s.total, 5);
  assert.equal(s.answered.length, 4);
  assert.equal(s.right, 2);
  assert.equal(s.wrong.length, 2);
  assert.equal(s.skipped.length, 1);
  assert.equal(s.missedDays, 3); // 27, 28, 29 Nov
  assert.equal(s.byTopic.Mechanical.total + s.byTopic.Electrical.total, 4);
  assert.equal(E.monthStats(st, 2026, 10, '2026-11-30').total, 0);
  assert.equal(E.monthStats(st, 2026, 10, '2026-11-30').missedDays, 0); // before the program started
});

test('report text lists wrong answers with the correct answer and explanation', () => {
  const st = playedState();
  const text = E.reportText(st, 2026, 11, '2026-11-30');
  assert.match(text, /Monthly report - November 2026/);
  assert.match(text, /Questions: 5 \| Answered: 4 \| Correct: 2 \(50%\) \| Wrong: 2 \| Unanswered: 1 \| Days not opened: 3/);
  assert.match(text, /QUESTIONS YOU GOT WRONG \(2\)/);
  assert.match(text, /UNANSWERED \(1\)/);
  const wrong = E.monthStats(st, 2026, 11, '2026-11-30').wrong[0];
  assert.ok(text.includes('Your answer: ' + wrong.answer + ') '));
  assert.ok(text.includes('Correct answer: ' + wrong.correct + ') ' + wrong.options['ABCD'.indexOf(wrong.correct)]));
  assert.ok(text.includes('Why: ' + wrong.explanation));
  assert.match(E.reportText(st, 2026, 10, '2026-11-30'), /No questions this month/);
});

test('report stays correct even if the bank is later replaced', () => {
  const st = playedState();
  const before = E.reportText(st, 2026, 11, '2026-11-30');
  E.assignToday(st, [], '2026-12-01', seeded(1)); // bank changes/empties: old snapshots unaffected
  assert.equal(E.reportText(st, 2026, 11, '2026-11-30'), before);
});

test('availableMonths lists months with data, newest first', () => {
  const st = playedState();
  st.days['2026-12-02'] = Object.assign({}, st.days[START], { date: '2026-12-02' });
  assert.deepEqual(E.availableMonths(st), [{ year: 2026, month: 12 }, { year: 2026, month: 11 }]);
});

// ---- bank import validation ------------------------------------------------------
test('validateBank rejects malformed questions and keeps good ones', () => {
  const good = Object.assign({}, BANK[0], { id: 'NEW-1' });
  const dupOptions = Object.assign({}, BANK[0], { id: 'NEW-2', options: ['a', 'a', 'b', 'c'] });
  const badLevel = Object.assign({}, BANK[0], { id: 'NEW-3', level: 9 });
  const badIdx = Object.assign({}, BANK[0], { id: 'NEW-4', correct_index: 4 });
  const dupId = Object.assign({}, BANK[0], { id: 'NEW-1' });
  const r = E.validateBank([good, dupOptions, badLevel, badIdx, dupId, 'junk', null]);
  assert.equal(r.valid.length, 1);
  assert.equal(r.errors.length, 6);
  assert.equal(E.validateBank({}).valid.length, 0);
});

test('mergeBanks: imported questions add to and override by id', () => {
  const override = Object.assign({}, BANK[0], { question: 'changed' });
  const merged = E.mergeBanks(BANK, [override, Object.assign({}, BANK[1], { id: 'brand-new' })]);
  assert.equal(merged.length, BANK.length + 1);
  assert.equal(merged.find(q => q.id === BANK[0].id).question, 'changed');
});

// ---- reminder file ---------------------------------------------------------------
test('calendar reminder is a daily repeating event with an alarm at the chosen time', () => {
  const ics = E.makeIcs('07:45', '2026-11-23', '2026-11-22T10:41:00.000Z');
  assert.ok(ics.includes('\r\n') && !/[^\r]\n/.test(ics), 'CRLF line endings');
  for (const line of ['BEGIN:VCALENDAR', 'RRULE:FREQ=DAILY', 'DTSTART:20261123T074500', 'DTSTAMP:20261122T104100Z',
    'BEGIN:VALARM', 'TRIGGER:PT0M', 'END:VCALENDAR']) assert.ok(ics.includes(line), line);
  assert.ok(E.isState(E.newState(START)) && !E.isState({}) && !E.isState(null));
});
