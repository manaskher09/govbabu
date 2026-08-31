const test = require('node:test');
const assert = require('node:assert/strict');
const notifications = require('../notifications/NotificationService');
const { approveChange, rejectChange } = require('../pipeline/applyApproval');
const { createTestDb, seedExamWithSource } = require('./helpers');

function insertPendingChange(db, examId, sourceId, overrides = {}) {
  const base = { field_name: 'exam_date', old_value: '2026-11-15', new_value: '2026-11-22', classification: 'CONFIRMED_CHANGE', confidence: 0.95, ...overrides };
  return db.prepare(
    `INSERT INTO change_events (exam_id, source_id, field_name, old_value, new_value, detection_method, confidence, classification, status)
     VALUES (?, ?, ?, ?, ?, 'regex', ?, ?, 'pending')`
  ).run(examId, sourceId, base.field_name, base.old_value, base.new_value, base.confidence, base.classification).lastInsertRowid;
}

test('a CONFIRMED_CHANGE is alertable on detection', async () => {
  const result = await notifications.notifyDetectedChange({ name: 'Test' }, { field_name: 'exam_date', classification: 'CONFIRMED_CHANGE', old_value: 'a', new_value: 'b' });
  assert.notEqual(result.status, 'skipped');
});

test('a POSSIBLE_CHANGE (unverified/low-confidence) is never alerted on detection', async () => {
  const result = await notifications.notifyDetectedChange({ name: 'Test' }, { field_name: 'exam_date', classification: 'POSSIBLE_CHANGE', old_value: 'a', new_value: 'b' });
  assert.equal(result.status, 'skipped');
  assert.equal(result.reason, 'classification_not_alertable');
});

test('approving a change sends exactly one approved notification', async () => {
  const db = createTestDb();
  const { examId, sourceId } = seedExamWithSource(db);
  const changeId = insertPendingChange(db, examId, sourceId);
  const calls = [];
  const spy = { notifyApprovedChange: async (exam, change) => calls.push(change) };

  approveChange(db, changeId, 1, 'ok', { notifications: spy });
  await new Promise((r) => setImmediate(r)); // let the fire-and-forget notify settle

  assert.equal(calls.length, 1);
  assert.equal(calls[0].new_value, '2026-11-22');
});

test('rejecting a change never triggers any notification', async () => {
  const db = createTestDb();
  const { examId, sourceId } = seedExamWithSource(db);
  const changeId = insertPendingChange(db, examId, sourceId);

  let called = false;
  const originalNotify = notifications.notifyApprovedChange;
  notifications.notifyApprovedChange = async () => { called = true; };
  try {
    rejectChange(db, changeId, 1, 'not confirmed');
    await new Promise((r) => setImmediate(r));
    assert.equal(called, false);
  } finally {
    notifications.notifyApprovedChange = originalNotify;
  }
});

test('a notification provider throwing synchronously does not affect the already-committed approval', () => {
  const db = createTestDb();
  const { examId, sourceId } = seedExamWithSource(db);
  const changeId = insertPendingChange(db, examId, sourceId);
  const throwingSpy = { notifyApprovedChange: () => { throw new Error('telegram is down'); } };

  const result = approveChange(db, changeId, 1, 'ok', { notifications: throwingSpy });
  assert.equal(result.status, 'approved');
  assert.equal(db.prepare('SELECT status FROM change_events WHERE id = ?').get(changeId).status, 'approved');
  assert.equal(db.prepare('SELECT COUNT(*) n FROM field_history WHERE is_current = 1').get().n, 1);
});

test('a notification provider returning a rejected promise does not affect the already-committed approval', async () => {
  const db = createTestDb();
  const { examId, sourceId } = seedExamWithSource(db);
  const changeId = insertPendingChange(db, examId, sourceId);
  const rejectingSpy = { notifyApprovedChange: async () => { throw new Error('network timeout'); } };

  const result = approveChange(db, changeId, 1, 'ok', { notifications: rejectingSpy });
  await new Promise((r) => setImmediate(r));
  assert.equal(result.status, 'approved');
  assert.equal(db.prepare('SELECT status FROM change_events WHERE id = ?').get(changeId).status, 'approved');
});
