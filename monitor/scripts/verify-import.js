#!/usr/bin/env node
// node scripts/verify-import.js [--app-js path]
//
// Re-parses app.js and compares every mappable field against what's
// currently is_current=1 in field_history for the matching exam code —
// the check that would have caught the hi_json truncation bug (DB had
// `{"name":"..."}`, app.js actually had several KB of FAQs/exam-pattern
// prose) before it went unnoticed. Read-only: never writes anything.
const path = require('path');
const { isDeepStrictEqual } = require('util');
const { getDb } = require('../db/db');
const { extractApplications } = require('./extractApplications');
const { getCurrentExam } = require('../db/currentExam');

const SIMPLE_FIELD_MAP = {
  status: 'status',
  popularity: 'popularity',
  notifTitle: 'notif_title',
  officialUrl: 'official_url',
  verified: 'verified',
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

function verify(db, applications) {
  const mismatches = [];
  const missing = [];

  for (const exam of applications) {
    if (!exam.code) continue;
    const row = db.prepare('SELECT id FROM exams WHERE code = ?').get(exam.code);
    if (!row) {
      missing.push(exam.code);
      continue;
    }
    const current = getCurrentExam(db, row.id) || { fields: {} };
    const fields = current.fields || {};

    for (const [srcKey, fieldName] of Object.entries(SIMPLE_FIELD_MAP)) {
      const expected = exam[srcKey];
      if (expected === undefined || expected === null || expected === '') continue;
      const actual = fields[fieldName];
      if (String(actual) !== String(expected)) {
        mismatches.push({ code: exam.code, field: fieldName, expected, actual });
      }
    }

    if (exam.vacancies != null && exam.vacancies !== '') {
      // Checked against vacancies_display (the verbatim original string),
      // not the digit-stripped `vacancies` field — that field is allowed
      // to differ for compound/approximate figures, see toApplicationsShape.js.
      const expected = String(exam.vacancies);
      const actual = fields.vacancies_display;
      if (String(actual) !== expected) {
        mismatches.push({ code: exam.code, field: 'vacancies_display', expected, actual });
      }
    }

    for (const [srcKey, fieldName] of Object.entries(JSON_FIELD_MAP)) {
      const expected = exam[srcKey];
      if (expected === undefined) continue;
      const actual = fields[fieldName];
      // Both sides are round-tripped through JSON before comparing: `expected`
      // comes from extractApplications' vm.Script (a different V8 realm), so
      // its objects have a foreign Object.prototype — isDeepStrictEqual
      // treats that as unequal even when every key/value matches exactly.
      // The round-trip strips prototypes from both sides, leaving a pure
      // content comparison, which is what "did any data get lost" means here.
      const expectedNormalized = JSON.parse(JSON.stringify(expected));
      const actualNormalized = actual == null ? actual : JSON.parse(JSON.stringify(actual));
      if (!isDeepStrictEqual(actualNormalized, expectedNormalized)) {
        mismatches.push({
          code: exam.code,
          field: fieldName,
          expectedBytes: JSON.stringify(expected).length,
          actualBytes: actual == null ? 0 : JSON.stringify(actual).length,
        });
      }
    }
  }

  return { mismatches, missing, checked: applications.length };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const appJsFlagIdx = args.indexOf('--app-js');
  const appJsPath = appJsFlagIdx !== -1 ? args[appJsFlagIdx + 1] : path.join(__dirname, '..', '..', 'app.js');

  const applications = extractApplications(appJsPath);
  const db = getDb();
  const { mismatches, missing, checked } = verify(db, applications);

  console.log(`Verified ${checked} exams from app.js against field_history.\n`);
  if (missing.length) {
    console.log(`MISSING from DB (${missing.length}):`);
    for (const code of missing) console.log(`  - ${code}`);
    console.log('');
  }
  if (mismatches.length) {
    console.log(`MISMATCHES (${mismatches.length}):`);
    for (const m of mismatches) {
      if ('expectedBytes' in m) {
        console.log(`  - ${m.code}.${m.field}: app.js has ${m.expectedBytes} bytes of JSON, DB has ${m.actualBytes}`);
      } else {
        console.log(`  - ${m.code}.${m.field}: app.js="${m.expected}" DB="${m.actual}"`);
      }
    }
  }
  if (!missing.length && !mismatches.length) {
    console.log('✓ Every exam and field matches app.js exactly. No data loss.');
  }
  process.exit(missing.length || mismatches.length ? 1 : 0);
}

module.exports = { verify };
