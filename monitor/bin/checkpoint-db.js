#!/usr/bin/env node
// Forces the WAL-checkpoint-on-exit behavior in db/db.js to run right now,
// against whatever MONITOR_DB_PATH points at. Needed before anything reads
// or copies the raw .sqlite3 file directly (git diff, cp, ...) while a
// long-running process (the admin server) might still have it open — that
// process only checkpoints when IT exits, not on demand, so a write made
// through the dashboard can sit in monitor.sqlite3-wal indefinitely and be
// invisible to a plain `git diff` on monitor.sqlite3 itself. See
// bin/save-review.sh, which calls this before committing.
require('../db/db').getDb();
