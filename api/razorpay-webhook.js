const razorpay = require('./_lib/razorpay');

// Backup confirmation path: if the browser closes before verify-payment
// runs, Razorpay still calls this webhook so the payment isn't silently
// lost. Needs RAZORPAY_WEBHOOK_SECRET set (from the webhook's dashboard
// config) once a real webhook is registered.
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end('Method not allowed');
  }

  const signature = req.headers['x-razorpay-signature'];
  const rawBody = req.rawBody != null ? req.rawBody : JSON.stringify(req.body || {});

  if (!razorpay.verifyWebhookSignature({ rawBody, signature })) {
    res.statusCode = 400;
    return res.end('Invalid signature');
  }

  // TODO once a persistence layer is chosen (KV/DB): record this
  // payment_id as settled so verify-payment can be skipped/reconciled for
  // sessions that never came back to call it directly.
  console.log('Razorpay webhook received:', req.body && req.body.event);
  res.statusCode = 200;
  res.end('ok');
};
