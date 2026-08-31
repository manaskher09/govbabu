const { isAllowed, USER_AGENT } = require('./robots');

const MIN_INTERVAL_MS = Number(process.env.MONITOR_MIN_INTERVAL_MS || 3000);
const MAX_RESPONSE_BYTES = Number(process.env.MONITOR_MAX_RESPONSE_BYTES || 25 * 1024 * 1024); // 25MB
const lastRequestAtByHost = new Map();

// Government notification URLs are admin-configured, but treated as
// untrusted input anyway (spec STEP 16): only fetch http(s), and refuse
// anything that resolves to a private/loopback/link-local address so a
// misconfigured or compromised source row can't be used to probe internal
// infrastructure (basic SSRF defense-in-depth, not DNS-rebinding-proof).
const PRIVATE_HOST_RE = /^(localhost|127\.|0\.0\.0\.0|10\.|192\.168\.|169\.254\.|::1$|\[::1\]$)/i;
function isPrivateHostname(hostname) {
  if (PRIVATE_HOST_RE.test(hostname)) return true;
  const m = hostname.match(/^172\.(\d+)\./);
  return Boolean(m && Number(m[1]) >= 16 && Number(m[1]) <= 31);
}

function assertSafeUrl(url) {
  const u = new URL(url);
  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
    throw Object.assign(new Error('unsupported_protocol'), { code: 'unsupported_protocol' });
  }
  if (isPrivateHostname(u.hostname)) {
    throw Object.assign(new Error('refused_private_address'), { code: 'refused_private_address' });
  }
  return u;
}

async function throttle(host) {
  const last = lastRequestAtByHost.get(host) || 0;
  const wait = MIN_INTERVAL_MS - (Date.now() - last);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequestAtByHost.set(host, Date.now());
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function readBodyWithLimit(res, maxBytes) {
  if (!res.body) return Buffer.from(await res.arrayBuffer());
  const reader = res.body.getReader();
  const chunks = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > maxBytes) {
      await reader.cancel();
      throw Object.assign(new Error('response_too_large'), { code: 'response_too_large' });
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}

/**
 * Polite conditional fetch: respects robots.txt, rate-limits per host,
 * retries transient failures with backoff, caps response size, and
 * supports If-None-Match / If-Modified-Since so an unchanged source costs
 * one cheap round trip.
 *
 * @returns {{ok:boolean, status?:number, notModified?:boolean, buffer?:Buffer,
 *             headers?:object, responseTimeMs?:number, error?:string}}
 */
async function politeFetch(url, { etag, lastModified, timeoutMs = 20000, maxAttempts = 3 } = {}) {
  let parsed;
  try {
    parsed = assertSafeUrl(url);
  } catch (err) {
    return { ok: false, error: err.code || 'invalid_url' };
  }
  const host = parsed.host;

  if (!(await isAllowed(url))) {
    return { ok: false, error: 'disallowed_by_robots' };
  }

  const headers = { 'User-Agent': USER_AGENT };
  if (etag) headers['If-None-Match'] = etag;
  if (lastModified) headers['If-Modified-Since'] = lastModified;

  let attempt = 0;
  let lastError;
  while (attempt < maxAttempts) {
    attempt += 1;
    await throttle(host);
    const startedAt = Date.now();
    try {
      const res = await fetch(url, { headers, signal: AbortSignal.timeout(timeoutMs), redirect: 'follow' });
      const responseTimeMs = Date.now() - startedAt;

      if (res.status === 304) {
        return { ok: true, status: 304, notModified: true, responseTimeMs, headers: headersToObject(res.headers) };
      }
      if (res.status === 429 || (res.status >= 500 && res.status < 600)) {
        lastError = `http_${res.status}`;
        if (attempt < maxAttempts) {
          await sleep(backoffMs(attempt));
          continue;
        }
        return { ok: false, status: res.status, error: lastError, responseTimeMs };
      }
      if (!res.ok) {
        return { ok: false, status: res.status, error: `http_${res.status}`, responseTimeMs };
      }
      const contentLength = Number(res.headers.get('content-length') || 0);
      if (contentLength > MAX_RESPONSE_BYTES) {
        return { ok: false, error: 'response_too_large', responseTimeMs, status: res.status };
      }
      const buffer = await readBodyWithLimit(res, MAX_RESPONSE_BYTES);
      return { ok: true, status: res.status, buffer, headers: headersToObject(res.headers), responseTimeMs };
    } catch (err) {
      if (err.code === 'response_too_large') return { ok: false, error: 'response_too_large', responseTimeMs: Date.now() - startedAt };
      lastError = err.name === 'TimeoutError' || err.name === 'AbortError' ? 'timeout' : 'network_error';
      if (attempt < maxAttempts) {
        await sleep(backoffMs(attempt));
        continue;
      }
      return { ok: false, error: lastError, responseTimeMs: Date.now() - startedAt };
    }
  }
  return { ok: false, error: lastError || 'unknown_error' };
}

function backoffMs(attempt) {
  return Math.min(1000 * 2 ** attempt, 15000);
}

function headersToObject(h) {
  const o = {};
  h.forEach((v, k) => (o[k] = v));
  return o;
}

module.exports = { politeFetch, isPrivateHostname, assertSafeUrl, MAX_RESPONSE_BYTES };
