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
  return db;
}

module.exports = { getDb, DB_PATH };
