const notifications = require('../notifications/NotificationService');

const INTERNAL_FIELDS = new Set(['__manual_review__', '__unstructured_change__']);

/**
 * The ONLY path by which a detected change becomes GovBabu's recorded
 * truth. Nothing in the pipeline calls this automatically — see
 * runCheck.js, which only ever writes to change_events (status='pending').
 *
 * Steps 1-8 below run as ONE transaction (see STEP 4 of the spec this
 * implements): if any step fails, everything rolls back — there is never a
 * state where the value changed but history wasn't recorded, or vice versa.
 */
function approveChange(db, changeEventId, adminUserId, notes, deps = {}) {
  const notify = deps.notifications || notifications;
  const preCheck = db.prepare('SELECT status FROM change_events WHERE id = ?').get(changeEventId);
  if (!preCheck) throw new Error(`No change_event ${changeEventId}`);
  if (preCheck.status !== 'pending') throw new Error(`change_event ${changeEventId} is already ${preCheck.status}`);

  let change;
  db.exec('BEGIN IMMEDIATE');
  try {
    // 1+2: validate + re-confirm still pending, inside the transaction, so a
    // concurrent approve/reject can never both succeed.
    change = db.prepare('SELECT * FROM change_events WHERE id = ?').get(changeEventId);
    if (!change || change.status !== 'pending') {
      throw new Error(`change_event ${changeEventId} is no longer pending`);
    }

    if (!INTERNAL_FIELDS.has(change.field_name)) {
      // 3: old value is already sitting in change.old_value (captured at
      // detection time) and in the field_history row we're about to demote.
      db.prepare(
        `UPDATE field_history SET is_current = 0 WHERE exam_id = ? AND field_name = ? AND is_current = 1`
      ).run(change.exam_id, change.field_name);
      // 4+5: write the new approved value and its history record together.
      db.prepare(
        `INSERT INTO field_history (exam_id, field_name, value, source_id, change_event_id, approved_by, is_current)
         VALUES (?, ?, ?, ?, ?, ?, 1)`
      ).run(change.exam_id, change.field_name, change.new_value, change.source_id, change.id, adminUserId);
      // 8: bump the exam's updated_at now that its published data changed.
      db.prepare(`UPDATE exams SET updated_at = datetime('now') WHERE id = ?`).run(change.exam_id);
    }

    // 6: mark the change event approved.
    db.prepare(
      `UPDATE change_events SET status = 'approved', reviewed_by = ?, reviewed_at = datetime('now'), review_notes = ? WHERE id = ?`
    ).run(adminUserId, notes || null, change.id);

    // 7: audit log, inside the same transaction as everything else.
    db.prepare(
      `INSERT INTO audit_logs (actor, action, entity_type, entity_id, details) VALUES (?, 'approve_change', 'change_event', ?, ?)`
    ).run(String(adminUserId), change.id, JSON.stringify({ field: change.field_name, old: change.old_value, new: change.new_value }));

    db.exec('COMMIT'); // 9: one transaction, all-or-nothing.
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  // Notifications happen strictly after commit — a failed Telegram send must
  // never roll back an already-approved, already-recorded change.
  // A notification failure must never undo or taint an already-committed
  // approval — guard against both a rejected promise and a synchronous throw.
  const exam = db.prepare('SELECT * FROM exams WHERE id = ?').get(change.exam_id);
  try {
    Promise.resolve(notify.notifyApprovedChange(exam, change)).catch(() => {});
  } catch {
    // ignored — see comment above
  }

  return { status: 'approved', changeEventId };
}

function rejectChange(db, changeEventId, adminUserId, notes) {
  const preCheck = db.prepare('SELECT status FROM change_events WHERE id = ?').get(changeEventId);
  if (!preCheck) throw new Error(`No change_event ${changeEventId}`);
  if (preCheck.status !== 'pending') throw new Error(`change_event ${changeEventId} is already ${preCheck.status}`);

  db.exec('BEGIN IMMEDIATE');
  try {
    const change = db.prepare('SELECT status, field_name FROM change_events WHERE id = ?').get(changeEventId);
    if (!change || change.status !== 'pending') {
      throw new Error(`change_event ${changeEventId} is no longer pending`);
    }
    // A rejected change is never deleted — it stays in change_events with
    // status='rejected', permanently visible in the audit trail.
    db.prepare(
      `UPDATE change_events SET status = 'rejected', reviewed_by = ?, reviewed_at = datetime('now'), review_notes = ? WHERE id = ?`
    ).run(adminUserId, notes || null, changeEventId);
    db.prepare(
      `INSERT INTO audit_logs (actor, action, entity_type, entity_id, details) VALUES (?, 'reject_change', 'change_event', ?, ?)`
    ).run(String(adminUserId), changeEventId, JSON.stringify({ field: change.field_name, notes: notes || null }));
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  return { status: 'rejected', changeEventId };
}

module.exports = { approveChange, rejectChange };
