// Deterministic, regex-based structured extraction. Deliberately NOT an AI
// call — Level 4 in the pipeline runs before Level 5 (AI assist), and most
// Indian recruitment notifications use a small, predictable vocabulary
// ("Last Date for Submission of Online Application", "Date of Examination",
// "Total Number of Vacancies") that a label→value regex handles reliably and
// cheaply. AI is reserved for genuinely ambiguous cases (see aiAssist.js).

const MONTHS = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
};
const MONTH_DATE_RE = /(\d{1,2})\s+([A-Za-z]{3,9})\.?\s+(\d{4})/;
const NUMERIC_DATE_RE = /(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/;
const NUMBER_RE = /([\d]{1,3}(?:,\d{2,3})*|\d{2,7})/;
const CURRENCY_RE = /(?:Rs\.?|INR|₹)\s?([\d]{1,3}(?:,\d{2,3})*|\d{2,7})/i;

function normalizeDate(raw) {
  let m = raw.match(MONTH_DATE_RE);
  if (m) {
    const month = MONTHS[m[2].slice(0, 3).toLowerCase()];
    if (month) return { iso: `${m[3]}-${month}-${String(m[1]).padStart(2, '0')}`, confidence: 0.95 };
  }
  m = raw.match(NUMERIC_DATE_RE);
  if (m) {
    let year = m[3].length === 2 ? `20${m[3]}` : m[3];
    return { iso: `${year}-${String(m[2]).padStart(2, '0')}-${String(m[1]).padStart(2, '0')}`, confidence: 0.75 };
  }
  return null;
}

const FIELD_RULES = {
  exam_date: {
    labels: [/date\s+of\s+(?:the\s+)?examination/i, /examination\s+date/i, /exam\s+date/i, /tentative\s+date\s+of\s+exam/i],
    type: 'date',
  },
  application_start_date: {
    labels: [/commencement\s+of\s+.{0,40}online\s+application/i, /starting\s+date\s+of\s+.{0,30}application/i, /application.{0,20}start(?:ing)?\s+date/i, /opening\s+date/i],
    type: 'date',
  },
  application_end_date: {
    labels: [/last\s+date\s+for\s+.{0,40}(?:submission|receipt|apply)/i, /closing\s+date\s+of\s+.{0,20}application/i, /application.{0,20}(?:last|end|closing)\s+date/i, /last\s+date\s+of\s+online\s+application/i],
    type: 'date',
  },
  vacancies: {
    labels: [/total\s+(?:number\s+of\s+)?vacanc(?:y|ies)/i, /no\.?\s+of\s+vacanc(?:y|ies)/i, /number\s+of\s+vacanc(?:y|ies)/i],
    type: 'number',
  },
  // Matches the `application_fee` field_history/display field the site
  // actually reads (sync/toApplicationsShape.js) — this used to be named
  // `fee` here, a different field_name that nothing displayed, so a
  // detected-and-approved fee change could never reach the live site.
  application_fee: {
    labels: [/application\s+fee/i, /examination\s+fee/i, /fee\s+for\s+general/i],
    type: 'currency',
  },
};

const WINDOW_CHARS = 100;

function extractField(text, fieldName) {
  const rule = FIELD_RULES[fieldName];
  if (!rule) return null;
  for (const labelRe of rule.labels) {
    const match = text.match(labelRe);
    if (!match) continue;
    const windowStart = match.index + match[0].length;
    const window = text.slice(windowStart, windowStart + WINDOW_CHARS);

    if (rule.type === 'date') {
      const found = window.match(MONTH_DATE_RE) || window.match(NUMERIC_DATE_RE);
      if (!found) continue;
      const norm = normalizeDate(found[0]);
      if (!norm) continue;
      return { value: norm.iso, confidence: norm.confidence, raw: found[0], matchedLabel: match[0] };
    }
    if (rule.type === 'number') {
      const found = window.match(NUMBER_RE);
      if (!found) continue;
      return { value: found[1].replace(/,/g, ''), confidence: 0.85, raw: found[0], matchedLabel: match[0] };
    }
    if (rule.type === 'currency') {
      const found = window.match(CURRENCY_RE);
      if (!found) continue;
      return { value: found[1].replace(/,/g, ''), confidence: 0.8, raw: found[0], matchedLabel: match[0] };
    }
  }
  return null;
}

function extractAllFields(text) {
  const out = {};
  for (const fieldName of Object.keys(FIELD_RULES)) {
    const result = extractField(text, fieldName);
    if (result) out[fieldName] = result;
  }
  return out;
}

module.exports = { extractField, extractAllFields, normalizeDate, FIELD_RULES };
