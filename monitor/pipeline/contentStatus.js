// Exam-level content lifecycle — distinct from change_events' field-level
// pending/approved/rejected. This tracks "is this EXAM RECORD as a whole
// ready to be public," not any single field's review state. Same
// transaction/audit pattern as applyApproval.js.

const TRANSITIONS = {
  discovered: ['draft', 'archived'],
  draft: ['needs_review', 'archived'],
  needs_review: ['draft', 'verified', 'archived'],
  verified: ['draft', 'published', 'archived'],
  published: ['verified', 'archived'],
  archived: ['draft'],
};

function transitionContentStatus(db, examId, toStatus, adminUserId) {
  if (!Object.prototype.hasOwnProperty.call(TRANSITIONS, toStatus)) {
    throw new Error(`Unknown content_status "${toStatus}"`);
  }
  db.exec('BEGIN IMMEDIATE');
  try {
    const exam = db.prepare('SELECT content_status FROM exams WHERE id = ?').get(examId);
    if (!exam) throw new Error(`No exam ${examId}`);
    if (!TRANSITIONS[exam.content_status].includes(toStatus)) {
      throw new Error(`Cannot transition from ${exam.content_status} to ${toStatus}`);
    }
    db.prepare(
      `UPDATE exams SET content_status = ?, content_status_updated_at = datetime('now'), content_status_updated_by = ? WHERE id = ?`
    ).run(toStatus, adminUserId, examId);
    db.prepare(
      `INSERT INTO audit_logs (actor, action, entity_type, entity_id, details) VALUES (?, 'set_content_status', 'exam', ?, ?)`
    ).run(String(adminUserId), examId, JSON.stringify({ from: exam.content_status, to: toStatus }));
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
  return { status: toStatus, examId };
}

module.exports = { transitionContentStatus, TRANSITIONS };
