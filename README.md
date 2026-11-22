# Engineering Coach (offline phone app)

Three Mechanical or Electrical engineering questions per day (changeable from 1 to 5 in Settings), on your Android phone, with no internet,
laptop or paid account needed once it is installed.

- **Topic:** alternates every week (week 1 Mechanical, week 2 Electrical, ...).
- **Difficulty:** one level per month: 1 Fundamentals, 2 Core principles, 3 Applied, 4 Design and
  trade-offs, 5 Advanced. It stays at level 5 afterwards.
- **After you answer:** right or wrong, the correct answer, and an explanation.
- **Monthly report:** wrong answers with the correct answer and why, unanswered questions, weak
  subtopics and a score by topic. Open the *Report* tab any time; copy it as text if you like.
- **Privacy:** everything is stored only on your phone. Nothing is sent anywhere.

## What is included, and what is not (read this)

- The app ships with **132 level-1 questions (66 Mechanical, 66 Electrical).** At 3 a day, a month
  uses about 45 per topic, so this lasts roughly 45 days (simulated). Levels 2 to 5 still need to be
  written. When a level has no unused questions the app shows the next lower level and tells you
  so on screen; once everything has been seen it starts repeating the oldest ones.
- Each day: Q1, Q2, Q3 chips at the top. Answer one, tap *Next question*, and after the last one you
  get a summary. Tap a chip to review any question. Reports label wrong answers like `2026-11-22 Q2`.
- New questions are added from *Settings > Add more questions* by importing a `.json` file. You do
  not need to re-install the app.
- Questions are multiple choice, text only. The arithmetic in 79 of the 132 questions was checked by
  script at build time, but please skim the explanations yourself: if one looks wrong, trust a
  textbook and tell me.

## 1. Put it online once (needed to install it)

Android only lets a web app install and work offline when it is served over **https**, so the files
must be hosted somewhere once. After that, the phone keeps its own copy.

Upload the **contents of the `dist` folder** (not the whole project) to any free static host.
Two common choices (check their current instructions, as the screens change):

- **Netlify Drop:** open <https://app.netlify.com/drop> and drag the `dist` folder onto the page.
  It gives you an https address.
- **GitHub Pages:** create a repository, upload the contents of `dist`, then turn on Pages in
  the repository settings.

Hosting is only a delivery truck: your answers never go there, and you can stop using the host after
installing.

## 2. Install on your phone

1. Open the https address in **Chrome** on your Android phone, and keep it open for a few seconds.
2. Chrome menu (three dots) > **Install app** (or **Add to Home screen**).
3. Open the app from your home screen. Try turning on airplane mode: it should still work.

## 3. Daily reminder

A web app cannot reliably notify you while it is closed. Instead, *Settings > Daily reminder* makes
a repeating calendar event with an alarm. Pick a time, tap **Add to calendar**, open the downloaded
file with your calendar app, and your phone will remind you every day, even offline.

## 4. Back up your data

Open *Settings > Export backup* now and then. Clearing Chrome's site data erases your history.
*Restore a backup* puts it back, for example on a new phone.

## Adding questions (laptop, needs Python 3)

Questions live in `tools/bank_src.py`. Each one has a correct answer and, for calculations, an
optional `check=("python expression", tolerance)` that the build script uses to prove the number.

```bash
python3 tools/build_bank.py                         # validate + rebuild data/bank.js
python3 tools/build_bank.py --json level2.json --min-level 2   # file to import on the phone
python3 tools/make_dist.py                          # refresh dist/ if you want to re-host
```

Questions are grouped in batches (see `tools/bank_fundamentals_2.py`). The `base` and `fundamentals-2` batches are bundled into
the app; any other batch is exported as an importable file, for example
`python3 tools/build_bank.py --json question-packs/fundamentals-100.json --batch fundamentals-2`.
`question-packs/fundamentals-100.json` is the same 100 level-1 questions as an importable file;
they are already bundled, so do not import them again.

Import the `.json` on the phone under *Settings > Add more questions*. Rows for each level and
topic in that screen show how many questions you have. Aim for about 15 x (questions per day) per topic per level, i.e. 45 at 3 a day.

## Tests

```bash
npm install        # once, installs the test browser simulator (jsdom)
npm test           # 43 tests: logic and interface
```

## Files

- `index.html`, `style.css`, `app.js`: the interface. `engine.js`: all the logic (no screen code).
- `sw.js`, `manifest.webmanifest`, `icons/`: offline support and installation.
- `data/bank.js`: the bundled questions (generated). `tools/`: scripts to build the bank and icons.
- `dist/`: exactly what you upload to a host.

## Updating the app later

`sw.js` loads the newest files when you are online and falls back to the saved copy offline, so
re-uploading `dist/` updates the phone the next time it is opened with internet. Your answers are
kept, because they live in the phone, not in the app files.
