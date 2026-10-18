import test from 'node:test';
import assert from 'node:assert/strict';
import { syllableWords, wordPairs, randomSequence, splitFocus } from '../visual-exercises.js';

test('syllable banks provide 90 unique words per level with matching divisions', () => {
  for (const [count, words] of Object.entries(syllableWords)) {
    assert.equal(words.length, 90);
    assert.equal(new Set(words).size, 90);
    for (const word of words) assert.equal(word.split('-').length, Number(count), word);
    const sequence = randomSequence(words, 90);
    assert.deepEqual(new Set(sequence), new Set(words));
  }
});
test('random sessions preserve items and avoid adjacent repeats across cycles', () => {
  const sequence = randomSequence(['a', 'b', 'c'], 30, () => 0.5);
  assert.equal(sequence.length, 30);
  sequence.forEach((word, i) => { if (i) assert.notEqual(word, sequence[i - 1]); });
  assert.deepEqual(randomSequence([]), []);
  assert.equal(wordPairs.length, 30);
  for (const pair of wordPairs) { assert.equal(pair.length, 2); assert.notEqual(...pair); }
});
test('focus splits odd, even and accented words without losing letters', () => {
  assert.deepEqual(splitFocus('janela'), ['ja', 'n', 'ela']);
  assert.deepEqual(splitFocus('gato'), ['g', 'a', 'to']);
  assert.deepEqual(splitFocus('sabão'), ['sa', 'b', 'ão']);
  assert.deepEqual(splitFocus('cabeça'), ['ca', 'b', 'eça']);
  for (const words of Object.values(syllableWords)) for (const divided of words) {
    const word = divided.replaceAll('-', '');
    assert.equal(splitFocus(word).join(''), word);
  }
});
