/* Engineering Coach - app logic. Pure functions, no DOM, so it can be tested in Node.
 *
 * state = { version: 1, startDate: 'YYYY-MM-DD', perDay: 3, days: { key: day }, extraBank: [] }
 *   key = 'YYYY-MM-DD' for the first question of a day, 'YYYY-MM-DD#2' for the second, and so on.
 *   Data saved before several questions a day existed has only first-question keys and still works.
 * day   = a snapshot of the question as shown (options already shuffled), plus your answer.
 *         Snapshots mean old reports stay correct even if the question bank changes later.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Engine = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var LEVEL_NAMES = ['Fundamentals', 'Core principles', 'Applied engineering', 'Design and trade-offs', 'Advanced analysis'];
  var MAX_LEVEL = LEVEL_NAMES.length;
  var LETTERS = ['A', 'B', 'C', 'D'];
  var TOPICS = ['Mechanical', 'Electrical'];
  var DAY_MS = 86400000;
  var DEFAULT_PER_DAY = 3, MAX_PER_DAY = 5;

  // ---- dates (all ISO 'YYYY-MM-DD' strings; computed in UTC so time zones cannot shift a day) ----
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function utc(iso) { var p = iso.split('-').map(Number); return Date.UTC(p[0], p[1] - 1, p[2]); }
  function isoFromUtc(ms) { return new Date(ms).toISOString().slice(0, 10); }
  function localISO(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function mondayOf(ms) { return ms - ((new Date(ms).getUTCDay() + 6) % 7) * DAY_MS; }

  // ---- curriculum: topic alternates weekly, level rises monthly ----
  function topicFor(todayISO, startISO) {
    var weeks = Math.floor((mondayOf(utc(todayISO)) - mondayOf(utc(startISO))) / (7 * DAY_MS));
    return ((weeks % 2) + 2) % 2 === 0 ? 'Mechanical' : 'Electrical';
  }
  function monthsElapsed(todayISO, startISO) {
    var t = todayISO.split('-').map(Number), s = startISO.split('-').map(Number);
    var months = (t[0] - s[0]) * 12 + (t[1] - s[1]);
    if (t[2] < s[2]) months -= 1;
    return Math.max(months, 0);
  }
  function monthNumber(todayISO, startISO) { return monthsElapsed(todayISO, startISO) + 1; }
  function levelFor(todayISO, startISO) { return Math.min(monthsElapsed(todayISO, startISO), MAX_LEVEL - 1) + 1; }

  // ---- state ----
  function newState(startISO) { return { version: 1, startDate: startISO, perDay: DEFAULT_PER_DAY, days: {}, extraBank: [] }; }

  // ---- several questions per day ----
  function perDayOf(state) {
    if (!state || state.perDay === undefined || state.perDay === null) return DEFAULT_PER_DAY;
    var n = Math.round(Number(state.perDay));
    if (!isFinite(n)) return DEFAULT_PER_DAY;
    return Math.min(Math.max(n, 1), MAX_PER_DAY);
  }
  function slotKey(dateISO, slot) { return slot > 1 ? dateISO + '#' + slot : dateISO; }
  function slotFromKey(key) {
    var i = key.indexOf('#');
    return i < 0 ? 1 : (Number(key.slice(i + 1)) || 1);
  }
  /* The day's questions in order. Older saved data has no `slot` field: it is read from the key. */
  function dayQuestions(state, dateISO) {
    return Object.keys(state.days)
      .filter(function (k) { return k === dateISO || k.indexOf(dateISO + '#') === 0; })
      .map(function (k) { var d = state.days[k]; if (!d.slot) d.slot = slotFromKey(k); return d; })
      .sort(function (a, b) { return a.slot - b.slot; });
  }
  function dayScore(state, dateISO) {
    var ds = dayQuestions(state, dateISO);
    var answered = ds.filter(function (d) { return d.answer; });
    return { total: ds.length, answered: answered.length,
      right: answered.filter(function (d) { return d.isCorrect; }).length };
  }

  function isState(s) {
    return !!s && typeof s === 'object' && typeof s.startDate === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(s.startDate) && !!s.days && typeof s.days === 'object';
  }

  // ---- question bank ----
  function validateBank(list) {
    var valid = [], errors = [];
    if (!Array.isArray(list)) return { valid: valid, errors: ['The file must contain a list of questions.'] };
    var seen = {};
    list.forEach(function (q, i) {
      var tag = '#' + (i + 1) + (q && q.id ? ' (' + q.id + ')' : '');
      var problems = [];
      if (!q || typeof q !== 'object') { errors.push(tag + ': not an object'); return; }
      if (typeof q.id !== 'string' || !q.id) problems.push('missing id');
      else if (seen[q.id]) problems.push('duplicate id');
      if (!(Number.isInteger(q.level) && q.level >= 1 && q.level <= MAX_LEVEL)) problems.push('level must be 1-' + MAX_LEVEL);
      if (TOPICS.indexOf(q.topic) < 0) problems.push('topic must be Mechanical or Electrical');
      if (typeof q.subtopic !== 'string' || !q.subtopic) problems.push('missing subtopic');
      if (typeof q.question !== 'string' || !q.question.trim()) problems.push('missing question');
      if (typeof q.explanation !== 'string' || !q.explanation.trim()) problems.push('missing explanation');
      if (!Array.isArray(q.options) || q.options.length !== 4 ||
          q.options.some(function (o) { return typeof o !== 'string' || !o.trim(); }) ||
          new Set(q.options.map(function (o) { return o.trim().toLowerCase(); })).size !== 4) problems.push('needs 4 distinct options');
      if (!(Number.isInteger(q.correct_index) && q.correct_index >= 0 && q.correct_index <= 3)) problems.push('correct_index must be 0-3');
      if (problems.length) errors.push(tag + ': ' + problems.join(', '));
      else { seen[q.id] = true; valid.push(q); }
    });
    return { valid: valid, errors: errors };
  }

  function mergeBanks(bundled, extra) {
    var byId = {};
    (bundled || []).forEach(function (q) { byId[q.id] = q; });
    (extra || []).forEach(function (q) { byId[q.id] = q; });
    return Object.keys(byId).map(function (k) { return byId[k]; });
  }

  function bankSummary(bank) {
    var out = {};
    bank.forEach(function (q) {
      var key = q.level + '|' + q.topic;
      out[key] = (out[key] || 0) + 1;
    });
    return out;
  }

  // ---- choosing today's question ----
  /* `tiers` is a list of subtopic lists to avoid, strictest first. Falls back tier by tier. */
  function pickPreferred(list, tiers, rng) {
    for (var t = 0; t < tiers.length; t++) {
      var avoid = tiers[t];
      var fresh = list.filter(function (q) { return avoid.indexOf(q.subtopic) < 0; });
      if (fresh.length) return fresh[Math.floor(rng() * fresh.length)];
    }
    return list[Math.floor(rng() * list.length)];
  }

  function shuffledOrder(rng) {
    var a = [0, 1, 2, 3];
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rng() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function byRecency(a, b) {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return (b.slot || 1) - (a.slot || 1);
  }

  /* One question for `topic` at about `wanted` level, never repeating one while unused ones remain.
   * Returns { chosen, notice } or { message } when the bank has nothing for this topic. */
  function chooseQuestion(state, bank, todayISO, topic, wanted, rng) {
    var all = Object.keys(state.days).map(function (k) { return state.days[k]; });
    var lastUsed = {};
    all.forEach(function (d) { if (!lastUsed[d.qid] || d.date > lastUsed[d.qid]) lastUsed[d.qid] = d.date; });
    var sameTopic = all.filter(function (d) { return d.topic === topic; });
    var todaySubs = sameTopic.filter(function (d) { return d.date === todayISO; })
      .map(function (d) { return d.subtopic; });
    var recentSubs = sameTopic.filter(function (d) { return d.date < todayISO; })
      .sort(byRecency).slice(0, 4).map(function (d) { return d.subtopic; });
    // prefer a subtopic not used today or recently, then one not used today, then anything
    var tiers = [todaySubs.concat(recentSubs), todaySubs, []];
    var inLevel = function (lv) { return bank.filter(function (q) { return q.topic === topic && q.level === lv; }); };

    var chosen = null, notice = null, lv;
    for (lv = wanted; lv >= 1 && !chosen; lv--) {
      var unused = inLevel(lv).filter(function (q) { return !lastUsed[q.id]; });
      if (unused.length) {
        chosen = pickPreferred(unused, tiers, rng);
        if (lv !== wanted) {
          notice = 'Your question bank has no unused level ' + wanted + ' ' + topic + ' questions, so this one is level ' + lv +
            '. Import more questions in Settings to keep progressing.';
        }
      }
    }
    if (!chosen) {
      var candidates = [];
      for (lv = wanted; lv >= 1 && !candidates.length; lv--) candidates = inLevel(lv);
      if (!candidates.length) candidates = bank.filter(function (q) { return q.topic === topic; });
      if (!candidates.length) {
        return { message: 'There are no ' + topic + ' questions in the bank. Import a question file in Settings.' };
      }
      var oldest = candidates.reduce(function (m, q) {
        var u = lastUsed[q.id] || '';
        return u < m ? u : m;
      }, '9999-99-99');
      var oldestOnes = candidates.filter(function (q) { return (lastUsed[q.id] || '') === oldest; });
      chosen = pickPreferred(oldestOnes, tiers, rng);
      notice = 'You have seen every available ' + topic + ' question at this level, so this one is a repeat. Import more questions in Settings.';
    }
    return { chosen: chosen, notice: notice };
  }

  /* Makes sure today has its questions (state.perDay of them, default 3). Never changes or removes
   * an existing one. Returns { days, day (the first), created (any new?), notice (of the first) }. */
  function assignToday(state, bank, todayISO, rng) {
    rng = rng || Math.random;
    var perDay = perDayOf(state);
    var topic = topicFor(todayISO, state.startDate);
    var wanted = levelFor(todayISO, state.startDate);
    var have = {};
    dayQuestions(state, todayISO).forEach(function (d) { have[d.slot] = true; });
    var created = false, problem = null;

    for (var n = 1; n <= perDay; n++) {
      if (have[n]) continue;
      var pick = chooseQuestion(state, bank, todayISO, topic, wanted, rng);
      if (!pick.chosen) { problem = pick.message; break; }
      var chosen = pick.chosen, order = shuffledOrder(rng);
      state.days[slotKey(todayISO, n)] = {
        date: todayISO, slot: n, qid: chosen.id, topic: topic, level: chosen.level, wantedLevel: wanted,
        subtopic: chosen.subtopic, question: chosen.question,
        options: order.map(function (i) { return chosen.options[i]; }),
        correct: LETTERS[order.indexOf(chosen.correct_index)],
        explanation: chosen.explanation, notice: pick.notice,
        answer: null, isCorrect: null, answeredAt: null
      };
      created = true;
    }
    var days = dayQuestions(state, todayISO);
    return { days: days, day: days[0] || null, created: created,
      notice: days.length ? (days[0].notice || null) : problem };
  }

  function answerDay(state, dateISO, letter, nowISO) {
    var day = state.days[dateISO];
    if (!day) return { ok: false, reason: 'no-question' };
    if (day.answer) return { ok: false, reason: 'already-answered', day: day };
    if (LETTERS.indexOf(letter) < 0) return { ok: false, reason: 'bad-letter' };
    day.answer = letter;
    day.isCorrect = letter === day.correct;
    day.answeredAt = nowISO || null;
    return { ok: true, day: day, isCorrect: day.isCorrect };
  }

  // ---- statistics and report ----
  function monthKey(year, month) { return year + '-' + pad(month); }

  function monthStats(state, year, month, todayISO) {
    var prefix = monthKey(year, month) + '-';
    var days = Object.keys(state.days).filter(function (k) { return k.indexOf(prefix) === 0; }).sort()
      .map(function (k) { return state.days[k]; });
    var answered = days.filter(function (d) { return d.answer; });
    var wrong = answered.filter(function (d) { return !d.isCorrect; });
    var skipped = days.filter(function (d) { return !d.answer; });

    var byTopic = {}, byLevel = {}, weakCount = {};
    answered.forEach(function (d) {
      [[byTopic, d.topic], [byLevel, d.level]].forEach(function (p) {
        var b = p[0][p[1]] = p[0][p[1]] || { right: 0, total: 0 };
        b.total += 1; if (d.isCorrect) b.right += 1;
      });
    });
    wrong.forEach(function (d) { weakCount[d.subtopic] = (weakCount[d.subtopic] || 0) + 1; });
    var weak = Object.keys(weakCount).map(function (s) { return [s, weakCount[s]]; })
      .sort(function (a, b) { return b[1] - a[1] || (a[0] < b[0] ? -1 : 1); }).slice(0, 5);

    // days since the start of the program on which the app was never opened (today does not count yet)
    var missed = 0;
    var first = utc(prefix + '01');
    var next = Date.UTC(month === 12 ? year + 1 : year, month % 12, 1);
    var from = Math.max(first, utc(state.startDate));
    var to = Math.min(next, todayISO ? utc(todayISO) : next);
    for (var t = from; t < to; t += DAY_MS) if (!state.days[isoFromUtc(t)]) missed += 1;

    return {
      year: year, month: month, label: monthLabel(year, month), days: days, total: days.length,
      answered: answered, right: answered.length - wrong.length, wrong: wrong, skipped: skipped,
      byTopic: byTopic, byLevel: byLevel, weak: weak, missedDays: missed
    };
  }

  function monthLabel(year, month) {
    return new Date(Date.UTC(year, month - 1, 1)).toLocaleString('en', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  }

  function availableMonths(state) {
    var seen = {};
    Object.keys(state.days).forEach(function (k) { seen[k.slice(0, 7)] = true; });
    return Object.keys(seen).sort().reverse().map(function (k) {
      return { year: Number(k.slice(0, 4)), month: Number(k.slice(5, 7)) };
    });
  }

  function slotLabel(d) { return d.date + ' Q' + (d.slot || 1); }
  function pct(right, total) { return total ? Math.round(100 * right / total) + '%' : '-'; }
  function optionText(day, letter) { return letter + ') ' + day.options[LETTERS.indexOf(letter)]; }

  function reportText(state, year, month, todayISO) {
    var s = monthStats(state, year, month, todayISO);
    var out = ['Monthly report - ' + s.label, ''];
    if (!s.total) { out.push('No questions this month.'); return out.join('\n'); }
    out.push('Questions: ' + s.total + ' | Answered: ' + s.answered.length + ' | Correct: ' + s.right + ' (' +
      pct(s.right, s.answered.length) + ') | Wrong: ' + s.wrong.length + ' | Unanswered: ' + s.skipped.length +
      (s.missedDays ? ' | Days not opened: ' + s.missedDays : ''));
    var topics = Object.keys(s.byTopic).sort();
    if (topics.length) out.push('By topic: ' + topics.map(function (t) {
      return t + ' ' + s.byTopic[t].right + '/' + s.byTopic[t].total + ' (' + pct(s.byTopic[t].right, s.byTopic[t].total) + ')';
    }).join(' | '));
    var levels = Object.keys(s.byLevel).sort();
    if (levels.length > 1) out.push('By level: ' + levels.map(function (l) {
      return 'L' + l + ' ' + s.byLevel[l].right + '/' + s.byLevel[l].total + ' (' + pct(s.byLevel[l].right, s.byLevel[l].total) + ')';
    }).join(' | '));
    if (s.weak.length) out.push('', 'Weak spots to revisit: ' + s.weak.map(function (w) { return w[0] + ' (' + w[1] + ')'; }).join('; '));
    if (s.wrong.length) {
      out.push('', 'QUESTIONS YOU GOT WRONG (' + s.wrong.length + ')');
      s.wrong.forEach(function (d, i) {
        out.push('', (i + 1) + '. [' + slotLabel(d) + ' | ' + d.topic + ' | level ' + d.level + ' | ' + d.subtopic + ']', d.question,
          'Your answer: ' + optionText(d, d.answer), 'Correct answer: ' + optionText(d, d.correct), 'Why: ' + d.explanation);
      });
    } else if (s.answered.length) out.push('', 'No wrong answers this month. Excellent.');
    if (s.skipped.length) {
      out.push('', 'UNANSWERED (' + s.skipped.length + ') - correct answers');
      s.skipped.forEach(function (d, i) {
        out.push('', (i + 1) + '. [' + slotLabel(d) + ' | ' + d.topic + ' | ' + d.subtopic + ']', d.question,
          'Correct answer: ' + optionText(d, d.correct), 'Why: ' + d.explanation);
      });
    }
    return out.join('\n');
  }

  // ---- daily reminder as a calendar file (works offline, notifies reliably) ----
  function makeIcs(timeHHMM, startISO, nowISO) {
    var p = String(timeHHMM || '08:00').split(':');
    var hh = pad(Number(p[0]) || 0), mm = pad(Number(p[1]) || 0);
    var stamp = (nowISO || new Date().toISOString()).replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
    return [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Engineering Coach//EN', 'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      'UID:engcoach-daily-question@local',
      'DTSTAMP:' + stamp,
      'DTSTART:' + startISO.replace(/-/g, '') + 'T' + hh + mm + '00',
      'DURATION:PT10M',
      'RRULE:FREQ=DAILY',
      'SUMMARY:Engineering questions of the day',
      'DESCRIPTION:Open the Engineering Coach app and answer the questions of the day.',
      'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Engineering questions of the day', 'TRIGGER:PT0M', 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR', ''
    ].join('\r\n');
  }

  return {
    LEVEL_NAMES: LEVEL_NAMES, MAX_LEVEL: MAX_LEVEL, LETTERS: LETTERS, TOPICS: TOPICS,
    localISO: localISO, topicFor: topicFor, monthsElapsed: monthsElapsed, monthNumber: monthNumber, levelFor: levelFor,
    DEFAULT_PER_DAY: DEFAULT_PER_DAY, MAX_PER_DAY: MAX_PER_DAY, perDayOf: perDayOf, slotKey: slotKey,
    dayQuestions: dayQuestions, dayScore: dayScore,
    newState: newState, isState: isState, validateBank: validateBank, mergeBanks: mergeBanks, bankSummary: bankSummary,
    assignToday: assignToday, answerDay: answerDay, monthStats: monthStats, monthLabel: monthLabel,
    availableMonths: availableMonths, reportText: reportText, makeIcs: makeIcs
  };
});
