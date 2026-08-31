ALTER TABLE admin_users ADD COLUMN password_hash TEXT;
ALTER TABLE admin_users ADD COLUMN updated_at TEXT NOT NULL DEFAULT (datetime('now'));

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_user_id INTEGER NOT NULL REFERENCES admin_users(id),
  token_hash TEXT UNIQUE NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  revoked_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_admin_user ON sessions(admin_user_id);
