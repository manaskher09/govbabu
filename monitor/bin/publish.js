#!/usr/bin/env node
// Publishes monitor's content_status='published' exams to the main site as
// static output: data/exams.json, data/applications.generated.js (the
// frontend's exam data — index.html/exams.html/calendar.html load this
// before app.js), one exams/<slug>/index.html per exam, and sitemap.xml.
// This is the ONLY thing that writes to any of those paths — there used to
// be a second, separate script generating exams/*/index.html straight from
// app.js's old hand-written array; that array and that script are both
// gone now that every exam has a real database row.
//
// Publish boundary: extract -> validate source data -> build the ENTIRE new
// site into one staging directory -> validate the staged output as a whole
// -> swap every output into production. See publish/atomicWrite.js for why
// the final swap is 3 ordered renames rather than one atomic operation (this
// repo has no deployment layer that could make it fewer), and why that
// ordering still guarantees the live site is never left broken or serving a
// torn page, even if the process is killed mid-swap.
const fs = require('fs');
const path = require('path');
const { getDb } = require('../db/db');
const { listCurrentExams } = require('../db/currentExam');
const { toApplicationsShape } = require('../sync/toApplicationsShape');
const { slugify } = require('../publish/slug');
const { checkAllPublished, validatePublishSet, validateStagedSite } = require('../publish/validate');
const { computeDiff } = require('../publish/diff');
const { buildStagedSite, swapStagedSite, discardStagedSite } = require('../publish/atomicWrite');
const { renderExamPage } = require('../publish/render');
const { buildSitemap } = require('../publish/sitemap');
const { checkNoUnexpectedShrinkage } = require('../publish/shrinkGuard');
const { renderApplicationsJs } = require('../publish/renderApplications');

const REPO_ROOT = path.join(__dirname, '..', '..');
const DATA_DIR = path.join(REPO_ROOT, 'data');
const EXAMS_JSON_PATH = path.join(DATA_DIR, 'exams.json');
const APPLICATIONS_JS_PATH = path.join(DATA_DIR, 'applications.generated.js');
const EXAMS_DIR = path.join(REPO_ROOT, 'exams');
const SITEMAP_PATH = path.join(REPO_ROOT, 'sitemap.xml');

function readPreviousExams() {
  try {
    return JSON.parse(fs.readFileSync(EXAMS_JSON_PATH, 'utf8')).exams || [];
  } catch {
    return []; // no prior publish, or unreadable -> treat everything as new
  }
}

// A deterministic, content-derived "as of" date for the published set — NOT
// wall-clock time. Using new Date() here would mean identical DB content
// produces different file bytes on every run (false idempotency, the
// second issue this pipeline was reviewed for). exams.updated_at only
// changes when a field genuinely changes (see db/adminWrite.js,
// pipeline/applyApproval.js), so the max across all published exams is a
// real, meaningful, reproducible value: "the newest approved change in
// this published set."
function computeLastContentUpdate(exams) {
  const dates = exams.map((e) => e.lastUpdated).filter(Boolean);
  return dates.length ? dates.reduce((max, d) => (d > max ? d : max)) : null;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const db = getDb();

  // 1. Select PUBLISHED records — the exact same read path (listCurrentExams)
  // that already backs the live /api/exams endpoint, so this script's
  // selection can never drift from what the API itself considers public.
  const currentExams = listCurrentExams(db);

  // 2. Defense-in-depth: every record really is content_status='published'.
  const publishGateErrors = checkAllPublished(currentExams);

  // 3. Transform (reusing toApplicationsShape) + attach a slug.
  const transformed = currentExams.map((e) => {
    const shaped = toApplicationsShape(e);
    return { ...shaped, slug: slugify(shaped.code) };
  });

  // 4. Validate the SOURCE data before generating anything.
  const { errors: sourceErrors } = validatePublishSet(transformed);
  const allSourceErrors = [...publishGateErrors, ...sourceErrors];

  if (allSourceErrors.length) {
    console.log('GovBabu Publish\n');
    console.log('❌ Publish aborted\n');
    console.log('Validation errors:');
    for (const e of allSourceErrors) console.log(`  - ${e}`);
    console.log('\nNo files were changed.');
    process.exit(1);
  }

  // 5. Change detection vs. the previous publish, read BEFORE any write.
  const previousExams = readPreviousExams();
  const { newlyAdded, updated, archived } = computeDiff(previousExams, transformed);

  // 5b. Guard against publishing a set that would delete real, live exam
  // pages the database doesn't know about yet (see checkNoUnexpectedShrinkage).
  const shrinkageError = checkNoUnexpectedShrinkage(EXAMS_DIR, transformed.length);
  if (shrinkageError) {
    console.log('GovBabu Publish\n');
    console.log('❌ Publish aborted\n');
    console.log(shrinkageError);
    console.log('\nNo files were changed.');
    process.exit(1);
  }

  const lastContentUpdate = computeLastContentUpdate(transformed);
  const payload = { lastContentUpdate, count: transformed.length, exams: transformed };
  const sitemapXml = buildSitemap(transformed);

  if (dryRun) {
    printReport({ dryRun, transformed, newlyAdded, updated, archived });
    return;
  }

  // 6. Build the ENTIRE new site into one staging directory. Nothing under
  // the real output paths is touched by this step, success or failure.
  const stagingDir = buildStagedSite(REPO_ROOT, (staging) => {
    fs.mkdirSync(path.join(staging, 'data'), { recursive: true });
    fs.writeFileSync(path.join(staging, 'data', 'exams.json'), JSON.stringify(payload, null, 2), 'utf8');
    fs.writeFileSync(path.join(staging, 'data', 'applications.generated.js'), renderApplicationsJs(transformed), 'utf8');
    fs.writeFileSync(path.join(staging, 'sitemap.xml'), sitemapXml, 'utf8');
    const stagedExamsDir = path.join(staging, 'exams');
    for (const exam of transformed) {
      const examDir = path.join(stagedExamsDir, exam.slug);
      fs.mkdirSync(examDir, { recursive: true });
      fs.writeFileSync(path.join(examDir, 'index.html'), renderExamPage(exam, transformed), 'utf8');
    }
  });

  // 7. Validate the BUILT output as a whole — catches a generation bug that
  // source validation can't see, since source validation never looks at
  // what actually landed on disk.
  const staged = validateStagedSite(stagingDir, transformed);
  if (!staged.ok) {
    discardStagedSite(stagingDir);
    console.log('GovBabu Publish\n');
    console.log('❌ Publish aborted\n');
    console.log('Staged output failed validation:');
    for (const e of staged.errors) console.log(`  - ${e}`);
    console.log('\nNo files were changed.');
    process.exit(1);
  }

  // 8. Only now does production get touched — the smallest possible number
  // of renames, back-to-back, in the order documented in atomicWrite.js.
  swapStagedSite(stagingDir, {
    examsDir: EXAMS_DIR,
    sitemapPath: SITEMAP_PATH,
    examsJsonPath: EXAMS_JSON_PATH,
    applicationsJsPath: APPLICATIONS_JS_PATH,
  });

  printReport({ dryRun, transformed, newlyAdded, updated, archived });
}

function printReport({ dryRun, transformed, newlyAdded, updated, archived }) {
  console.log('GovBabu Publish\n');
  console.log(`Published exams: ${transformed.length}`);
  console.log(`New: ${newlyAdded.length}`);
  console.log(`Updated: ${updated.length}`);
  console.log(`Removed/Archived: ${archived.length}`);
  console.log('');
  console.log('Validation:');
  console.log('✓ All exams have slugs');
  console.log('✓ All published exams have required fields');
  console.log('✓ No duplicate slugs');
  console.log('✓ No draft records included');
  console.log('✓ No invalid dates');
  console.log('✓ No malformed URLs');
  if (!dryRun) console.log('✓ Staged output matches expected exam set');

  if (newlyAdded.length) {
    console.log('\nNEW');
    for (const code of newlyAdded) console.log(`• ${code}`);
  }
  if (updated.length) {
    console.log('\nUPDATED');
    for (const u of updated) {
      console.log(`• ${u.code}`);
      for (const f of u.changedFields) console.log(`  ${f}: changed`);
    }
  }
  if (archived.length) {
    console.log('\nARCHIVED');
    for (const code of archived) console.log(`• ${code}`);
  }

  console.log(dryRun ? '\nDry run complete — no files were changed.' : '\nPublish complete.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
