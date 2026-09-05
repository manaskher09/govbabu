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
//
// Safe to re-run at any time (a sync, not a one-shot): an exam whose code
// already exists gets its fields refreshed rather than skipped, using the
// exact same is_current=0-then-insert-new-current-row pattern
// pipeline/applyApproval.js uses for a normal approved change — so re-
// running this after app.js gains more detail (e.g. a fuller `hi` object)
// actually picks up the new content instead of leaving the DB stuck with
// whatever was true the first time it ran.
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
  // Free-text display strings the UI reads directly (app.js's Important
  // Dates panel: `a.examDate`, `a.admitCardDate`) — distinct from the
  // machine-parsed `exam_date` ISO field the monitoring pipeline tracks
  // for sanity checks (validate/sanityChecks.js's DATE_FIELDS), so these
  // must never collide with that field_name.
  examDate: 'exam_date_text',
  admitCardDate: 'admit_card_date_text',
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

function importOne(db, exam, systemActorId, needsMapping, existingId) {
  const orgId = ensureOrg(db, exam.cat);
  let examId = existingId;
  if (examId) {
    db.prepare('UPDATE exams SET org_id = ?, external_code = ?, name = ?, category = ? WHERE id = ?')
      .run(orgId, exam.code, exam.name, exam.cat || null, examId);
  } else {
    examId = db
      .prepare('INSERT INTO exams (org_id, code, external_code, name, category) VALUES (?, ?, ?, ?, ?)')
      .run(orgId, exam.code, exam.code, exam.name, exam.cat || null).lastInsertRowid;
  }

  let changedFields = 0;
  const setField = (fieldName, value) => {
    if (value === undefined || value === null || value === '') return;
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    const current = db
      .prepare('SELECT value FROM field_history WHERE exam_id = ? AND field_name = ? AND is_current = 1')
      .get(examId, fieldName);
    if (current && current.value === serialized) return; // already up to date, no churn
    db.prepare(
      `UPDATE field_history SET is_current = 0 WHERE exam_id = ? AND field_name = ? AND is_current = 1`
    ).run(examId, fieldName);
    db.prepare(
      `INSERT INTO field_history (exam_id, field_name, value, source_id, change_event_id, approved_by, is_current)
       VALUES (?, ?, ?, NULL, NULL, ?, 1)`
    ).run(examId, fieldName, serialized, systemActorId);
    changedFields += 1;
  };

  for (const [srcKey, fieldName] of Object.entries(SIMPLE_FIELD_MAP)) {
    let value = exam[srcKey];
    if (srcKey === 'vacancies') value = cleanVacancies(value);
    setField(fieldName, value);
  }
  // vacancies is often NOT a clean number in app.js — "~933", "25,000+",
  // "8,868 (5,810 Graduate + 3,058 Undergraduate)", "No single total (21
  // separate notifications)" are all real, meaningful values for real
  // exams. cleanVacancies() above exists for the machine-numeric `vacancies`
  // field the live monitoring pipeline validates (sanityChecks.js expects
  // digits-only), but stripping non-digits from a compound string like the
  // RRB-NTPC example silently concatenates unrelated numbers into
  // nonsense. vacancies_display preserves the exact original string
  // verbatim so the site can keep showing the real, honest figure — see
  // toApplicationsShape.js, which prefers this over the cleaned number.
  if (exam.vacancies !== undefined && exam.vacancies !== null && exam.vacancies !== '') {
    setField('vacancies_display', String(exam.vacancies));
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

  return { examId, changedFields };
}

function runImport(db, applications, { dryRun = false } = {}) {
  const systemActorId = db.prepare(`INSERT OR IGNORE INTO admin_users (username, display_name) VALUES ('import-script', 'Data Migration')`).run() &&
    db.prepare(`SELECT id FROM admin_users WHERE username = 'import-script'`).get().id;

  const summary = { found: applications.length, created: 0, updated: 0, unchanged: 0, duplicates: 0, failed: 0, needsManualMapping: [] };
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
      try {
        const { changedFields } = importOne(db, exam, systemActorId, summary.needsManualMapping, existing && existing.id);
        if (!existing) summary.created += 1;
        else if (changedFields > 0) summary.updated += 1;
        else summary.unchanged += 1;
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
  console.log(`Created: ${summary.created}`);
  console.log(`Updated: ${summary.updated}`);
  console.log(`Unchanged: ${summary.unchanged}`);
  console.log(`Duplicates (repeated code within app.js): ${summary.duplicates}`);
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
