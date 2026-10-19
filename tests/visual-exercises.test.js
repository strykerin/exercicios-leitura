import test from 'node:test';
import assert from 'node:assert/strict';
import { syllableWords, wordPairs, syllablePairs, wordPairLevels, randomSequence, splitFocus } from '../visual-exercises.js';

test('longer pair levels supply 30 distinct pairs with matching syllable counts', () => {
  assert.equal(wordPairLevels.short, wordPairs);
  for (const count of [3, 4, 5]) {
    const pairs = syllablePairs[count];
    assert.equal(pairs.length, 30);
    assert.equal(new Set(pairs.map(pair => [...pair].sort().join('|'))).size, 30);
    for (const pair of pairs) {
      assert.equal(pair.length, 2);
      assert.notEqual(...pair);
      for (const word of pair) assert.equal(word.split('-').length, count, word);
    }
    const round = randomSequence(wordPairLevels[count], 30);
    assert.equal(new Set(round).size, 30);
    assert.deepEqual(new Set(round), new Set(wordPairLevels[count]));
    for (const word of round.flat()) assert.match(word, /^\p{L}+$/u);
  }
});

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

test('block focus selects a central letter, skipping spaces and punctuation', async () => {
  const { splitBlockFocus } = await import('../visual-exercises.js');
  assert.deepEqual(splitBlockFocus('até a feira.'), ['até a ', 'f', 'eira.']);
  assert.deepEqual(splitBlockFocus('ab cd'), ['a', 'b', ' cd']);
  assert.deepEqual(splitBlockFocus('a...b'), ['', 'a', '...b']);
  assert.deepEqual(splitBlockFocus(' ... '), [' ... ', '', '']);
  assert.deepEqual(splitBlockFocus(''), ['', '', '']);
  for (const text of ['Um pequeno passo', 'coração e atenção', 'gato', 'é', 'até a feira.']) {
    const parts = splitBlockFocus(text);
    assert.equal(parts.join(''), text);
    assert.match(parts[1], /^\p{L}$/u);
  }
});
