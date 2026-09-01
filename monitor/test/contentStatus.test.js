process.env.MONITOR_DB_PATH = ':memory:';
const test = require('node:test');
const assert = require('node:assert/strict');
const { getDb } = require('../db/db');
const { setPassword } = require('../auth/sessions');
const { server } = require('../admin/server');

let baseUrl;
let orgId;

test.before(async () => {
  await new Promise((resolve) => server.listen(0, resolve));
  baseUrl = `http://localhost:${server.address().port}`;
  const db = getDb();
  setPassword(db, 'statustester', 'correct-horse-battery');
  orgId = db.prepare(`INSERT INTO organizations (name, short_code) VALUES ('Status Org', 'STATUSORG')`).run().lastInsertRowid;

  // The "old way" every exam has entered the DB until now: a raw INSERT with
  // no content_status column at all — relies entirely on the DEFAULT.
  db.prepare(`INSERT INTO exams (org_id, code, name, category) VALUES (?, 'LEGACY-EXAM', 'Legacy Exam', 'Central Govt')`).run(orgId);
});
test.after(() => server.close());

function cookieFrom(res) {
  return (res.headers.get('set-cookie') || '').split(';')[0];
}
async function login() {
  const res = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: 'statustester', password: 'correct-horse-battery' }),
  });
  return cookieFrom(res);
}

test('a pre-existing exam with no content_status column set is still public (backward-compat default)', async () => {
  const res = await fetch(`${baseUrl}/api/exams/LEGACY-EXAM`);
  assert.equal(res.status, 200);
});

test('a brand-new admin-created exam starts as draft and is invisible to the public API', async () => {
  const cookie = await login();
  const createRes = await fetch(`${baseUrl}/api/admin/exams`, {
    method: 'POST', headers: { 'content-type': 'application/json', cookie },
    body: JSON.stringify({ org_id: orgId, code: 'NEW-EXAM', name: 'New Exam', category: 'Central Govt' }),
  });
  assert.equal(createRes.status, 201);
  const created = await createRes.json();
  assert.equal(created.content_status, 'draft');
  global.__newExamId = created.id;

  const publicRes = await fetch(`${baseUrl}/api/exams/NEW-EXAM`);
  assert.equal(publicRes.status, 404, 'a draft exam must not be publicly reachable');

  const listRes = await fetch(`${baseUrl}/api/exams`);
  const { exams } = await listRes.json();
  assert.ok(!exams.some((e) => e.code === 'NEW-EXAM'), 'a draft exam must not appear in the public list either');
});

test('walking the full lifecycle flips public visibility only at published, and rejects an invalid jump', async () => {
  const cookie = await login();
  const examId = global.__newExamId;

  // draft -> published directly is not a valid transition.
  const badJump = await fetch(`${baseUrl}/api/admin/exams/${examId}/status`, {
    method: 'POST', headers: { 'content-type': 'application/json', cookie },
    body: JSON.stringify({ to: 'published' }),
  });
  assert.equal(badJump.status, 409);
  const stillGone = await fetch(`${baseUrl}/api/exams/NEW-EXAM`);
  assert.equal(stillGone.status, 404, 'a rejected transition must not have changed anything');

  for (const to of ['needs_review', 'verified']) {
    const res = await fetch(`${baseUrl}/api/admin/exams/${examId}/status`, {
      method: 'POST', headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ to }),
    });
    assert.equal(res.status, 200, `transition to ${to} should succeed`);
    const stillPrivate = await fetch(`${baseUrl}/api/exams/NEW-EXAM`);
    assert.equal(stillPrivate.status, 404, `must still be private at content_status=${to}`);
  }

  const publishRes = await fetch(`${baseUrl}/api/admin/exams/${examId}/status`, {
    method: 'POST', headers: { 'content-type': 'application/json', cookie },
    body: JSON.stringify({ to: 'published' }),
  });
  assert.equal(publishRes.status, 200);
  const nowPublic = await fetch(`${baseUrl}/api/exams/NEW-EXAM`);
  assert.equal(nowPublic.status, 200, 'must become public exactly once content_status=published');
});

test('every successful transition writes exactly one correctly-shaped audit log entry', async () => {
  const db = getDb();
  const examId = global.__newExamId;
  const rows = db
    .prepare(`SELECT details FROM audit_logs WHERE entity_type = 'exam' AND entity_id = ? AND action = 'set_content_status' ORDER BY id`)
    .all(examId);
  // draft->needs_review, needs_review->verified, verified->published = 3 successful transitions
  // (the rejected draft->published jump must NOT have written a row).
  assert.equal(rows.length, 3);
  const details = rows.map((r) => JSON.parse(r.details));
  assert.deepEqual(details[0], { from: 'draft', to: 'needs_review' });
  assert.deepEqual(details[1], { from: 'needs_review', to: 'verified' });
  assert.deepEqual(details[2], { from: 'verified', to: 'published' });
});
