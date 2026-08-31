#!/usr/bin/env node
// Plain Node http, no framework — same convention as the main site's
// dev-server.js/api/*.js. Serves three things from one process:
//   /api/exams*        - public, read-only, approved-data-only
//   /api/admin/*        - session-authenticated
//   /  (static)         - the admin dashboard + login page
const http = require('http');
const fs = require('fs');
const path = require('path');
const { getDb } = require('../db/db');
const { approveChange, rejectChange } = require('../pipeline/applyApproval');
const { login, logout, getSessionUser, parseCookies, COOKIE_NAME, SESSION_TTL_MS } = require('../auth/sessions');
const { getCurrentExam, listCurrentExams, getAllFieldHistory } = require('../db/currentExam');
const { toApplicationsShape } = require('../sync/toApplicationsShape');

const PORT = process.env.MONITOR_ADMIN_PORT || 8745;
const PUBLIC_DIR = path.join(__dirname, 'public');
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' };
const MAX_BODY_BYTES = 1024 * 1024;

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY_BYTES) req.destroy(new Error('body_too_large'));
      data += c;
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

// Never leak internals (spec STEP 16 / STEP 5): the client gets a stable
// error code, the real error (with a stack) only ever goes to server logs.
function safeError(res, status, code, err) {
  if (err) console.error(`[api error] ${code}:`, err);
  json(res, status, { error: code });
}

function setSessionCookie(res, token) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}${secure}`
  );
}
function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`);
}

function requireAuth(db, req) {
  const cookies = parseCookies(req.headers.cookie);
  return getSessionUser(db, cookies[COOKIE_NAME]);
}

function healthStats(db) {
  const c = (sql, ...args) => db.prepare(sql).get(...args).n;
  return {
    total_sources: c('SELECT COUNT(*) n FROM sources'),
    active_sources: c('SELECT COUNT(*) n FROM sources WHERE active = 1'),
    checked_today: c(`SELECT COUNT(*) n FROM monitoring_results WHERE date(created_at) = date('now')`),
    failed_today: c(`SELECT COUNT(*) n FROM monitoring_results WHERE result IN ('error','unavailable') AND date(created_at) = date('now')`),
    unavailable_now: c(`SELECT COUNT(*) n FROM sources WHERE consecutive_failures >= 3`),
    changed_today: c(`SELECT COUNT(*) n FROM monitoring_results WHERE result = 'changed' AND date(created_at) = date('now')`),
    pending_reviews: c(`SELECT COUNT(*) n FROM change_events WHERE status = 'pending'`),
  };
}

function reviewQueue(db) {
  return db
    .prepare(
      `SELECT ce.id, ce.field_name, ce.old_value, ce.new_value, ce.confidence, ce.classification,
              ce.status, ce.evidence, ce.created_at, e.name AS exam_name, s.label AS source_label, s.url AS source_url
       FROM change_events ce JOIN exams e ON e.id = ce.exam_id JOIN sources s ON s.id = ce.source_id
       WHERE ce.status = 'pending' ORDER BY ce.created_at DESC`
    )
    .all();
}

function sourceHealth(db) {
  return db
    .prepare(
      `SELECT s.id, s.label, s.url, s.source_type, s.active, s.last_checked_at, s.last_success_at,
              s.last_http_status, s.last_response_time_ms, s.consecutive_failures, e.name AS exam_name
       FROM sources s JOIN exams e ON e.id = s.exam_id
       ORDER BY s.consecutive_failures DESC, s.last_checked_at DESC`
    )
    .all();
}

function jobsList(db) {
  return db
    .prepare(
      `SELECT j.id, j.source_id, s.label AS source_label, j.scheduled_at, j.started_at, j.finished_at, j.status, j.attempt_number
       FROM monitoring_jobs j JOIN sources s ON s.id = j.source_id
       ORDER BY j.id DESC LIMIT 200`
    )
    .all();
}

function auditLogList(db) {
  return db.prepare(`SELECT * FROM audit_logs ORDER BY id DESC LIMIT 200`).all();
}

const server = http.createServer(async (req, res) => {
  const db = getDb();
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  try {
    // ---------- Public API: approved/current data only ----------
    if (pathname === '/api/exams' && req.method === 'GET') {
      const exams = listCurrentExams(db, { category: url.searchParams.get('category') || undefined, status: url.searchParams.get('status') || undefined });
      return json(res, 200, { exams: exams.map(toApplicationsShape) });
    }
    const examMatch = pathname.match(/^\/api\/exams\/([^/]+)$/);
    if (examMatch && req.method === 'GET') {
      const exam = resolveExam(db, examMatch[1]);
      if (!exam) return safeError(res, 404, 'exam_not_found');
      return json(res, 200, toApplicationsShape(exam));
    }
    const notifMatch = pathname.match(/^\/api\/exams\/([^/]+)\/notifications$/);
    if (notifMatch && req.method === 'GET') {
      const exam = resolveExam(db, notifMatch[1]);
      if (!exam) return safeError(res, 404, 'exam_not_found');
      const rows = db.prepare(
        `SELECT dv.id, dv.extracted_at, dv.content_hash, s.label AS source_label, s.url AS source_url
         FROM document_versions dv JOIN documents d ON d.id = dv.document_id JOIN sources s ON s.id = d.source_id
         WHERE s.exam_id = ? ORDER BY dv.extracted_at DESC LIMIT 50`
      ).all(exam.id);
      return json(res, 200, { notifications: rows });
    }
    const historyMatch = pathname.match(/^\/api\/exams\/([^/]+)\/history$/);
    if (historyMatch && req.method === 'GET') {
      const exam = resolveExam(db, historyMatch[1]);
      if (!exam) return safeError(res, 404, 'exam_not_found');
      return json(res, 200, { history: getAllFieldHistory(db, exam.id) });
    }

    // ---------- Auth ----------
    if (pathname === '/api/admin/login' && req.method === 'POST') {
      const body = JSON.parse((await readBody(req)) || '{}');
      const result = login(db, String(body.username || ''), String(body.password || ''));
      if (!result) return safeError(res, 401, 'invalid_credentials');
      setSessionCookie(res, result.token);
      return json(res, 200, { user: result.user });
    }
    if (pathname === '/api/admin/logout' && req.method === 'POST') {
      const cookies = parseCookies(req.headers.cookie);
      logout(db, cookies[COOKIE_NAME]);
      clearSessionCookie(res);
      return json(res, 200, { status: 'logged_out' });
    }

    // ---------- Admin API: everything below requires a valid session ----------
    if (pathname.startsWith('/api/admin/')) {
      const user = requireAuth(db, req);
      if (!user) return safeError(res, 401, 'unauthorized');

      if (pathname === '/api/admin/dashboard' && req.method === 'GET') return json(res, 200, healthStats(db));
      if (pathname === '/api/admin/review-queue' && req.method === 'GET') return json(res, 200, reviewQueue(db));
      if (pathname === '/api/admin/sources' && req.method === 'GET') return json(res, 200, sourceHealth(db));
      if (pathname === '/api/admin/jobs' && req.method === 'GET') return json(res, 200, jobsList(db));
      if (pathname === '/api/admin/audit-log' && req.method === 'GET') return json(res, 200, auditLogList(db));
      if (pathname === '/api/admin/me' && req.method === 'GET') return json(res, 200, { user });

      const approveMatch = pathname.match(/^\/api\/admin\/change-events\/(\d+)\/approve$/);
      if (approveMatch && req.method === 'POST') {
        const body = JSON.parse((await readBody(req)) || '{}');
        try {
          return json(res, 200, approveChange(db, Number(approveMatch[1]), user.id, body.notes));
        } catch (err) {
          return safeError(res, 409, 'approve_failed', err);
        }
      }
      const rejectMatch = pathname.match(/^\/api\/admin\/change-events\/(\d+)\/reject$/);
      if (rejectMatch && req.method === 'POST') {
        const body = JSON.parse((await readBody(req)) || '{}');
        try {
          return json(res, 200, rejectChange(db, Number(rejectMatch[1]), user.id, body.notes));
        } catch (err) {
          return safeError(res, 409, 'reject_failed', err);
        }
      }
      return safeError(res, 404, 'not_found');
    }

    // ---------- Static admin UI ----------
    const safePath = pathname === '/' ? '/index.html' : pathname;
    const filePath = path.join(PUBLIC_DIR, path.normalize(safePath));
    if (!filePath.startsWith(PUBLIC_DIR)) return safeError(res, 403, 'forbidden');
    fs.readFile(filePath, (err, data) => {
      if (err) return safeError(res, 404, 'not_found');
      res.setHeader('Content-Type', MIME[path.extname(filePath)] || 'application/octet-stream');
      res.end(data);
    });
  } catch (err) {
    safeError(res, 400, 'bad_request', err);
  }
});

function resolveExam(db, idOrCode) {
  if (/^\d+$/.test(idOrCode)) return getCurrentExam(db, Number(idOrCode));
  const row = db.prepare('SELECT id FROM exams WHERE code = ? OR external_code = ?').get(idOrCode, idOrCode);
  return row ? getCurrentExam(db, row.id) : null;
}

if (require.main === module) {
  server.listen(PORT, () => console.log(`Monitor backend: http://localhost:${PORT}`));
}

module.exports = { server };
