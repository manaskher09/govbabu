// crypto.scrypt is Node's built-in, purpose-built password-hashing KDF —
// no bcrypt/argon2 dependency needed, matching the project's "avoid
// unnecessary frameworks" constraint while still being a real, slow,
// salted hash (not a fast general-purpose hash like sha256).
const crypto = require('crypto');

const KEY_LEN = 64;
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 };

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const derived = crypto.scryptSync(password, salt, KEY_LEN, SCRYPT_PARAMS);
  return `scrypt:${salt.toString('hex')}:${derived.toString('hex')}`;
}

function verifyPassword(password, stored) {
  if (!stored) return false;
  const [scheme, saltHex, hashHex] = stored.split(':');
  if (scheme !== 'scrypt') return false;
  const salt = Buffer.from(saltHex, 'hex');
  const expected = Buffer.from(hashHex, 'hex');
  const actual = crypto.scryptSync(password, salt, expected.length, SCRYPT_PARAMS);
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

module.exports = { hashPassword, verifyPassword };
