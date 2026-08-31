const { politeFetch } = require('../lib/httpClient');
const { sha256 } = require('../lib/hash');

/**
 * Adapter contract (see adapters/index.js for the registry):
 *   fetchRaw(source, {fetcher}) -> Level 1: cheap fetch + hash, no parsing.
 *     { ok, notModified, status, buffer, headers, contentHash, responseTimeMs, error }
 *   extractText(buffer, source) -> Level 2: turn bytes into text (async).
 *     { ok, text, error }
 * Every adapter shares fetchRaw via defaultFetchRaw; only extractText differs
 * per content type. `fetcher` is injectable so tests never hit the network.
 */
async function defaultFetchRaw(source, { fetcher = politeFetch } = {}) {
  const result = await fetcher(source.url, {
    etag: source.last_etag || undefined,
    lastModified: source.last_modified_header || undefined,
  });
  if (!result.ok) return { ok: false, error: result.error, status: result.status, responseTimeMs: result.responseTimeMs };
  if (result.notModified) return { ok: true, notModified: true, status: 304, responseTimeMs: result.responseTimeMs, headers: result.headers };
  const contentHash = sha256(result.buffer);
  return {
    ok: true,
    notModified: false,
    status: result.status,
    buffer: result.buffer,
    headers: result.headers,
    contentHash,
    responseTimeMs: result.responseTimeMs,
  };
}

module.exports = { defaultFetchRaw };
