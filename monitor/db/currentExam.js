// The "current exam data" layer (spec STEP 3): the ONLY read path the
// public API is allowed to use. It only ever reads field_history rows with
// is_current=1 — pending/rejected change_events and raw extracted_fields
// are invisible from here by construction, not by a filter someone could
// forget to apply.
const { listPostsForExam } = require('./posts');

const JSON_FIELDS = new Set(['photo_json', 'signature_json', 'details_json', 'hi_json', 'other_docs_json', 'results_json', 'tentative_next_json']);

function parseMaybeJson(fieldName, value) {
  if (value == null) return null;
  if (!JSON_FIELDS.has(fieldName)) return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function getCurrentFieldsRaw(db, examId) {
  return db
    .prepare(
      `SELECT field_name, value, effective_at, source_id FROM field_history
       WHERE exam_id = ? AND is_current = 1`
    )
    .all(examId);
}

/**
 * Assembles one exam's full current record: static identity columns from
 * `exams` plus every is_current=1 field_history row. Returns null if the
 * exam doesn't exist. This never exposes pending/rejected data.
 */
function getCurrentExam(db, examId) {
  // content_status='published' is the entire enforcement point for the
  // exam-level lifecycle: every public route in admin/server.js funnels
  // through this function (or listCurrentExams below), so a draft/
  // needs_review/verified-but-unpublished/archived exam is structurally
  // unreachable from here — same principle as is_current already applying
  // to field_history rows. Admin routes must NOT call this function; they
  // need every exam regardless of status (see admin/server.js's own
  // unfiltered query functions).
  // org_name is joined in here (not fetched separately by callers) so every
  // consumer of getCurrentExam gets it consistently — it's needed for the
  // publish pipeline's JSON-LD hiringOrganization field.
  const exam = db
    .prepare(
      `SELECT e.*, o.name AS org_name FROM exams e JOIN organizations o ON o.id = e.org_id
       WHERE e.id = ? AND e.content_status = 'published'`
    )
    .get(examId);
  if (!exam) return null;
  const fields = {};
  for (const row of getCurrentFieldsRaw(db, examId)) {
    fields[row.field_name] = parseMaybeJson(row.field_name, row.value);
  }
  // posts is always an array (empty for legacy/imported exams that predate
  // the posts table) — never undefined, so callers never need a null check.
  return { ...exam, fields, posts: listPostsForExam(db, examId) };
}

function listCurrentExams(db, { category, status } = {}) {
  let sql = `SELECT id FROM exams WHERE status = ? AND content_status = 'published'`;
  const params = ['active'];
  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }
  const ids = db.prepare(sql).all(...params).map((r) => r.id);
  let exams = ids.map((id) => getCurrentExam(db, id)).filter(Boolean);
  if (status) exams = exams.filter((e) => e.fields.status === status);
  return exams;
}

function getFieldHistory(db, examId, fieldName) {
  return db
    .prepare(
      `SELECT fh.value, fh.effective_at, fh.is_current, fh.source_id, s.label AS source_label,
              ce.evidence, ce.classification
       FROM field_history fh
       LEFT JOIN sources s ON s.id = fh.source_id
       LEFT JOIN change_events ce ON ce.id = fh.change_event_id
       WHERE fh.exam_id = ? AND fh.field_name = ?
       ORDER BY fh.effective_at DESC`
    )
    .all(examId, fieldName);
}

function getAllFieldHistory(db, examId) {
  return db
    .prepare(
      `SELECT fh.field_name, fh.value, fh.effective_at, fh.is_current
       FROM field_history fh WHERE fh.exam_id = ? ORDER BY fh.field_name, fh.effective_at DESC`
    )
    .all(examId);
}

module.exports = { getCurrentExam, listCurrentExams, getFieldHistory, getAllFieldHistory };
