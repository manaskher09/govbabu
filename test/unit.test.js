// Zero-dependency unit tests for the backend logic — run with `node --test`.
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

process.env.UNLOCK_TOKEN_SECRET = 'test-secret-for-unit-tests';
const unlockToken = require('../api/_lib/unlock-token');

test('unlock-token: mint then verify succeeds for the same tool+examCode', () => {
  const token = unlockToken.mint({ tool: 'bundle', examCode: 'SSC-CGL' });
  assert.equal(unlockToken.verify(token, { tool: 'bundle', examCode: 'SSC-CGL' }), true);
});

test('unlock-token: verify fails for a different tool', () => {
  const token = unlockToken.mint({ tool: 'bundle', examCode: 'SSC-CGL' });
  assert.equal(unlockToken.verify(token, { tool: 'pdf', examCode: 'SSC-CGL' }), false);
});

test('unlock-token: verify fails for a different examCode', () => {
  const token = unlockToken.mint({ tool: 'bundle', examCode: 'SSC-CGL' });
  assert.equal(unlockToken.verify(token, { tool: 'bundle', examCode: 'IBPS-PO' }), false);
});

test('unlock-token: verify fails when the signature is tampered with', () => {
  const token = unlockToken.mint({ tool: 'bundle', examCode: 'SSC-CGL' });
  const [payload] = token.split('.');
  const tampered = payload + '.' + 'x'.repeat(43);
  assert.equal(unlockToken.verify(tampered, { tool: 'bundle', examCode: 'SSC-CGL' }), false);
});

test('unlock-token: verify fails when the payload is tampered with (mismatched signature)', () => {
  const tokenA = unlockToken.mint({ tool: 'bundle', examCode: 'SSC-CGL' });
  const tokenB = unlockToken.mint({ tool: 'bundle', examCode: 'IBPS-PO' });
  const [payloadA] = tokenA.split('.');
  const [, sigB] = tokenB.split('.');
  const frankensteined = payloadA + '.' + sigB;
  assert.equal(unlockToken.verify(frankensteined, { tool: 'bundle', examCode: 'SSC-CGL' }), false);
});

test('unlock-token: verify fails for an already-expired token', () => {
  // Mint a token whose payload we hand-craft with exp in the past, signed
  // with the same secret so only expiry (not signature) is under test.
  const base64url = (buf) => Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const payload = JSON.stringify({ tool: 'bundle', examCode: 'SSC-CGL', exp: Date.now() - 1000 });
  const payloadB64 = base64url(payload);
  const sig = base64url(crypto.createHmac('sha256', 'test-secret-for-unit-tests').update(payloadB64).digest());
  const expiredToken = payloadB64 + '.' + sig;
  assert.equal(unlockToken.verify(expiredToken, { tool: 'bundle', examCode: 'SSC-CGL' }), false);
});

test('unlock-token: verify fails for garbage input without throwing', () => {
  assert.doesNotThrow(() => unlockToken.verify('not-a-real-token', { tool: 'bundle', examCode: 'SSC-CGL' }));
  assert.equal(unlockToken.verify('not-a-real-token', { tool: 'bundle', examCode: 'SSC-CGL' }), false);
  assert.equal(unlockToken.verify(null, { tool: 'bundle', examCode: 'SSC-CGL' }), false);
  assert.equal(unlockToken.verify(undefined, { tool: 'bundle', examCode: 'SSC-CGL' }), false);
});

test('razorpay: isConfigured() is false with no keys set', () => {
  delete process.env.RAZORPAY_KEY_ID;
  delete process.env.RAZORPAY_KEY_SECRET;
  delete require.cache[require.resolve('../api/_lib/razorpay')];
  const razorpay = require('../api/_lib/razorpay');
  assert.equal(razorpay.isConfigured(), false);
});

test('razorpay: isConfigured() is true once both keys are set', () => {
  process.env.RAZORPAY_KEY_ID = 'rzp_test_id';
  process.env.RAZORPAY_KEY_SECRET = 'rzp_test_secret';
  delete require.cache[require.resolve('../api/_lib/razorpay')];
  const razorpay = require('../api/_lib/razorpay');
  assert.equal(razorpay.isConfigured(), true);
  delete process.env.RAZORPAY_KEY_ID;
  delete process.env.RAZORPAY_KEY_SECRET;
  delete require.cache[require.resolve('../api/_lib/razorpay')];
});

test('razorpay: verifyPaymentSignature accepts a correctly-computed HMAC', () => {
  process.env.RAZORPAY_KEY_ID = 'rzp_test_id';
  process.env.RAZORPAY_KEY_SECRET = 'rzp_test_secret';
  delete require.cache[require.resolve('../api/_lib/razorpay')];
  const razorpay = require('../api/_lib/razorpay');
  const orderId = 'order_ABC123', paymentId = 'pay_XYZ789';
  const signature = crypto.createHmac('sha256', 'rzp_test_secret').update(`${orderId}|${paymentId}`).digest('hex');
  assert.equal(razorpay.verifyPaymentSignature({ orderId, paymentId, signature }), true);
  delete process.env.RAZORPAY_KEY_ID;
  delete process.env.RAZORPAY_KEY_SECRET;
  delete require.cache[require.resolve('../api/_lib/razorpay')];
});

test('razorpay: verifyPaymentSignature rejects a tampered signature', () => {
  process.env.RAZORPAY_KEY_ID = 'rzp_test_id';
  process.env.RAZORPAY_KEY_SECRET = 'rzp_test_secret';
  delete require.cache[require.resolve('../api/_lib/razorpay')];
  const razorpay = require('../api/_lib/razorpay');
  const orderId = 'order_ABC123', paymentId = 'pay_XYZ789';
  const realSignature = crypto.createHmac('sha256', 'rzp_test_secret').update(`${orderId}|${paymentId}`).digest('hex');
  const wrongPaymentId = 'pay_DIFFERENT';
  assert.equal(razorpay.verifyPaymentSignature({ orderId, paymentId: wrongPaymentId, signature: realSignature }), false);
  delete process.env.RAZORPAY_KEY_ID;
  delete process.env.RAZORPAY_KEY_SECRET;
  delete require.cache[require.resolve('../api/_lib/razorpay')];
});

test('razorpay: verifyPaymentSignature returns false (not throws) when not configured', () => {
  delete process.env.RAZORPAY_KEY_ID;
  delete process.env.RAZORPAY_KEY_SECRET;
  delete require.cache[require.resolve('../api/_lib/razorpay')];
  const razorpay = require('../api/_lib/razorpay');
  assert.doesNotThrow(() => razorpay.verifyPaymentSignature({ orderId: 'x', paymentId: 'y', signature: 'z' }));
  assert.equal(razorpay.verifyPaymentSignature({ orderId: 'x', paymentId: 'y', signature: 'z' }), false);
});

test('pricing: unlock amount is a sane positive integer equal to ₹29', () => {
  const { unlockAmountPaise } = require('../api/_lib/pricing');
  assert.equal(typeof unlockAmountPaise, 'number');
  assert.ok(Number.isInteger(unlockAmountPaise));
  assert.ok(unlockAmountPaise > 0);
  assert.equal(unlockAmountPaise, 2900);
});
