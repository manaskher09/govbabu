const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;
const PUBLIC_CHAT_ID = process.env.TELEGRAM_PUBLIC_CHAT_ID;
const PUBLIC_ENABLED = process.env.TELEGRAM_PUBLIC_ENABLED === 'true';

async function send(chatId, text) {
  if (!BOT_TOKEN || !chatId) return { status: 'dry_run', reason: 'not_configured' };
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
      signal: AbortSignal.timeout(10000),
    });
    return { status: res.ok ? 'sent' : 'failed' };
  } catch {
    return { status: 'failed' };
  }
}

const TelegramProvider = {
  name: 'telegram',
  isConfigured: () => Boolean(BOT_TOKEN),
  async sendAdmin(message) {
    return send(ADMIN_CHAT_ID, message);
  },
  async sendPublic(message) {
    if (!PUBLIC_ENABLED) return { status: 'skipped_unapproved', reason: 'public_alerts_disabled' };
    return send(PUBLIC_CHAT_ID, message);
  },
};

module.exports = TelegramProvider;
