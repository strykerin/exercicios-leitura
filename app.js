import { syllableWords, wordPairs, randomSequence, splitFocus, splitBlockFocus } from './visual-exercises.js';
import { setupWordSearch } from './word-search.js';
import { chunks, wordCount, duration, passages, scoreQuiz, dailyPassageIndex, textLengthGroup, validSpeed } from './reading.js';
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
let passage = passages[dailyPassageIndex()];
let mode = 'chunk', size = 3, wpm = 250, status = 'ready', index = 0, groups = [], timer, remaining = 0, deadline = 0, answered = false;
try { wpm = validSpeed(localStorage.getItem('stride-speed'), wpm); } catch { /* Keep the current visit usable without storage. */ }
$('#speed').value = wpm;
$('#speed-value').textContent = wpm;
function toast(message) { $('#toast').textContent = message; $('#toast').hidden = false; setTimeout(() => $('#toast').hidden = true, 4000); }
function switchView(view) {
  if (status === 'running') pause();
  setReadingFocus(false);
  document.body.classList.toggle('guided-view', view === 'practice' && mode === 'paced');
  $$('.view').forEach(el => el.hidden = el.id !== `${view}-view`);
  $$('.nav').forEach(el => el.classList.toggle('active', el.dataset.view === view));
}
$$('.nav').forEach(button => button.addEventListener('click', () => switchView(button.dataset.view)));
const isVisual = () => mode === 'flash' || mode === 'pairs';
const exposureTime = () => isVisual() ? Number($('#exposure').value) : duration(groups[index], wpm);
function setReadingFocus(focused) {
  document.body.classList.toggle('reading-focus', focused);
  $('#exit-focus').hidden = !focused;
}
function reset() {
  setReadingFocus(false);
  document.body.classList.toggle('guided-view', mode === 'paced' && !$('#practice-view').hidden);
  clearTimeout(timer); status = 'ready'; index = 0; remaining = 0;
  $('#word-search').hidden = mode !== 'search';
  $('#reader').hidden = mode === 'search';
  $('.exercise-footer').hidden = mode === 'search';
  if (mode === 'search') {
    $('#reading-settings').hidden = true; $('#visual-settings').hidden = true;
    return;
  }
  groups = isVisual() ? randomSequence(mode === 'flash' ? syllableWords[$('#syllables').value].map(word => word.replaceAll('-', '')) : wordPairs, mode === 'flash' ? 90 : 30) : chunks(passage.text, size);
  $('#reading-settings').hidden = isVisual(); $('#visual-settings').hidden = !isVisual();
  $('#syllable-setting').hidden = mode !== 'flash'; $('#pair-setting').hidden = mode !== 'pairs';
  $('#exposure-unit').textContent = mode === 'pairs' ? 'par' : 'palavra';
  $('#word-display').classList.toggle('flash-word', mode === 'flash');
  $('#word-display').classList.toggle('word-pair', mode === 'pairs');
  $('#word-display').setAttribute('aria-label', isVisual() ? 'Exercício de percepção de palavras' : 'Texto da leitura');
  $('#start').innerHTML = 'Iniciar prática <span>→</span>'; $('#reset').hidden = true;
  $('#reading-state').textContent = 'COMECE NO SEU TEMPO'; $('#read-fill').style.width = '0%';
  $('#reader-hint').textContent = mode === 'chunk' ? 'Mantenha o olhar no centro' : 'Acompanhe o bloco de palavras em destaque';
  $('#passage-label').textContent = passage.category.toUpperCase();
  $('#session-length').textContent = `◷ Cerca de ${Math.max(1, Math.ceil(wordCount(passage.text) / wpm))} min · ${passage.questions?.length ? `${passage.questions.length} perguntas ao final` : 'Reflexão ao final'}`;
  $('#reader').classList.toggle('paced', mode === 'paced');
  if (isVisual()) {
    $('#reader-hint').textContent = mode === 'flash' ? 'Fixe o olhar na letra vermelha e perceba a palavra inteira' : 'Olhe para o ponto central, sem mover os olhos para as palavras';
    $('#passage-label').textContent = mode === 'flash' ? `${$('#syllables').value} SÍLABAS` : 'PERCEPÇÃO DE FORMAS';
    $('#session-length').textContent = `${groups.length} ${mode === 'flash' ? 'palavras' : 'pares'} · ${Math.round(groups.length * exposureTime() / 1000)} s · Sem questionário`;
    renderVisual(mode === 'flash' ? groups[0] : ['rei', 'lei']);
  } else if (mode === 'chunk') renderBlock('Um pequeno passo');
  else { $('#word-display').replaceChildren(...groups.map(group => { const span = document.createElement('span'); span.textContent = group + ' '; return span; })); $('#word-display').scrollTop = 0; }
}
function renderBlock(text) {
  const [before, letter, after] = splitBlockFocus(text);
  const focus = document.createElement('span');
  focus.className = 'block-focus'; focus.textContent = letter;
  $('#word-display').replaceChildren(document.createTextNode(before), focus, document.createTextNode(after));
}
function renderVisual(item) {
  const display = $('#word-display');
  display.replaceChildren();
  const parts = mode === 'flash' ? splitFocus(item) : [item[0], '·', item[1]];
  parts.forEach((part, i) => {
    const span = document.createElement('span'); span.textContent = part;
    span.className = i === 1 ? 'visual-focus' : i === 0 ? 'visual-left' : 'visual-right';
    if (mode === 'pairs' && i === 1) span.setAttribute('aria-hidden', 'true');
    display.append(span);
  });
}
function showChunk() {
  if (isVisual()) {
    renderVisual(groups[index]);
    $('#read-fill').style.width = `${index / groups.length * 100}%`;
    $('#reading-state').textContent = `${index + 1} / ${groups.length} ${mode === 'flash' ? 'PALAVRAS' : 'PARES'}`;
    return;
  }
  if (mode === 'chunk') renderBlock(groups[index]);
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
  timer = setTimeout(() => { index++; if (index >= groups.length) finish(); else { showChunk(); schedule(exposureTime()); } }, ms);
}
function start() {
  if (mode === 'search') return;
  if (status === 'running') { pause(); return; }
  if (status === 'complete') reset();
  const resuming = status === 'paused'; status = 'running';
  setReadingFocus(mode === 'paced');
  $('#reset').hidden = false; $('#start').textContent = 'Pausar Ⅱ'; $('#reader-hint').textContent = isVisual() ? (mode === 'flash' ? 'Olhe para a letra vermelha · Espaço para pausar' : 'Mantenha o olhar no ponto central · Espaço para pausar') : 'Espaço para pausar · Respire e acompanhe o ritmo';
  showChunk(); schedule(resuming ? remaining : exposureTime());
}
function pause() {
  if (status !== 'running') return;
  clearTimeout(timer); remaining = Math.max(0, deadline - performance.now()); status = 'paused';
  $('#start').textContent = 'Continuar →'; $('#reading-state').textContent = 'EM PAUSA'; $('#reader-hint').textContent = 'Sem pressa. Continue quando quiser.';
}
function finish() {
  if (isVisual()) {
    status = 'complete';
    $('#read-fill').style.width = '100%'; $('#reading-state').textContent = 'PRÁTICA CONCLUÍDA';
    $('#word-display').replaceChildren();
    $('#reader-hint').textContent = 'Sessão concluída! Ajuste o tempo para um ritmo confortável.';
    $('#start').textContent = 'Praticar novamente →';
    return;
  }
  status = 'quiz'; $('#read-fill').style.width = '100%'; $('#reading-state').textContent = 'LEITURA CONCLUÍDA'; $('#start').disabled = true;
  answered = false; $('#quiz-feedback').textContent = ''; $('#quiz-submit').textContent = passage.questions?.length ? 'Verificar respostas →' : 'Concluir prática →';
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
  answered = true;
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
  $('#quiz-feedback').textContent = correct === null ? 'Prática concluída. Reflita sobre o que você compreendeu antes de aumentar o ritmo.' : `Você acertou ${score} de ${questions.length} perguntas (${Math.round(score / questions.length * 100)}%). Prática concluída. ${correct ? 'Quando esse ritmo ficar confortável, experimente mais uma palavra por bloco.' : 'Revise as explicações e experimente diminuir a velocidade na próxima sessão.'}`;
  $$('#quiz-options input, #quiz-options textarea').forEach(input => input.disabled = true);
  $('#quiz-submit').textContent = 'Voltar à prática →';
});
$('#start').addEventListener('click', start);
$('#reset').addEventListener('click', reset);
$('#exit-focus').addEventListener('click', () => { pause(); setReadingFocus(false); $('#start').focus(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && document.body.classList.contains('reading-focus') && !$('#quiz').open) {
    pause(); setReadingFocus(false); $('#start').focus();
  }
});
$('#speed').addEventListener('input', event => {
  wpm = validSpeed(event.target.value); $('#speed-value').textContent = wpm;
  try { localStorage.setItem('stride-speed', String(wpm)); } catch { toast('A velocidade será mantida nesta visita, mas não foi possível salvá-la no navegador.'); }
  reset();
});
$$('[data-chunk]').forEach(button => button.addEventListener('click', () => { size = Number(button.dataset.chunk); $$('[data-chunk]').forEach(b => { b.classList.toggle('selected', b === button); b.setAttribute('aria-pressed', String(b === button)); }); reset(); }));
$$('[data-mode]').forEach(button => button.addEventListener('click', () => {
  mode = button.dataset.mode; $$('[data-mode]').forEach(b => { b.classList.toggle('selected', b === button); b.setAttribute('aria-selected', String(b === button)); });
  $('#exercise-title').textContent = mode === 'chunk' ? 'Leia várias palavras de uma vez.' : 'Deixe o ritmo guiar sua atenção.';
  $('#exercise-description').textContent = mode === 'chunk' ? 'Relaxe o olhar e perceba cada bloco como uma ideia.' : 'Acompanhe cada bloco em destaque ao longo do texto.';
  if (isVisual()) {
    $('#exercise-title').textContent = mode === 'flash' ? 'Uma palavra. Um olhar.' : 'Duas palavras, um ponto de foco.';
    $('#exercise-description').textContent = mode === 'flash' ? 'Fixe o olhar na letra vermelha e reconheça a palavra inteira.' : 'Mantenha o olhar no ponto central e perceba as diferenças entre as palavras.';
  }
  if (mode === 'search') {
    $('#exercise-title').textContent = 'Encontre a palavra em meio às outras.';
    $('#exercise-description').textContent = 'Treine a atenção visual: procure todas as repetições da palavra-alvo, da esquerda para a direita.';
  }
  reset();
}));
document.addEventListener('keydown', event => { if (mode !== 'search' && event.code === 'Space' && !['INPUT', 'TEXTAREA', 'BUTTON', 'SELECT'].includes(event.target.tagName) && !$('#quiz').open && !$('#practice-view').hidden) { event.preventDefault(); start(); } });
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
for (const item of passages) {
  const card = document.createElement('article'); card.className = 'library-card';
  card.dataset.length = textLengthGroup(wordCount(item.text));
  const category = document.createElement('span'); category.className = 'eyebrow'; category.textContent = item.category.toUpperCase();
  const title = document.createElement('h3'); title.textContent = item.title;
  const info = document.createElement('p'); info.textContent = `${wordCount(item.text)} palavras · ${item.questions.length} perguntas`;
  const button = document.createElement('button'); button.className = 'primary'; button.textContent = 'Ler este texto →'; button.addEventListener('click', () => { passage = item; if (isVisual() || mode === 'search') $('[data-mode="chunk"]').click(); reset(); switchView('practice'); toast(`Texto selecionado: ${item.title}`); });
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
  passage = { title: 'Seu próprio texto', category: 'Leitura pessoal', text }; if (isVisual() || mode === 'search') $('[data-mode="chunk"]').click(); reset(); switchView('practice'); toast('Seu texto está pronto.');
});
$('#exposure').addEventListener('input', () => { $('#exposure-value').textContent = $('#exposure').value; reset(); });
$('#syllables').addEventListener('change', reset);
$('#pair-gap').addEventListener('input', () => { $('#word-display').style.setProperty('--pair-gap', `${$('#pair-gap').value}px`); reset(); });
setupWordSearch();
reset();
