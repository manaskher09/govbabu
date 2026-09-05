const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const test = require('node:test');
const assert = require('node:assert/strict');
const { DatabaseSync } = require('node:sqlite');

// Regression test for the exact scenario Phase E's daily-check workflow
// depends on: a short-lived CLI process (no graceful close()) must leave
// monitor.sqlite3 itself as a complete, self-contained snapshot — nothing
// should be left stranded in monitor.sqlite3-wal once the process exits.
// This has to spawn a real child process: db.js's checkpoint runs on the
// process 'exit' event, which only fires for an actual process teardown,
// not for anything achievable by calling getDb() in-process here.
test('a CLI-style process exiting leaves no unchecked-pointed data in the WAL file', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'govbabu-checkpoint-test-'));
  const dbPath = path.join(dir, 'test.sqlite3');
  const dbJsPath = path.join(__dirname, '..', 'db', 'db.js');

  execFileSync(process.execPath, [
    '-e',
    `const { getDb } = require(${JSON.stringify(dbJsPath)});
     const db = getDb();
     db.exec("INSERT INTO admin_users (username, display_name) VALUES ('wal-test', 'x')");`,
  ], { env: { ...process.env, MONITOR_DB_PATH: dbPath } });

  const walPath = `${dbPath}-wal`;
  if (fs.existsSync(walPath)) {
    assert.equal(fs.statSync(walPath).size, 0, 'WAL file should be checkpointed (truncated) on process exit');
  }

  // The write must be visible from a FRESH connection reading only the main
  // file — proving it isn't stranded in a WAL file a naive `cp` would miss.
  const verify = new DatabaseSync(dbPath, { readOnly: true });
  const row = verify.prepare(`SELECT username FROM admin_users WHERE username = 'wal-test'`).get();
  assert.equal(row.username, 'wal-test');

  fs.rmSync(dir, { recursive: true, force: true });
});
