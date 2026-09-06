// Brute-force protection for /api/admin/login. In-memory and per-username
// (not per-IP) — this is a single-admin dashboard, so the thing worth
// protecting is the account, regardless of which IP the guesses come from.
// Resets on server restart, which is an acceptable trade-off here: this
// isn't defending a multi-tenant system, just adding a real cap on top of
// scrypt's own slowness.
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

const attempts = new Map(); // username -> { count, firstAttemptAt }

function isExpired(entry) {
  return Date.now() - entry.firstAttemptAt > WINDOW_MS;
}

function isLocked(username) {
  const entry = attempts.get(username);
  if (!entry) return false;
  if (isExpired(entry)) {
    attempts.delete(username);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailure(username) {
  const entry = attempts.get(username);
  if (!entry || isExpired(entry)) {
    attempts.set(username, { count: 1, firstAttemptAt: Date.now() });
  } else {
    entry.count += 1;
  }
}

function recordSuccess(username) {
  attempts.delete(username);
}

// Test-only: the module-level Map would otherwise leak state between tests.
function _reset() {
  attempts.clear();
}

module.exports = { isLocked, recordFailure, recordSuccess, _reset, MAX_ATTEMPTS, WINDOW_MS };
