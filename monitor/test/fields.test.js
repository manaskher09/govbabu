const test = require('node:test');
const assert = require('node:assert/strict');
const { extractField, extractAllFields, normalizeDate } = require('../extract/fields');

test('normalizeDate parses month-name dates', () => {
  const r = normalizeDate('15 November 2026');
  assert.equal(r.iso, '2026-11-15');
});

test('normalizeDate parses numeric dd/mm/yyyy dates', () => {
  const r = normalizeDate('05/10/2026');
  assert.equal(r.iso, '2026-10-05');
});

test('extractField finds exam date near its label', () => {
  const text = 'Important dates: Date of Examination: 22 November 2026. Other info follows.';
  const f = extractField(text, 'exam_date');
  assert.equal(f.value, '2026-11-22');
});

test('extractField finds vacancies as a plain number', () => {
  const text = 'Total Number of Vacancies: 1,300 posts across categories.';
  const f = extractField(text, 'vacancies');
  assert.equal(f.value, '1300');
});

test('extractField finds application last date', () => {
  const text = 'Last Date for Submission of Online Application: 05 October 2026.';
  const f = extractField(text, 'application_end_date');
  assert.equal(f.value, '2026-10-05');
});

test('extractField returns null when the label is absent', () => {
  assert.equal(extractField('nothing relevant here', 'exam_date'), null);
});

test('extractAllFields extracts multiple fields from one notification', () => {
  const text = `
    Commencement of Online Application: 07 May 2026.
    Last Date for Submission of Online Application: 31 May 2026.
    Total Number of Vacancies: 1,189 posts.
    Date of Examination: 25 October 2026.
    Application Fee: Rs. 600 for General category.
  `;
  const fields = extractAllFields(text);
  assert.equal(fields.application_start_date.value, '2026-05-07');
  assert.equal(fields.application_end_date.value, '2026-05-31');
  assert.equal(fields.vacancies.value, '1189');
  assert.equal(fields.exam_date.value, '2026-10-25');
  assert.equal(fields.application_fee.value, '600');
});
