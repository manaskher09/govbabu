process.env.MONITOR_DB_PATH = ':memory:';
const test = require('node:test');
const assert = require('node:assert/strict');
const { getDb } = require('../db/db');
const { setPassword } = require('../auth/sessions');
const { server } = require('../admin/server');

let baseUrl;
let examId;

test.before(async () => {
  await new Promise((resolve) => server.listen(0, resolve));
  baseUrl = `http://localhost:${server.address().port}`;
  const db = getDb();
  setPassword(db, 'fieldtester', 'correct-horse-battery');
  const orgId = db.prepare(`INSERT INTO organizations (name, short_code) VALUES ('Field Org', 'FIELDORG')`).run().lastInsertRowid;
  examId = db
    .prepare(`INSERT INTO exams (org_id, code, name, category) VALUES (?, 'FIELD-EXAM', 'Field Test Exam', 'Central Govt')`)
    .run(orgId).lastInsertRowid;
});
test.after(() => server.close());

function cookieFrom(res) {
  return (res.headers.get('set-cookie') || '').split(';')[0];
}
async function login() {
  const res = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: 'fieldtester', password: 'correct-horse-battery' }),
  });
  return cookieFrom(res);
}

test('setting a field is rejected without auth', async () => {
  const res = await fetch(`${baseUrl}/api/admin/exams/${examId}/fields/exam_date`, {
    method: 'PUT', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ value: '2026-05-01' }),
  });
  assert.equal(res.status, 401);
});

test('a valid date write creates a correctly-shaped, admin-authored field_history row', async () => {
  const cookie = await login();
  const res = await fetch(`${baseUrl}/api/admin/exams/${examId}/fields/exam_date`, {
    method: 'PUT', headers: { 'content-type': 'application/json', cookie },
    body: JSON.stringify({ value: '2026-05-01' }),
  });
  assert.equal(res.status, 200);

  const db = getDb();
  const row = db
    .prepare(`SELECT * FROM field_history WHERE exam_id = ? AND field_name = 'exam_date' AND is_current = 1`)
    .get(examId);
  assert.equal(row.value, '2026-05-01');
  assert.equal(row.source_id, null);
  assert.equal(row.change_event_id, null);
  assert.equal(row.is_current, 1);
  // admin_users.id for the just-logged-in user
  const admin = db.prepare(`SELECT id FROM admin_users WHERE username = 'fieldtester'`).get();
  assert.equal(row.approved_by, admin.id);
});

test('writing the field again demotes the prior row instead of deleting it', async () => {
  const cookie = await login();
  await fetch(`${baseUrl}/api/admin/exams/${examId}/fields/exam_date`, {
    method: 'PUT', headers: { 'content-type': 'application/json', cookie },
    body: JSON.stringify({ value: '2026-06-15' }),
  });

  const db = getDb();
  const rows = db.prepare(`SELECT value, is_current FROM field_history WHERE exam_id = ? AND field_name = 'exam_date' ORDER BY id`).all(examId);
  assert.equal(rows.length, 2, 'the original row must still exist, not be deleted');
  assert.equal(rows[0].value, '2026-05-01');
  assert.equal(rows[0].is_current, 0);
  assert.equal(rows[1].value, '2026-06-15');
  assert.equal(rows[1].is_current, 1);
});

test('an invalid date string is rejected and writes nothing', async () => {
  const cookie = await login();
  const res = await fetch(`${baseUrl}/api/admin/exams/${examId}/fields/exam_date`, {
    method: 'PUT', headers: { 'content-type': 'application/json', cookie },
    body: JSON.stringify({ value: 'not-a-date' }),
  });
  assert.equal(res.status, 400);

  const db = getDb();
  const count = db.prepare(`SELECT COUNT(*) n FROM field_history WHERE exam_id = ? AND field_name = 'exam_date'`).get(examId).n;
  assert.equal(count, 2, 'no new row should have been written');
});

test('a field outside the manual-write allowlist is rejected', async () => {
  const cookie = await login();
  const res = await fetch(`${baseUrl}/api/admin/exams/${examId}/fields/photo_json`, {
    method: 'PUT', headers: { 'content-type': 'application/json', cookie },
    body: JSON.stringify({ value: '{"px":200}' }),
  });
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.equal(body.error, 'field_not_allowed');

  const db = getDb();
  const count = db.prepare(`SELECT COUNT(*) n FROM field_history WHERE exam_id = ? AND field_name = 'photo_json'`).get(examId).n;
  assert.equal(count, 0);
});

test('the site-facing display fields (vacancies_display, exam_date_text, admit_card_date_text, application_fee) are manually settable', async () => {
  const cookie = await login();
  for (const field of ['vacancies_display', 'exam_date_text', 'admit_card_date_text', 'application_fee']) {
    const res = await fetch(`${baseUrl}/api/admin/exams/${examId}/fields/${field}`, {
      method: 'PUT', headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ value: `test value for ${field}` }),
    });
    assert.equal(res.status, 200, `expected ${field} to be settable`);
  }
});
