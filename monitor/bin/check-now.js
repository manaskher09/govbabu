#!/usr/bin/env node
const { getDb } = require('../db/db');
const { runCheck } = require('../pipeline/runCheck');

async function main() {
  const db = getDb();
  const arg = process.argv[2];
  const sources = arg
    ? [db.prepare('SELECT id, label FROM sources WHERE id = ?').get(Number(arg))]
    : db.prepare('SELECT id, label FROM sources WHERE active = 1').all();

  for (const source of sources.filter(Boolean)) {
    process.stdout.write(`Checking [${source.id}] ${source.label} ... `);
    const result = await runCheck(db, source.id);
    console.log(JSON.stringify(result));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
