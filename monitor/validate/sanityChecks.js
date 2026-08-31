const DATE_FIELDS = new Set(['exam_date', 'application_start_date', 'application_end_date']);
const UNUSUAL_JUMP_DAYS = 60;
const DRAMATIC_CHANGE_SIMILARITY_THRESHOLD = 0.25;

function isValidIsoDate(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const d = new Date(iso + 'T00:00:00Z');
  return d.toISOString().slice(0, 10) === iso;
}

function daysBetween(isoA, isoB) {
  return Math.round((new Date(isoB) - new Date(isoA)) / 86400000);
}

/**
 * Runs every change through the founder's explicit rule list. Nothing here
 * ever mutates the database or auto-rejects — it only annotates each change
 * with issues + a classification so the review queue can prioritize and the
 * admin can see WHY something needs a closer look.
 *
 * @param {Array} changes            from diff/compare.js#diffFields
 * @param {object} resultingFields   { field_name: value } — current values with
 *                                    this batch's changes applied, for cross-field
 *                                    checks like start-before-end
 * @param {object} [opts]
 * @param {number} [opts.textSimilarity] 0..1, from diff/compare.js#textSimilarity
 * @param {Function} [opts.findConflictingSource] (field_name, new_value) -> other source's differing pending value | null
 */
function runSanityChecks(changes, resultingFields, opts = {}) {
  const { textSimilarity, findConflictingSource } = opts;
  const annotated = changes.map((change) => ({ ...change, issues: [] }));

  if (typeof textSimilarity === 'number' && textSimilarity < DRAMATIC_CHANGE_SIMILARITY_THRESHOLD) {
    for (const c of annotated) c.issues.push('dramatic_content_change');
  }

  for (const c of annotated) {
    if (DATE_FIELDS.has(c.field_name)) {
      if (!isValidIsoDate(c.new_value)) c.issues.push('invalid_date');
    }
    if (c.field_name === 'vacancies' && (!/^\d+$/.test(String(c.new_value)) || Number(c.new_value) <= 0)) {
      c.issues.push('non_numeric_vacancies');
    }
    if ((c.old_value !== null && c.old_value !== undefined && c.old_value !== '') &&
        (c.new_value === null || c.new_value === undefined || c.new_value === '')) {
      c.issues.push('null_overwrite_blocked');
    }
    if (c.conflict) c.issues.push('ai_regex_conflict');
    if (DATE_FIELDS.has(c.field_name) && c.old_value && isValidIsoDate(c.new_value) && isValidIsoDate(c.old_value)) {
      if (Math.abs(daysBetween(c.old_value, c.new_value)) > UNUSUAL_JUMP_DAYS) c.issues.push('unusual_date_jump');
    }
    if (findConflictingSource) {
      const conflict = findConflictingSource(c.field_name, c.new_value);
      if (conflict) c.issues.push(`cross_source_disagreement: another source reports "${conflict}"`);
    }
  }

  if (isValidIsoDate(resultingFields.application_start_date) && isValidIsoDate(resultingFields.application_end_date)) {
    if (resultingFields.application_start_date > resultingFields.application_end_date) {
      for (const c of annotated) {
        if (c.field_name === 'application_start_date' || c.field_name === 'application_end_date') {
          c.issues.push('application_start_after_end');
        }
      }
    }
  }
  if (isValidIsoDate(resultingFields.exam_date) && isValidIsoDate(resultingFields.application_end_date)) {
    if (resultingFields.exam_date < resultingFields.application_end_date) {
      for (const c of annotated) {
        if (c.field_name === 'exam_date' || c.field_name === 'application_end_date') {
          c.issues.push('exam_date_before_application_close');
        }
      }
    }
  }

  for (const c of annotated) {
    c.classification = classify(c);
  }
  return annotated;
}

function classify(change) {
  if (change.issues.length > 0) return 'NEEDS_HUMAN_REVIEW';
  if (change.confidence >= 0.85) return 'CONFIRMED_CHANGE';
  return 'POSSIBLE_CHANGE';
}

module.exports = { runSanityChecks, isValidIsoDate, daysBetween };
