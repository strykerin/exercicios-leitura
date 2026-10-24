import test from 'node:test';
import assert from 'node:assert/strict';
import { createMemoryExercises, createFigureExercises, shuffleExercises, shuffled, figureMarkup } from '../row-exercises.js';

function seeded(seed) {
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2 ** 32; };
}

test('every memory row has exactly one repeated word', () => {
  for (let seed = 0; seed < 50; seed++) {
    const rows = createMemoryExercises(seeded(seed));
    assert.equal(rows.length, 15);
    for (const row of rows) {
      assert.equal(row.items.length, 5);
      assert.equal(new Set(row.items).size, 4);
      assert.equal(row.items.filter(word => word === row.target).length, 2);
    }
  }
});

test('figure counts agree with rendered targets and include similar distractors', () => {
  for (let seed = 0; seed < 50; seed++) {
    const rows = createFigureExercises(seeded(seed));
    assert.equal(rows.length, 8);
    assert.equal(new Set(rows.map(row => row.target.split('-')[0])).size, 8);
    for (const row of rows) {
      assert.equal(row.items.length, 20);
      assert.equal(new Set(row.items).size, 5);
      const count = row.items.filter(item => item === row.target).length;
      assert.ok(count >= 2 && count <= 6);
      assert.equal(new Set(row.items.map(figureMarkup)).size, 5);
      assert.match(figureMarkup(row.target), /<svg/);
    }
  }
});

test('shuffle changes every row layout without changing its contents or answer', () => {
  for (const create of [createMemoryExercises, createFigureExercises]) {
    const original = create(seeded(4)).map((row, id) => ({ ...row, id })), snapshot = structuredClone(original);
    for (const random of [seeded(17), () => 0, () => 0.999999]) {
      const changed = shuffleExercises(original, random);
      assert.notDeepEqual(changed.map(row => row.target), original.map(row => row.target));
      for (const row of changed) {
        const before = original.find(item => item.id === row.id);
        assert.equal(row.target, before.target);
        assert.deepEqual([...row.items].sort(), [...before.items].sort());
        assert.notDeepEqual(row.items, before.items);
      }
    }
    assert.deepEqual(original, snapshot);
  }
  assert.deepEqual(shuffled([]), []);
  assert.deepEqual(shuffled(['a', 'a']), ['a', 'a']);
});
