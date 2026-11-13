import { randomSequence } from './visual-exercises.js';

// Explicit divisions keep the fixed five-syllable difficulty easy to review.
export const searchWords = {
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
export const SEARCH_WORD_COUNT = 30;

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

export function createSearchExercises(random = Math.random) {
  const bank = searchWords[5];
  const words = bank.map(word => word.replaceAll('-', ''));
  return randomSequence(words, SEARCH_EXERCISE_COUNT, random).map((target, index) => {
    const occurrences = index % 2 === 0 ? 2 : 3;
    const candidates = randomSequence(words.filter(word => word !== target), words.length - 1, random);
    const similar = [...candidates].sort((a, b) => letterDistance(target, a) - letterDistance(target, b)).slice(0, 10);
    const others = candidates.filter(word => !similar.includes(word)).slice(0, SEARCH_WORD_COUNT - occurrences - similar.length);
    return { target, words: randomSequence([...similar, ...others, ...Array(occurrences).fill(target)], SEARCH_WORD_COUNT, random) };
  });
}

export function setupWordSearch() {
  const panel = document.querySelector('#word-search');
  const list = panel.querySelector('#search-exercises');
  const exercises = createSearchExercises();

  function render() {
    list.replaceChildren(...exercises.map((exercise, rowIndex) => {
      const row = document.createElement('li'); row.className = 'search-row';
      const heading = document.createElement('h3'); heading.id = `search-target-${rowIndex}`;
      const number = document.createElement('small'); number.textContent = String(rowIndex + 1).padStart(2, '0');
      heading.append(number, document.createTextNode(exercise.target));
      const words = document.createElement('div'); words.className = 'search-words';
      words.setAttribute('role', 'group'); words.setAttribute('aria-labelledby', heading.id);
      exercise.words.forEach(word => {
        const text = document.createElement('span');
        text.className = 'search-word'; text.textContent = word;
        words.append(text);
      });
      row.append(heading, words);
      return row;
    }));
  }

  render();
}
