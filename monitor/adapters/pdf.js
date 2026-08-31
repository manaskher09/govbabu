const { defaultFetchRaw } = require('./base');

const type = 'pdf';

async function fetchRaw(source, opts) {
  return defaultFetchRaw(source, opts);
}

/**
 * `pdfParser` is injectable (defaults to the real pdf-parse) so tests can
 * simulate a corrupted/unreadable PDF, or a PDF whose text differs from a
 * prior version, without shipping real binary fixtures.
 */
async function extractText(buffer, source, { pdfParser } = {}) {
  const parse = pdfParser || require('pdf-parse');
  try {
    const result = await parse(buffer);
    const text = (result.text || '').replace(/\s+/g, ' ').trim();
    if (!text) return { ok: false, error: 'empty_pdf_text' };
    return { ok: true, text, numPages: result.numpages };
  } catch (err) {
    return { ok: false, error: 'pdf_parse_error: ' + err.message };
  }
}

module.exports = { type, fetchRaw, extractText };
