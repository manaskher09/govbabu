const test = require('node:test');
const assert = require('node:assert/strict');
const { approveChange, rejectChange } = require('../pipeline/applyApproval');
const { createTestDb, seedExamWithSource } = require('./helpers');

function insertPendingChange(db, examId, sourceId, overrides = {}) {
  return db.prepare(
    `INSERT INTO change_events (exam_id, source_id, field_name, old_value, new_value, detection_method, confidence, classification, status)
     VALUES (?, ?, 'exam_date', '2026-11-15', '2026-11-22', 'regex', 0.95, 'CONFIRMED_CHANGE', 'pending')`
  ).run(examId, sourceId).lastInsertRowid;
}

test('approving a change writes field_history and marks the event approved', () => {
  const db = createTestDb();
  const { examId, sourceId } = seedExamWithSource(db);
  const adminId = db.prepare(`INSERT INTO admin_users (username) VALUES ('tester')`).run().lastInsertRowid;
  const changeId = insertPendingChange(db, examId, sourceId);

  approveChange(db, changeId, adminId, 'looks right');

  const change = db.prepare('SELECT * FROM change_events WHERE id = ?').get(changeId);
  assert.equal(change.status, 'approved');
  assert.equal(change.reviewed_by, adminId);

  const history = db.prepare('SELECT * FROM field_history WHERE exam_id = ? AND is_current = 1').get(examId);
  assert.equal(history.value, '2026-11-22');

  const audit = db.prepare(`SELECT * FROM audit_logs WHERE action = 'approve_change'`).get();
  assert.ok(audit);
});

test('rejecting a change never touches field_history', () => {
  const db = createTestDb();
  const { examId, sourceId } = seedExamWithSource(db);
  const adminId = db.prepare(`INSERT INTO admin_users (username) VALUES ('tester')`).run().lastInsertRowid;
  const changeId = insertPendingChange(db, examId, sourceId);

  rejectChange(db, changeId, adminId, 'not confirmed yet');

  const change = db.prepare('SELECT * FROM change_events WHERE id = ?').get(changeId);
  assert.equal(change.status, 'rejected');
  assert.equal(db.prepare('SELECT COUNT(*) n FROM field_history').get().n, 0);
});

test('approving an already-reviewed change throws instead of double-applying', () => {
  const db = createTestDb();
  const { examId, sourceId } = seedExamWithSource(db);
  const adminId = db.prepare(`INSERT INTO admin_users (username) VALUES ('tester')`).run().lastInsertRowid;
  const changeId = insertPendingChange(db, examId, sourceId);

  approveChange(db, changeId, adminId);
  assert.throws(() => approveChange(db, changeId, adminId), /already approved/);
});

test('rejecting after an approval is impossible — the terminal state is protected', () => {
  const db = createTestDb();
  const { examId, sourceId } = seedExamWithSource(db);
  const adminId = db.prepare(`INSERT INTO admin_users (username) VALUES ('tester')`).run().lastInsertRowid;
  const changeId = insertPendingChange(db, examId, sourceId);

  approveChange(db, changeId, adminId);
  assert.throws(() => rejectChange(db, changeId, adminId), /already approved/);
});

test('a failing write inside the transaction rolls back everything — no partial state', () => {
  const db = createTestDb();
  const { examId, sourceId } = seedExamWithSource(db);
  const changeId = insertPendingChange(db, examId, sourceId);
  const bogusAdminId = 999999; // violates the admin_users foreign key

  assert.throws(() => approveChange(db, changeId, bogusAdminId), /FOREIGN KEY/);

  const change = db.prepare('SELECT status FROM change_events WHERE id = ?').get(changeId);
  assert.equal(change.status, 'pending', 'must not be left half-approved');
  assert.equal(db.prepare('SELECT COUNT(*) n FROM field_history').get().n, 0, 'no history row from the failed attempt');
  assert.equal(db.prepare(`SELECT COUNT(*) n FROM audit_logs WHERE action = 'approve_change'`).get().n, 0);
});

test('a second approved change for the same field supersedes the first in field_history', () => {
  const db = createTestDb();
  const { examId, sourceId } = seedExamWithSource(db);
  const adminId = db.prepare(`INSERT INTO admin_users (username) VALUES ('tester')`).run().lastInsertRowid;

  approveChange(db, insertPendingChange(db, examId, sourceId), adminId);
  const secondId = db.prepare(
    `INSERT INTO change_events (exam_id, source_id, field_name, old_value, new_value, detection_method, confidence, classification, status)
     VALUES (?, ?, 'exam_date', '2026-11-22', '2026-11-29', 'regex', 0.9, 'CONFIRMED_CHANGE', 'pending')`
  ).run(examId, sourceId).lastInsertRowid;
  approveChange(db, secondId, adminId);

  const current = db.prepare('SELECT * FROM field_history WHERE exam_id = ? AND is_current = 1').all(examId);
  assert.equal(current.length, 1);
  assert.equal(current[0].value, '2026-11-29');
  const historyCount = db.prepare('SELECT COUNT(*) n FROM field_history WHERE exam_id = ?').get(examId).n;
  assert.equal(historyCount, 2, 'old value must be preserved in history, not overwritten');
});
