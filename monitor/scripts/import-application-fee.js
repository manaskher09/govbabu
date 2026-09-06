#!/usr/bin/env node
// node scripts/import-application-fee.js [--dry-run]
//
// One-off backfill for the `applicationFee` field, which the DB migration
// (import-existing-exams.js's SIMPLE_FIELD_MAP) never mapped — it was a
// top-level app.js field, not one of the recognized ones, so it silently
// never made it into the database for any of the 53 migrated exams. app.js
// no longer carries the source array to re-run that script against, so this
// reads the recovered fee text from scratchpad/fees-by-code.json instead
// (reconstructed from the original research + a pre-migration app.js
// backup — see scratchpad/extract-fees.js).
//
// Uses the same is_current=0-then-insert-new-current-row pattern as
// import-existing-exams.js's setField, so it's safe to re-run.
const fs = require('fs');
const { getDb } = require('../db/db');

const FEES_PATH = '/Users/manaskher/Desktop/GovBabu/scratchpad/fees-by-code.json';

function setField(db, examId, fieldName, value, actorId) {
  const current = db
    .prepare('SELECT value FROM field_history WHERE exam_id = ? AND field_name = ? AND is_current = 1')
    .get(examId, fieldName);
  if (current && current.value === value) return false;
  db.prepare('UPDATE field_history SET is_current = 0 WHERE exam_id = ? AND field_name = ? AND is_current = 1').run(examId, fieldName);
  db.prepare(
    `INSERT INTO field_history (exam_id, field_name, value, source_id, change_event_id, approved_by, is_current)
     VALUES (?, ?, ?, NULL, NULL, ?, 1)`
  ).run(examId, fieldName, value, actorId);
  return true;
}

function run({ dryRun = false } = {}) {
  const fees = JSON.parse(fs.readFileSync(FEES_PATH, 'utf8'));
  const db = getDb();
  const systemActorId =
    (db.prepare(`INSERT OR IGNORE INTO admin_users (username, display_name) VALUES ('import-application-fee', 'Fee Backfill')`).run(),
    db.prepare(`SELECT id FROM admin_users WHERE username = 'import-application-fee'`).get().id);

  const summary = { found: Object.keys(fees).length, updated: 0, unchanged: 0, notFoundInDb: [] };

  const doImport = () => {
    for (const [code, fee] of Object.entries(fees)) {
      const row = db.prepare('SELECT id FROM exams WHERE code = ?').get(code);
      if (!row) {
        summary.notFoundInDb.push(code);
        continue;
      }
      const changed = setField(db, row.id, 'application_fee', fee, systemActorId);
      if (changed) summary.updated += 1;
      else summary.unchanged += 1;
    }
  };

  db.exec('BEGIN');
  try {
    doImport();
    if (dryRun) db.exec('ROLLBACK');
    else db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
  return summary;
}

if (require.main === module) {
  const dryRun = process.argv.includes('--dry-run');
  const summary = run({ dryRun });
  console.log(JSON.stringify(summary, null, 2));
  if (dryRun) console.log('\n(dry run — nothing was written)');
}

module.exports = { run };
