/* Engineering Coach - user interface. All data stays on this device (localStorage). */
(function () {
  'use strict';

  var E = window.Engine;
  var KEY = 'engcoach.v1';
  var rootEl = document.getElementById('app');
  var tabsEl = document.getElementById('tabs');
  var toastEl = document.getElementById('toast');
  var view = 'today';
  var reportMonth = null;
  var viewSlot = null;   // question being shown; null = the first unanswered one (or the summary)
  var viewDate = null;
  var installEvent = null;
  var state = loadState();

  // ---------- small helpers ----------
  function today() { return window.__TODAY__ || E.localISO(new Date()); } // __TODAY__ is a test hook
  function nowISO() { return new Date().toISOString(); }

  function append(el, child) {
    if (child === null || child === undefined || child === false) return;
    if (Array.isArray(child)) { child.forEach(function (c) { append(el, c); }); return; }
    el.appendChild(child.nodeType ? child : document.createTextNode(String(child)));
  }
  // h('div', {class: 'x', onclick: fn}, child, child...) - builds elements with textContent only (no innerHTML)
  function h(tag, attrs) {
    var el = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  }

  var toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2800);
  }

  // ---------- storage ----------
  function loadState() {
    var raw = null;
    try {
      raw = localStorage.getItem(KEY);
      if (raw) {
        var s = JSON.parse(raw);
        if (E.isState(s)) { s.extraBank = Array.isArray(s.extraBank) ? s.extraBank : []; return s; }
      }
    } catch (e) { /* fall through */ }
    if (raw) { try { localStorage.setItem(KEY + '.corrupt-backup', raw); } catch (e) { /* ignore */ } }
    var fresh = E.newState(today());
    try { localStorage.setItem(KEY, JSON.stringify(fresh)); } catch (e) { /* ignore */ }
    return fresh;
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); return true; }
    catch (e) { toast('Could not save. Your browser may be blocking storage.'); return false; }
  }
  function bank() { return E.mergeBanks(window.ENG_BANK || [], state.extraBank); }

  function download(name, text, mime) {
    var url = URL.createObjectURL(new Blob([text], { type: mime }));
    var a = h('a', { href: url, download: name });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }
  function copyText(text) {
    function fallback() {
      var ta = h('textarea', { 'aria-hidden': 'true', style: 'position:fixed;opacity:0' });
      ta.value = text; document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand('copy'); } catch (e) { /* ignore */ }
      ta.remove(); toast(ok ? 'Report copied' : 'Copy failed');
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast('Report copied'); }, fallback);
    } else fallback();
  }
  function readFile(file, cb) {
    var r = new FileReader();
    r.onload = function () { cb(String(r.result)); };
    r.onerror = function () { toast('Could not read that file.'); };
    r.readAsText(file);
  }

  // ---------- Today ----------
  function badge(text, cls) { return h('span', { class: 'badge' + (cls ? ' ' + cls : ''), text: text }); }

  function slotOf(d) { return d.slot || 1; }

  function chipsFor(days, cur) {
    return h('div', { class: 'chips', role: 'group', 'aria-label': 'Today’s questions' }, days.map(function (d) {
      var mark = d.answer ? (d.isCorrect ? ' ✓' : ' ✗') : '';
      var cls = 'chip' + (d.answer ? (d.isCorrect ? ' ok' : ' bad') : '') + (cur === d ? ' current' : '');
      return h('button', { type: 'button', class: cls, 'aria-current': cur === d ? 'true' : 'false',
        'aria-label': 'Question ' + slotOf(d) + (d.answer ? (d.isCorrect ? ', correct' : ', wrong') : ', not answered'),
        onclick: function () { viewSlot = slotOf(d); render(); } }, 'Q' + slotOf(d) + mark);
    }));
  }

  function summaryCard(days, date) {
    var right = days.filter(function (d) { return d.isCorrect; }).length;
    var card = h('div', { class: 'card stack' },
      h('h2', { text: 'All done for today' }),
      h('p', { class: 'score', text: right + ' of ' + days.length + ' correct' }));
    days.forEach(function (d) {
      var rightText = d.options[E.LETTERS.indexOf(d.correct)];
      card.appendChild(h('details', null,
        h('summary', { text: 'Q' + slotOf(d) + (d.isCorrect ? ' ✓ ' : ' ✗ ') + d.subtopic }),
        h('p', { class: 'q', text: d.question }),
        d.isCorrect ? null : h('p', { class: 'miss', text: 'Your answer: ' + d.answer + ') ' + d.options[E.LETTERS.indexOf(d.answer)] }),
        h('p', { class: 'right', text: 'Correct answer: ' + d.correct + ') ' + rightText }),
        h('p', { text: d.explanation })));
    });
    var p = date.split('-').map(Number), s = E.monthStats(state, p[0], p[1], date);
    card.appendChild(h('p', { class: 'muted', text: 'This month: ' + s.right + '/' + s.answered.length + ' correct. Come back tomorrow for ' + E.perDayOf(state) + ' new questions.' }));
    return card;
  }

  function todayView() {
    var date = today();
    var r = E.assignToday(state, bank(), date);
    if (r.created) save();
    if (!r.day) {
      return h('section', { class: 'card' }, h('h2', { text: 'No question available' }), h('p', { text: r.notice }));
    }
    if (viewDate !== date) { viewDate = date; viewSlot = null; }
    var days = r.days;
    var cur = viewSlot ? days.filter(function (d) { return slotOf(d) === viewSlot; })[0] : null;
    if (!cur) cur = days.filter(function (d) { return !d.answer; })[0] || null;

    if (!cur) {
      return h('section', { class: 'stack' },
        h('p', { class: 'muted', text: 'Month ' + E.monthNumber(date, state.startDate) + ' of the program · ' + date }),
        chipsFor(days, null), summaryCard(days, date));
    }

    var d = cur, answered = !!d.answer;
    var parts = date.split('-').map(Number);
    var s = E.monthStats(state, parts[0], parts[1], date);

    var meta = h('div', { class: 'meta' },
      badge(d.topic, 'topic-' + d.topic.toLowerCase()),
      badge('Level ' + d.level + ' · ' + E.LEVEL_NAMES[d.level - 1]),
      badge(d.subtopic));

    var list = h('ul', { class: 'options' });
    E.LETTERS.forEach(function (letter, i) {
      var cls = 'option';
      if (answered) {
        if (letter === d.correct) cls += ' correct';
        else if (letter === d.answer) cls += ' wrong';
        else cls += ' dim';
      }
      list.appendChild(h('li', null, h('button', {
        type: 'button', class: cls, disabled: answered,
        onclick: function () { choose(date, slotOf(d), letter); }
      }, h('span', { class: 'letter', text: letter }), h('span', { text: d.options[i] }))));
    });

    var wrap = h('section', { class: 'stack' },
      h('p', { class: 'muted', text: 'Month ' + E.monthNumber(date, state.startDate) + ' of the program · ' + date }),
      chipsFor(days, d),
      meta,
      d.notice ? h('p', { class: 'notice', text: d.notice }) : null,
      h('div', { class: 'card' }, h('p', { class: 'question', text: d.question })),
      list);

    if (answered) {
      var right = d.options[E.LETTERS.indexOf(d.correct)];
      var more = days.some(function (x) { return !x.answer; });
      var fb = h('div', { class: 'feedback ' + (d.isCorrect ? 'ok' : 'bad'), role: 'status' },
        h('strong', { text: d.isCorrect ? 'Correct!' : 'Not quite.' }),
        d.isCorrect ? null : h('p', { text: 'You answered ' + d.answer + ') ' + d.options[E.LETTERS.indexOf(d.answer)] + '. The correct answer is ' + d.correct + ') ' + right + '.' }),
        h('p', { text: d.explanation }),
        h('p', { class: 'muted', text: 'This month: ' + s.right + '/' + s.answered.length + ' correct.' }));
      wrap.appendChild(fb);
      wrap.appendChild(h('button', { type: 'button', class: 'primary', text: more ? 'Next question' : 'See today’s summary',
        onclick: function () { viewSlot = null; render(); window.scrollTo(0, 0); } }));
    }
    return wrap;
  }

  function choose(date, slot, letter) {
    var res = E.answerDay(state, E.slotKey(date, slot), letter, nowISO());
    if (res.ok) save();
    viewSlot = slot;
    render();
  }

  // ---------- Report ----------
  function reportView() {
    var date = today(), p = date.split('-').map(Number);
    var months = E.availableMonths(state);
    if (!months.some(function (m) { return m.year === p[0] && m.month === p[1]; })) months.unshift({ year: p[0], month: p[1] });
    if (!reportMonth || !months.some(function (m) { return m.year === reportMonth.year && m.month === reportMonth.month; })) reportMonth = months[0];

    var select = h('select', { 'aria-label': 'Month', onchange: function () {
      var v = select.value.split('-'); reportMonth = { year: Number(v[0]), month: Number(v[1]) }; render();
    } }, months.map(function (m) {
      return h('option', { value: m.year + '-' + m.month, selected: m.year === reportMonth.year && m.month === reportMonth.month, text: E.monthLabel(m.year, m.month) });
    }));

    var s = E.monthStats(state, reportMonth.year, reportMonth.month, date);
    var wrap = h('section', { class: 'stack' }, h('div', { class: 'row' }, h('h2', { text: 'Monthly report' }), select));
    if (!s.total) {
      wrap.appendChild(h('div', { class: 'card' }, h('p', { text: 'No questions in ' + s.label + ' yet.' })));
      return wrap;
    }
    var pct = s.answered.length ? Math.round(100 * s.right / s.answered.length) + '%' : '-';
    var card = h('div', { class: 'card' },
      h('div', { class: 'stats' },
        stat(s.total, 'asked'), stat(s.right + ' (' + pct + ')', 'correct'), stat(s.wrong.length, 'wrong'),
        stat(s.skipped.length, 'unanswered'), stat(s.missedDays, 'days not opened')));
    Object.keys(s.byTopic).sort().forEach(function (t) {
      var b = s.byTopic[t];
      card.appendChild(h('p', null, h('strong', { text: t + ': ' }), b.right + '/' + b.total + ' correct'));
    });
    if (Object.keys(s.byLevel).length > 1) {
      card.appendChild(h('p', null, h('strong', { text: 'By level: ' }),
        Object.keys(s.byLevel).sort().map(function (l) { return 'L' + l + ' ' + s.byLevel[l].right + '/' + s.byLevel[l].total; }).join(' · ')));
    }
    if (s.weak.length) {
      card.appendChild(h('p', null, h('strong', { text: 'Weak spots to revisit: ' }),
        s.weak.map(function (w) { return w[0] + ' (' + w[1] + ')'; }).join('; ')));
    }
    wrap.appendChild(card);

    if (s.wrong.length) {
      wrap.appendChild(h('h3', { text: 'Questions you got wrong (' + s.wrong.length + ')' }));
      s.wrong.forEach(function (d) {
        wrap.appendChild(h('details', null,
          h('summary', { text: d.date + ' Q' + slotOf(d) + ' · ' + d.topic + ' · ' + d.subtopic }),
          h('p', { class: 'q', text: d.question }),
          h('p', { class: 'miss', text: 'Your answer: ' + d.answer + ') ' + d.options[E.LETTERS.indexOf(d.answer)] }),
          h('p', { class: 'right', text: 'Correct answer: ' + d.correct + ') ' + d.options[E.LETTERS.indexOf(d.correct)] }),
          h('p', { text: d.explanation })));
      });
    } else if (s.answered.length) {
      wrap.appendChild(h('p', { class: 'right', text: 'No wrong answers this month. Excellent.' }));
    }
    if (s.skipped.length) {
      wrap.appendChild(h('h3', { text: 'Unanswered (' + s.skipped.length + ')' }));
      s.skipped.forEach(function (d) {
        wrap.appendChild(h('details', null,
          h('summary', { text: d.date + ' Q' + slotOf(d) + ' · ' + d.topic + ' · ' + d.subtopic }),
          h('p', { class: 'q', text: d.question }),
          h('p', { class: 'right', text: 'Correct answer: ' + d.correct + ') ' + d.options[E.LETTERS.indexOf(d.correct)] }),
          h('p', { text: d.explanation })));
      });
    }
    wrap.appendChild(h('button', { type: 'button', class: 'secondary', onclick: function () {
      copyText(E.reportText(state, reportMonth.year, reportMonth.month, date));
    }, text: 'Copy report as text' }));
    return wrap;
  }
  function stat(value, label) { return h('div', { class: 'stat' }, h('b', { text: String(value) }), h('span', { text: label })); }

  // ---------- Settings ----------
  function settingsView() {
    var wrap = h('section', { class: 'stack' });

    // offline status + install
    var offline = ('serviceWorker' in navigator) && navigator.serviceWorker.controller;
    var install = h('div', { class: 'card' }, h('h2', { text: 'Offline use' }),
      h('p', { text: offline ? 'Ready: this app works without internet.' : 'Open this app once while online and it will then work offline.' }),
      installEvent
        ? h('button', { type: 'button', class: 'primary', text: 'Install app', onclick: function () {
            installEvent.prompt(); installEvent = null; render();
          } })
        : h('p', { class: 'muted', text: 'To put it on your home screen: Chrome menu (three dots), then "Install app" or "Add to Home screen".' }));
    wrap.appendChild(install);

    // reminder
    var timeInput = h('input', { type: 'time', value: state.reminderTime || '08:00', 'aria-label': 'Reminder time' });
    wrap.appendChild(h('div', { class: 'card' }, h('h2', { text: 'Daily reminder' }),
      h('p', { class: 'muted', text: 'A web app cannot reliably notify you when it is closed. This creates a daily repeating event for your phone’s calendar, which reminds you every day, even offline.' }),
      h('div', { class: 'row' }, timeInput,
        h('button', { type: 'button', class: 'primary', text: 'Add to calendar', onclick: function () {
          state.reminderTime = timeInput.value || '08:00'; save();
          download('engineering-question-reminder.ics', E.makeIcs(state.reminderTime, today(), nowISO()), 'text/calendar');
          toast('Open the downloaded file to add the reminder');
        } }))));

    // questions per day
    var perSel = h('select', { 'aria-label': 'Questions per day' }, [1, 2, 3, 4, 5].map(function (n) {
      return h('option', { value: String(n), selected: n === E.perDayOf(state), text: String(n) });
    }));
    wrap.appendChild(h('div', { class: 'card' }, h('h2', { text: 'Questions per day' }),
      h('p', { class: 'muted', text: 'Applies from now on. Questions already shown today are kept.' }),
      h('div', { class: 'row' }, perSel,
        h('button', { type: 'button', class: 'secondary', text: 'Apply', onclick: function () {
          state.perDay = Number(perSel.value) || 3; save(); viewSlot = null; toast('Now ' + state.perDay + ' per day');
          render();
        } }))));

    // program start
    var startInput = h('input', { type: 'date', value: state.startDate, 'aria-label': 'Program start date' });
    wrap.appendChild(h('div', { class: 'card' }, h('h2', { text: 'Program start date' }),
      h('p', { class: 'muted', text: 'The week topic and the monthly difficulty are counted from this date. Past answers are kept.' }),
      h('div', { class: 'row' }, startInput,
        h('button', { type: 'button', class: 'secondary', text: 'Save', onclick: function () {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(startInput.value)) { toast('Pick a valid date'); return; }
          state.startDate = startInput.value; save(); toast('Start date saved');
        } }))));

    // question bank
    var all = bank(), counts = E.bankSummary(all);
    var table = h('table', null,
      h('thead', null, h('tr', null, h('th', { text: 'Level' }), h('th', { class: 'n', text: 'Mechanical' }), h('th', { class: 'n', text: 'Electrical' }))),
      h('tbody', null, E.LEVEL_NAMES.map(function (name, i) {
        var lv = i + 1;
        return h('tr', null, h('td', { text: lv + ' · ' + name }),
          h('td', { class: 'n', text: String(counts[lv + '|Mechanical'] || 0) }),
          h('td', { class: 'n', text: String(counts[lv + '|Electrical'] || 0) }));
      })));
    var qFile = h('input', { type: 'file', accept: '.json,application/json', 'aria-label': 'Question file',
      onchange: function () { if (qFile.files[0]) readFile(qFile.files[0], importQuestions); } });
    wrap.appendChild(h('div', { class: 'card' }, h('h2', { text: 'Question bank (' + all.length + ' questions)' }),
      h('p', { class: 'muted', text: 'At ' + E.perDayOf(state) + ' per day, each month uses about ' + 15 * E.perDayOf(state) + ' questions per topic. When a level has none left, the app uses the next lower level.' }),
      table, h('h3', { text: 'Add more questions' }),
      h('p', { class: 'muted', text: 'Choose a question file (.json) made with the generator tool.' }), qFile));

    // data
    var bFile = h('input', { type: 'file', accept: '.json,application/json', 'aria-label': 'Backup file',
      onchange: function () { if (bFile.files[0]) readFile(bFile.files[0], importBackup); } });
    wrap.appendChild(h('div', { class: 'card' }, h('h2', { text: 'Your data' }),
      h('p', { class: 'muted', text: 'Everything is stored only on this phone. Clearing browser data erases it, so export a backup now and then.' }),
      h('div', { class: 'row' },
        h('button', { type: 'button', class: 'secondary', text: 'Export backup', onclick: function () {
          download('engineering-coach-backup-' + today() + '.json', JSON.stringify(state, null, 1), 'application/json');
        } }),
        h('button', { type: 'button', class: 'danger', text: 'Reset everything', onclick: function () {
          if (confirm('Delete all answers and start over? This cannot be undone.')) {
            state = E.newState(today()); save(); reportMonth = null; viewSlot = null; view = 'today'; render(); toast('Reset');
          }
        } })),
      h('h3', { text: 'Restore a backup' }), bFile));
    return wrap;
  }

  function importQuestions(text) {
    var data;
    try { data = JSON.parse(text); } catch (e) { toast('That file is not valid JSON.'); return; }
    var list = Array.isArray(data) ? data : data && data.questions;
    var r = E.validateBank(list);
    if (!r.valid.length) { toast(r.errors[0] || 'No usable questions found.'); return; }
    state.extraBank = E.mergeBanks(state.extraBank, r.valid);
    if (save()) toast('Added ' + r.valid.length + ' questions' + (r.errors.length ? ' (' + r.errors.length + ' rejected)' : ''));
    render();
  }

  function importBackup(text) {
    var data;
    try { data = JSON.parse(text); } catch (e) { toast('That file is not valid JSON.'); return; }
    if (!E.isState(data)) { toast('That does not look like a backup from this app.'); return; }
    if (!confirm('Replace everything on this phone with the backup?')) return;
    data.extraBank = Array.isArray(data.extraBank) ? data.extraBank : [];
    state = data; save(); reportMonth = null; viewSlot = null; render(); toast('Backup restored');
  }

  // ---------- shell ----------
  function render() {
    Array.prototype.forEach.call(tabsEl.querySelectorAll('button'), function (b) {
      b.setAttribute('aria-current', b.getAttribute('data-view') === view ? 'page' : 'false');
    });
    rootEl.textContent = '';
    rootEl.appendChild(view === 'report' ? reportView() : view === 'settings' ? settingsView() : todayView());
  }

  tabsEl.addEventListener('click', function (ev) {
    var v = ev.target && ev.target.getAttribute && ev.target.getAttribute('data-view');
    if (v) { view = v; render(); window.scrollTo(0, 0); }
  });
  window.addEventListener('beforeinstallprompt', function (ev) {
    ev.preventDefault(); installEvent = ev; if (view === 'settings') render();
  });
  // a new day may have started while the app stayed open in the background
  document.addEventListener('visibilitychange', function () { if (!document.hidden && view === 'today') render(); });

  if (navigator.storage && navigator.storage.persist) { try { navigator.storage.persist(); } catch (e) { /* ignore */ } }
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register('sw.js').then(function () {
      if (view === 'settings') render();
    }, function () { /* offline support is optional */ });
  }
  render();
})();
