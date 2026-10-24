import { syllableWords, wordPairLevels, randomSequence, splitFocus, splitBlockFocus } from './visual-exercises.js';
import { setupWordSearch } from './word-search.js';
import { chunks, wordCount, duration, passages, scoreQuiz, randomPassage, validSpeed } from './reading.js';
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
let previousTitle;
try { previousTitle = sessionStorage.getItem('stride-last-passage'); } catch { /* Storage is optional. */ }
let passage = randomPassage(passages.find(item => item.title === previousTitle));
function rememberPassage() {
  try { sessionStorage.setItem('stride-last-passage', passage.title); } catch { /* Storage is optional. */ }
}
rememberPassage();
let mode = 'chunk', size = 3, wpm = 250, status = 'ready', index = 0, groups = [], timer, remaining = 0, deadline = 0, answered = false;
try { wpm = validSpeed(localStorage.getItem('stride-speed'), wpm); } catch { /* Keep the current visit usable without storage. */ }
$('#speed').value = wpm;
$('#speed-value').textContent = wpm;
function toast(message) { $('#toast').textContent = message; $('#toast').hidden = false; setTimeout(() => $('#toast').hidden = true, 4000); }
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
  $('#start').disabled = false;
  $('#text-picker').hidden = mode !== 'chunk' && mode !== 'paced';
  $('#selected-text-title').textContent = passage.title;
  $('#selected-text-info').textContent = `${wordCount(passage.text)} palavras · ${passage.questions?.length ? `${passage.questions.length} perguntas` : 'Reflexão ao final'}`;
  $('#word-search').hidden = mode !== 'search';
  $('#reader').hidden = mode === 'search';
  $('.exercise-footer').hidden = mode === 'search';
  if (mode === 'search') {
    $('#reading-settings').hidden = true; $('#visual-settings').hidden = true;
    return;
  }
  groups = isVisual() ? randomSequence(mode === 'flash' ? syllableWords[$('#syllables').value].map(word => word.replaceAll('-', '')) : wordPairLevels[$('#pair-syllables').value], mode === 'flash' ? 90 : 30) : chunks(passage.text, size);
  $('#reading-settings').hidden = isVisual(); $('#visual-settings').hidden = !isVisual();
  $('#word-display').style.removeProperty('font-size');
  $('#syllable-setting').hidden = mode !== 'flash';
  $('#pair-syllable-setting').hidden = mode !== 'pairs';
  $('#exposure-unit').textContent = mode === 'pairs' ? 'par' : 'palavra';
  $('#word-display').classList.toggle('flash-word', mode === 'flash');
  $('#word-display').classList.toggle('word-pair', mode === 'pairs');
  $('#word-display').setAttribute('aria-label', isVisual() ? 'Exercício de percepção de palavras' : 'Texto da leitura');
  $('#start').innerHTML = 'Iniciar prática <span>→</span>'; $('#reset').hidden = true;
  $('#read-fill').style.width = '0%';
  $('#session-length').textContent = `◷ Cerca de ${Math.max(1, Math.ceil(wordCount(passage.text) / wpm))} min`;
  $('#reader').classList.toggle('paced', mode === 'paced');
  if (isVisual()) {
    $('#session-length').textContent = `${groups.length} ${mode === 'flash' ? 'palavras' : 'pares'} · ${Math.round(groups.length * exposureTime() / 1000)} s`;
    renderVisual(groups[0]);
  } else if (mode === 'chunk') renderBlock(groups[0]);
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
  fitWordPairs();
}
function fitWordPairs() {
  const display = $('#word-display');
  display.style.removeProperty('font-size');
  if (mode !== 'pairs' || !display.children.length || !display.clientWidth) return;
  const available = (display.clientWidth - display.children[1].getBoundingClientRect().width) / 2;
  const fontSize = parseFloat(getComputedStyle(display).fontSize);
  // Size for the longest word in the round so the text stays steady between pairs.
  const context = document.createElement('canvas').getContext('2d');
  context.font = getComputedStyle(display).font;
  const widest = Math.max(...groups.flat().map(word => context.measureText(word).width));
  if (widest > available) display.style.fontSize = `${Math.max(1, Math.floor(fontSize * available / widest))}px`;
}
let pairDisplayWidth = 0;
new ResizeObserver(([entry]) => {
  if (entry.contentRect.width === pairDisplayWidth) return;
  pairDisplayWidth = entry.contentRect.width;
  fitWordPairs();
}).observe($('#word-display'));
function showChunk() {
  if (isVisual()) {
    renderVisual(groups[index]);
    $('#read-fill').style.width = `${index / groups.length * 100}%`;
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
  $('#reset').hidden = false; $('#start').textContent = 'Pausar Ⅱ';
  showChunk(); schedule(resuming ? remaining : exposureTime());
}
function pause() {
  if (status !== 'running') return;
  clearTimeout(timer); remaining = Math.max(0, deadline - performance.now()); status = 'paused';
  $('#start').textContent = 'Continuar →';
}
function finish() {
  if (isVisual()) {
    status = 'complete';
    $('#read-fill').style.width = '100%';
    $('#word-display').replaceChildren();
    $('#start').textContent = 'Praticar novamente →';
    return;
  }
  status = 'quiz'; $('#read-fill').style.width = '100%'; $('#start').disabled = true;
  $('#quiz-title').textContent = 'O que você compreendeu?';
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
  $('#quiz-body').scrollTop = 0;
}
function dismissQuiz() {
  $('#quiz').close();
  reset();
  $('#start').focus();
}
$('#quiz-close').addEventListener('click', dismissQuiz);
$('#quiz').addEventListener('cancel', event => {
  event.preventDefault();
  dismissQuiz();
});
$('#quiz').addEventListener('close', () => {
  if (status === 'quiz') dismissQuiz();
});
$('#quiz-form').addEventListener('submit', event => {
  event.preventDefault();
  if (answered) { dismissQuiz(); return; }
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
  $('#quiz-feedback').textContent = correct === null ? 'Prática concluída.' : `Você acertou ${score} de ${questions.length} perguntas (${Math.round(score / questions.length * 100)}%).`;
  $$('#quiz-options input, #quiz-options textarea').forEach(input => input.disabled = true);
  $('#quiz-submit').textContent = 'Voltar à prática →';
  $('#quiz-title').textContent = 'Resultado da prática';
  $('#quiz-body').scrollTop = 0;
  $('#quiz-submit').focus({ preventScroll: true });
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
  reset();
}));
document.addEventListener('keydown', event => { if (mode !== 'search' && event.code === 'Space' && !['INPUT', 'TEXTAREA', 'BUTTON', 'SELECT', 'SUMMARY'].includes(event.target.tagName) && !$('#quiz').open && !$('#practice-view').hidden) { event.preventDefault(); start(); } });
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
function newReading() {
  passage = randomPassage(passage);
  rememberPassage();
  reset();
}
$('#new-reading').addEventListener('click', newReading);
window.addEventListener('pageshow', event => {
  if (event.persisted) {
    if ($('#quiz').open) $('#quiz').close();
    newReading();
  }
});
$('#exposure').addEventListener('input', () => { $('#exposure-value').textContent = $('#exposure').value; reset(); });
$('#syllables').addEventListener('change', reset);
$('#pair-syllables').addEventListener('change', reset);
setupWordSearch();
reset();
