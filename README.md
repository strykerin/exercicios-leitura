# Stride

A dependency-free Portuguese reading exercise app. Run `npm start`, then open http://localhost:5173. Run `npm test` for the reading and word-bank checks. No build or package installation is required. To use another port, run `PORT=3000 npm start`.

Five exercises are available directly on the homepage:

- **Leitura em blocos:** adjustable 100–800 WPM pacing with 1–6 words per chunk.
- **Leitura guiada:** highlighted passages with a focused reading view.
- **Palavras inteiras:** 90 randomly ordered words per round, choosing 2, 3, or 4 syllables. The central letter is red; for even lengths, the left central letter is highlighted.
- **Palavras parecidas:** 30 pairs with a central fixation point and adjustable spacing.
- **Localizar palavras:** 30 exercises per series (three times the 10 rows in the reference), each with 20 words and two or three occurrences of its target. Choose 1–5 syllables, mark every match, then check correct, missed, and incorrect selections. All words in a group use the selected syllable count. Clear selections to retry or generate a new randomized series; there is no time limit.

Timed visual exercises have adjustable exposure from 150 ms to 2 seconds. Timed exercises support pause/resume and restart. Changing a timed exercise or setting prepares a new round. Space pauses/resumes when focus is outside a control; leaving the page automatically pauses reading. Word-search selections persist when switching tabs; changing its syllable level starts a new series.

An inline text picker appears above the reading exercises (blocks and guided reading only). It includes 40 original Portuguese passages with three multiple-choice questions each, plus custom text with self-reflection. Filter texts by short (under 250 words), medium (250–499), or long (500+). Selecting a text preserves the reading mode. Quizzes show a score and explanations without recording session history; their close button and footer action stay visible while the questions scroll. Escape also returns to practice.

The interface uses solid paper-white and charcoal colors with a restrained red accent, system fonts, and responsive layouts. There are no daily goals, streaks, time tracking, or progress dashboards. Only the selected reading speed is saved as a local preference; old session records are left untouched but are no longer read or updated.
