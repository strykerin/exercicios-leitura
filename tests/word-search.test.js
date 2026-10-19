import test from 'node:test';
import assert from 'node:assert/strict';
import { searchWords, createSearchExercises, scoreSearchExercise, SEARCH_EXERCISE_COUNT, SEARCH_WORD_COUNT } from '../word-search.js';

test('five syllable levels have enough unique targets for 30 exercises', () => {
  assert.deepEqual(Object.keys(searchWords), ['1', '2', '3', '4', '5']);
  for (const [count, words] of Object.entries(searchWords)) {
    assert.ok(words.length >= 30);
    assert.equal(new Set(words.map(word => word.replaceAll('-', ''))).size, words.length);
    for (const word of words) assert.equal(word.split('-').length, Number(count), word);
  }
});

test('every series triples the reference with distinct targets and repeated matches', () => {
  for (const count of Object.keys(searchWords)) {
    for (const random of [() => 0, () => 0.5, () => 0.9999, Math.random]) {
      const exercises = createSearchExercises(count, random);
      assert.equal(exercises.length, 10 * 3);
      assert.equal(exercises.length, SEARCH_EXERCISE_COUNT);
      assert.equal(new Set(exercises.map(exercise => exercise.target)).size, 30);
      const bank = new Set(searchWords[count].map(word => word.replaceAll('-', '')));
      for (const { target, words } of exercises) {
        assert.equal(words.length, SEARCH_WORD_COUNT);
        assert.ok(bank.has(target));
        words.forEach(word => assert.ok(bank.has(word)));
        const matches = words.filter(word => word === target).length;
        assert.ok(matches === 2 || matches === 3);
        const distractors = words.filter(word => word !== target);
        assert.equal(new Set(distractors).size, distractors.length);
      }
    }
  }
  assert.throws(() => createSearchExercises(6), RangeError);
});

test('correction distinguishes complete, missed and incorrectly selected words', () => {
  const exercise = { target: 'casa', words: ['casa', 'capa', 'casa', 'carro'] };
  assert.deepEqual(scoreSearchExercise(exercise, new Set()), { hits: 0, missed: 2, wrong: 0, complete: false });
  assert.deepEqual(scoreSearchExercise(exercise, new Set([0, 2])), { hits: 2, missed: 0, wrong: 0, complete: true });
  assert.deepEqual(scoreSearchExercise(exercise, new Set([0, 1])), { hits: 1, missed: 1, wrong: 1, complete: false });
  assert.deepEqual(scoreSearchExercise(exercise, new Set([0, 1, 2, 3])), { hits: 2, missed: 0, wrong: 2, complete: false });
});
