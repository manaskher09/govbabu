const test = require('node:test');
const assert = require('node:assert/strict');
const { runImport, cleanVacancies, bestEffortIsoDate } = require('../scripts/import-existing-exams');
const { createTestDb } = require('./helpers');
const { getCurrentExam } = require('../db/currentExam');

const FAKE_APPLICATIONS = [
  {
    code: 'FAKE-A', name: 'Fake Exam A', cat: 'Central Govt', status: 'open', popularity: 1,
    vacancies: '1,250', notifTitle: 'Fake A Notification', applyStart: '07 May 2026', applyEnd: '31 May 2026 (extended)',
    officialUrl: 'https://a.gov.in/notice.pdf', verified: '01 Aug 2026',
    photo: { dims: '3.5x4.5cm', minKB: 20, maxKB: 50, format: 'JPEG' },
    details: { eligibility: { age: '18-27', qualification: 'Graduate' } },
  },
  { code: 'FAKE-B', name: 'Fake Exam B', cat: 'Railway', status: 'closed', applyStart: 'not a real date', applyEnd: '', officialUrl: 'https://b.gov.in' },
  { code: 'FAKE-A', name: 'Duplicate of A', cat: 'Central Govt' }, // duplicate code within the same batch
];

test('cleanVacancies strips formatting to a bare digit string', () => {
  assert.equal(cleanVacancies('1,250'), '1250');
  assert.equal(cleanVacancies('25,000+'), '25000');
});

test('bestEffortIsoDate parses a real date and returns null for unparseable text', () => {
  assert.equal(bestEffortIsoDate('07 May 2026'), '2026-05-07');
  assert.equal(bestEffortIsoDate('not a real date'), null);
  assert.equal(bestEffortIsoDate(''), null);
});

test('a dry run imports nothing but still reports an accurate summary', () => {
  const db = createTestDb();
  const summary = runImport(db, FAKE_APPLICATIONS, { dryRun: true });
  assert.equal(summary.found, 3);
  assert.equal(summary.created, 2);
  assert.equal(summary.duplicates, 1);
  assert.equal(db.prepare('SELECT COUNT(*) n FROM exams').get().n, 0, 'dry run must not persist anything');
});

test('a real run imports exams, detects duplicates, and preserves all mappable fields', () => {
  const db = createTestDb();
  const summary = runImport(db, FAKE_APPLICATIONS);
  assert.equal(summary.created, 2);
  assert.equal(summary.duplicates, 1);
  assert.equal(summary.failed, 0);

  const examId = db.prepare(`SELECT id FROM exams WHERE code = 'FAKE-A'`).get().id;
  const current = getCurrentExam(db, examId);
  assert.equal(current.fields.vacancies, '1250');
  assert.equal(current.fields.vacancies_display, '1,250', 'the verbatim original string, not the digit-stripped form');
  assert.equal(current.fields.notif_title, 'Fake A Notification');
  assert.equal(current.fields.application_start_date, '2026-05-07');
  assert.equal(current.fields.application_end_date, '2026-05-31');
  assert.deepEqual(current.fields.photo_json, { dims: '3.5x4.5cm', minKB: 20, maxKB: 50, format: 'JPEG' });
  assert.deepEqual(current.fields.details_json, { eligibility: { age: '18-27', qualification: 'Graduate' } });
});

test('a compound/approximate vacancies string is preserved verbatim in vacancies_display, not mangled by digit-stripping', () => {
  const db = createTestDb();
  const compound = [
    { code: 'FAKE-C', name: 'Fake Exam C', cat: 'Railway', vacancies: '8,868 (5,810 Graduate + 3,058 Undergraduate)' },
    { code: 'FAKE-D', name: 'Fake Exam D', cat: 'Central Govt', vacancies: '~933' },
  ];
  runImport(db, compound);

  const cId = db.prepare(`SELECT id FROM exams WHERE code = 'FAKE-C'`).get().id;
  const dId = db.prepare(`SELECT id FROM exams WHERE code = 'FAKE-D'`).get().id;
  assert.equal(getCurrentExam(db, cId).fields.vacancies_display, '8,868 (5,810 Graduate + 3,058 Undergraduate)');
  assert.equal(getCurrentExam(db, dId).fields.vacancies_display, '~933');
});

test('an unparseable date is reported as needing manual mapping, not silently dropped or guessed', () => {
  const db = createTestDb();
  const summary = runImport(db, FAKE_APPLICATIONS);
  assert.ok(summary.needsManualMapping.some((m) => m.code === 'FAKE-B' && m.field === 'application_start_date'));
  const examId = db.prepare(`SELECT id FROM exams WHERE code = 'FAKE-B'`).get().id;
  const current = getCurrentExam(db, examId);
  assert.equal(current.fields.application_start_date, undefined);
});

test('running the import twice does not create duplicate exam rows, and reports the second run as unchanged', () => {
  const db = createTestDb();
  runImport(db, FAKE_APPLICATIONS);
  const secondRun = runImport(db, FAKE_APPLICATIONS);
  assert.equal(secondRun.created, 0);
  assert.equal(secondRun.updated, 0);
  assert.equal(secondRun.unchanged, 2);
  assert.equal(secondRun.duplicates, 1, 'only the in-batch duplicate code, not the already-imported exams');
  assert.equal(db.prepare('SELECT COUNT(*) n FROM exams').get().n, 2);
});

test('re-running after app.js gains richer content updates the existing exam instead of skipping it', () => {
  const db = createTestDb();
  runImport(db, FAKE_APPLICATIONS);
  const examId = db.prepare(`SELECT id FROM exams WHERE code = 'FAKE-A'`).get().id;
  const before = getCurrentExam(db, examId);
  assert.deepEqual(before.fields.details_json, { eligibility: { age: '18-27', qualification: 'Graduate' } });

  const richer = FAKE_APPLICATIONS.map((e) =>
    e.code === 'FAKE-A' && e.name === 'Fake Exam A'
      ? { ...e, details: { eligibility: { age: '18-27', qualification: 'Graduate' }, faqs: [{ q: 'New FAQ?', a: 'Yes.' }] } }
      : e
  );
  const secondRun = runImport(db, richer);
  assert.equal(secondRun.updated, 1);
  assert.equal(secondRun.created, 0);

  const after = getCurrentExam(db, examId);
  assert.deepEqual(after.fields.details_json, {
    eligibility: { age: '18-27', qualification: 'Graduate' },
    faqs: [{ q: 'New FAQ?', a: 'Yes.' }],
  });

  const historyRows = db
    .prepare('SELECT is_current FROM field_history WHERE exam_id = ? AND field_name = ? ORDER BY id')
    .all(examId, 'details_json');
  assert.deepEqual(historyRows.map((r) => r.is_current), [0, 1], 'old value superseded, exactly one current row remains');
});

test('exams.code and organizations.short_code foreign keys/uniqueness are enforced', () => {
  const db = createTestDb();
  runImport(db, FAKE_APPLICATIONS);
  assert.throws(() => {
    db.prepare(`INSERT INTO exams (org_id, code, name) VALUES (99999, 'ORPHAN', 'Orphan Exam')`).run();
  }, /FOREIGN KEY/);
});
