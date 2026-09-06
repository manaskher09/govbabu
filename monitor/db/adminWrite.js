// The admin manual field-write path — mirrors exactly what
// scripts/import-existing-exams.js already does when writing field_history
// (is_current=1, approved_by=<admin id>, source_id=NULL, change_event_id=NULL),
// but transactional and audit-logged for live use rather than a one-shot
// batch job.

const ALLOWED_MANUAL_FIELDS = new Set([
  // identity/status fields
  'status', 'popularity', 'vacancies', 'notif_title', 'apply_start', 'apply_end', 'official_url', 'verified',
  // canonical date fields — application_start_date/application_end_date/exam_date are shared
  // with extract/fields.js's auto-detection vocabulary; admit_card_release_date and
  // result_date are new in this phase, manual-entry-only until regex patterns exist for them.
  'application_start_date', 'application_end_date', 'exam_date', 'admit_card_release_date', 'result_date',
  // Free-text display strings the site actually renders (see
  // sync/toApplicationsShape.js) — these have no admin-editable path
  // otherwise, since they're distinct from the machine-parsed fields above
  // (vacancies_display can be "~933" or a compound figure, not a bare
  // number; exam_date_text/admit_card_date_text are display strings
  // alongside the ISO fields; application_fee matches the field name
  // extract/fields.js's regex/AI detection now also uses).
  'vacancies_display', 'exam_date_text', 'admit_card_date_text', 'application_fee',
]);
// JSON-shaped fields (photo_json, details_json, etc.) are deliberately excluded — they're
// legacy shapes from the static-site import, not part of this structured workflow, and
// writing malformed JSON through a plain string input would silently break
// db/currentExam.js's parseMaybeJson.

const DATE_FIELDS = new Set(['application_start_date', 'application_end_date', 'exam_date', 'admit_card_release_date', 'result_date']);

function setCurrentField(db, examId, fieldName, value, adminUserId) {
  if (!ALLOWED_MANUAL_FIELDS.has(fieldName)) {
    throw Object.assign(new Error(`Field "${fieldName}" is not manually settable`), { code: 'field_not_allowed' });
  }
  db.exec('BEGIN IMMEDIATE');
  try {
    const prior = db
      .prepare(`SELECT value FROM field_history WHERE exam_id = ? AND field_name = ? AND is_current = 1`)
      .get(examId, fieldName);
    db.prepare(
      `UPDATE field_history SET is_current = 0 WHERE exam_id = ? AND field_name = ? AND is_current = 1`
    ).run(examId, fieldName);
    db.prepare(
      `INSERT INTO field_history (exam_id, field_name, value, source_id, change_event_id, approved_by, is_current)
       VALUES (?, ?, ?, NULL, NULL, ?, 1)`
    ).run(examId, fieldName, value, adminUserId);
    db.prepare(`UPDATE exams SET updated_at = datetime('now') WHERE id = ?`).run(examId);
    db.prepare(
      `INSERT INTO audit_logs (actor, action, entity_type, entity_id, details) VALUES (?, 'set_field', 'exam', ?, ?)`
    ).run(String(adminUserId), examId, JSON.stringify({ field: fieldName, old: prior ? prior.value : null, new: value }));
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
  return { field: fieldName, value };
}

module.exports = { setCurrentField, ALLOWED_MANUAL_FIELDS, DATE_FIELDS };
