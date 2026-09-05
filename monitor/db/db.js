// Uses Node's built-in node:sqlite (stable in this project's Node version)
// instead of better-sqlite3 — it needs no native compilation, which
// better-sqlite3's prebuilt binaries don't yet support on very new Node
// releases. Same synchronous prepare/run/get/all API either way; if you're
// running an older Node without node:sqlite, swap this one file for
// better-sqlite3 and nothing else in the pipeline changes.
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const { runMigrations } = require('./migrate');

const DB_PATH = process.env.MONITOR_DB_PATH || path.join(__dirname, 'monitor.sqlite3');

let db;
function getDb() {
  if (db) return db;
  db = new DatabaseSync(DB_PATH);
  db.exec('PRAGMA foreign_keys = ON');
  db.exec('PRAGMA journal_mode = WAL');
  runMigrations(db);
  // Every short-lived CLI entry point (check-now, publish, daily-check,
  // import-existing-exams, ...) opens this DB, writes, and lets the process
  // exit — none of them call a graceful close(). In WAL mode, a commit is
  // durable in monitor.sqlite3-wal immediately, but isn't folded back into
  // monitor.sqlite3 itself until a checkpoint runs. Anything that reads or
  // copies just the single .sqlite3 file — which is exactly what the daily
  // GitHub Actions workflow does when it hands the file to the private
  // govbabu-data repo — would silently miss whatever's still sitting in the
  // WAL file. Checkpointing on exit keeps monitor.sqlite3 itself always a
  // complete, self-contained snapshot, independent of whether anything ever
  // explicitly closes the connection.
  process.on('exit', () => {
    try {
      db.exec('PRAGMA wal_checkpoint(TRUNCATE)');
    } catch {
      // best-effort — a failed checkpoint here must never crash process exit
    }
  });
  return db;
}

module.exports = { getDb, DB_PATH };
