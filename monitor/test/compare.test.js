const test = require('node:test');
const assert = require('node:assert/strict');
const { diffFields, textSimilarity } = require('../diff/compare');

test('textSimilarity is 1 for identical text', () => {
  assert.equal(textSimilarity('hello world', 'hello world'), 1);
});

test('textSimilarity is low for completely different text', () => {
  assert.ok(textSimilarity('the quick brown fox', 'lorem ipsum dolor sit amet consectetur') < 0.2);
});

test('diffFields finds nothing when values match', () => {
  const changes = diffFields({ exam_date: '2026-11-15' }, { exam_date: { value: '2026-11-15', confidence: 0.9 } });
  assert.equal(changes.length, 0);
});

test('diffFields reports a field-level change with regex detection method', () => {
  const changes = diffFields({ exam_date: '2026-11-15' }, { exam_date: { value: '2026-11-22', confidence: 0.9, raw: '22 November 2026', matchedLabel: 'Date of Examination:' } });
  assert.equal(changes.length, 1);
  assert.equal(changes[0].old_value, '2026-11-15');
  assert.equal(changes[0].new_value, '2026-11-22');
  assert.equal(changes[0].detection_method, 'regex');
});

test('diffFields treats a brand-new field (no prior value) as a change', () => {
  const changes = diffFields({}, { vacancies: { value: '1300', confidence: 0.85 } });
  assert.equal(changes.length, 1);
  assert.equal(changes[0].old_value, null);
});

test('diffFields fills a gap with an AI-detected change the regex missed', () => {
  const changes = diffFields({ eligibility: 'Bachelor degree' }, {}, [
    { field: 'eligibility', old_value: 'Bachelor degree', new_value: 'Bachelor degree in Engineering', confidence: 0.7, evidence: 'corrigendum prose' },
  ]);
  assert.equal(changes.length, 1);
  assert.equal(changes[0].detection_method, 'ai');
});

test('diffFields flags a conflict when AI and regex disagree on the same field', () => {
  const changes = diffFields(
    { exam_date: '2026-11-15' },
    { exam_date: { value: '2026-11-22', confidence: 0.9, raw: '22 Nov 2026', matchedLabel: 'Exam Date:' } },
    [{ field: 'exam_date', old_value: '2026-11-15', new_value: '2026-12-01', confidence: 0.6, evidence: 'ai read' }]
  );
  assert.equal(changes.length, 1);
  assert.equal(changes[0].conflict, true);
});
