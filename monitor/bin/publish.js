#!/usr/bin/env node
// Publishes monitor's content_status='published' exams to the main site as
// static output: data/exams.json, one exams/<slug>/index.html per exam, and
// sitemap.xml. Never partial — everything is built in a temp location,
// validated, and only then atomically swapped into place. See
// monitor/publish/*.js for the individual pieces.
const fs = require('fs');
const path = require('path');
const { getDb } = require('../db/db');
const { listCurrentExams } = require('../db/currentExam');
const { toApplicationsShape } = require('../sync/toApplicationsShape');
const { slugify } = require('../publish/slug');
const { checkAllPublished, validatePublishSet } = require('../publish/validate');
const { computeDiff } = require('../publish/diff');
const { atomicWriteFile, buildTempDir, swapInTempDir } = require('../publish/atomicWrite');
const { renderExamPage } = require('../publish/render');
const { buildSitemap } = require('../publish/sitemap');

const REPO_ROOT = path.join(__dirname, '..', '..');
const DATA_DIR = path.join(REPO_ROOT, 'data');
const EXAMS_JSON_PATH = path.join(DATA_DIR, 'exams.json');
const EXAMS_DIR = path.join(REPO_ROOT, 'exams');
const SITEMAP_PATH = path.join(REPO_ROOT, 'sitemap.xml');

function readPreviousExams() {
  try {
    return JSON.parse(fs.readFileSync(EXAMS_JSON_PATH, 'utf8')).exams || [];
  } catch {
    return []; // no prior publish, or unreadable -> treat everything as new
  }
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

  // 3. Transform (reusing toApplicationsShape, extended in this phase to
  // include posts[]/orgName) + attach a slug.
  const transformed = currentExams.map((e) => {
    const shaped = toApplicationsShape(e);
    return { ...shaped, slug: slugify(shaped.code) };
  });

  // 4. Validate before anything is written.
  const { ok, errors } = validatePublishSet(transformed);
  const allErrors = [...publishGateErrors, ...errors];

  if (allErrors.length) {
    console.log('GovBabu Publish\n');
    console.log('❌ Publish aborted\n');
    console.log('Validation errors:');
    for (const e of allErrors) console.log(`  - ${e}`);
    console.log('\nNo files were changed.');
    process.exit(1);
  }

  // 5. Change detection vs. the previous publish, read BEFORE any write.
  const previousExams = readPreviousExams();
  const { newlyAdded, updated, archived } = computeDiff(previousExams, transformed);

  const generatedAt = new Date().toISOString();
  const payload = { generatedAt, count: transformed.length, exams: transformed };
  const sitemapXml = buildSitemap(transformed, generatedAt);

  if (!dryRun) {
    // Build the exams/ directory FIRST, and only in a temp location — this
    // is the step most likely to throw (a template bug on unusual data, an
    // ENAMETOOLONG on a pathological slug), and it must fail before ANY
    // production file is touched. Only once every page has rendered
    // successfully do we write the other two outputs and swap the
    // directory in — never the other way around, or a render failure
    // partway through could leave exams.json/sitemap.xml pointing at a
    // directory that was never actually rebuilt to match.
    const tmpExamsDir = buildTempDir(EXAMS_DIR, (tmpDir) => {
      for (const exam of transformed) {
        const examDir = path.join(tmpDir, exam.slug);
        fs.mkdirSync(examDir, { recursive: true });
        fs.writeFileSync(path.join(examDir, 'index.html'), renderExamPage(exam, transformed), 'utf8');
      }
    });
    fs.mkdirSync(DATA_DIR, { recursive: true });
    atomicWriteFile(EXAMS_JSON_PATH, JSON.stringify(payload, null, 2));
    atomicWriteFile(SITEMAP_PATH, sitemapXml);
    swapInTempDir(EXAMS_DIR, tmpExamsDir);
  }

  // 6. Report.
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
