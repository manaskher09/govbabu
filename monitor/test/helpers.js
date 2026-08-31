const { DatabaseSync } = require('node:sqlite');
const { runMigrations } = require('../db/migrate');

function createTestDb() {
  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON');
  runMigrations(db);
  db.prepare(`INSERT INTO admin_users (id, username) VALUES (1, 'test-admin')`).run();
  return db;
}

function seedExamWithSource(db, { sourceType = 'html', url = 'https://example.gov.in/notice' } = {}) {
  const orgId = db.prepare(`INSERT INTO organizations (name, short_code) VALUES (?, ?)`).run('Test Org', 'TESTORG' + Math.random()).lastInsertRowid;
  const examId = db.prepare(`INSERT INTO exams (org_id, code, name, category) VALUES (?, ?, ?, ?)`).run(orgId, 'TEST-' + Math.random(), 'Test Exam', 'Central Govt').lastInsertRowid;
  const sourceId = db.prepare(
    `INSERT INTO sources (exam_id, label, url, source_type, monitoring_frequency_minutes) VALUES (?, ?, ?, ?, 720)`
  ).run(examId, 'Test source', url, sourceType).lastInsertRowid;
  return { orgId, examId, sourceId };
}

function fakeFetcherReturning(text, { status = 200, notModified = false } = {}) {
  return async () => {
    if (notModified) return { ok: true, notModified: true, status: 304, responseTimeMs: 5 };
    return { ok: true, status, buffer: Buffer.from(text, 'utf8'), headers: {}, responseTimeMs: 12 };
  };
}

function fakePdfParser(text) {
  return async () => ({ text, numpages: 1 });
}

module.exports = { createTestDb, seedExamWithSource, fakeFetcherReturning, fakePdfParser };
