# Stride

A dependency-free daily reading practice app. Run `npm start`, then open http://localhost:5173. Run `npm test` for timing, chunking, and streak checks.

Includes adjustable 100–800 WPM pacing, 1–6 word chunks, focused and highlighted-passage modes, pause/resume, and 40 original Portuguese passages with three multiple-choice questions each. Each quiz shows a score and explanations for all answers; history retains scores and remains compatible with older sessions. Daily selection cycles through all 40 texts across month boundaries. Custom text uses self-reflection. Also includes daily practice minutes, streaks, and session history. Space pauses/resumes when focus is outside a control. Switching tabs automatically pauses reading.

Completed sessions are stored in this browser's local storage. Clearing site data removes progress; it does not sync across devices. The five-minute goal counts active reading time in completed sessions. Selected WPM measures the display pace, not independently assessed reading ability. Increase speed only while retaining comprehension.

No build or package installation is required. Fonts use Google Fonts with local sans-serif fallbacks. To use another port, run `PORT=3000 npm start`.

The library includes longer texts of 387, 557, and 638 words. Filter by short (under 250 words), medium (250–499), or long (500+). The most recently selected speed is saved locally and restored on reload; the dashboard displays this selected pace as the current speed. Existing users without a saved preference start at the last recorded session speed.

The interface uses a dark theme with distinct correct/incorrect quiz states. On wide screens the content is centered within the area beside the navigation. Four additional medium-length readings cover cinema, ceramics, sound observation, and a community garden.
