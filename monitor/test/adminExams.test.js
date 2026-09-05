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
  setPassword(db, 'examstester', 'correct-horse-battery');
});
test.after(() => server.close());

function cookieFrom(res) {
  return (res.headers.get('set-cookie') || '').split(';')[0];
}
async function login() {
  const res = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: 'examstester', password: 'correct-horse-battery' }),
  });
  return cookieFrom(res);
}

test('creating an organization then an exam under it, and reading the full admin detail', async () => {
  const cookie = await login();

  const orgRes = await fetch(`${baseUrl}/api/admin/organizations`, {
    method: 'POST', headers: { 'content-type': 'application/json', cookie },
    body: JSON.stringify({ name: 'Admin Flow Org', short_code: 'ADMINFLOW' }),
  });
  assert.equal(orgRes.status, 201);
  const org = await orgRes.json();

  const examRes = await fetch(`${baseUrl}/api/admin/exams`, {
    method: 'POST', headers: { 'content-type': 'application/json', cookie },
    body: JSON.stringify({ org_id: org.id, code: 'ADMIN-FLOW-EXAM', name: 'Admin Flow Exam', category: 'Central Govt' }),
  });
  assert.equal(examRes.status, 201);
  const exam = await examRes.json();

  const detailRes = await fetch(`${baseUrl}/api/admin/exams/${exam.id}`, { headers: { cookie } });
  assert.equal(detailRes.status, 200);
  const detail = await detailRes.json();
  assert.equal(detail.exam.code, 'ADMIN-FLOW-EXAM');
  assert.equal(detail.exam.content_status, 'draft');
  assert.deepEqual(detail.posts, []);
  assert.deepEqual(detail.documents, []);
});

test('creating an exam with a duplicate code is a clean 409', async () => {
  const cookie = await login();
  const db = getDb();
  const orgId = db.prepare(`INSERT INTO organizations (name, short_code) VALUES ('Dup Org', 'DUPORG')`).run().lastInsertRowid;

  const first = await fetch(`${baseUrl}/api/admin/exams`, {
    method: 'POST', headers: { 'content-type': 'application/json', cookie },
    body: JSON.stringify({ org_id: orgId, code: 'DUP-CODE', name: 'First', category: 'Central Govt' }),
  });
  assert.equal(first.status, 201);

  const second = await fetch(`${baseUrl}/api/admin/exams`, {
    method: 'POST', headers: { 'content-type': 'application/json', cookie },
    body: JSON.stringify({ org_id: orgId, code: 'DUP-CODE', name: 'Second', category: 'Central Govt' }),
  });
  assert.equal(second.status, 409);
  const body = await second.json();
  assert.equal(body.error, 'exam_code_taken');
});

test('registering a document creates a manual, inactive source so the scheduler never touches it', async () => {
  const cookie = await login();
  const db = getDb();
  const orgId = db.prepare(`INSERT INTO organizations (name, short_code) VALUES ('Doc Org', 'DOCORG')`).run().lastInsertRowid;
  const examId = db
    .prepare(`INSERT INTO exams (org_id, code, name, category) VALUES (?, 'DOC-EXAM', 'Doc Exam', 'Central Govt')`)
    .run(orgId).lastInsertRowid;

  const docRes = await fetch(`${baseUrl}/api/admin/exams/${examId}/documents`, {
    method: 'POST', headers: { 'content-type': 'application/json', cookie },
    body: JSON.stringify({ label: 'Official Notification', url: 'https://example.gov.in/notice.pdf', role: 'notification' }),
  });
  assert.equal(docRes.status, 201);
  const doc = await docRes.json();

  const source = db.prepare(`SELECT * FROM sources WHERE id = ?`).get(doc.source_id);
  assert.equal(source.source_type, 'manual');
  assert.equal(source.active, 0);
  assert.equal(source.exam_id, examId);

  const listRes = await fetch(`${baseUrl}/api/admin/exams/${examId}/documents`, { headers: { cookie } });
  const { documents } = await listRes.json();
  assert.equal(documents.length, 1);
  assert.equal(documents[0].label, 'Official Notification');
});

test('/exam-categories returns the distinct categories actually in use, alphabetically, no duplicates', async () => {
  const cookie = await login();
  const db = getDb();
  const orgId = db.prepare(`INSERT INTO organizations (name, short_code) VALUES ('Cat Org', 'CATORG')`).run().lastInsertRowid;
  db.prepare(`INSERT INTO exams (org_id, code, name, category) VALUES (?, 'CAT-A', 'Cat Exam A', 'Zebra Category')`).run(orgId);
  db.prepare(`INSERT INTO exams (org_id, code, name, category) VALUES (?, 'CAT-B', 'Cat Exam B', 'Zebra Category')`).run(orgId);
  db.prepare(`INSERT INTO exams (org_id, code, name, category) VALUES (?, 'CAT-C', 'Cat Exam C', 'Alpha Category')`).run(orgId);
  db.prepare(`INSERT INTO exams (org_id, code, name, category) VALUES (?, 'CAT-D', 'Cat Exam D', NULL)`).run(orgId);

  const res = await fetch(`${baseUrl}/api/admin/exam-categories`, { headers: { cookie } });
  assert.equal(res.status, 200);
  const { categories } = await res.json();
  assert.ok(categories.includes('Zebra Category'));
  assert.ok(categories.includes('Alpha Category'));
  assert.equal(categories.filter((c) => c === 'Zebra Category').length, 1, 'no duplicates even though 2 exams share it');
  assert.ok(categories.indexOf('Alpha Category') < categories.indexOf('Zebra Category'), 'alphabetical order');
});

test('GET /exams?category filters to only that category', async () => {
  const cookie = await login();
  const db = getDb();
  const orgId = db.prepare(`INSERT INTO organizations (name, short_code) VALUES ('Filter Org', 'FILTORG')`).run().lastInsertRowid;
  db.prepare(`INSERT INTO exams (org_id, code, name, category) VALUES (?, 'FILT-RAIL', 'Filter Rail Exam', 'Filter-Railway')`).run(orgId);
  db.prepare(`INSERT INTO exams (org_id, code, name, category) VALUES (?, 'FILT-BANK', 'Filter Bank Exam', 'Filter-Banking')`).run(orgId);

  const res = await fetch(`${baseUrl}/api/admin/exams?category=Filter-Railway`, { headers: { cookie } });
  const { exams } = await res.json();
  assert.ok(exams.every((e) => e.category === 'Filter-Railway'));
  assert.ok(exams.some((e) => e.code === 'FILT-RAIL'));
  assert.ok(!exams.some((e) => e.code === 'FILT-BANK'));
});
