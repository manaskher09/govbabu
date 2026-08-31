// Covers pdf_scanned_ocr and js_rendered source types. We still fetch and
// hash the raw bytes cheaply (so we can tell a human "this changed"), but we
// deliberately never attempt to auto-extract fields from a scanned PDF or a
// JS-rendered page in the MVP — real OCR and headless-browser rendering are
// their own substantial subsystems, and a wrong auto-extraction here is
// worse than no extraction (see the founder's own "MANUAL REVIEW REQUIRED"
// requirement). Swap this file's extractText for a real OCR/rendering
// implementation later without touching the pipeline.
const { defaultFetchRaw } = require('./base');

const type = 'manual';

async function fetchRaw(source, opts) {
  return defaultFetchRaw(source, opts);
}

async function extractText() {
  return { ok: false, error: 'manual_review_required', requiresManualReview: true };
}

module.exports = { type, fetchRaw, extractText };
