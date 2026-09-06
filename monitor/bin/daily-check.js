#!/usr/bin/env node
// Entry point for the scheduled daily check (see
// .github/workflows/daily-sanity-check.yml in the main site repo). Runs
// every active source through the same pipeline `bin/check-now.js` uses,
// then sends ONE summary Telegram message — a heartbeat confirming the job
// actually ran, separate from the per-change alerts pipeline/runCheck.js
// already sends via NotificationService for anything CONFIRMED_CHANGE or
// NEEDS_HUMAN_REVIEW. Exits non-zero only on an unexpected crash, never
// because a source was unreachable or flagged something — those are
// expected, everyday outcomes of monitoring real government sites.
const { getDb } = require('../db/db');
const { runCheck } = require('../pipeline/runCheck');
const TelegramProvider = require('../notifications/TelegramProvider');

function classify(result) {
  if (result.result === 'no_change') return 'noChange';
  if (result.result === 'unavailable') return 'unavailable';
  if (result.result === 'error') return 'errors';
  if (result.result === 'changed') {
    const classifications = result.changes ? result.changes.map((c) => c.classification) : [result.classification];
    return classifications.includes('NEEDS_HUMAN_REVIEW') ? 'needsReview' : 'changed';
  }
  return 'errors';
}

async function main() {
  const db = getDb();
  const sources = db.prepare('SELECT id, label FROM sources WHERE active = 1').all();

  const tally = { checked: 0, noChange: 0, changed: 0, needsReview: 0, unavailable: 0, errors: 0 };
  for (const source of sources) {
    tally.checked += 1;
    try {
      const result = await runCheck(db, source.id);
      console.log(`[${source.id}] ${source.label}: ${JSON.stringify(result)}`);
      tally[classify(result)] += 1;
    } catch (err) {
      tally.errors += 1;
      console.error(`[${source.id}] ${source.label} threw: ${err.message}`);
    }
  }

  const pendingCount = db.prepare(`SELECT COUNT(*) c FROM change_events WHERE status = 'pending'`).get().c;
  const flagged = tally.changed + tally.needsReview;
  const summary = [
    '📋 GovBabu daily sanity check',
    `Sources checked: ${tally.checked}`,
    `No change: ${tally.noChange} · Flagged: ${flagged} · Unavailable: ${tally.unavailable}${tally.errors ? ` · Errors: ${tally.errors}` : ''}`,
    `Total pending review: ${pendingCount}`,
    pendingCount > 0 ? 'Open the admin dashboard to review.' : null,
  ].filter(Boolean).join('\n');

  console.log('\n' + summary);
  if (TelegramProvider.isConfigured()) {
    const sendResult = await TelegramProvider.sendAdmin(summary);
    console.log('Telegram summary:', JSON.stringify(sendResult));
  } else {
    console.log('Telegram not configured (TELEGRAM_BOT_TOKEN unset) — summary printed above only.');
  }
  return tally;
}

// A normal day's summary (bad sources, flagged changes) is loud on purpose.
// A day where the job crashes outright must be at least as loud — silence
// is the one outcome nobody notices, since "no message today" looks
// identical to "nothing happened to run." Separated from the process-exit
// side effect below so it's testable without killing the test runner.
async function alertOnCrash(err, deps = {}) {
  const telegram = deps.telegram || TelegramProvider;
  console.error(err);
  let alertSent = false;
  try {
    if (telegram.isConfigured()) {
      const result = await telegram.sendAdmin(`🚨 GovBabu daily sanity check CRASHED — no sources were checked today.\n${err.message}`);
      alertSent = result.status === 'sent';
    }
  } catch {
    // a failed alert must not mask the original crash — alertSent stays false
  }
  return alertSent;
}

if (require.main === module) {
  main().catch((err) => alertOnCrash(err).then(() => process.exit(1)));
}
module.exports = { main, classify, alertOnCrash };
