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
const {
  login,
  logout,
  getSessionUser,
  parseCookies,
  tokenHash,
  setPassword,
  revokeOtherSessions,
  revokeAllSessions,
  listSessions,
  COOKIE_NAME,
  SESSION_TTL_MS,
} = require('../auth/sessions');
const { verifyPassword } = require('../auth/passwords');
const { getCurrentExam, listCurrentExams, getAllFieldHistory } = require('../db/currentExam');
const { toApplicationsShape } = require('../sync/toApplicationsShape');
const { transitionContentStatus } = require('../pipeline/contentStatus');
const { setCurrentField, ALLOWED_MANUAL_FIELDS, DATE_FIELDS } = require('../db/adminWrite');
const { listPostsForExam: postsListForExam } = require('../db/posts');
const { runCheck } = require('../pipeline/runCheck');

const PORT = process.env.MONITOR_ADMIN_PORT || 8745;
const PUBLIC_DIR = path.join(__dirname, 'public');
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' };
const MAX_BODY_BYTES = 1024 * 1024;
// Mirrors the sources.role and sources.source_type CHECK constraints in
// db/migrations/001_init.sql — kept here too so a bad value 400s before it
// ever reaches SQLite.
const VALID_SOURCE_ROLES = new Set(['website', 'notification', 'result', 'admit_card', 'corrigendum', 'other']);
const VALID_SOURCE_TYPES = new Set(['html', 'pdf', 'pdf_scanned_ocr', 'js_rendered', 'manual']);

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

// 8+ chars, at least one letter and one digit — matches bin/create-admin.js's
// baseline plus a real strength floor rather than length alone.
function isStrongPassword(pw) {
  return pw.length >= 8 && /[a-zA-Z]/.test(pw) && /[0-9]/.test(pw);
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

// ---------- Phase 1 exam-data-foundation query helpers ----------
// These deliberately do NOT go through db/currentExam.js — that module's
// own header comment says it's "the ONLY read path the public API is
// allowed to use," and admin needs every exam regardless of content_status.

function organizationsList(db) {
  return db.prepare('SELECT * FROM organizations ORDER BY name').all();
}

function examListForAdmin(db, { content_status, org_id, category, search } = {}) {
  let sql = `SELECT e.*, o.name AS org_name FROM exams e JOIN organizations o ON o.id = e.org_id WHERE 1=1`;
  const params = [];
  if (content_status) {
    sql += ' AND e.content_status = ?';
    params.push(content_status);
  }
  if (org_id) {
    sql += ' AND e.org_id = ?';
    params.push(Number(org_id));
  }
  if (category) {
    sql += ' AND e.category = ?';
    params.push(category);
  }
  if (search) {
    sql += ' AND (e.name LIKE ? OR e.code LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  sql += ' ORDER BY e.category, e.updated_at DESC';
  return db.prepare(sql).all(...params);
}

// Distinct categories actually in use — drives the admin Exams filter
// dropdown, so it never drifts from real data (no hardcoded category list).
function examCategoriesList(db) {
  return db
    .prepare(`SELECT DISTINCT category FROM exams WHERE category IS NOT NULL AND category != '' ORDER BY category`)
    .all()
    .map((r) => r.category);
}

function documentsListForExam(db, examId) {
  return db
    .prepare(
      `SELECT d.*, s.label, s.url AS source_url, s.role
       FROM documents d JOIN sources s ON s.id = d.source_id
       WHERE s.exam_id = ? ORDER BY d.fetched_at DESC`
    )
    .all(examId);
}

function examDetailForAdmin(db, examId) {
  const exam = db.prepare('SELECT * FROM exams WHERE id = ?').get(examId);
  if (!exam) return null;
  const currentRows = db.prepare(`SELECT field_name, value FROM field_history WHERE exam_id = ? AND is_current = 1`).all(examId);
  const fields = {};
  for (const row of currentRows) fields[row.field_name] = row.value;
  const statusHistory = db
    .prepare(`SELECT * FROM audit_logs WHERE entity_type = 'exam' AND entity_id = ? AND action = 'set_content_status' ORDER BY id DESC`)
    .all(examId);
  return { exam, fields, posts: postsListForExam(db, examId), documents: documentsListForExam(db, examId), statusHistory };
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

      if (pathname === '/api/admin/sessions' && req.method === 'GET') {
        const curToken = tokenHash(parseCookies(req.headers.cookie)[COOKIE_NAME] || '');
        return json(res, 200, { sessions: listSessions(db, user.id, curToken) });
      }

      if (pathname === '/api/admin/change-password' && req.method === 'POST') {
        const body = JSON.parse((await readBody(req)) || '{}');
        const currentPassword = String(body.currentPassword || '');
        const newPassword = String(body.newPassword || '');
        const fullUser = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(user.id);
        if (!verifyPassword(currentPassword, fullUser.password_hash)) {
          // 403, not 401: a 401 here would trip the frontend's generic
          // "session expired -> redirect to /login.html" handling, which is
          // wrong for "you're authenticated but typed the wrong password."
          return safeError(res, 403, 'invalid_current_password');
        }
        if (!isStrongPassword(newPassword)) {
          return safeError(res, 400, 'password_too_weak');
        }
        if (verifyPassword(newPassword, fullUser.password_hash)) {
          return safeError(res, 400, 'password_reused');
        }
        setPassword(db, fullUser.username, newPassword);
        const curToken = tokenHash(parseCookies(req.headers.cookie)[COOKIE_NAME] || '');
        const revoked = revokeOtherSessions(db, user.id, curToken);
        db.prepare(
          `INSERT INTO audit_logs (actor, action, entity_type, entity_id, details) VALUES (?, 'change_password', 'admin_user', ?, ?)`
        ).run(String(user.id), user.id, JSON.stringify({ other_sessions_revoked: revoked }));
        return json(res, 200, { status: 'password_changed', other_sessions_revoked: revoked });
      }

      if (pathname === '/api/admin/logout-all' && req.method === 'POST') {
        const revoked = revokeAllSessions(db, user.id);
        db.prepare(
          `INSERT INTO audit_logs (actor, action, entity_type, entity_id, details) VALUES (?, 'logout_all_sessions', 'admin_user', ?, ?)`
        ).run(String(user.id), user.id, JSON.stringify({ sessions_revoked: revoked }));
        clearSessionCookie(res);
        return json(res, 200, { status: 'logged_out_everywhere', sessions_revoked: revoked });
      }

      // ---------- Organizations ----------
      if (pathname === '/api/admin/organizations' && req.method === 'GET') {
        return json(res, 200, { organizations: organizationsList(db) });
      }
      if (pathname === '/api/admin/organizations' && req.method === 'POST') {
        const body = JSON.parse((await readBody(req)) || '{}');
        const name = String(body.name || '').trim();
        const short_code = String(body.short_code || '').trim().toUpperCase();
        if (!name || !short_code) return safeError(res, 400, 'name_and_short_code_required');
        try {
          const info = db
            .prepare(`INSERT INTO organizations (name, short_code, website_url, notes) VALUES (?, ?, ?, ?)`)
            .run(name, short_code, body.website_url || null, body.notes || null);
          db.prepare(
            `INSERT INTO audit_logs (actor, action, entity_type, entity_id, details) VALUES (?, 'create_organization', 'organization', ?, ?)`
          ).run(String(user.id), info.lastInsertRowid, JSON.stringify({ name, short_code }));
          return json(res, 201, { id: info.lastInsertRowid, name, short_code });
        } catch (err) {
          if (String(err.message).includes('UNIQUE')) return safeError(res, 409, 'org_code_taken');
          return safeError(res, 400, 'create_organization_failed', err);
        }
      }

      // ---------- Exams (admin: unfiltered by content_status) ----------
      if (pathname === '/api/admin/exams' && req.method === 'GET') {
        return json(res, 200, {
          exams: examListForAdmin(db, {
            content_status: url.searchParams.get('content_status') || undefined,
            org_id: url.searchParams.get('org_id') || undefined,
            category: url.searchParams.get('category') || undefined,
            search: url.searchParams.get('search') || undefined,
          }),
        });
      }
      if (pathname === '/api/admin/exam-categories' && req.method === 'GET') {
        return json(res, 200, { categories: examCategoriesList(db) });
      }
      if (pathname === '/api/admin/exams' && req.method === 'POST') {
        const body = JSON.parse((await readBody(req)) || '{}');
        const org_id = Number(body.org_id);
        const code = String(body.code || '').trim().toUpperCase();
        const name = String(body.name || '').trim();
        if (!org_id || !code || !name) return safeError(res, 400, 'org_id_code_name_required');
        try {
          // content_status is always explicit 'draft' here — never rely on
          // the column's DEFAULT 'published' (that default exists only for
          // backward-compat with pre-existing/imported rows, see the
          // migration comment in db/migrations/003_content_lifecycle.sql).
          const info = db
            .prepare(
              `INSERT INTO exams (org_id, code, external_code, name, category, content_status) VALUES (?, ?, ?, ?, ?, 'draft')`
            )
            .run(org_id, code, body.external_code || null, name, body.category || null);
          db.prepare(
            `INSERT INTO audit_logs (actor, action, entity_type, entity_id, details) VALUES (?, 'create_exam', 'exam', ?, ?)`
          ).run(String(user.id), info.lastInsertRowid, JSON.stringify({ code, name }));
          return json(res, 201, { id: info.lastInsertRowid, code, name, content_status: 'draft' });
        } catch (err) {
          if (String(err.message).includes('UNIQUE')) return safeError(res, 409, 'exam_code_taken');
          return safeError(res, 400, 'create_exam_failed', err);
        }
      }

      const adminExamIdMatch = pathname.match(/^\/api\/admin\/exams\/(\d+)$/);
      if (adminExamIdMatch && req.method === 'GET') {
        const detail = examDetailForAdmin(db, Number(adminExamIdMatch[1]));
        if (!detail) return safeError(res, 404, 'exam_not_found');
        return json(res, 200, detail);
      }
      if (adminExamIdMatch && req.method === 'PATCH') {
        const examId = Number(adminExamIdMatch[1]);
        const body = JSON.parse((await readBody(req)) || '{}');
        const sets = [];
        const params = [];
        for (const key of ['name', 'category', 'external_code', 'status']) {
          if (body[key] !== undefined) {
            sets.push(`${key} = ?`);
            params.push(body[key]);
          }
        }
        if (!sets.length) return safeError(res, 400, 'no_fields_to_update');
        params.push(examId);
        const info = db.prepare(`UPDATE exams SET ${sets.join(', ')}, updated_at = datetime('now') WHERE id = ?`).run(...params);
        if (info.changes === 0) return safeError(res, 404, 'exam_not_found');
        db.prepare(
          `INSERT INTO audit_logs (actor, action, entity_type, entity_id, details) VALUES (?, 'update_exam', 'exam', ?, ?)`
        ).run(String(user.id), examId, JSON.stringify(body));
        return json(res, 200, { id: examId, updated: true });
      }

      const examStatusMatch = pathname.match(/^\/api\/admin\/exams\/(\d+)\/status$/);
      if (examStatusMatch && req.method === 'POST') {
        const body = JSON.parse((await readBody(req)) || '{}');
        try {
          return json(res, 200, transitionContentStatus(db, Number(examStatusMatch[1]), String(body.to || ''), user.id));
        } catch (err) {
          return safeError(res, 409, 'invalid_transition', err);
        }
      }

      // ---------- Posts ----------
      const examPostsMatch = pathname.match(/^\/api\/admin\/exams\/(\d+)\/posts$/);
      if (examPostsMatch && req.method === 'GET') {
        return json(res, 200, { posts: postsListForExam(db, Number(examPostsMatch[1])) });
      }
      if (examPostsMatch && req.method === 'POST') {
        const examId = Number(examPostsMatch[1]);
        const body = JSON.parse((await readBody(req)) || '{}');
        if (!body.post_name) return safeError(res, 400, 'post_name_required');
        const maxOrder = db.prepare('SELECT COALESCE(MAX(display_order), -1) m FROM posts WHERE exam_id = ?').get(examId).m;
        const info = db
          .prepare(
            `INSERT INTO posts (exam_id, post_name, department, vacancies, vacancies_display, qualification, age_limit, pay_level, pay_band, category_breakdown, notes, display_order)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          )
          .run(
            examId,
            body.post_name,
            body.department || null,
            body.vacancies != null && body.vacancies !== '' ? Number(body.vacancies) : null,
            body.vacancies_display || null,
            body.qualification || null,
            body.age_limit || null,
            body.pay_level || null,
            body.pay_band || null,
            body.category_breakdown ? JSON.stringify(body.category_breakdown) : null,
            body.notes || null,
            body.display_order != null ? Number(body.display_order) : maxOrder + 1
          );
        db.prepare(
          `INSERT INTO audit_logs (actor, action, entity_type, entity_id, details) VALUES (?, 'create_post', 'post', ?, ?)`
        ).run(String(user.id), info.lastInsertRowid, JSON.stringify({ exam_id: examId, post_name: body.post_name }));
        return json(res, 201, { id: info.lastInsertRowid });
      }

      const postIdMatch = pathname.match(/^\/api\/admin\/posts\/(\d+)$/);
      if (postIdMatch && req.method === 'PATCH') {
        const postId = Number(postIdMatch[1]);
        const body = JSON.parse((await readBody(req)) || '{}');
        const cols = [
          'post_name', 'department', 'vacancies', 'vacancies_display', 'qualification',
          'age_limit', 'pay_level', 'pay_band', 'category_breakdown', 'notes', 'display_order',
        ];
        const sets = [];
        const params = [];
        for (const key of cols) {
          if (body[key] !== undefined) {
            sets.push(`${key} = ?`);
            params.push(key === 'category_breakdown' && body[key] != null ? JSON.stringify(body[key]) : body[key]);
          }
        }
        if (!sets.length) return safeError(res, 400, 'no_fields_to_update');
        params.push(postId);
        const info = db.prepare(`UPDATE posts SET ${sets.join(', ')}, updated_at = datetime('now') WHERE id = ?`).run(...params);
        if (info.changes === 0) return safeError(res, 404, 'post_not_found');
        db.prepare(
          `INSERT INTO audit_logs (actor, action, entity_type, entity_id, details) VALUES (?, 'update_post', 'post', ?, ?)`
        ).run(String(user.id), postId, JSON.stringify(body));
        return json(res, 200, { id: postId, updated: true });
      }
      if (postIdMatch && req.method === 'DELETE') {
        const postId = Number(postIdMatch[1]);
        const info = db.prepare('DELETE FROM posts WHERE id = ?').run(postId);
        if (info.changes === 0) return safeError(res, 404, 'post_not_found');
        db.prepare(
          `INSERT INTO audit_logs (actor, action, entity_type, entity_id, details) VALUES (?, 'delete_post', 'post', ?, '{}')`
        ).run(String(user.id), postId);
        return json(res, 200, { id: postId, deleted: true });
      }

      // ---------- Fields (Important Dates + the rest of the manual vocabulary) ----------
      const examFieldsMatch = pathname.match(/^\/api\/admin\/exams\/(\d+)\/fields$/);
      if (examFieldsMatch && req.method === 'GET') {
        const examId = Number(examFieldsMatch[1]);
        const currentRows = db.prepare(`SELECT field_name, value FROM field_history WHERE exam_id = ? AND is_current = 1`).all(examId);
        const fields = {};
        for (const row of currentRows) fields[row.field_name] = row.value;
        return json(res, 200, { fields, history: getAllFieldHistory(db, examId) });
      }
      const fieldNameMatch = pathname.match(/^\/api\/admin\/exams\/(\d+)\/fields\/([a-zA-Z0-9_]+)$/);
      if (fieldNameMatch && req.method === 'PUT') {
        const examId = Number(fieldNameMatch[1]);
        const fieldName = fieldNameMatch[2];
        if (!ALLOWED_MANUAL_FIELDS.has(fieldName)) return safeError(res, 400, 'field_not_allowed');
        const body = JSON.parse((await readBody(req)) || '{}');
        const value = body.value == null ? null : String(body.value);
        if (DATE_FIELDS.has(fieldName) && value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
          return safeError(res, 400, 'invalid_date');
        }
        try {
          return json(res, 200, setCurrentField(db, examId, fieldName, value, user.id));
        } catch (err) {
          return safeError(res, 400, err.code || 'set_field_failed', err);
        }
      }

      // ---------- Documents (URL + metadata only, no file upload) ----------
      const examDocsMatch = pathname.match(/^\/api\/admin\/exams\/(\d+)\/documents$/);
      if (examDocsMatch && req.method === 'GET') {
        return json(res, 200, { documents: documentsListForExam(db, Number(examDocsMatch[1])) });
      }
      if (examDocsMatch && req.method === 'POST') {
        const examId = Number(examDocsMatch[1]);
        const body = JSON.parse((await readBody(req)) || '{}');
        const label = String(body.label || '').trim();
        const docUrl = String(body.url || '').trim();
        const role = String(body.role || 'other');
        if (!label || !docUrl) return safeError(res, 400, 'label_and_url_required');
        if (!VALID_SOURCE_ROLES.has(role)) return safeError(res, 400, 'invalid_role');
        // active=0 so the scheduler/check-now (WHERE active = 1) never tries
        // to "monitor" a hand-entered link for changes.
        const sourceInfo = db
          .prepare(`INSERT INTO sources (exam_id, label, url, source_type, role, active) VALUES (?, ?, ?, 'manual', ?, 0)`)
          .run(examId, label, docUrl, role);
        const docInfo = db
          .prepare(`INSERT INTO documents (source_id, url, content_type, fetched_at) VALUES (?, ?, ?, datetime('now'))`)
          .run(sourceInfo.lastInsertRowid, docUrl, body.content_type || null);
        db.prepare(
          `INSERT INTO audit_logs (actor, action, entity_type, entity_id, details) VALUES (?, 'register_document', 'document', ?, ?)`
        ).run(String(user.id), docInfo.lastInsertRowid, JSON.stringify({ exam_id: examId, label, url: docUrl }));
        return json(res, 201, { id: docInfo.lastInsertRowid, source_id: sourceInfo.lastInsertRowid });
      }

      // ---------- Sources (real monitored sources — active by default, unlike
      // the "manual document" endpoint above which deliberately forces active=0) ----------
      const examSourcesMatch = pathname.match(/^\/api\/admin\/exams\/(\d+)\/sources$/);
      if (examSourcesMatch && req.method === 'GET') {
        const examId = Number(examSourcesMatch[1]);
        return json(res, 200, {
          sources: db
            .prepare(
              `SELECT id, label, url, source_type, role, active, monitoring_frequency_minutes,
                      last_checked_at, last_success_at, last_http_status, consecutive_failures
               FROM sources WHERE exam_id = ? ORDER BY id`
            )
            .all(examId),
        });
      }
      if (examSourcesMatch && req.method === 'POST') {
        const examId = Number(examSourcesMatch[1]);
        const body = JSON.parse((await readBody(req)) || '{}');
        const label = String(body.label || '').trim();
        const srcUrl = String(body.url || '').trim();
        const source_type = String(body.source_type || '');
        const role = String(body.role || 'notification');
        if (!label || !srcUrl) return safeError(res, 400, 'label_and_url_required');
        if (!VALID_SOURCE_TYPES.has(source_type)) return safeError(res, 400, 'invalid_source_type');
        if (!VALID_SOURCE_ROLES.has(role)) return safeError(res, 400, 'invalid_role');
        const freq = body.monitoring_frequency_minutes != null ? Number(body.monitoring_frequency_minutes) : 720;
        if (!Number.isFinite(freq) || freq < 1) return safeError(res, 400, 'invalid_monitoring_frequency');
        let extractKeywords = null;
        if (body.extract_keywords !== undefined) {
          if (!Array.isArray(body.extract_keywords)) return safeError(res, 400, 'extract_keywords_must_be_array');
          extractKeywords = JSON.stringify(body.extract_keywords);
        }
        try {
          const info = db
            .prepare(
              `INSERT INTO sources (exam_id, label, url, source_type, role, extract_keywords, monitoring_frequency_minutes, active)
               VALUES (?, ?, ?, ?, ?, ?, ?, 1)`
            )
            .run(examId, label, srcUrl, source_type, role, extractKeywords, freq);
          db.prepare(
            `INSERT INTO audit_logs (actor, action, entity_type, entity_id, details) VALUES (?, 'create_source', 'source', ?, ?)`
          ).run(String(user.id), info.lastInsertRowid, JSON.stringify({ exam_id: examId, label, url: srcUrl, source_type, role }));
          return json(res, 201, { id: info.lastInsertRowid });
        } catch (err) {
          if (String(err.message).includes('FOREIGN KEY')) return safeError(res, 404, 'exam_not_found');
          return safeError(res, 400, 'create_source_failed', err);
        }
      }

      // Runs the real pipeline (pipeline/runCheck.js) synchronously for one
      // source, so a newly-added source can be proven working right from
      // the dashboard instead of dropping to `npm run check-now` on the CLI.
      // Still only ever writes to change_events (status='pending') — this
      // endpoint cannot make anything live without a separate approval.
      const sourceCheckMatch = pathname.match(/^\/api\/admin\/sources\/(\d+)\/check-now$/);
      if (sourceCheckMatch && req.method === 'POST') {
        const sourceId = Number(sourceCheckMatch[1]);
        const source = db.prepare('SELECT id FROM sources WHERE id = ?').get(sourceId);
        if (!source) return safeError(res, 404, 'source_not_found');
        try {
          const result = await runCheck(db, sourceId);
          db.prepare(
            `INSERT INTO audit_logs (actor, action, entity_type, entity_id, details) VALUES (?, 'manual_check_now', 'source', ?, ?)`
          ).run(String(user.id), sourceId, JSON.stringify(result));
          return json(res, 200, result);
        } catch (err) {
          return safeError(res, 500, 'check_failed', err);
        }
      }

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
