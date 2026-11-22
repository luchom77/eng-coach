'use strict';
// Loads the real index.html in a simulated browser (jsdom) and taps through it.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const read = (f) => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
const HTML = read('index.html'), BANK_JS = read('data/bank.js'), ENGINE_JS = read('engine.js'), APP_JS = read('app.js');
const KEY = 'engcoach.v1';

function boot({ today = '2026-11-22', storage = {} } = {}) {
  const dom = new JSDOM(HTML, { url: 'http://localhost/', runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  w.__TODAY__ = today;
  w.confirm = () => true;
  w.scrollTo = () => {};
  Object.entries(storage).forEach(([k, v]) => w.localStorage.setItem(k, v));
  w.eval(BANK_JS); w.eval(ENGINE_JS); w.eval(APP_JS);
  return w;
}
const stored = (w) => JSON.parse(w.localStorage.getItem(KEY));
const $ = (w, sel) => w.document.querySelector(sel);
const $$ = (w, sel) => Array.from(w.document.querySelectorAll(sel));
const tab = (w, name) => $(w, `#tabs button[data-view="${name}"]`).click();
const options = (w) => $$(w, 'button.option');
const wait = (ms = 60) => new Promise((r) => setTimeout(r, ms));

function fileInput(w, input, text, name = 'f.json') {
  Object.defineProperty(input, 'files', { value: [new w.File([text], name)], configurable: true });
  input.dispatchEvent(new w.Event('change'));
}

test('first launch shows a Mechanical level-1 question with four options', () => {
  const w = boot();
  const st = stored(w);
  assert.equal(st.startDate, '2026-11-22');
  const day = st.days['2026-11-22'];
  assert.equal(day.topic, 'Mechanical');
  assert.equal($(w, '.question').textContent, day.question);
  assert.equal(options(w).length, 4);
  assert.deepEqual(options(w).map((b) => b.querySelector('.letter').textContent), ['A', 'B', 'C', 'D']);
  assert.ok($(w, '.badge.topic-mechanical'));
  assert.equal($(w, '.feedback'), null);
});

test('wrong answer: shows the correction and explanation, locks the buttons, saves', () => {
  const w = boot();
  const day0 = stored(w).days['2026-11-22'];
  const wrongIdx = 'ABCD'.indexOf(day0.correct) === 0 ? 1 : 0;
  options(w)[wrongIdx].click();
  const fb = $(w, '.feedback.bad');
  assert.ok(fb, 'bad feedback shown');
  assert.match(fb.textContent, /Not quite/);
  assert.ok(fb.textContent.includes(day0.explanation));
  assert.ok(fb.textContent.includes('The correct answer is ' + day0.correct + ') '));
  assert.ok(options(w).every((b) => b.disabled));
  assert.ok(options(w)['ABCD'.indexOf(day0.correct)].classList.contains('correct'));
  assert.ok(options(w)[wrongIdx].classList.contains('wrong'));
  const saved = stored(w).days['2026-11-22'];
  assert.equal(saved.answer, 'ABCD'[wrongIdx]);
  assert.equal(saved.isCorrect, false);
});

test('right answer shows Correct! and the month score', () => {
  const w = boot();
  const day0 = stored(w).days['2026-11-22'];
  options(w)['ABCD'.indexOf(day0.correct)].click();
  const fb = $(w, '.feedback.ok');
  assert.ok(fb);
  assert.match(fb.textContent, /Correct!/);
  assert.match(fb.textContent, /This month: 1\/1 correct/);
});

test('reloading the app keeps the same question and answer (no new question, no re-answering)', () => {
  const w1 = boot();
  const day = stored(w1).days['2026-11-22'];
  options(w1)[0].click();
  const w2 = boot({ storage: { [KEY]: w1.localStorage.getItem(KEY) } });
  assert.equal($(w2, '.question').textContent, day.question);
  assert.ok(options(w2).every((b) => b.disabled));
  assert.equal(Object.keys(stored(w2).days).length, 1);
});

test('next day brings a new question and the topic switches to Electrical', () => {
  const w = boot();
  options(w)[0].click();
  w.__TODAY__ = '2026-11-23';
  tab(w, 'report'); tab(w, 'today');
  const st = stored(w);
  assert.equal(Object.keys(st.days).length, 2);
  assert.equal(st.days['2026-11-23'].topic, 'Electrical');
  assert.ok($(w, '.badge.topic-electrical'));
  assert.ok(options(w).every((b) => !b.disabled));
});

test('report tab lists what you got wrong, with the right answer and why', () => {
  const w = boot();
  const day = stored(w).days['2026-11-22'];
  const wrongIdx = 'ABCD'.indexOf(day.correct) === 0 ? 1 : 0;
  options(w)[wrongIdx].click();
  tab(w, 'report');
  const text = $(w, 'main').textContent;
  assert.match(text, /Monthly report/);
  assert.match(text, /Questions you got wrong \(1\)/);
  assert.ok(text.includes('Correct answer: ' + day.correct + ') ' + day.options['ABCD'.indexOf(day.correct)]));
  assert.ok(text.includes(day.explanation));
  assert.ok($(w, 'details'));
  assert.ok($$(w, 'button').some((b) => /Copy report/.test(b.textContent)));
});

test('report with no activity says so instead of breaking', () => {
  const w = boot();
  tab(w, 'report');
  assert.match($(w, 'main').textContent, /Monthly report/);
  assert.match($(w, 'main').textContent, /Asked|asked/);
});

test('settings: bank counts, reminder, backup controls are present', () => {
  const w = boot();
  tab(w, 'settings');
  const text = $(w, 'main').textContent;
  assert.match(text, /Question bank \(32 questions\)/);
  assert.match(text, /Daily reminder/);
  assert.match(text, /Export backup/);
  assert.match(text, /Program start date/);
  assert.equal($(w, 'input[type="time"]').value, '08:00');
});

test('importing a question file adds valid questions and rejects bad ones', async () => {
  const w = boot();
  tab(w, 'settings');
  const good = { id: 'IMP-1', level: 2, topic: 'Mechanical', subtopic: 'Torque and moments', question: 'Test?',
    options: ['a', 'b', 'c', 'd'], correct_index: 1, explanation: 'Because.' };
  const bad = Object.assign({}, good, { id: 'IMP-2', options: ['a', 'a', 'b', 'c'] });
  fileInput(w, $(w, 'input[aria-label="Question file"]'), JSON.stringify({ questions: [good, bad] }));
  await wait();
  assert.equal(stored(w).extraBank.length, 1);
  assert.match($(w, 'main').textContent, /Question bank \(33 questions\)/);
  assert.match($(w, '#toast').textContent, /Added 1 questions \(1 rejected\)/);

  fileInput(w, $(w, 'input[aria-label="Question file"]'), 'not json at all');
  await wait();
  assert.match($(w, '#toast').textContent, /not valid JSON/);
  assert.equal(stored(w).extraBank.length, 1);
});

test('backup restore replaces state; a non-backup file is refused', async () => {
  const src = boot();
  const day = stored(src).days['2026-11-22'];
  options(src)[0].click();
  const backup = src.localStorage.getItem(KEY);

  const w = boot({ today: '2026-11-22' });
  options(w)[1].click();
  tab(w, 'settings');
  fileInput(w, $(w, 'input[aria-label="Backup file"]'), JSON.stringify({ hello: 'world' }));
  await wait();
  assert.match($(w, '#toast').textContent, /does not look like a backup/);

  fileInput(w, $(w, 'input[aria-label="Backup file"]'), backup);
  await wait();
  assert.equal(stored(w).days['2026-11-22'].qid, day.qid);
  assert.equal(stored(w).days['2026-11-22'].answer, stored(src).days['2026-11-22'].answer);
});

test('reset wipes answers and starts fresh', () => {
  const w = boot();
  options(w)[0].click();
  tab(w, 'settings');
  $$(w, 'button').find((b) => /Reset everything/.test(b.textContent)).click();
  assert.equal(Object.keys(stored(w).days).length, 1); // fresh state, then today's new question
  assert.equal(stored(w).days['2026-11-22'].answer, null);
});

test('start date can be changed and invalid input is refused', () => {
  const w = boot();
  tab(w, 'settings');
  const input = $(w, 'input[type="date"]');
  input.value = '2026-11-16';
  $$(w, 'button').find((b) => b.textContent === 'Save').click();
  assert.equal(stored(w).startDate, '2026-11-16');
  input.value = '';
  $$(w, 'button').find((b) => b.textContent === 'Save').click();
  assert.equal(stored(w).startDate, '2026-11-16');
  assert.match($(w, '#toast').textContent, /valid date/);
});

test('question text is rendered as text, never as HTML', () => {
  const evil = '<img src=x onerror="window.__pwned=1"><b>bold</b>';
  const st = { version: 1, startDate: '2026-11-22', extraBank: [], days: { '2026-11-22': {
    date: '2026-11-22', qid: 'EVIL', topic: 'Mechanical', level: 1, wantedLevel: 1, subtopic: '<i>s</i>',
    question: evil, options: [evil, 'b', 'c', 'd'], correct: 'B', explanation: evil, notice: null,
    answer: null, isCorrect: null, answeredAt: null } } };
  const w = boot({ storage: { [KEY]: JSON.stringify(st) } });
  assert.equal($(w, '.question').textContent, evil);
  assert.equal($(w, 'main img'), null);
  assert.equal($(w, 'main b'), null);
  options(w)[0].click();
  tab(w, 'report');
  assert.equal($(w, 'main img'), null);
  assert.equal(w.__pwned, undefined);
});

test('corrupt saved data is backed up and the app still starts', () => {
  const w = boot({ storage: { [KEY]: '{this is not json' } });
  assert.equal(w.localStorage.getItem(KEY + '.corrupt-backup'), '{this is not json');
  assert.equal(stored(w).startDate, '2026-11-22');
  assert.equal(options(w).length, 4);
});

test('month 2 without level-2 questions falls back to level 1 and says so', () => {
  const st = { version: 1, startDate: '2026-11-22', extraBank: [], days: {} };
  const w = boot({ today: '2026-12-23', storage: { [KEY]: JSON.stringify(st) } });
  assert.match($(w, '.notice').textContent, /no unused level 2/);
  assert.equal(stored(w).days['2026-12-23'].level, 1);
});
