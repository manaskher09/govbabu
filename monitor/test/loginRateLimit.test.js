const test = require('node:test');
const assert = require('node:assert/strict');
const rateLimit = require('../auth/loginRateLimit');

test.beforeEach(() => rateLimit._reset());

test('is not locked before any failures', () => {
  assert.equal(rateLimit.isLocked('someone'), false);
});

test('locks out after MAX_ATTEMPTS failures, and stays locked', () => {
  for (let i = 0; i < rateLimit.MAX_ATTEMPTS; i++) rateLimit.recordFailure('bob');
  assert.equal(rateLimit.isLocked('bob'), true);
});

test('does not lock out one attempt short of the threshold', () => {
  for (let i = 0; i < rateLimit.MAX_ATTEMPTS - 1; i++) rateLimit.recordFailure('bob');
  assert.equal(rateLimit.isLocked('bob'), false);
});

test('a successful login clears the failure count', () => {
  for (let i = 0; i < rateLimit.MAX_ATTEMPTS; i++) rateLimit.recordFailure('bob');
  assert.equal(rateLimit.isLocked('bob'), true);
  rateLimit.recordSuccess('bob');
  assert.equal(rateLimit.isLocked('bob'), false);
});

test('failures are tracked per-username, not globally', () => {
  for (let i = 0; i < rateLimit.MAX_ATTEMPTS; i++) rateLimit.recordFailure('bob');
  assert.equal(rateLimit.isLocked('bob'), true);
  assert.equal(rateLimit.isLocked('alice'), false);
});

test('the lockout expires after the window elapses', () => {
  for (let i = 0; i < rateLimit.MAX_ATTEMPTS; i++) rateLimit.recordFailure('bob');
  assert.equal(rateLimit.isLocked('bob'), true);
  // Simulate the window having passed by directly manipulating the clock
  // this module reads: re-record a failure with Date.now() mocked forward.
  const realNow = Date.now;
  Date.now = () => realNow() + rateLimit.WINDOW_MS + 1000;
  try {
    assert.equal(rateLimit.isLocked('bob'), false);
  } finally {
    Date.now = realNow;
  }
});
