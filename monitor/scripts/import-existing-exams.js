#!/usr/bin/env node
// node scripts/import-existing-exams.js [--app-js path] [--dry-run]
//
// Read-only with respect to app.js — this script never writes to it (see
// spec STEP 8: "do not modify the original app.js until the migration has
// been verified"). It only reads APPLICATIONS and writes into the
// monitor's own database as one-time-approved field_history rows (so the
// imported data is immediately part of "current exam data," attributable
// to a real system actor, and carries the same audit trail machinery as a
// live-detected change).
const path = require('path');
const { getDb } = require('../db/db');
const { extractApplications } = require('./extractApplications');
const { normalizeDate } = require('../extract/fields');

const CATEGORY_ORG = {
  'Central Govt': { name: 'Central Government Recruiting Bodies (SSC/UPSC/etc.)', code: 'CENTRAL-GOVT' },
  Railway: { name: 'Railway Recruitment Boards', code: 'RAILWAY' },
  Banking: { name: 'Banking Recruitment Bodies (IBPS/SBI/RBI)', code: 'BANKING' },
  Defence: { name: 'Defence Recruiting Bodies', code: 'DEFENCE' },
  'State PSC': { name: 'State Public Service Commissions', code: 'STATE-PSC' },
  Teaching: { name: 'Teaching Eligibility Boards', code: 'TEACHING' },
  Police: { name: 'Police Recruitment Boards', code: 'POLICE' },
};

const SIMPLE_FIELD_MAP = {
  status: 'status',
  popularity: 'popularity',
  vacancies: 'vacancies',
  notifTitle: 'notif_title',
  applyStart: 'apply_start',
  applyEnd: 'apply_end',
  officialUrl: 'official_url',
  verified: 'verified',
};
const JSON_FIELD_MAP = {
  photo: 'photo_json',
  signature: 'signature_json',
  details: 'details_json',
  hi: 'hi_json',
  otherDocs: 'other_docs_json',
  results: 'results_json',
};

function cleanVacancies(raw) {
  if (raw == null) return null;
  const digits = String(raw).replace(/[^\d]/g, '');
  return digits || String(raw);
}

function bestEffortIsoDate(displayString) {
  if (!displayString) return null;
  const norm = normalizeDate(String(displayString));
  return norm ? norm.iso : null;
}

function ensureOrg(db, category) {
  const meta = CATEGORY_ORG[category] || { name: category || 'Unclassified', code: (category || 'UNCLASSIFIED').toUpperCase().replace(/[^A-Z]+/g, '-') };
  db.prepare('INSERT OR IGNORE INTO organizations (name, short_code) VALUES (?, ?)').run(meta.name, meta.code);
  return db.prepare('SELECT id FROM organizations WHERE short_code = ?').get(meta.code).id;
}

function importOne(db, exam, systemActorId, needsMapping) {
  const orgId = ensureOrg(db, exam.cat);
  const examId = db
    .prepare('INSERT INTO exams (org_id, code, external_code, name, category) VALUES (?, ?, ?, ?, ?)')
    .run(orgId, exam.code, exam.code, exam.name, exam.cat || null).lastInsertRowid;

  const setField = (fieldName, value) => {
    if (value === undefined || value === null || value === '') return;
    db.prepare(
      `INSERT INTO field_history (exam_id, field_name, value, source_id, change_event_id, approved_by, is_current)
       VALUES (?, ?, ?, NULL, NULL, ?, 1)`
    ).run(examId, fieldName, typeof value === 'string' ? value : JSON.stringify(value), systemActorId);
  };

  for (const [srcKey, fieldName] of Object.entries(SIMPLE_FIELD_MAP)) {
    let value = exam[srcKey];
    if (srcKey === 'vacancies') value = cleanVacancies(value);
    setField(fieldName, value);
  }
  for (const [srcKey, fieldName] of Object.entries(JSON_FIELD_MAP)) {
    if (exam[srcKey] !== undefined) setField(fieldName, exam[srcKey]);
  }
  if (exam.tentativeNext || exam.tentativeNextMonth) {
    setField('tentative_next_json', { text: exam.tentativeNext, month: exam.tentativeNextMonth });
  }

  const startIso = bestEffortIsoDate(exam.applyStart);
  const endIso = bestEffortIsoDate(exam.applyEnd);
  if (startIso) setField('application_start_date', startIso);
  else needsMapping.push({ code: exam.code, field: 'application_start_date', reason: `could not parse "${exam.applyStart}"` });
  if (endIso) setField('application_end_date', endIso);
  else needsMapping.push({ code: exam.code, field: 'application_end_date', reason: `could not parse "${exam.applyEnd}"` });

  needsMapping.push({ code: exam.code, field: 'exam_date', reason: 'not present as a structured field in APPLICATIONS (only embedded in free text)' });

  return examId;
}

function runImport(db, applications, { dryRun = false } = {}) {
  const systemActorId = db.prepare(`INSERT OR IGNORE INTO admin_users (username, display_name) VALUES ('import-script', 'Data Migration')`).run() &&
    db.prepare(`SELECT id FROM admin_users WHERE username = 'import-script'`).get().id;

  const summary = { found: applications.length, imported: 0, duplicates: 0, failed: 0, needsManualMapping: [] };
  const seenCodes = new Set();

  const doImport = () => {
    for (const exam of applications) {
      if (!exam.code) {
        summary.failed += 1;
        continue;
      }
      if (seenCodes.has(exam.code)) {
        summary.duplicates += 1;
        continue;
      }
      seenCodes.add(exam.code);
      const existing = db.prepare('SELECT id FROM exams WHERE code = ?').get(exam.code);
      if (existing) {
        summary.duplicates += 1;
        continue;
      }
      try {
        importOne(db, exam, systemActorId, summary.needsManualMapping);
        summary.imported += 1;
      } catch (err) {
        summary.failed += 1;
        summary.needsManualMapping.push({ code: exam.code, field: '(entire record)', reason: err.message });
      }
    }
  };

  if (dryRun) {
    db.exec('BEGIN');
    try {
      doImport();
    } finally {
      db.exec('ROLLBACK');
    }
  } else {
    db.exec('BEGIN');
    try {
      doImport();
      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  }
  return summary;
}

function printSummary(summary) {
  console.log('\nMigration complete\n');
  console.log(`Exam records found: ${summary.found}`);
  console.log(`Imported: ${summary.imported}`);
  console.log(`Duplicates: ${summary.duplicates}`);
  console.log(`Needs manual mapping: ${summary.needsManualMapping.length} field(s)`);
  console.log(`Failed: ${summary.failed}`);
  if (summary.needsManualMapping.length) {
    console.log('\nFields needing manual mapping (expected for exam_date, and for any applyStart/applyEnd string the parser could not read):');
    for (const item of summary.needsManualMapping.slice(0, 50)) {
      console.log(`  - ${item.code}: ${item.field} — ${item.reason}`);
    }
    if (summary.needsManualMapping.length > 50) console.log(`  ...and ${summary.needsManualMapping.length - 50} more`);
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const appJsFlagIdx = args.indexOf('--app-js');
  const appJsPath = appJsFlagIdx !== -1 ? args[appJsFlagIdx + 1] : path.join(__dirname, '..', '..', 'app.js');

  const applications = extractApplications(appJsPath);
  const db = getDb();
  const summary = runImport(db, applications, { dryRun });
  printSummary(summary);
  if (dryRun) console.log('\n(dry run — nothing was written)');
}

module.exports = { runImport, importOne, cleanVacancies, bestEffortIsoDate };
