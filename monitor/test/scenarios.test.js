const test = require('node:test');
const assert = require('node:assert/strict');
const { runCheck } = require('../pipeline/runCheck');
const { approveChange } = require('../pipeline/applyApproval');
const { createTestDb, seedExamWithSource, fakeFetcherReturning, fakePdfParser } = require('./helpers');

const noAi = async () => null; // keep every scenario deterministic / offline

function notice({ examDate = '22 November 2026', endDate = '05 October 2026', startDate = '07 September 2026', vacancies = '1,300' } = {}) {
  return `
    OFFICIAL RECRUITMENT NOTIFICATION
    Commencement of Online Application: ${startDate}.
    Last Date for Submission of Online Application: ${endDate}.
    Total Number of Vacancies: ${vacancies} posts across various categories.
    Date of Examination: ${examDate}.
    Application Fee: Rs. 600 for General category.
    Please read the notification carefully before applying.
  `;
}

test('1. no change: identical content is a cheap no-op', async () => {
  const db = createTestDb();
  const { sourceId } = seedExamWithSource(db);
  const text = notice();
  await runCheck(db, sourceId, { fetcher: fakeFetcherReturning(text), aiAssist: noAi });
  const r2 = await runCheck(db, sourceId, { fetcher: fakeFetcherReturning(text), aiAssist: noAi });
  assert.equal(r2.result, 'no_change');
  assert.equal(db.prepare('SELECT COUNT(*) n FROM change_events').get().n, 5); // first run: 5 brand-new fields
});

test('2. exam date change is detected and classified CONFIRMED_CHANGE', async () => {
  const db = createTestDb();
  const { examId, sourceId } = seedExamWithSource(db);
  await runCheck(db, sourceId, { fetcher: fakeFetcherReturning(notice({ examDate: '15 November 2026' })), aiAssist: noAi });
  for (const row of db.prepare("SELECT id FROM change_events WHERE status='pending'").all()) approveChange(db, row.id, 1);

  const r = await runCheck(db, sourceId, { fetcher: fakeFetcherReturning(notice({ examDate: '22 November 2026' })), aiAssist: noAi });
  const examDateChange = r.changes.find((c) => c.field_name === 'exam_date');
  assert.equal(examDateChange.old_value, '2026-11-15');
  assert.equal(examDateChange.new_value, '2026-11-22');
  assert.equal(examDateChange.classification, 'CONFIRMED_CHANGE');
});

test('3. deadline extension (application_end_date) is detected', async () => {
  const db = createTestDb();
  const { sourceId } = seedExamWithSource(db);
  await runCheck(db, sourceId, { fetcher: fakeFetcherReturning(notice({ endDate: '30 September 2026' })), aiAssist: noAi });
  for (const row of db.prepare("SELECT id FROM change_events WHERE status='pending'").all()) approveChange(db, row.id, 1);

  const r = await runCheck(db, sourceId, { fetcher: fakeFetcherReturning(notice({ endDate: '05 October 2026' })), aiAssist: noAi });
  const c = r.changes.find((c) => c.field_name === 'application_end_date');
  assert.equal(c.old_value, '2026-09-30');
  assert.equal(c.new_value, '2026-10-05');
});

test('4. vacancy count change is detected', async () => {
  const db = createTestDb();
  const { sourceId } = seedExamWithSource(db);
  await runCheck(db, sourceId, { fetcher: fakeFetcherReturning(notice({ vacancies: '1,250' })), aiAssist: noAi });
  for (const row of db.prepare("SELECT id FROM change_events WHERE status='pending'").all()) approveChange(db, row.id, 1);

  const r = await runCheck(db, sourceId, { fetcher: fakeFetcherReturning(notice({ vacancies: '1,300' })), aiAssist: noAi });
  const c = r.changes.find((c) => c.field_name === 'vacancies');
  assert.equal(c.old_value, '1250');
  assert.equal(c.new_value, '1300');
});

test('5. a brand-new notification with no prior data reports every field as new', async () => {
  const db = createTestDb();
  const { sourceId } = seedExamWithSource(db);
  const r = await runCheck(db, sourceId, { fetcher: fakeFetcherReturning(notice()), aiAssist: noAi });
  assert.equal(r.result, 'changed');
  assert.ok(r.changes.every((c) => c.old_value === null));
  assert.ok(r.changes.some((c) => c.field_name === 'exam_date'));
});

test('6. a revised notification (corrigendum) diffs against the approved baseline, not the original', async () => {
  const db = createTestDb();
  const { sourceId } = seedExamWithSource(db);
  await runCheck(db, sourceId, { fetcher: fakeFetcherReturning(notice({ examDate: '15 November 2026' })), aiAssist: noAi });
  for (const row of db.prepare("SELECT id FROM change_events WHERE status='pending'").all()) approveChange(db, row.id, 1);

  const r1 = await runCheck(db, sourceId, { fetcher: fakeFetcherReturning(notice({ examDate: '22 November 2026' })), aiAssist: noAi });
  for (const row of db.prepare("SELECT id FROM change_events WHERE status='pending'").all()) approveChange(db, row.id, 1);
  assert.equal(r1.changes.find((c) => c.field_name === 'exam_date').old_value, '2026-11-15');

  const r2 = await runCheck(db, sourceId, { fetcher: fakeFetcherReturning(notice({ examDate: '29 November 2026' })), aiAssist: noAi });
  const c2 = r2.changes.find((c) => c.field_name === 'exam_date');
  assert.equal(c2.old_value, '2026-11-22', 'must diff against the already-approved 22nd, not the original 15th');
  assert.equal(c2.new_value, '2026-11-29');
});

test('7. PDF replacement is detected through the PDF adapter', async () => {
  const db = createTestDb();
  const { sourceId } = seedExamWithSource(db, { sourceType: 'pdf' });
  await runCheck(db, sourceId, {
    fetcher: fakeFetcherReturning('PDF-BYTES-V1'),
    pdfParser: fakePdfParser(notice({ vacancies: '1,189' })),
    aiAssist: noAi,
  });
  for (const row of db.prepare("SELECT id FROM change_events WHERE status='pending'").all()) approveChange(db, row.id, 1);

  const r = await runCheck(db, sourceId, {
    fetcher: fakeFetcherReturning('PDF-BYTES-V2-REPLACED'),
    pdfParser: fakePdfParser(notice({ vacancies: '1,300' })),
    aiAssist: noAi,
  });
  const c = r.changes.find((c) => c.field_name === 'vacancies');
  assert.equal(c.old_value, '1189');
  assert.equal(c.new_value, '1300');
});

test('8. source unavailable is classified without touching existing data', async () => {
  const db = createTestDb();
  const { sourceId } = seedExamWithSource(db);
  await runCheck(db, sourceId, { fetcher: fakeFetcherReturning(notice()), aiAssist: noAi });
  for (const row of db.prepare("SELECT id FROM change_events WHERE status='pending'").all()) approveChange(db, row.id, 1);
  const before = db.prepare('SELECT COUNT(*) n FROM field_history WHERE is_current = 1').get().n;

  const r = await runCheck(db, sourceId, {
    fetcher: async () => ({ ok: false, error: 'network_error' }),
    aiAssist: noAi,
  });
  assert.equal(r.result, 'unavailable');
  assert.equal(r.classification, 'SOURCE_UNAVAILABLE');
  assert.equal(db.prepare('SELECT COUNT(*) n FROM field_history WHERE is_current = 1').get().n, before, 'existing verified data must be untouched');
  assert.equal(db.prepare('SELECT consecutive_failures FROM sources WHERE id = ?').get(sourceId).consecutive_failures, 1);
});

test('9. a parser failure is classified and does not update the stored hash', async () => {
  const db = createTestDb();
  const { sourceId } = seedExamWithSource(db, { sourceType: 'pdf' });
  const before = db.prepare('SELECT last_hash FROM sources WHERE id = ?').get(sourceId).last_hash;

  const r = await runCheck(db, sourceId, {
    fetcher: fakeFetcherReturning('CORRUPT-PDF-BYTES'),
    pdfParser: async () => { throw new Error('bad xref table'); },
    aiAssist: noAi,
  });
  assert.equal(r.result, 'error');
  assert.equal(r.classification, 'PARSING_ERROR');
  assert.equal(db.prepare('SELECT last_hash FROM sources WHERE id = ?').get(sourceId).last_hash, before, 'a parse failure must not be mistaken for "no change" next time');
  assert.equal(db.prepare("SELECT COUNT(*) n FROM errors WHERE error_type='parse_failed'").get().n, 1);
});

test('10. a scanned (OCR) PDF source always routes to manual review, never guesses', async () => {
  const db = createTestDb();
  const { sourceId } = seedExamWithSource(db, { sourceType: 'pdf_scanned_ocr' });
  const r = await runCheck(db, sourceId, { fetcher: fakeFetcherReturning('scanned-image-bytes-v1'), aiAssist: noAi });
  assert.equal(r.classification, 'NEEDS_HUMAN_REVIEW');
  const change = db.prepare("SELECT * FROM change_events WHERE id = ?").get(r.changeEventIds[0]);
  assert.equal(change.field_name, '__manual_review__');
  assert.equal(change.status, 'pending');
});

test('11. two sources disagreeing on the same exam field are both flagged, neither silently wins', async () => {
  const db = createTestDb();
  const orgId = db.prepare(`INSERT INTO organizations (name, short_code) VALUES ('Org', 'ORG2')`).run().lastInsertRowid;
  const examId = db.prepare(`INSERT INTO exams (org_id, code, name) VALUES (?, 'DUAL', 'Dual-source exam')`).run(orgId).lastInsertRowid;
  const sourceA = db.prepare(`INSERT INTO sources (exam_id, label, url, source_type) VALUES (?, 'A', 'https://a.gov.in', 'html')`).run(examId).lastInsertRowid;
  const sourceB = db.prepare(`INSERT INTO sources (exam_id, label, url, source_type) VALUES (?, 'B', 'https://b.gov.in', 'html')`).run(examId).lastInsertRowid;

  await runCheck(db, sourceA, { fetcher: fakeFetcherReturning(notice({ examDate: '22 November 2026' })), aiAssist: noAi });
  const rB = await runCheck(db, sourceB, { fetcher: fakeFetcherReturning(notice({ examDate: '30 November 2026' })), aiAssist: noAi });

  const examDateChangeB = rB.changes.find((c) => c.field_name === 'exam_date');
  assert.equal(examDateChangeB.classification, 'NEEDS_HUMAN_REVIEW');
  assert.ok(examDateChangeB.issues.some((i) => i.startsWith('cross_source_disagreement')));
  const pendingCount = db.prepare("SELECT COUNT(*) n FROM change_events WHERE status='pending' AND field_name='exam_date'").get().n;
  assert.equal(pendingCount, 2, 'both proposed values must sit in the queue for a human to resolve, neither auto-applied');
});

test('12. a duplicate notification (reworded, same facts) does not fabricate a field change', async () => {
  const db = createTestDb();
  const { sourceId } = seedExamWithSource(db);
  await runCheck(db, sourceId, { fetcher: fakeFetcherReturning(notice()), aiAssist: noAi });
  for (const row of db.prepare("SELECT id FROM change_events WHERE status='pending'").all()) approveChange(db, row.id, 1);

  const reworded = notice() + '\n    (Reformatted republish of the same notice, no facts changed.)';
  const r = await runCheck(db, sourceId, { fetcher: fakeFetcherReturning(reworded), aiAssist: noAi });
  assert.equal(r.result, 'changed'); // hash did change
  assert.equal(r.changes.length, 1);
  assert.equal(r.changes[0].field_name, '__unstructured_change__', 'no real field differed, so no false field-level change was invented');
});
