PRAGMA foreign_keys = ON;

-- One row per structured post/vacancy breakdown line within an exam (e.g.
-- "Assistant Section Officer", "Inspector (Income Tax)" for SSC CGL). This
-- replaces the free-text payGroups[].posts string the main site currently
-- uses with queryable, per-post fields. category_breakdown is JSON because
-- reservation categories vary by exam (UR/OBC/SC/ST/EWS/PwBD is common but
-- not universal) and a fixed column set would be wrong for some exams.
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  exam_id INTEGER NOT NULL REFERENCES exams(id),
  post_name TEXT NOT NULL,
  department TEXT,
  vacancies INTEGER,
  vacancies_display TEXT,      -- fallback for non-numeric figures, e.g. "25,000+"
  qualification TEXT,
  age_limit TEXT,
  pay_level TEXT,               -- e.g. "Level 7" — matches payGroups[].level today
  pay_band TEXT,                 -- e.g. "₹44,900–₹1,42,400" — matches payGroups[].band
  category_breakdown TEXT,      -- JSON object, e.g. {"UR":10,"OBC":5,"SC":3,"ST":2,"EWS":2}
  notes TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_posts_exam ON posts(exam_id);
CREATE INDEX IF NOT EXISTS idx_posts_exam_order ON posts(exam_id, display_order);

-- Content lifecycle for a whole exam record (distinct from `status`, which
-- is an operational active/inactive flag unrelated to editorial readiness).
-- discovered is reserved for a future automated-discovery pipeline — no
-- code in this phase ever sets it; every exam created through the new admin
-- "New Exam" flow starts at 'draft'. DEFAULT 'published' exists ONLY for
-- backward compatibility with every exam already in the database (imported
-- via scripts/import-existing-exams.js, or inserted directly in tests) —
-- that data is already live on the public site today and must stay visible
-- without a manual backfill. New rows created by the admin exam-creation
-- endpoint MUST pass content_status='draft' explicitly; they never rely on
-- this default.
-- content_status_updated_at/_by are nullable with no default: for every
-- exam that already exists, we genuinely don't know when it was "verified"
-- (SQLite's ALTER TABLE ADD COLUMN also rejects a non-constant default like
-- datetime('now') outright) — NULL correctly means "never explicitly
-- transitioned," which is true for all pre-existing/imported rows.
ALTER TABLE exams ADD COLUMN content_status TEXT NOT NULL DEFAULT 'published'
  CHECK (content_status IN ('discovered','draft','needs_review','verified','published','archived'));
ALTER TABLE exams ADD COLUMN content_status_updated_at TEXT;
ALTER TABLE exams ADD COLUMN content_status_updated_by INTEGER REFERENCES admin_users(id);
CREATE INDEX IF NOT EXISTS idx_exams_content_status ON exams(content_status);
