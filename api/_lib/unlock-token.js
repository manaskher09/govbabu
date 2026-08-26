// Signs a short-lived token proving a specific (tool, examCode) pair was
// paid for, without needing an accounts/login system. The browser holds the
// token in sessionStorage; nothing here depends on Razorpay, so it's fully
// testable before a payment gateway is wired up.
const crypto = require('crypto');

const SECRET = process.env.UNLOCK_TOKEN_SECRET || 'dev-only-insecure-secret-change-me';
const TTL_MS = 48 * 60 * 60 * 1000; // 48h — enough for a retry without re-paying

if (!process.env.UNLOCK_TOKEN_SECRET) {
  console.warn('[unlock-token] UNLOCK_TOKEN_SECRET is not set — using an insecure dev default. Set it before deploying for real.');
}

function base64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function base64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64');
}
function sign(payloadB64) {
  return base64url(crypto.createHmac('sha256', SECRET).update(payloadB64).digest());
}
function timingSafeEqualStr(a, b) {
  const bufA = Buffer.from(a), bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function mint({ tool, examCode }) {
  const payloadB64 = base64url(JSON.stringify({ tool, examCode, exp: Date.now() + TTL_MS }));
  return `${payloadB64}.${sign(payloadB64)}`;
}

function verify(token, { tool, examCode }) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return false;
  const [payloadB64, sig] = token.split('.');
  if (!sig || !timingSafeEqualStr(sig, sign(payloadB64))) return false;
  let payload;
  try {
    payload = JSON.parse(base64urlDecode(payloadB64).toString('utf8'));
  } catch {
    return false;
  }
  return payload.tool === tool && payload.examCode === examCode && Date.now() <= payload.exp;
}

module.exports = { mint, verify };
