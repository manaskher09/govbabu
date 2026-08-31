const test = require('node:test');
const assert = require('node:assert/strict');
const { runSanityChecks } = require('../validate/sanityChecks');

function change(overrides) {
  return { field_name: 'exam_date', old_value: '2026-11-15', new_value: '2026-11-22', confidence: 0.95, detection_method: 'regex', evidence: '', ...overrides };
}

test('a clean high-confidence date change is CONFIRMED_CHANGE', () => {
  const [c] = runSanityChecks([change()], { exam_date: '2026-11-22' });
  assert.equal(c.classification, 'CONFIRMED_CHANGE');
  assert.deepEqual(c.issues, []);
});

test('a low-confidence change with no red flags is POSSIBLE_CHANGE', () => {
  const [c] = runSanityChecks([change({ confidence: 0.7 })], { exam_date: '2026-11-22' });
  assert.equal(c.classification, 'POSSIBLE_CHANGE');
});

test('an invalid date is flagged and forced to NEEDS_HUMAN_REVIEW', () => {
  const [c] = runSanityChecks([change({ new_value: '2026-02-30' })], { exam_date: '2026-02-30' });
  assert.ok(c.issues.includes('invalid_date'));
  assert.equal(c.classification, 'NEEDS_HUMAN_REVIEW');
});

test('vacancies must be numeric', () => {
  const c0 = change({ field_name: 'vacancies', old_value: '1250', new_value: 'about a thousand' });
  const [c] = runSanityChecks([c0], { vacancies: 'about a thousand' });
  assert.ok(c.issues.includes('non_numeric_vacancies'));
});

test('a non-empty field never gets silently overwritten with null', () => {
  const c0 = change({ old_value: '2026-11-15', new_value: null });
  const [c] = runSanityChecks([c0], { exam_date: null });
  assert.ok(c.issues.includes('null_overwrite_blocked'));
  assert.equal(c.classification, 'NEEDS_HUMAN_REVIEW');
});

test('application start date after end date is flagged on both fields', () => {
  const changes = [
    change({ field_name: 'application_start_date', old_value: '2026-05-01', new_value: '2026-10-01' }),
    change({ field_name: 'application_end_date', old_value: '2026-05-31', new_value: '2026-09-01' }),
  ];
  const annotated = runSanityChecks(changes, { application_start_date: '2026-10-01', application_end_date: '2026-09-01' });
  assert.ok(annotated.every((c) => c.issues.includes('application_start_after_end')));
});

test('exam date before application close is flagged', () => {
  const changes = [change({ field_name: 'exam_date', new_value: '2026-05-01' })];
  const annotated = runSanityChecks(changes, { exam_date: '2026-05-01', application_end_date: '2026-06-01' });
  assert.ok(annotated[0].issues.includes('exam_date_before_application_close'));
});

test('an unusually large date jump is flagged for review, not blocked', () => {
  const c0 = change({ old_value: '2026-11-15', new_value: '2027-05-15' });
  const [c] = runSanityChecks([c0], { exam_date: '2027-05-15' });
  assert.ok(c.issues.includes('unusual_date_jump'));
  assert.equal(c.classification, 'NEEDS_HUMAN_REVIEW');
});

test('dramatic overall content change flags every field in the batch', () => {
  const [c] = runSanityChecks([change()], { exam_date: '2026-11-22' }, { textSimilarity: 0.05 });
  assert.ok(c.issues.includes('dramatic_content_change'));
});

test('a conflicting AI extraction is flagged, not silently trusted', () => {
  const c0 = change({ conflict: true });
  const [c] = runSanityChecks([c0], { exam_date: '2026-11-22' });
  assert.ok(c.issues.includes('ai_regex_conflict'));
});

test('cross-source disagreement is surfaced via the injected lookup', () => {
  const [c] = runSanityChecks([change()], { exam_date: '2026-11-22' }, {
    findConflictingSource: () => '2026-11-30',
  });
  assert.ok(c.issues.some((i) => i.startsWith('cross_source_disagreement')));
});
