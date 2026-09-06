process.env.MONITOR_DB_PATH = ':memory:';
const test = require('node:test');
const assert = require('node:assert/strict');
const { getDb } = require('../db/db');
const { setPassword } = require('../auth/sessions');
const { server } = require('../admin/server');
const rateLimit = require('../auth/loginRateLimit');

let baseUrl;
// Unique to this file so it can't collide with rate-limit state left by
// other test files sharing the same module cache within one process.
const USERNAME = 'lockout-test-user';

test.before(async () => {
  await new Promise((resolve) => server.listen(0, resolve));
  baseUrl = `http://localhost:${server.address().port}`;
  const db = getDb();
  setPassword(db, USERNAME, 'correct-horse-battery');
});
test.after(() => server.close());
test.beforeEach(() => rateLimit._reset());

async function attemptLogin(password) {
  return fetch(`${baseUrl}/api/admin/login`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: USERNAME, password }),
  });
}

test('repeated wrong passwords eventually get locked out with 429', async () => {
  let lastStatus;
  for (let i = 0; i < rateLimit.MAX_ATTEMPTS; i++) {
    const res = await attemptLogin('wrong-password');
    lastStatus = res.status;
    assert.equal(lastStatus, 401);
  }
  const lockedRes = await attemptLogin('wrong-password');
  assert.equal(lockedRes.status, 429);
});

test('lockout applies even to the CORRECT password once triggered — otherwise it protects nothing', async () => {
  for (let i = 0; i < rateLimit.MAX_ATTEMPTS; i++) await attemptLogin('wrong-password');
  const res = await attemptLogin('correct-horse-battery');
  assert.equal(res.status, 429);
});

test('a successful login before lockout clears the count, so a later mistyped attempt is not immediately blocked', async () => {
  await attemptLogin('wrong-password');
  const goodRes = await attemptLogin('correct-horse-battery');
  assert.equal(goodRes.status, 200);
  const nextRes = await attemptLogin('wrong-password');
  assert.equal(nextRes.status, 401, 'should be a normal rejection, not 429 — the counter was reset');
});
