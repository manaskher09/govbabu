const razorpay = require('./_lib/razorpay');
const { unlockAmountPaise } = require('./_lib/pricing');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end('Method not allowed');
  }

  const { tool, examCode } = req.body || {};
  if (!tool || !examCode) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'tool and examCode are required' }));
  }

  res.setHeader('Content-Type', 'application/json');

  if (!razorpay.isConfigured()) {
    // No live Razorpay account yet. Returns a clearly-labeled mock order so
    // the full button -> pay -> unlock -> download loop is testable today.
    // This disables itself automatically the moment real keys are set.
    return res.end(JSON.stringify({
      mock: true,
      order_id: 'mock_order_' + Date.now(),
      key_id: null,
      amount: unlockAmountPaise,
    }));
  }

  try {
    const order = await razorpay.createOrder({
      amountPaise: unlockAmountPaise,
      receipt: `${tool}-${examCode}-${Date.now()}`,
    });
    return res.end(JSON.stringify({
      mock: false,
      order_id: order.id,
      key_id: process.env.RAZORPAY_KEY_ID,
      amount: unlockAmountPaise,
    }));
  } catch (err) {
    res.statusCode = 502;
    return res.end(JSON.stringify({ error: 'Could not create order', detail: String((err && err.message) || err) }));
  }
};
