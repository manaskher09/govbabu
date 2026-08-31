process.env.MONITOR_DB_PATH = ':memory:';
const test = require('node:test');
const assert = require('node:assert/strict');
const { getDb } = require('../db/db');
const { setPassword } = require('../auth/sessions');
const { server } = require('../admin/server');
const { runCheck } = require('../pipeline/runCheck');

const noAi = async () => null;
function fixtureFetcher(text) {
  return async () => ({ ok: true, status: 200, buffer: Buffer.from(text, 'utf8'), headers: {}, responseTimeMs: 10 });
}

let baseUrl;
let db;
let examId;
let sourceId;

test.before(async () => {
  await new Promise((resolve) => server.listen(0, resolve));
  baseUrl = `http://localhost:${server.address().port}`;
  db = getDb();
  setPassword(db, 'e2e-admin', 'end-to-end-password-1');

  const orgId = db.prepare(`INSERT INTO organizations (name, short_code) VALUES ('SSC', 'SSC-E2E')`).run().lastInsertRowid;
  examId = db.prepare(`INSERT INTO exams (org_id, code, name, category) VALUES (?, 'SSC-CGL-E2E', 'SSC CGL', 'Central Govt')`).run(orgId).lastInsertRowid;
  sourceId = db.prepare(`INSERT INTO sources (exam_id, label, url, source_type) VALUES (?, 'SSC CGL notification', 'https://ssc.gov.in/notice.pdf', 'html')`).run(examId).lastInsertRowid;
  // Seed the "current" state exactly as the spec's scenario states it.
  db.prepare(
    `INSERT INTO field_history (exam_id, field_name, value, is_current) VALUES (?, 'application_end_date', '2026-06-22', 1)`
  ).run(examId);
});
test.after(() => server.close());

function cookieFrom(res) {
  return (res.headers.get('set-cookie') || '').split(';')[0];
}

test('STEP 18: government fixture change flows end-to-end from detection to public API', async () => {
  // Current: SSC CGL application_end_date = 22-06-2026 (seeded above).
  const before = await (await fetch(`${baseUrl}/api/exams/SSC-CGL-E2E`)).json();
  assert.equal(before.applicationEndDateIso, '2026-06-22');

  // New government fixture: application_end_date = 30-06-2026.
  const newFixture = 'OFFICIAL NOTICE. Last Date for Submission of Online Application: 30 June 2026. Total Number of Vacancies: 12,256 posts.';

  // Monitor detects change -> change event created.
  const result = await runCheck(db, sourceId, { fetcher: fixtureFetcher(newFixture), aiAssist: noAi });
  assert.equal(result.result, 'changed');
  const deadlineChange = result.changes.find((c) => c.field_name === 'application_end_date');
  assert.ok(deadlineChange, 'a change event for application_end_date must exist');
  assert.equal(deadlineChange.old_value, '2026-06-22');
  assert.equal(deadlineChange.new_value, '2026-06-30');

  // Admin dashboard shows OLD/NEW/SOURCE/STATUS: PENDING REVIEW.
  const loginRes = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: 'e2e-admin', password: 'end-to-end-password-1' }),
  });
  const cookie = cookieFrom(loginRes);
  const queue = await (await fetch(`${baseUrl}/api/admin/review-queue`, { headers: { cookie } })).json();
  const queueItem = queue.find((q) => q.field_name === 'application_end_date');
  assert.ok(queueItem);
  assert.equal(queueItem.old_value, '2026-06-22');
  assert.equal(queueItem.new_value, '2026-06-30');
  assert.equal(queueItem.status, 'pending');
  assert.match(queueItem.source_url, /ssc\.gov\.in/);

  // Public API must still show the OLD value — nothing is published yet.
  const stillOld = await (await fetch(`${baseUrl}/api/exams/SSC-CGL-E2E`)).json();
  assert.equal(stillOld.applicationEndDateIso, '2026-06-22');

  // Admin approves.
  const notifyCalls = [];
  const notificationsSpy = { notifyApprovedChange: async (exam, change) => notifyCalls.push({ exam, change }) };
  const { approveChange } = require('../pipeline/applyApproval');
  const meRes = await fetch(`${baseUrl}/api/admin/me`, { headers: { cookie } });
  const me = (await meRes.json()).user;
  const approveResult = approveChange(db, queueItem.id, me.id, 'confirmed against official notification', { notifications: notificationsSpy });
  assert.equal(approveResult.status, 'approved');

  // Database current value becomes 30-06-2026; field_history + audit_log created.
  const history = db.prepare(`SELECT * FROM field_history WHERE exam_id = ? AND field_name = 'application_end_date' ORDER BY id`).all(examId);
  assert.equal(history.length, 2);
  assert.equal(history[0].is_current, 0);
  assert.equal(history[1].value, '2026-06-30');
  assert.equal(history[1].is_current, 1);
  const audit = db.prepare(`SELECT * FROM audit_logs WHERE action = 'approve_change' AND entity_id = ?`).get(queueItem.id);
  assert.ok(audit);

  // API returns 30-06-2026.
  const after = await (await fetch(`${baseUrl}/api/exams/SSC-CGL-E2E`)).json();
  assert.equal(after.applicationEndDateIso, '2026-06-30');

  // Notification provider received the deadline-changed message.
  await new Promise((r) => setImmediate(r));
  assert.equal(notifyCalls.length, 1);
  assert.equal(notifyCalls[0].change.new_value, '2026-06-30');

  // Queue is empty again — nothing left pending for this field.
  const queueAfter = await (await fetch(`${baseUrl}/api/admin/review-queue`, { headers: { cookie } })).json();
  assert.equal(queueAfter.filter((q) => q.field_name === 'application_end_date').length, 0);
});
