import test from 'node:test';
import assert from 'node:assert/strict';
import { chunks, wordCount, duration, localDay, streak, passages, scoreQuiz, dailyPassageIndex, textLengthGroup, validSpeed } from '../reading.js';
test('chunks preserve words and keep a shorter final group', () => {
  assert.deepEqual(chunks(' One  two\nthree four five ', 3), ['One two three', 'four five']);
  assert.deepEqual(chunks('', 3), []);
  assert.equal(wordCount('  '), 0);
});
test('library contains 40 unique passages with three valid questions each', () => {
  assert.equal(passages.length, 40);
  assert.equal(new Set(passages.map(p => p.title)).size, 40);
  assert.equal(new Set(passages.map(p => p.text)).size, 40);
  for (const passage of passages) {
    assert.ok(wordCount(passage.text) >= 80, passage.title);
    assert.equal(passage.questions.length, 3, passage.title);
    assert.equal(new Set(passage.questions.map(q => q.prompt)).size, 3);
    for (const question of passage.questions) {
      assert.equal(question.options.length, 3);
      assert.equal(new Set(question.options).size, 3);
      assert.ok(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < 3);
      assert.ok(question.explanation.length > 20);
    }
  }
});
test('quiz scoring handles full, partial, zero and missing answers', () => {
  for (const passage of passages) {
    const answers = passage.questions.map(q => q.answer);
    assert.equal(scoreQuiz(passage.questions, answers), 3);
    assert.equal(scoreQuiz(passage.questions, [(answers[0] + 1) % 3, ...answers.slice(1)]), 2);
    assert.equal(scoreQuiz(passage.questions, answers.map(a => (a + 1) % 3)), 0);
    assert.equal(scoreQuiz(passage.questions, []), 0);
  }
});
test('daily selection reaches every passage across month boundaries', () => {
  const selections = Array.from({ length: 40 }, (_, i) => dailyPassageIndex(new Date(2026, 9, 20 + i)));
  assert.equal(new Set(selections).size, 40);
});
test('exposure uses actual group length including a partial final chunk', () => {
  assert.equal(duration('one two three', 300), 600);
  assert.equal(duration('four five', 300), 400);
});
test('streak permits an unfinished today and ignores duplicate sessions', () => {
  const now = new Date(2026, 9, 14, 12);
  assert.equal(localDay(now), '2026-10-14');
  assert.equal(streak([{day:'2026-10-13'}, {day:'2026-10-13'}, {day:'2026-10-12'}], now), 2);
  assert.equal(streak([{day:'2026-10-14'}, {day:'2026-10-13'}, {day:'2026-10-11'}], now), 2);
  assert.equal(streak([{day:'2026-10-12'}], now), 0);
});

test('length groups cover boundaries without gaps', () => {
  assert.equal(textLengthGroup(249), 'short');
  assert.equal(textLengthGroup(250), 'medium');
  assert.equal(textLengthGroup(499), 'medium');
  assert.equal(textLengthGroup(500), 'long');
  assert.ok(passages.some(p => textLengthGroup(wordCount(p.text)) === 'medium'));
  assert.ok(passages.filter(p => textLengthGroup(wordCount(p.text)) === 'long').length >= 2);
});
test('saved speed accepts slider values and rejects corrupt storage', () => {
  for (const speed of ['100', '375', '800']) assert.equal(validSpeed(speed), Number(speed));
  for (const value of [null, '', 'oops', 'Infinity', '99', '825', '251']) assert.equal(validSpeed(value), 250);
  assert.equal(validSpeed(null, 400), 400);
});
