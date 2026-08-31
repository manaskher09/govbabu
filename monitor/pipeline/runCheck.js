const { getAdapter } = require('../adapters');
const { extractAllFields } = require('../extract/fields');
const { aiAssistExtract } = require('../extract/aiAssist');
const { textSimilarity, diffFields } = require('../diff/compare');
const { runSanityChecks } = require('../validate/sanityChecks');
const notifications = require('../notifications/NotificationService');

const MAX_STORED_TEXT_CHARS = 200000;

function getCurrentFields(db, examId) {
  const rows = db
    .prepare('SELECT field_name, value FROM field_history WHERE exam_id = ? AND is_current = 1')
    .all(examId);
  const out = {};
  for (const r of rows) out[r.field_name] = r.value;
  return out;
}

function getCurrentDocumentText(db, sourceId) {
  const row = db
    .prepare(
      `SELECT dv.raw_text FROM document_versions dv
       JOIN documents d ON d.id = dv.document_id
       WHERE d.source_id = ? AND dv.is_current = 1
       ORDER BY dv.id DESC LIMIT 1`
    )
    .get(sourceId);
  return row ? row.raw_text : null;
}

function findConflictingSourceFactory(db, examId, sourceId) {
  return (fieldName, newValue) => {
    const row = db
      .prepare(
        `SELECT new_value FROM change_events
         WHERE exam_id = ? AND field_name = ? AND source_id != ? AND status = 'pending'
         AND new_value != ? LIMIT 1`
      )
      .get(examId, fieldName, sourceId, String(newValue));
    return row ? row.new_value : null;
  };
}

function nextCheckAt(frequencyMinutes) {
  return new Date(Date.now() + frequencyMinutes * 60000).toISOString();
}

function logAudit(db, actor, action, entityType, entityId, details) {
  db.prepare(
    `INSERT INTO audit_logs (actor, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)`
  ).run(actor, action, entityType, entityId, details ? JSON.stringify(details) : null);
}

/**
 * Runs the full pipeline for one source. Returns a summary object; never
 * throws for expected failure modes (network/parse errors are captured and
 * classified, not propagated) so a scheduler can run many sources in a loop
 * without one bad source killing the batch.
 *
 * @param {object} deps injectable for tests: { fetcher, pdfParser, aiAssist }
 */
async function runCheck(db, sourceId, deps = {}) {
  const aiAssist = deps.aiAssist || aiAssistExtract;
  const notify = deps.notifications || notifications;
  const source = db.prepare('SELECT * FROM sources WHERE id = ?').get(sourceId);
  if (!source) throw new Error(`Unknown source id ${sourceId}`);
  const exam = db.prepare('SELECT * FROM exams WHERE id = ?').get(source.exam_id);

  const job = db
    .prepare(`INSERT INTO monitoring_jobs (source_id, started_at, status) VALUES (?, datetime('now'), 'running')`)
    .run(sourceId);
  const jobId = job.lastInsertRowid;

  const adapter = getAdapter(source.source_type);
  const raw = await adapter.fetchRaw(source, { fetcher: deps.fetcher });

  const finishJob = (status) =>
    db.prepare(`UPDATE monitoring_jobs SET finished_at = datetime('now'), status = ? WHERE id = ?`).run(status, jobId);

  if (!raw.ok) {
    db.prepare(
      `INSERT INTO monitoring_results (job_id, source_id, result, http_status, response_time_ms, error_message)
       VALUES (?, ?, 'unavailable', ?, ?, ?)`
    ).run(jobId, sourceId, raw.status || null, raw.responseTimeMs || null, raw.error);
    db.prepare(`INSERT INTO errors (source_id, job_id, error_type, message) VALUES (?, ?, 'fetch_failed', ?)`).run(
      sourceId, jobId, raw.error
    );
    db.prepare(
      `UPDATE sources SET last_checked_at = datetime('now'), last_http_status = ?, consecutive_failures = consecutive_failures + 1, updated_at = datetime('now') WHERE id = ?`
    ).run(raw.status || null, sourceId);
    finishJob('failed');
    return { result: 'unavailable', classification: 'SOURCE_UNAVAILABLE', error: raw.error };
  }

  if (raw.notModified || raw.contentHash === source.last_hash) {
    db.prepare(
      `INSERT INTO monitoring_results (job_id, source_id, result, http_status, response_time_ms, content_hash)
       VALUES (?, ?, 'no_change', ?, ?, ?)`
    ).run(jobId, sourceId, raw.status || null, raw.responseTimeMs || null, raw.contentHash || source.last_hash);
    db.prepare(
      `UPDATE sources SET last_checked_at = datetime('now'), last_success_at = datetime('now'),
         last_http_status = ?, last_response_time_ms = ?, consecutive_failures = 0,
         next_check_at = ?, updated_at = datetime('now') WHERE id = ?`
    ).run(raw.status || null, raw.responseTimeMs || null, nextCheckAt(source.monitoring_frequency_minutes), sourceId);
    finishJob('success');
    return { result: 'no_change' };
  }

  // Content hash changed (or this is the first-ever check) -> Level 2+.
  const extracted = await adapter.extractText(raw.buffer, source, { pdfParser: deps.pdfParser });

  if (extracted.requiresManualReview) {
    const documentId = insertDocument(db, sourceId, source.url, adapter.type, raw.status, raw.responseTimeMs);
    insertDocumentVersion(db, documentId, sourceId, raw.contentHash, '(manual review required — not auto-extracted)');
    const manualReviewChange = {
      field_name: '__manual_review__', old_value: source.last_hash, new_value: raw.contentHash,
      classification: 'NEEDS_HUMAN_REVIEW', confidence: 1, evidence: source.url,
    };
    const { id: changeEventId, isNew: manualReviewIsNew } = insertChangeEvent(db, {
      examId: exam.id, sourceId, documentVersionId: null,
      fieldName: manualReviewChange.field_name, oldValue: manualReviewChange.old_value, newValue: manualReviewChange.new_value,
      detectionMethod: 'hash_only', confidence: 1.0,
      classification: manualReviewChange.classification,
      evidence: `Content changed at a ${source.source_type} source that requires manual review.`,
    });
    if (manualReviewIsNew) await notify.notifyDetectedChange(exam, manualReviewChange);
    db.prepare(
      `INSERT INTO monitoring_results (job_id, source_id, result, http_status, response_time_ms, content_hash)
       VALUES (?, ?, 'changed', ?, ?, ?)`
    ).run(jobId, sourceId, raw.status || null, raw.responseTimeMs || null, raw.contentHash);
    db.prepare(
      `UPDATE sources SET last_checked_at = datetime('now'), last_success_at = datetime('now'), last_hash = ?,
         last_http_status = ?, last_response_time_ms = ?, consecutive_failures = 0,
         next_check_at = ?, updated_at = datetime('now') WHERE id = ?`
    ).run(raw.contentHash, raw.status || null, raw.responseTimeMs || null, nextCheckAt(source.monitoring_frequency_minutes), sourceId);
    logAudit(db, 'system', 'manual_review_flagged', 'source', sourceId, { changeEventId });
    finishJob('success');
    return { result: 'changed', classification: 'NEEDS_HUMAN_REVIEW', changeEventIds: [changeEventId] };
  }

  if (!extracted.ok) {
    db.prepare(
      `INSERT INTO monitoring_results (job_id, source_id, result, http_status, response_time_ms, content_hash, error_message)
       VALUES (?, ?, 'error', ?, ?, ?, ?)`
    ).run(jobId, sourceId, raw.status || null, raw.responseTimeMs || null, raw.contentHash, extracted.error);
    db.prepare(`INSERT INTO errors (source_id, job_id, error_type, message) VALUES (?, ?, 'parse_failed', ?)`).run(
      sourceId, jobId, extracted.error
    );
    // Deliberately do NOT update source.last_hash: a parse failure must not
    // be mistaken for "no change" on the next run, and must never touch
    // field_history (never silently lose previously verified information).
    db.prepare(
      `UPDATE sources SET last_checked_at = datetime('now'), last_http_status = ?, last_response_time_ms = ?,
         consecutive_failures = consecutive_failures + 1, updated_at = datetime('now') WHERE id = ?`
    ).run(raw.status || null, raw.responseTimeMs || null, sourceId);
    finishJob('failed');
    return { result: 'error', classification: 'PARSING_ERROR', error: extracted.error };
  }

  const previousText = getCurrentDocumentText(db, sourceId);
  const currentFields = getCurrentFields(db, exam.id);
  const regexFields = extractAllFields(extracted.text);
  const aiResult = await aiAssist(previousText || '', extracted.text);
  const aiChanges = aiResult && aiResult.changes_detected ? aiResult.changes : [];

  const rawChanges = diffFields(currentFields, regexFields, aiChanges);
  const resultingFields = { ...currentFields };
  for (const c of rawChanges) resultingFields[c.field_name] = c.new_value;

  const similarity = previousText != null ? textSimilarity(previousText, extracted.text) : 1;
  const annotated = runSanityChecks(rawChanges, resultingFields, {
    textSimilarity: similarity,
    findConflictingSource: findConflictingSourceFactory(db, exam.id, sourceId),
  });

  const documentId = insertDocument(db, sourceId, source.url, adapter.type, raw.status, raw.responseTimeMs);
  const documentVersionId = insertDocumentVersion(db, documentId, sourceId, raw.contentHash, extracted.text.slice(0, MAX_STORED_TEXT_CHARS));
  for (const [fieldName, f] of Object.entries(regexFields)) {
    db.prepare(
      `INSERT INTO extracted_fields (document_version_id, field_name, field_value, confidence, extraction_method)
       VALUES (?, ?, ?, ?, 'regex')`
    ).run(documentVersionId, fieldName, f.value, f.confidence);
  }
  for (const ai of aiChanges) {
    db.prepare(
      `INSERT INTO extracted_fields (document_version_id, field_name, field_value, confidence, extraction_method)
       VALUES (?, ?, ?, ?, 'ai')`
    ).run(documentVersionId, ai.field, ai.new_value, ai.confidence ?? 0.6);
  }

  const changeEventIds = [];
  if (annotated.length === 0) {
    const unstructured = {
      field_name: '__unstructured_change__', old_value: null, new_value: null,
      detection_method: 'hash_only', confidence: 0.5,
      classification: 'POSSIBLE_CHANGE', issues: [],
      evidence: `Content hash changed (similarity ${similarity.toFixed(2)}) but no tracked field differed — worth a manual look.`,
    };
    const { id } = insertChangeEvent(db, {
      examId: exam.id, sourceId, documentVersionId,
      fieldName: unstructured.field_name, oldValue: unstructured.old_value, newValue: unstructured.new_value,
      detectionMethod: unstructured.detection_method, confidence: unstructured.confidence,
      classification: unstructured.classification, evidence: unstructured.evidence,
    });
    changeEventIds.push(id);
    annotated.push(unstructured);
  } else {
    for (const c of annotated) {
      const evidence = c.evidence + (c.issues?.length ? ` [${c.issues.join(', ')}]` : '');
      const { id, isNew } = insertChangeEvent(db, {
        examId: exam.id, sourceId, documentVersionId,
        fieldName: c.field_name, oldValue: c.old_value, newValue: c.new_value,
        detectionMethod: c.detection_method, confidence: c.confidence,
        classification: c.classification, evidence,
      });
      changeEventIds.push(id);
      if (isNew) await notify.notifyDetectedChange(exam, { ...c, evidence });
    }
  }

  db.prepare(
    `INSERT INTO monitoring_results (job_id, source_id, result, http_status, response_time_ms, content_hash)
     VALUES (?, ?, 'changed', ?, ?, ?)`
  ).run(jobId, sourceId, raw.status || null, raw.responseTimeMs || null, raw.contentHash);
  db.prepare(
    `UPDATE sources SET last_checked_at = datetime('now'), last_success_at = datetime('now'), last_hash = ?,
       last_http_status = ?, last_response_time_ms = ?, consecutive_failures = 0,
       next_check_at = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(raw.contentHash, raw.status || null, raw.responseTimeMs || null, nextCheckAt(source.monitoring_frequency_minutes), sourceId);
  logAudit(db, 'system', 'changes_detected', 'source', sourceId, { changeEventIds });
  finishJob('success');

  return { result: 'changed', changeEventIds, changes: annotated };
}

function insertDocument(db, sourceId, url, contentType, httpStatus, responseTimeMs) {
  return db
    .prepare(
      `INSERT INTO documents (source_id, url, content_type, http_status, response_time_ms) VALUES (?, ?, ?, ?, ?)`
    )
    .run(sourceId, url, contentType, httpStatus || null, responseTimeMs || null).lastInsertRowid;
}

function insertDocumentVersion(db, documentId, sourceId, contentHash, rawText) {
  db.prepare(
    `UPDATE document_versions SET is_current = 0
     WHERE document_id IN (SELECT id FROM documents WHERE source_id = ?)`
  ).run(sourceId);
  const maxVersion = db
    .prepare(
      `SELECT COALESCE(MAX(version_number), 0) v FROM document_versions dv
       JOIN documents d ON d.id = dv.document_id WHERE d.source_id = ?`
    )
    .get(sourceId).v;
  return db
    .prepare(
      `INSERT INTO document_versions (document_id, version_number, content_hash, raw_text, is_current)
       VALUES (?, ?, ?, ?, 1)`
    )
    .run(documentId, maxVersion + 1, contentHash, rawText).lastInsertRowid;
}

/**
 * Idempotency guard (see spec STEP 12): if the exact same field+candidate
 * value is already sitting pending for this exam/source, checking the same
 * unchanged-in-substance document again must not create a second queue item
 * or fire a second alert. Returns { id, isNew }.
 */
function insertChangeEvent(db, c) {
  const oldValue = c.oldValue != null ? String(c.oldValue) : null;
  const newValue = c.newValue != null ? String(c.newValue) : null;
  const existing = db
    .prepare(
      `SELECT id FROM change_events
       WHERE exam_id = ? AND source_id = ? AND field_name = ? AND status = 'pending'
         AND IFNULL(new_value,'') = IFNULL(?,'')`
    )
    .get(c.examId, c.sourceId, c.fieldName, newValue);
  if (existing) return { id: existing.id, isNew: false };

  const id = db
    .prepare(
      `INSERT INTO change_events
         (exam_id, source_id, document_version_id, field_name, old_value, new_value,
          detection_method, confidence, classification, evidence, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`
    )
    .run(
      c.examId, c.sourceId, c.documentVersionId || null, c.fieldName, oldValue, newValue,
      c.detectionMethod, c.confidence, c.classification, c.evidence
    ).lastInsertRowid;
  return { id, isNew: true };
}

module.exports = { runCheck };
