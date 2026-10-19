import { syllableWords, randomSequence } from './visual-exercises.js';

// Explicit divisions make every difficulty level easy to review.
export const searchWords = {
  1: ['sol', 'sal', 'sul', 'mar', 'par', 'lar', 'bar', 'dor', 'cor', 'flor',
    'pão', 'mão', 'cão', 'chão', 'não', 'são', 'grão', 'vão', 'bom', 'som',
    'tom', 'dom', 'bem', 'trem', 'quem', 'cem', 'sem', 'fim', 'sim', 'rim',
    'rei', 'lei', 'boi', 'foi', 'pai', 'vai', 'pé', 'fé', 'chá', 'já',
    'luz', 'cruz', 'voz', 'vez', 'nós', 'paz', 'faz', 'giz', 'três', 'mês'],
  ...syllableWords,
  5: ['a-ca-de-mi-a', 'a-gri-cul-tu-ra', 'a-li-men-ta-ção', 'a-ma-du-re-cer',
    'a-po-sen-ta-do', 'a-pre-sen-ta-ção', 'a-pro-vei-ta-do',
    'ar-te-sa-na-to', 'as-so-ci-a-ção', 'a-ten-ci-o-so', 'a-tu-a-li-zar',
    'bi-bli-o-te-ca', 'ca-te-go-ri-a',
    'ce-le-bra-ri-a', 'co-la-bo-ra-ção', 'co-mu-ni-ca-ção', 'co-mu-ni-da-de',
    'con-si-de-ra-ção', 'de-co-ra-ti-vo',
    'de-li-ca-de-za', 'de-mo-cra-ci-a', 'de-par-ta-men-to', 'de-sen-vol-vi-do',
    'di-fi-cul-da-de', 'do-cu-men-ta-ção', 'e-co-no-mi-a',
    'e-du-ca-ti-vo',
    'es-ta-be-le-cer', 'ex-pe-ri-men-tal', 'ex-pe-ri-men-to', 'fe-li-ci-da-de',
    'fo-to-gra-fi-a', 'ge-o-gra-fi-a', 'i-lu-mi-na-ção', 'i-ma-gi-na-ção',
    'in-de-pen-den-te', 'in-te-li-gen-te', 'la-bo-ra-tó-rio', 'li-te-ra-tu-ra',
    'ma-te-má-ti-ca', 'mo-di-fi-ca-ção', 'o-bri-ga-tó-rio', 'or-ga-ni-za-ção',
    'par-ti-ci-pa-ção', 'pla-ne-ja-men-to',
    'qua-li-fi-ca-ção', 're-co-men-da-ção', 're-cu-pe-ra-ção',
    'sig-ni-fi-ca-do', 'te-le-vi-so-ra']
};

export const SEARCH_EXERCISE_COUNT = 30; // Three times the 10 rows in the reference.
export const SEARCH_WORD_COUNT = 20;

function letterDistance(left, right) {
  let previous = Array.from({ length: right.length + 1 }, (_, i) => i);
  for (let i = 0; i < left.length; i++) {
    const row = [i + 1];
    for (let j = 0; j < right.length; j++) {
      row.push(Math.min(row[j] + 1, previous[j + 1] + 1, previous[j] + Number(left[i] !== right[j])));
    }
    previous = row;
  }
  return previous[right.length];
}

export function createSearchExercises(syllables, random = Math.random) {
  const bank = searchWords[syllables];
  if (!bank) throw new RangeError('Escolha um nível de 1 a 5 sílabas.');
  const words = bank.map(word => word.replaceAll('-', ''));
  return randomSequence(words, SEARCH_EXERCISE_COUNT, random).map((target, index) => {
    const occurrences = index % 2 === 0 ? 2 : 3;
    const candidates = randomSequence(words.filter(word => word !== target), words.length - 1, random);
    const similar = [...candidates].sort((a, b) => letterDistance(target, a) - letterDistance(target, b)).slice(0, 10);
    const others = candidates.filter(word => !similar.includes(word)).slice(0, SEARCH_WORD_COUNT - occurrences - similar.length);
    return { target, words: randomSequence([...similar, ...others, ...Array(occurrences).fill(target)], SEARCH_WORD_COUNT, random) };
  });
}

export function scoreSearchExercise(exercise, selected) {
  let hits = 0, missed = 0, wrong = 0;
  exercise.words.forEach((word, i) => {
    if (word === exercise.target) selected.has(i) ? hits++ : missed++;
    else if (selected.has(i)) wrong++;
  });
  return { hits, missed, wrong, complete: missed === 0 && wrong === 0 };
}

export function setupWordSearch() {
  const panel = document.querySelector('#word-search');
  const list = panel.querySelector('#search-exercises');
  const level = panel.querySelector('#search-syllables');
  const feedback = panel.querySelector('#search-feedback');
  const check = panel.querySelector('#search-check');
  const clear = panel.querySelector('#search-clear');
  let exercises, selections, checked;

  function updateSelectionCount() {
    const count = selections.reduce((total, selected) => total + selected.size, 0);
    feedback.textContent = `${count} ${count === 1 ? 'palavra marcada' : 'palavras marcadas'} · Encontre todas as repetições de cada palavra-alvo.`;
  }

  function render() {
    checked = false;
    selections = exercises.map(() => new Set());
    check.disabled = false;
    list.replaceChildren(...exercises.map((exercise, rowIndex) => {
      const row = document.createElement('li'); row.className = 'search-row';
      const heading = document.createElement('h3'); heading.id = `search-target-${rowIndex}`;
      const number = document.createElement('small'); number.textContent = String(rowIndex + 1).padStart(2, '0');
      heading.append(number, document.createTextNode(exercise.target));
      const words = document.createElement('div'); words.className = 'search-words';
      words.setAttribute('role', 'group'); words.setAttribute('aria-labelledby', heading.id);
      exercise.words.forEach((word, wordIndex) => {
        const button = document.createElement('button'); button.type = 'button';
        button.className = 'search-word'; button.textContent = word;
        button.setAttribute('aria-pressed', 'false');
        button.addEventListener('click', () => {
          if (checked) return;
          const selected = selections[rowIndex];
          if (selected.has(wordIndex)) selected.delete(wordIndex); else selected.add(wordIndex);
          button.setAttribute('aria-pressed', String(selected.has(wordIndex)));
          updateSelectionCount();
        });
        words.append(button);
      });
      const result = document.createElement('p'); result.className = 'search-row-result'; result.hidden = true;
      row.append(heading, words, result);
      return row;
    }));
    updateSelectionCount();
    panel.querySelector('#search-legend').hidden = true;
  }

  function newSeries() { exercises = createSearchExercises(Number(level.value)); render(); }
  level.addEventListener('change', newSeries);
  panel.querySelector('#search-new').addEventListener('click', newSeries);
  clear.addEventListener('click', render);
  check.addEventListener('click', () => {
    checked = true; check.disabled = true;
    let complete = 0, hits = 0, missed = 0, wrong = 0;
    exercises.forEach((exercise, rowIndex) => {
      const score = scoreSearchExercise(exercise, selections[rowIndex]);
      complete += Number(score.complete); hits += score.hits; missed += score.missed; wrong += score.wrong;
      const row = list.children[rowIndex];
      row.querySelectorAll('button').forEach((button, wordIndex) => {
        const selected = selections[rowIndex].has(wordIndex), match = exercise.words[wordIndex] === exercise.target;
        const state = match ? (selected ? 'correct' : 'missed') : selected ? 'wrong' : '';
        const label = { correct: 'correta', missed: 'não marcada', wrong: 'incorreta' }[state];
        if (state) { button.classList.add(`search-${state}`); button.setAttribute('aria-label', `${button.textContent}: ${label}`); }
        button.setAttribute('aria-disabled', 'true');
      });
      const result = row.querySelector('.search-row-result'); result.hidden = false;
      result.textContent = score.complete ? 'Todas encontradas!' : `Corretas: ${score.hits} · Não marcadas: ${score.missed} · Incorretas: ${score.wrong}`;
    });
    feedback.textContent = `Exercícios completos: ${complete} de ${exercises.length} · Corretas: ${hits} · Não marcadas: ${missed} · Incorretas: ${wrong}.`;
    panel.querySelector('#search-legend').hidden = false;
  });
  newSeries();
}
