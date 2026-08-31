process.env.MONITOR_DB_PATH = ':memory:';
const test = require('node:test');
const assert = require('node:assert/strict');
const { getDb } = require('../db/db');
const { setPassword } = require('../auth/sessions');
const { server } = require('../admin/server');

let baseUrl;
test.before(async () => {
  await new Promise((resolve) => server.listen(0, resolve));
  baseUrl = `http://localhost:${server.address().port}`;
  const db = getDb();
  setPassword(db, 'apitester', 'correct-horse-battery');

  const orgId = db.prepare(`INSERT INTO organizations (name, short_code) VALUES ('API Org', 'APIORG')`).run().lastInsertRowid;
  const examId = db.prepare(`INSERT INTO exams (org_id, code, name, category) VALUES (?, 'API-EXAM', 'API Test Exam', 'Central Govt')`).run(orgId).lastInsertRowid;
  const sourceId = db.prepare(`INSERT INTO sources (exam_id, label, url, source_type) VALUES (?, 'src', 'https://x.gov.in', 'html')`).run(examId).lastInsertRowid;
  db.prepare(
    `INSERT INTO field_history (exam_id, field_name, value, is_current) VALUES (?, 'application_end_date', '2026-11-22', 1)`
  ).run(examId);
  db.prepare(
    `INSERT INTO change_events (exam_id, source_id, field_name, old_value, new_value, detection_method, confidence, classification, status)
     VALUES (?, ?, 'vacancies', NULL, '9999', 'regex', 0.9, 'CONFIRMED_CHANGE', 'pending')`
  ).run(examId, sourceId);
  global.__apiTestExamId = examId;
});
test.after(() => server.close());

function cookieFrom(res) {
  const raw = res.headers.get('set-cookie') || '';
  return raw.split(';')[0];
}

test('public GET /api/exams/:code returns only approved data, never a pending value', async () => {
  const res = await fetch(`${baseUrl}/api/exams/API-EXAM`);
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.applicationEndDateIso, '2026-11-22');
  assert.equal(body.vacancies, undefined, 'the pending vacancies change must not leak through the public endpoint');
});

test('public endpoint 404s cleanly for an unknown exam, no stack trace leaked', async () => {
  const res = await fetch(`${baseUrl}/api/exams/DOES-NOT-EXIST`);
  const body = await res.json();
  assert.equal(res.status, 404);
  assert.equal(body.error, 'exam_not_found');
  assert.equal(body.stack, undefined);
});

test('admin endpoint rejects an unauthenticated request', async () => {
  const res = await fetch(`${baseUrl}/api/admin/dashboard`);
  assert.equal(res.status, 401);
});

test('admin endpoint rejects a wrong password', async () => {
  const res = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: 'apitester', password: 'nope' }),
  });
  assert.equal(res.status, 401);
});

test('a valid login session can reach admin endpoints and see the pending change', async () => {
  const loginRes = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: 'apitester', password: 'correct-horse-battery' }),
  });
  assert.equal(loginRes.status, 200);
  const cookie = cookieFrom(loginRes);

  const queueRes = await fetch(`${baseUrl}/api/admin/review-queue`, { headers: { cookie } });
  const queue = await queueRes.json();
  assert.ok(queue.some((c) => c.field_name === 'vacancies' && c.status === 'pending'));

  const dashRes = await fetch(`${baseUrl}/api/admin/dashboard`, { headers: { cookie } });
  const dash = await dashRes.json();
  assert.equal(dash.pending_reviews, 1);
});

test('approving through the API makes the field visible on the public endpoint', async () => {
  const loginRes = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: 'apitester', password: 'correct-horse-battery' }),
  });
  const cookie = cookieFrom(loginRes);
  const db = getDb();
  const change = db.prepare(`SELECT id FROM change_events WHERE field_name = 'vacancies'`).get();

  const approveRes = await fetch(`${baseUrl}/api/admin/change-events/${change.id}/approve`, {
    method: 'POST', headers: { 'content-type': 'application/json', cookie }, body: JSON.stringify({ notes: 'ok' }),
  });
  assert.equal(approveRes.status, 200);

  const publicRes = await fetch(`${baseUrl}/api/exams/API-EXAM`);
  const body = await publicRes.json();
  assert.equal(body.vacancies, '9,999');
});

test('approving an invalid change_event id is a clean 409, not a crash', async () => {
  const loginRes = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: 'apitester', password: 'correct-horse-battery' }),
  });
  const cookie = cookieFrom(loginRes);
  const res = await fetch(`${baseUrl}/api/admin/change-events/999999/approve`, {
    method: 'POST', headers: { 'content-type': 'application/json', cookie }, body: '{}',
  });
  assert.equal(res.status, 409);
});

test('malformed JSON body on login is a 400, not a crash', async () => {
  const res = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: '{not json',
  });
  assert.equal(res.status, 400);
});

test('logout invalidates the session', async () => {
  const loginRes = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: 'apitester', password: 'correct-horse-battery' }),
  });
  const cookie = cookieFrom(loginRes);
  await fetch(`${baseUrl}/api/admin/logout`, { method: 'POST', headers: { cookie } });
  const res = await fetch(`${baseUrl}/api/admin/dashboard`, { headers: { cookie } });
  assert.equal(res.status, 401);
});
