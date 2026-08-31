const crypto = require('crypto');
const { hashPassword, verifyPassword } = require('./passwords');

const SESSION_TTL_MS = Number(process.env.MONITOR_SESSION_TTL_MS || 12 * 60 * 60 * 1000);
const COOKIE_NAME = 'govbabu_monitor_session';

function tokenHash(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function login(db, username, password) {
  const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);
  if (!user || !verifyPassword(password, user.password_hash)) return null;
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  db.prepare(
    `INSERT INTO sessions (admin_user_id, token_hash, expires_at) VALUES (?, ?, ?)`
  ).run(user.id, tokenHash(token), expiresAt);
  return { token, user: { id: user.id, username: user.username, display_name: user.display_name } };
}

function logout(db, token) {
  if (!token) return;
  db.prepare(`UPDATE sessions SET revoked_at = datetime('now') WHERE token_hash = ?`).run(tokenHash(token));
}

function getSessionUser(db, token) {
  if (!token) return null;
  const row = db
    .prepare(
      `SELECT s.expires_at, s.revoked_at, u.id, u.username, u.display_name
       FROM sessions s JOIN admin_users u ON u.id = s.admin_user_id
       WHERE s.token_hash = ?`
    )
    .get(tokenHash(token));
  if (!row || row.revoked_at) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) return null;
  return { id: row.id, username: row.username, display_name: row.display_name };
}

function setPassword(db, username, password) {
  const passwordHash = hashPassword(password);
  const existing = db.prepare('SELECT id FROM admin_users WHERE username = ?').get(username);
  if (existing) {
    db.prepare(`UPDATE admin_users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?`).run(passwordHash, existing.id);
    return existing.id;
  }
  return db.prepare(`INSERT INTO admin_users (username, password_hash) VALUES (?, ?)`).run(username, passwordHash).lastInsertRowid;
}

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    out[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
  }
  return out;
}

module.exports = { login, logout, getSessionUser, setPassword, parseCookies, COOKIE_NAME, SESSION_TTL_MS };
