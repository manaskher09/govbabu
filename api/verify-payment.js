const razorpay = require('./_lib/razorpay');
const unlockToken = require('./_lib/unlock-token');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end('Method not allowed');
  }

  const { tool, examCode, order_id, payment_id, signature, mock } = req.body || {};
  if (!tool || !examCode) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'tool and examCode are required' }));
  }

  res.setHeader('Content-Type', 'application/json');

  if (!razorpay.isConfigured()) {
    // Mirrors create-order's mock mode: only accepts the mock order id it
    // issued, and still mints a real signed token so the rest of the
    // pipeline (frontend gating, sessionStorage, download unlock) runs
    // exactly as it will once real payments are verified here.
    if (!mock || !String(order_id || '').startsWith('mock_order_')) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: 'Payments are not configured yet on this server.' }));
    }
    return res.end(JSON.stringify({ unlock_token: unlockToken.mint({ tool, examCode }), mock: true }));
  }

  const ok = razorpay.verifyPaymentSignature({ orderId: order_id, paymentId: payment_id, signature });
  if (!ok) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: 'Payment verification failed' }));
  }

  return res.end(JSON.stringify({ unlock_token: unlockToken.mint({ tool, examCode }) }));
};
