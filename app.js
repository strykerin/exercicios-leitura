import { chunks, wordCount, duration, localDay, streak, passages, scoreQuiz, dailyPassageIndex, textLengthGroup, validSpeed } from './reading.js';
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const translatedTitles = {
  'The art of paying attention': 'A arte de prestar atenção',
  'A forest beneath the city': 'Uma floresta na cidade',
  'Small steps, lasting change': 'Pequenos passos, mudanças duradouras',
  'Your own passage': 'Seu próprio texto'
};
let sessions = [];
try { const saved = JSON.parse(localStorage.getItem('stride-sessions') || '[]'); if (Array.isArray(saved)) sessions = saved.filter(s => s && typeof s.day === 'string' && Number.isFinite(s.wpm) && Number.isFinite(s.seconds) && typeof s.title === 'string'); } catch { /* Storage may be unavailable. */ }
let passage = passages[dailyPassageIndex()];
let mode = 'chunk', size = 3, wpm = 250, status = 'ready', index = 0, groups = [], timer, startedAt = 0, elapsed = 0, remaining = 0, deadline = 0, answered = false;
wpm = validSpeed(sessions.at(-1)?.wpm);
try { wpm = validSpeed(localStorage.getItem('stride-speed'), wpm); } catch { /* Keep the current visit usable without storage. */ }
$('#speed').value = wpm;
$('#speed-value').textContent = wpm;
$('#date-label').textContent = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());
function toast(message) { $('#toast').textContent = message; $('#toast').hidden = false; setTimeout(() => $('#toast').hidden = true, 4000); }
function renderStats() {
  const currentStreak = streak(sessions);
  $('#streak').innerHTML = `${currentStreak} <small>${currentStreak === 1 ? 'dia' : 'dias'}</small>`;
  $('#current-speed').innerHTML = `${wpm} <small>PPM</small>`;
  const today = sessions.filter(s => s.day === localDay()).reduce((sum, s) => sum + s.seconds, 0) / 60;
  $('#today-minutes').innerHTML = `${today ? today.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '0'} <small>/ 5 min</small>`;
  $('#goal-fill').style.width = `${Math.min(100, today / 5 * 100)}%`;
  const history = $('#history'); history.replaceChildren();
  if (!sessions.length) { const p = document.createElement('p'); p.className = 'muted'; p.textContent = 'Sua jornada começa com uma sessão. Conclua uma prática para ver seu progresso aqui.'; history.append(p); }
  [...sessions].reverse().slice(0, 30).forEach(s => {
    const row = document.createElement('div'); row.className = 'history-row';
    const title = document.createElement('div'); title.textContent = translatedTitles[s.title] || s.title; const date = document.createElement('small'); date.textContent = `${s.day.split('-').reverse().join('/')} · ${s.mode === 'paced' ? 'Leitura guiada' : 'Leitura em blocos'}`; title.append(date); row.append(title);
    const comprehension = Number.isInteger(s.totalQuestions) && s.totalQuestions > 0 ? `Compreensão: ${s.score}/${s.totalQuestions} acertos` : s.correct === null ? 'Reflexão concluída' : s.correct ? 'Compreensão: correta' : 'Compreensão: revisar';
    for (const value of [`${s.wpm} PPM`, `${s.size} palavras / bloco`, comprehension]) { const cell = document.createElement('span'); cell.textContent = value; row.append(cell); }
    history.append(row);
  });
}
function switchView(view) {
  if (status === 'running') pause();
  $$('.view').forEach(el => el.hidden = el.id !== `${view}-view`);
  $$('.nav').forEach(el => el.classList.toggle('active', el.dataset.view === view));
  if (view === 'progress') renderStats();
}
$$('.nav').forEach(button => button.addEventListener('click', () => switchView(button.dataset.view)));
function lockSettings(locked) { $('#speed').disabled = locked; $$('[data-chunk], [data-mode]').forEach(b => b.disabled = locked); }
function reset() {
  clearTimeout(timer); status = 'ready'; index = 0; elapsed = 0; remaining = 0;
  groups = chunks(passage.text, size); lockSettings(false);
  $('#start').innerHTML = 'Iniciar prática <span>→</span>'; $('#reset').hidden = true;
  $('#reading-state').textContent = 'COMECE NO SEU TEMPO'; $('#read-fill').style.width = '0%';
  $('#reader-hint').textContent = mode === 'chunk' ? 'Mantenha o olhar no centro' : 'Acompanhe o bloco de palavras em destaque';
  $('#passage-label').textContent = passage.category.toUpperCase();
  $('#session-length').textContent = `◷ Cerca de ${Math.max(1, Math.ceil(wordCount(passage.text) / wpm))} min · ${passage.questions?.length ? `${passage.questions.length} perguntas ao final` : 'Reflexão ao final'}`;
  $('#reader').classList.toggle('paced', mode === 'paced');
  if (mode === 'chunk') $('#word-display').textContent = 'Um pequeno passo';
  else { $('#word-display').replaceChildren(...groups.map(group => { const span = document.createElement('span'); span.textContent = group + ' '; return span; })); $('#word-display').scrollTop = 0; }
}
function showChunk() {
  if (mode === 'chunk') $('#word-display').textContent = groups[index];
  else {
    const spans = [...$('#word-display').children];
    spans.forEach((span, i) => { span.classList.toggle('current', i === index); span.classList.toggle('read', i < index); });
    const active = spans[index], box = $('#word-display');
    box.scrollTop += active.getBoundingClientRect().top - box.getBoundingClientRect().top - box.clientHeight / 2 + active.offsetHeight / 2;
  }
  $('#read-fill').style.width = `${index / groups.length * 100}%`;
  $('#reading-state').textContent = `${index + 1} / ${groups.length} BLOCOS`;
}
function schedule(ms) {
  deadline = performance.now() + ms;
  timer = setTimeout(() => { index++; if (index >= groups.length) finish(); else { showChunk(); schedule(duration(groups[index], wpm)); } }, ms);
}
function start() {
  if (status === 'running') { pause(); return; }
  const resuming = status === 'paused'; status = 'running'; startedAt = performance.now();
  lockSettings(true); $('#reset').hidden = false; $('#start').textContent = 'Pausar Ⅱ'; $('#reader-hint').textContent = 'Espaço para pausar · Respire e acompanhe o ritmo';
  showChunk(); schedule(resuming ? remaining : duration(groups[index], wpm));
}
function pause() {
  if (status !== 'running') return;
  clearTimeout(timer); elapsed += performance.now() - startedAt; remaining = Math.max(0, deadline - performance.now()); status = 'paused';
  $('#start').textContent = 'Continuar →'; $('#reading-state').textContent = 'EM PAUSA'; $('#reader-hint').textContent = 'Sem pressa. Continue quando quiser.';
}
function finish() {
  elapsed += performance.now() - startedAt; status = 'quiz'; $('#read-fill').style.width = '100%'; $('#reading-state').textContent = 'LEITURA CONCLUÍDA'; $('#start').disabled = true;
  answered = false; $('#quiz-feedback').textContent = ''; $('#quiz-submit').textContent = passage.questions?.length ? 'Verificar respostas →' : 'Salvar prática →';
  $('#quiz-question').textContent = passage.questions?.length ? `Responda às ${passage.questions.length} perguntas sobre “${passage.title}”.` : 'Sem consultar o texto, resuma a ideia principal com suas próprias palavras.';
  $('#quiz-options').replaceChildren();
  if (passage.questions?.length) passage.questions.forEach((question, questionIndex) => {
    const fieldset = document.createElement('fieldset'); fieldset.className = 'quiz-question';
    const legend = document.createElement('legend'); legend.textContent = `${questionIndex + 1}. ${question.prompt}`; fieldset.append(legend);
    question.options.forEach((option, i) => { const label = document.createElement('label'); const input = document.createElement('input'); input.type = 'radio'; input.name = `answer-${questionIndex}`; input.value = i; input.required = true; label.append(input, document.createTextNode(option)); fieldset.append(label); });
    const feedback = document.createElement('p'); feedback.className = 'question-feedback'; feedback.hidden = true; fieldset.append(feedback);
    $('#quiz-options').append(fieldset);
  });
  else { const input = document.createElement('textarea'); input.id = 'reflection'; input.required = true; input.minLength = 10; input.placeholder = 'A ideia principal era…'; input.setAttribute('aria-label', 'Seu resumo'); $('#quiz-options').append(input); }
  $('#quiz').showModal();
}
$('#quiz').addEventListener('cancel', event => event.preventDefault());
$('#quiz-form').addEventListener('submit', event => {
  event.preventDefault();
  if (answered) { $('#quiz').close(); $('#start').disabled = false; reset(); return; }
  if (!event.target.reportValidity()) return;
  const questions = passage.questions || [];
  const data = new FormData(event.target);
  const answers = questions.map((_, i) => Number(data.get(`answer-${i}`)));
  const score = questions.length ? scoreQuiz(questions, answers) : null;
  const correct = questions.length ? score === questions.length : null;
  sessions.push({ day: localDay(), title: passage.title, wpm, size, mode, seconds: elapsed / 1000, correct, score, totalQuestions: questions.length });
  try { localStorage.setItem('stride-sessions', JSON.stringify(sessions)); } catch { toast('Prática concluída. O armazenamento do navegador está indisponível; o progresso será mantido apenas nesta visita.'); }
  renderStats(); answered = true;
  questions.forEach((question, i) => {
    const feedback = $$('.question-feedback')[i]; feedback.hidden = false;
    const isCorrect = answers[i] === question.answer;
    feedback.classList.add(isCorrect ? 'is-correct' : 'is-incorrect');
    feedback.textContent = `${isCorrect ? 'Você acertou.' : `Você errou. Resposta correta: ${question.options[question.answer]}.`} ${question.explanation}`;
    feedback.closest('fieldset').querySelectorAll('label').forEach((label, optionIndex) => {
      if (optionIndex !== question.answer && optionIndex !== answers[i]) return;
      const correctOption = optionIndex === question.answer;
      label.classList.add(correctOption ? 'answer-correct' : 'answer-incorrect');
      const badge = document.createElement('strong'); badge.className = 'answer-badge';
      badge.textContent = correctOption ? (isCorrect ? 'Sua resposta · correta' : 'Resposta correta') : 'Sua resposta · incorreta';
      label.append(badge);
    });
  });
  $('#quiz-feedback').textContent = correct === null ? 'Prática salva. Reflita sobre o que você compreendeu antes de aumentar o ritmo.' : `Você acertou ${score} de ${questions.length} perguntas (${Math.round(score / questions.length * 100)}%). Prática salva. ${correct ? 'Quando esse ritmo ficar confortável, experimente mais uma palavra por bloco.' : 'Revise as explicações e experimente diminuir a velocidade na próxima sessão.'}`;
  $$('#quiz-options input, #quiz-options textarea').forEach(input => input.disabled = true);
  $('#quiz-submit').textContent = 'Voltar à prática →';
});
$('#start').addEventListener('click', start);
$('#reset').addEventListener('click', reset);
$('#speed').addEventListener('input', event => {
  wpm = validSpeed(event.target.value); $('#speed-value').textContent = wpm;
  $('#current-speed').innerHTML = `${wpm} <small>PPM</small>`;
  try { localStorage.setItem('stride-speed', String(wpm)); } catch { toast('A velocidade será mantida nesta visita, mas não foi possível salvá-la no navegador.'); }
  reset();
});
$$('[data-chunk]').forEach(button => button.addEventListener('click', () => { size = Number(button.dataset.chunk); $$('[data-chunk]').forEach(b => { b.classList.toggle('selected', b === button); b.setAttribute('aria-pressed', String(b === button)); }); reset(); }));
$$('[data-mode]').forEach(button => button.addEventListener('click', () => {
  mode = button.dataset.mode; $$('[data-mode]').forEach(b => { b.classList.toggle('selected', b === button); b.setAttribute('aria-selected', String(b === button)); });
  $('#exercise-label').textContent = mode === 'chunk' ? 'AMPLIE SEU CAMPO DE LEITURA' : 'MANTENHA UM RITMO CONSTANTE';
  $('#exercise-title').textContent = mode === 'chunk' ? 'Leia várias palavras de uma vez.' : 'Deixe o ritmo guiar sua atenção.';
  $('#exercise-description').textContent = mode === 'chunk' ? 'Relaxe o olhar e perceba cada bloco como uma ideia.' : 'Acompanhe cada bloco em destaque ao longo do texto.'; reset();
}));
document.addEventListener('keydown', event => { if (event.code === 'Space' && !['INPUT', 'TEXTAREA', 'BUTTON'].includes(event.target.tagName) && !$('#quiz').open && !$('#practice-view').hidden) { event.preventDefault(); start(); } });
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
for (const item of passages) {
  const card = document.createElement('article'); card.className = 'library-card';
  card.dataset.length = textLengthGroup(wordCount(item.text));
  const category = document.createElement('span'); category.className = 'eyebrow'; category.textContent = item.category.toUpperCase();
  const title = document.createElement('h3'); title.textContent = item.title;
  const info = document.createElement('p'); info.textContent = `${wordCount(item.text)} palavras · ${item.questions.length} perguntas`;
  const button = document.createElement('button'); button.className = 'primary'; button.textContent = 'Ler este texto →'; button.addEventListener('click', () => { passage = item; reset(); switchView('practice'); toast(`Texto selecionado: ${item.title}`); });
  card.append(category, title, info, button); $('#library-cards').append(card);
}
function filterLibrary() {
  const length = $('#length-filter').value;
  const cards = $$('.library-card');
  cards.forEach(card => { card.hidden = length !== 'all' && card.dataset.length !== length; });
  const count = cards.filter(card => !card.hidden).length;
  $('#library-count').textContent = `${count} de ${cards.length} textos`;
  $('#library-empty').hidden = count !== 0;
}
$('#length-filter').addEventListener('change', filterLibrary);
filterLibrary();
$('#custom-text').addEventListener('input', event => { $('#custom-count').textContent = `${wordCount(event.target.value)} palavras`; $('#custom-error').textContent = ''; });
$('#use-custom').addEventListener('click', () => {
  const text = $('#custom-text').value.trim(), count = wordCount(text);
  if (count < 20 || count > 3000) { $('#custom-error').textContent = 'Insira um texto de 20 a 3.000 palavras.'; return; }
  passage = { title: 'Seu próprio texto', category: 'Leitura pessoal', text }; reset(); switchView('practice'); toast('Seu texto está pronto.');
});
renderStats(); reset();
