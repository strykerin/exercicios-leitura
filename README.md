# Stride

A dependency-free Portuguese reading exercise app. Run `npm start`, then open http://localhost:5173. Run `npm test` for the reading and word-bank checks. No build or package installation is required. To use another port, run `PORT=3000 npm start`.

Four exercises are available directly on the homepage:

- **Leitura em blocos:** adjustable 100–800 WPM pacing with 1–6 words per chunk.
- **Leitura guiada:** highlighted passages with a focused reading view.
- **Palavras inteiras:** 90 randomly ordered words per round, choosing 2, 3, or 4 syllables. The central letter is red; for even lengths, the left central letter is highlighted.
- **Palavras parecidas:** 30 pairs with a central fixation point and adjustable spacing.

Visual exercises have adjustable exposure from 150 ms to 2 seconds. All exercises support pause/resume and restart. Changing an exercise or setting prepares a new round. Space pauses/resumes when focus is outside a control; leaving the page automatically pauses reading.

The Textos section includes 40 original Portuguese passages with three multiple-choice questions each, plus custom text with self-reflection. Filter texts by short (under 250 words), medium (250–499), or long (500+). Quizzes show a score and explanations without recording session history.

The interface uses solid paper-white and charcoal colors with a restrained red accent, system fonts, and responsive layouts. There are no daily goals, streaks, time tracking, or progress dashboards. Only the selected reading speed is saved as a local preference; old session records are left untouched but are no longer read or updated.
