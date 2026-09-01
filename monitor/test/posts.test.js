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
  setPassword(db, 'poststester', 'correct-horse-battery');
  const orgId = db.prepare(`INSERT INTO organizations (name, short_code) VALUES ('Posts Org', 'POSTSORG')`).run().lastInsertRowid;
  examId = db
    .prepare(`INSERT INTO exams (org_id, code, name, category, content_status) VALUES (?, 'POSTS-EXAM', 'Posts Test Exam', 'Central Govt', 'draft')`)
    .run(orgId).lastInsertRowid;
});
test.after(() => server.close());

function cookieFrom(res) {
  return (res.headers.get('set-cookie') || '').split(';')[0];
}

async function login() {
  const res = await fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: 'poststester', password: 'correct-horse-battery' }),
  });
  return cookieFrom(res);
}

test('creating a post is rejected without auth', async () => {
  const res = await fetch(`${baseUrl}/api/admin/exams/${examId}/posts`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ post_name: 'Should Not Work' }),
  });
  assert.equal(res.status, 401);
});

test('two posts are created and listed in display_order', async () => {
  const cookie = await login();
  const first = await fetch(`${baseUrl}/api/admin/exams/${examId}/posts`, {
    method: 'POST', headers: { 'content-type': 'application/json', cookie },
    body: JSON.stringify({ post_name: 'Second Post', vacancies: 50, display_order: 1 }),
  });
  assert.equal(first.status, 201);
  const second = await fetch(`${baseUrl}/api/admin/exams/${examId}/posts`, {
    method: 'POST', headers: { 'content-type': 'application/json', cookie },
    body: JSON.stringify({ post_name: 'First Post', vacancies: 100, display_order: 0 }),
  });
  assert.equal(second.status, 201);

  const listRes = await fetch(`${baseUrl}/api/admin/exams/${examId}/posts`, { headers: { cookie } });
  const { posts } = await listRes.json();
  assert.equal(posts.length, 2);
  assert.equal(posts[0].post_name, 'First Post', 'display_order=0 must come first');
  assert.equal(posts[1].post_name, 'Second Post');
});

test('patching a post only touches the given fields', async () => {
  const cookie = await login();
  const listRes = await fetch(`${baseUrl}/api/admin/exams/${examId}/posts`, { headers: { cookie } });
  const { posts } = await listRes.json();
  const target = posts.find((p) => p.post_name === 'First Post');

  const patchRes = await fetch(`${baseUrl}/api/admin/posts/${target.id}`, {
    method: 'PATCH', headers: { 'content-type': 'application/json', cookie },
    body: JSON.stringify({ vacancies: 150 }),
  });
  assert.equal(patchRes.status, 200);

  const after = await fetch(`${baseUrl}/api/admin/exams/${examId}/posts`, { headers: { cookie } });
  const { posts: afterPosts } = await after.json();
  const updated = afterPosts.find((p) => p.id === target.id);
  assert.equal(updated.vacancies, 150);
  assert.equal(updated.post_name, 'First Post', 'untouched field must survive the patch');
});

test('deleting a post removes it, and deleting it again is a clean 404', async () => {
  const cookie = await login();
  const listRes = await fetch(`${baseUrl}/api/admin/exams/${examId}/posts`, { headers: { cookie } });
  const { posts } = await listRes.json();
  const target = posts.find((p) => p.post_name === 'Second Post');

  const del1 = await fetch(`${baseUrl}/api/admin/posts/${target.id}`, { method: 'DELETE', headers: { cookie } });
  assert.equal(del1.status, 200);

  const del2 = await fetch(`${baseUrl}/api/admin/posts/${target.id}`, { method: 'DELETE', headers: { cookie } });
  assert.equal(del2.status, 404);

  const after = await fetch(`${baseUrl}/api/admin/exams/${examId}/posts`, { headers: { cookie } });
  const { posts: afterPosts } = await after.json();
  assert.equal(afterPosts.length, 1);
});
