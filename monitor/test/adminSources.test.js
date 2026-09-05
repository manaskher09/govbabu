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
  setPassword(db, 'sourcestester', 'correct-horse-battery');
});
test.after(() => server.close());

function cookieFrom(res) {
  return (res.headers.get('set-cookie') || '').split(';')[0];
}
async function login() {
  const res = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: 'sourcestester', password: 'correct-horse-battery' }),
  });
  return cookieFrom(res);
}

function makeExam(db, code) {
  const orgId = db.prepare(`INSERT INTO organizations (name, short_code) VALUES (?, ?)`).run(`Org ${code}`, `ORG-${code}`).lastInsertRowid;
  return db.prepare(`INSERT INTO exams (org_id, code, name, category) VALUES (?, ?, ?, 'Central Govt')`).run(orgId, code, `Exam ${code}`).lastInsertRowid;
}

// Note: check-now's success path calls the real pipeline/runCheck.js, which
// performs a real HTTP fetch — deliberately not exercised here to keep this
// suite's "zero network calls" property (see test/helpers.js and
// scenarios.test.js, which already cover runCheck's behavior end-to-end via
// injected fetchers). Only this endpoint's own plumbing — auth, validation,
// the 404 path — is tested at the HTTP layer.

test('creating a real monitored source requires auth', async () => {
  const db = getDb();
  const examId = makeExam(db, 'NOAUTH-SRC');
  const res = await fetch(`${baseUrl}/api/admin/exams/${examId}/sources`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ label: 'x', url: 'https://example.gov.in', source_type: 'html' }),
  });
  assert.equal(res.status, 401);
});

test('creating a real monitored source defaults to active=1, unlike the manual-document endpoint', async () => {
  const cookie = await login();
  const db = getDb();
  const examId = makeExam(db, 'REAL-SRC');

  const res = await fetch(`${baseUrl}/api/admin/exams/${examId}/sources`, {
    method: 'POST', headers: { 'content-type': 'application/json', cookie },
    body: JSON.stringify({
      label: 'Official notification', url: 'https://example.gov.in/notice.pdf',
      source_type: 'pdf', role: 'notification', monitoring_frequency_minutes: 360,
      extract_keywords: ['exam date', 'last date'],
    }),
  });
  assert.equal(res.status, 201);
  const { id } = await res.json();

  const row = db.prepare('SELECT * FROM sources WHERE id = ?').get(id);
  assert.equal(row.active, 1);
  assert.equal(row.source_type, 'pdf');
  assert.equal(row.role, 'notification');
  assert.equal(row.monitoring_frequency_minutes, 360);
  assert.deepEqual(JSON.parse(row.extract_keywords), ['exam date', 'last date']);

  const audit = db.prepare(`SELECT * FROM audit_logs WHERE action = 'create_source' AND entity_id = ?`).get(id);
  assert.ok(audit, 'expected an audit log entry');
});

test('GET lists only sources for the requested exam', async () => {
  const cookie = await login();
  const db = getDb();
  const examA = makeExam(db, 'LIST-A');
  const examB = makeExam(db, 'LIST-B');
  await fetch(`${baseUrl}/api/admin/exams/${examA}/sources`, {
    method: 'POST', headers: { 'content-type': 'application/json', cookie },
    body: JSON.stringify({ label: 'A source', url: 'https://a.gov.in', source_type: 'html' }),
  });
  await fetch(`${baseUrl}/api/admin/exams/${examB}/sources`, {
    method: 'POST', headers: { 'content-type': 'application/json', cookie },
    body: JSON.stringify({ label: 'B source', url: 'https://b.gov.in', source_type: 'html' }),
  });

  const res = await fetch(`${baseUrl}/api/admin/exams/${examA}/sources`, { headers: { cookie } });
  const { sources } = await res.json();
  assert.equal(sources.length, 1);
  assert.equal(sources[0].label, 'A source');
});

test('rejects a bad source_type, role, and missing fields', async () => {
  const cookie = await login();
  const db = getDb();
  const examId = makeExam(db, 'BAD-SRC');

  const noUrl = await fetch(`${baseUrl}/api/admin/exams/${examId}/sources`, {
    method: 'POST', headers: { 'content-type': 'application/json', cookie },
    body: JSON.stringify({ label: 'x' }),
  });
  assert.equal(noUrl.status, 400);

  const badType = await fetch(`${baseUrl}/api/admin/exams/${examId}/sources`, {
    method: 'POST', headers: { 'content-type': 'application/json', cookie },
    body: JSON.stringify({ label: 'x', url: 'https://x.gov.in', source_type: 'carrier-pigeon' }),
  });
  assert.equal(badType.status, 400);

  const badRole = await fetch(`${baseUrl}/api/admin/exams/${examId}/sources`, {
    method: 'POST', headers: { 'content-type': 'application/json', cookie },
    body: JSON.stringify({ label: 'x', url: 'https://x.gov.in', source_type: 'html', role: 'not-a-real-role' }),
  });
  assert.equal(badRole.status, 400);

  const badFreq = await fetch(`${baseUrl}/api/admin/exams/${examId}/sources`, {
    method: 'POST', headers: { 'content-type': 'application/json', cookie },
    body: JSON.stringify({ label: 'x', url: 'https://x.gov.in', source_type: 'html', monitoring_frequency_minutes: 0 }),
  });
  assert.equal(badFreq.status, 400);
});

test('check-now on a nonexistent source is a clean 404, no crash', async () => {
  const cookie = await login();
  const res = await fetch(`${baseUrl}/api/admin/sources/999999/check-now`, {
    method: 'POST', headers: { cookie },
  });
  assert.equal(res.status, 404);
});

test('check-now requires auth', async () => {
  const res = await fetch(`${baseUrl}/api/admin/sources/1/check-now`, { method: 'POST' });
  assert.equal(res.status, 401);
});
