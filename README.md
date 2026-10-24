# Stride

A dependency-free Portuguese reading exercise app. Run `npm start`, then open http://localhost:5173. Run `npm test` for the reading and word-bank checks. No build or package installation is required. To use another port, run `PORT=3000 npm start`.

Seven exercises are available directly on the homepage:

- **Leitura em blocos:** adjustable 100–800 WPM pacing with 1–6 words per chunk.
- **Leitura guiada:** highlighted passages with a focused reading view.
- **Palavras inteiras:** 90 randomly ordered words per round, choosing 2, 3, or 4 syllables. The central letter is red; for even lengths, the left central letter is highlighted.
- **Palavras parecidas:** 30 pairs with a central fixation point and adjustable spacing. Choose short words (1–2 syllables) or longer words with 3, 4, or 5 syllables. Each level has 30 distinct pairs; text scales to fit the longest word in the round on smaller screens.
- **Localizar palavras:** 30 exercises per series (three times the 10 rows in the reference), each with 20 words and two or three occurrences of its target. Choose 1–5 syllables and visually locate every match. All words in a group use the selected syllable count. Generate a new randomized series whenever desired.

- **Contar figuras:** eight rows of 20 vector figures. Mentally count exact matches to the model, excluding the model itself. Similar variants differ in their details.
- **Palavra repetida:** 15 rows of five similar words, with exactly one word appearing twice in each row. Read from left to right and mentally identify the repeated word.

These three exercises are observation-only: no selections, answer inputs, correction, scores, or time limits. Their arrangements persist when switching tabs. In the figure and repeated-word exercises, **Embaralhar** changes row and item order while retaining the same contents. **Nova série** generates fresh targets.

Timed visual exercises have adjustable exposure from 150 ms to 2 seconds. Timed exercises support pause/resume and restart. Changing a timed exercise or setting prepares a new round. Space pauses/resumes when focus is outside a control; leaving the page automatically pauses reading. Changing the word-search syllable level starts a new series.

An inline text picker appears above the reading exercises (blocks and guided reading only). It includes 40 original Portuguese passages with three multiple-choice questions each, plus custom text with self-reflection. Filter texts by short (under 250 words), medium (250–499), or long (500+). Selecting a text preserves the reading mode. Quizzes show a score and explanations without recording session history; their close button and footer action stay visible while the questions scroll. Escape also returns to practice.

The interface uses a dark-only charcoal theme with light text and a coral accent, system fonts, and responsive layouts. There are no daily goals, streaks, time tracking, or progress dashboards. Only the selected reading speed is saved as a local preference; old session records are left untouched but are no longer read or updated.
