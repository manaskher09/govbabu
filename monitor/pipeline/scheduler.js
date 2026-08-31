const { getDb } = require('../db/db');
const { runCheck } = require('./runCheck');

const POLL_INTERVAL_MS = Number(process.env.MONITOR_POLL_INTERVAL_MS || 60000);

/**
 * Async/background by design: this never runs inside a web request. Swap
 * this loop for a real queue (BullMQ, a Vercel Cron hitting one source per
 * invocation, etc.) once source count grows past what a single process
 * should poll — the pipeline itself (runCheck) doesn't change either way.
 */
async function runDueSources(db) {
  const due = db
    .prepare(`SELECT id, url FROM sources WHERE active = 1 AND next_check_at <= datetime('now')`)
    .all();
  const results = [];
  for (const source of due) {
    try {
      const result = await runCheck(db, source.id);
      results.push({ sourceId: source.id, ...result });
    } catch (err) {
      results.push({ sourceId: source.id, result: 'unexpected_error', error: err.message });
    }
  }
  return results;
}

function startScheduler() {
  const db = getDb();
  console.log(`Monitor scheduler starting — polling every ${POLL_INTERVAL_MS}ms`);
  const tick = async () => {
    const results = await runDueSources(db);
    if (results.length) console.log(`Checked ${results.length} due source(s):`, results.map((r) => `${r.sourceId}:${r.result}`).join(', '));
  };
  tick();
  setInterval(tick, POLL_INTERVAL_MS);
}

if (require.main === module) startScheduler();
module.exports = { runDueSources, startScheduler };
