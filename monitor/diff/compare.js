// Level 3 (text-level diff) + the field-level diff that feeds change_events.

/**
 * Cheap similarity measure (Jaccard over word sets) — no external diff lib.
 * Used by sanity checks to flag a document that changed far more than a
 * routine date/number edit would (e.g. an entirely different notification
 * was uploaded at the same URL).
 */
function textSimilarity(oldText, newText) {
  if (!oldText && !newText) return 1;
  if (!oldText || !newText) return 0;
  const a = new Set(oldText.toLowerCase().split(/\W+/).filter(Boolean));
  const b = new Set(newText.toLowerCase().split(/\W+/).filter(Boolean));
  let intersection = 0;
  for (const w of a) if (b.has(w)) intersection += 1;
  const union = a.size + b.size - intersection;
  return union === 0 ? 1 : intersection / union;
}

/**
 * @param {object} currentFields  { field_name: string|null } — last approved values
 * @param {object} extractedFields { field_name: {value, confidence, raw, matchedLabel} }
 * @param {Array}  aiChanges optional [{field, old_value, new_value, confidence, evidence}]
 * @returns {Array<{field_name, old_value, new_value, confidence, detection_method, evidence}>}
 */
function diffFields(currentFields, extractedFields, aiChanges = []) {
  const changes = [];
  const coveredByRegex = new Set();

  for (const [fieldName, extracted] of Object.entries(extractedFields)) {
    const oldValue = currentFields[fieldName] ?? null;
    if (String(oldValue ?? '') === String(extracted.value ?? '')) continue;
    coveredByRegex.add(fieldName);
    changes.push({
      field_name: fieldName,
      old_value: oldValue,
      new_value: extracted.value,
      confidence: extracted.confidence,
      detection_method: 'regex',
      evidence: extracted.matchedLabel ? `"${extracted.matchedLabel}" → "${extracted.raw}"` : extracted.raw || '',
    });
  }

  for (const ai of aiChanges) {
    const oldValue = currentFields[ai.field] ?? null;
    if (coveredByRegex.has(ai.field)) {
      const regexChange = changes.find((c) => c.field_name === ai.field);
      if (regexChange && String(regexChange.new_value) !== String(ai.new_value)) {
        regexChange.conflict = true;
        regexChange.evidence += ` | AI disagreed: "${ai.new_value}"`;
      }
      continue;
    }
    if (String(oldValue ?? '') === String(ai.new_value ?? '')) continue;
    changes.push({
      field_name: ai.field,
      old_value: ai.old_value ?? oldValue,
      new_value: ai.new_value,
      confidence: ai.confidence ?? 0.6,
      detection_method: 'ai',
      evidence: ai.evidence || '',
    });
  }

  return changes;
}

module.exports = { textSimilarity, diffFields };
