#!/usr/bin/env node
// node bin/create-admin.js <username> <password>
// Password is never written anywhere except its scrypt hash in the DB.
const { getDb } = require('../db/db');
const { setPassword } = require('../auth/sessions');

const [, , username, password] = process.argv;
if (!username || !password) {
  console.error('Usage: node bin/create-admin.js <username> <password>');
  process.exit(1);
}
if (password.length < 8) {
  console.error('Password must be at least 8 characters.');
  process.exit(1);
}

const db = getDb();
const id = setPassword(db, username, password);
console.log(`Admin user "${username}" ready (id ${id}).`);
