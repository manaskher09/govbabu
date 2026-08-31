// Level 5 — AI validation, used ONLY to interpret genuinely ambiguous diffs
// (e.g. free-text corrigendum prose that doesn't match the regex label
// vocabulary in fields.js). It never runs unless ANTHROPIC_API_KEY is set,
// and its output is treated exactly like a regex extraction — one more
// candidate change for a human to approve, never a write straight to the
// database. No SDK dependency: a single fetch call keeps this piece
// optional and removable without touching package.json.
const MODEL = process.env.MONITOR_AI_MODEL || 'claude-sonnet-5';

function isConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/**
 * @param {string} oldText previous document version's text (may be empty for a new source)
 * @param {string} newText current document version's text
 * @returns {Promise<null|{changes_detected:boolean, changes:Array}>} null when not configured or on any failure
 */
async function aiAssistExtract(oldText, newText) {
  if (!isConfigured()) return null;
  const prompt = [
    'Compare OLD and NEW text from an Indian government recruitment notification.',
    'Return ONLY JSON matching this schema, nothing else:',
    '{"changes_detected": boolean, "changes": [{"field": string, "old_value": string, "new_value": string, "confidence": number, "evidence": string}]}',
    'Only include fields you are confident actually changed in meaning (not formatting). Known field names to prefer: exam_date, application_start_date, application_end_date, vacancies, fee, eligibility, age_limit.',
    '--- OLD ---', oldText.slice(0, 6000),
    '--- NEW ---', newText.slice(0, 6000),
  ].join('\n');

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.content?.[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    if (typeof parsed.changes_detected !== 'boolean' || !Array.isArray(parsed.changes)) return null;
    return parsed;
  } catch {
    return null; // AI is an optional enhancement — never let it break the pipeline
  }
}

module.exports = { aiAssistExtract, isConfigured };
