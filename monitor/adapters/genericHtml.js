const cheerio = require('cheerio');
const { defaultFetchRaw } = require('./base');

const type = 'html';

async function fetchRaw(source, opts) {
  return defaultFetchRaw(source, opts);
}

async function extractText(buffer, source) {
  try {
    const $ = cheerio.load(buffer.toString('utf8'));
    let config = {};
    try {
      config = source.selector_config ? JSON.parse(source.selector_config) : {};
    } catch {
      config = {};
    }
    const scope = config.selector ? $(config.selector) : $('body');
    const text = scope.text().replace(/\s+/g, ' ').trim();
    if (!text) return { ok: false, error: 'empty_extraction' };
    return { ok: true, text };
  } catch (err) {
    return { ok: false, error: 'html_parse_error: ' + err.message };
  }
}

module.exports = { type, fetchRaw, extractText };
