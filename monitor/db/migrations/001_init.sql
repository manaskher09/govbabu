PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS organizations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  short_code TEXT UNIQUE NOT NULL,
  website_url TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- external_code links back to app.js's APPLICATIONS[].code for the future
-- sync step; it is nullable because a monitored exam may not exist on the
-- live site yet (e.g. a brand-new notification GovBabu hasn't added).
CREATE TABLE IF NOT EXISTS exams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id INTEGER NOT NULL REFERENCES organizations(id),
  code TEXT UNIQUE NOT NULL,
  external_code TEXT,
  name TEXT NOT NULL,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_exams_org ON exams(org_id);
CREATE INDEX IF NOT EXISTS idx_exams_external_code ON exams(external_code);

-- One row per official source URL for an exam. selector_config and
-- extract_keywords are JSON blobs so new sources can be added purely as
-- data (see adapters/base.js) without new code.
CREATE TABLE IF NOT EXISTS sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  exam_id INTEGER NOT NULL REFERENCES exams(id),
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN
    ('html','pdf','pdf_scanned_ocr','js_rendered','manual')),
  role TEXT NOT NULL DEFAULT 'notification' CHECK (role IN
    ('website','notification','result','admit_card','corrigendum','other')),
  selector_config TEXT,      -- JSON: {"selector": "...", "fields": {...}}
  extract_keywords TEXT,     -- JSON array of strings
  monitoring_frequency_minutes INTEGER NOT NULL DEFAULT 720,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  last_checked_at TEXT,
  next_check_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_success_at TEXT,
  last_http_status INTEGER,
  last_response_time_ms INTEGER,
  last_hash TEXT,
  last_etag TEXT,
  last_modified_header TEXT,
  consecutive_failures INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sources_exam ON sources(exam_id);
CREATE INDEX IF NOT EXISTS idx_sources_active_next_check ON sources(active, next_check_at);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  exam_id INTEGER NOT NULL REFERENCES exams(id),
  source_id INTEGER NOT NULL REFERENCES sources(id),
  title TEXT,
  notif_type TEXT NOT NULL DEFAULT 'original' CHECK (notif_type IN
    ('original','corrigendum','revised','addendum')),
  published_date TEXT,
  discovered_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_notifications_exam ON notifications(exam_id);

CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id INTEGER NOT NULL REFERENCES sources(id),
  notification_id INTEGER REFERENCES notifications(id),
  url TEXT NOT NULL,
  content_type TEXT,
  fetched_at TEXT NOT NULL DEFAULT (datetime('now')),
  http_status INTEGER,
  response_time_ms INTEGER
);
CREATE INDEX IF NOT EXISTS idx_documents_source ON documents(source_id);

CREATE TABLE IF NOT EXISTS document_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id INTEGER NOT NULL REFERENCES documents(id),
  version_number INTEGER NOT NULL,
  content_hash TEXT NOT NULL,
  raw_text TEXT,
  is_current INTEGER NOT NULL DEFAULT 1 CHECK (is_current IN (0,1)),
  extracted_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(document_id, version_number)
);
CREATE INDEX IF NOT EXISTS idx_docversions_document ON document_versions(document_id);

CREATE TABLE IF NOT EXISTS extracted_fields (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_version_id INTEGER NOT NULL REFERENCES document_versions(id),
  field_name TEXT NOT NULL,
  field_value TEXT,
  confidence REAL NOT NULL DEFAULT 1.0,
  extraction_method TEXT NOT NULL DEFAULT 'regex' CHECK (extraction_method IN
    ('regex','ai','manual')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_extracted_fields_docversion ON extracted_fields(document_version_id);

CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  telegram_chat_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- One row per detected field-level change. A "pending" row *is* the review
-- queue item; there is no separate review_queue table, to avoid two tables
-- getting out of sync about the same fact. See admin/server.js.
CREATE TABLE IF NOT EXISTS change_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  exam_id INTEGER NOT NULL REFERENCES exams(id),
  source_id INTEGER NOT NULL REFERENCES sources(id),
  document_version_id INTEGER REFERENCES document_versions(id),
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  detection_method TEXT NOT NULL,
  confidence REAL NOT NULL DEFAULT 1.0,
  classification TEXT NOT NULL CHECK (classification IN
    ('CONFIRMED_CHANGE','POSSIBLE_CHANGE','PARSING_ERROR','SOURCE_UNAVAILABLE','NEEDS_HUMAN_REVIEW')),
  evidence TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN
    ('pending','approved','rejected','auto_applied')),
  reviewed_by INTEGER REFERENCES admin_users(id),
  reviewed_at TEXT,
  review_notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_change_events_status ON change_events(status);
CREATE INDEX IF NOT EXISTS idx_change_events_exam ON change_events(exam_id);

-- Append-only ledger: every value a field has ever held, once approved.
-- This is the "Exam Date History" the founder asked for.
CREATE TABLE IF NOT EXISTS field_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  exam_id INTEGER NOT NULL REFERENCES exams(id),
  field_name TEXT NOT NULL,
  value TEXT,
  source_id INTEGER REFERENCES sources(id),
  change_event_id INTEGER REFERENCES change_events(id),
  approved_by INTEGER REFERENCES admin_users(id),
  is_current INTEGER NOT NULL DEFAULT 1 CHECK (is_current IN (0,1)),
  effective_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_field_history_exam_field ON field_history(exam_id, field_name);

CREATE TABLE IF NOT EXISTS monitoring_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id INTEGER NOT NULL REFERENCES sources(id),
  scheduled_at TEXT NOT NULL DEFAULT (datetime('now')),
  started_at TEXT,
  finished_at TEXT,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN
    ('queued','running','success','failed')),
  attempt_number INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_monitoring_jobs_source ON monitoring_jobs(source_id);

CREATE TABLE IF NOT EXISTS monitoring_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id INTEGER NOT NULL REFERENCES monitoring_jobs(id),
  source_id INTEGER NOT NULL REFERENCES sources(id),
  result TEXT NOT NULL CHECK (result IN ('no_change','changed','error','unavailable')),
  http_status INTEGER,
  response_time_ms INTEGER,
  content_hash TEXT,
  error_message TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_monitoring_results_source ON monitoring_results(source_id);

CREATE TABLE IF NOT EXISTS errors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id INTEGER REFERENCES sources(id),
  job_id INTEGER REFERENCES monitoring_jobs(id),
  error_type TEXT NOT NULL,
  message TEXT,
  stack_excerpt TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_errors_source ON errors(source_id);

CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id INTEGER,
  details TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

CREATE TABLE IF NOT EXISTS alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  change_event_id INTEGER REFERENCES change_events(id),
  alert_type TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('telegram_admin','telegram_public','email')),
  message TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent','failed','skipped_unapproved','dry_run')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
