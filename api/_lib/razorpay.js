// Thin wrapper around Razorpay's REST API — no SDK dependency, just fetch +
// crypto (both built into the Node runtime). isConfigured() is the single
// switch: unset env vars means every caller falls back to mock mode instead
// of a broken real one, and the moment real keys are set this starts
// talking to Razorpay for real with no code changes elsewhere.
const crypto = require('crypto');

const KEY_ID = process.env.RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

function isConfigured() {
  return Boolean(KEY_ID && KEY_SECRET);
}

async function createOrder({ amountPaise, receipt }) {
  if (!isConfigured()) throw new Error('RAZORPAY_NOT_CONFIGURED');
  const auth = Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString('base64');
  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: amountPaise, currency: 'INR', receipt }),
  });
  if (!res.ok) throw new Error(`Razorpay order creation failed: ${res.status} ${await res.text()}`);
  return res.json();
}

function timingSafeEqualHex(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
  } catch {
    return false;
  }
}

// Per Razorpay's documented checkout verification: HMAC-SHA256 of
// "order_id|payment_id" using the key secret, compared to what checkout.js
// returned. This must run server-side — it's the one step that can't be
// trusted to the browser.
function verifyPaymentSignature({ orderId, paymentId, signature }) {
  if (!isConfigured() || !orderId || !paymentId || !signature) return false;
  const expected = crypto.createHmac('sha256', KEY_SECRET).update(`${orderId}|${paymentId}`).digest('hex');
  return timingSafeEqualHex(expected, signature);
}

function verifyWebhookSignature({ rawBody, signature }) {
  if (!WEBHOOK_SECRET || !signature) return false;
  const expected = crypto.createHmac('sha256', WEBHOOK_SECRET).update(rawBody).digest('hex');
  return timingSafeEqualHex(expected, signature);
}

module.exports = { isConfigured, createOrder, verifyPaymentSignature, verifyWebhookSignature };
