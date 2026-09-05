// Safe-publish primitives.
//
// True single-syscall atomicity across ALL THREE published outputs
// (data/exams.json, sitemap.xml, exams/<slug>/) is not achievable on a
// plain filesystem: they are three independent top-level paths, and a
// filesystem rename() can only atomically swap ONE path at a time. Merging
// them under one directory would change the site's URL structure
// (sitemap.xml must stay at /sitemap.xml, exams at /exams/<slug>/), which
// the task explicitly requires preserving. A true all-or-nothing swap would
// need a deployment-level indirection layer (e.g. a `current` symlink the
// web server's document root resolves through) — that's a hosting/deploy
// decision outside this repo (there is no deployment config here at all)
// and would be new infrastructure, not a fix to this pipeline.
//
// What IS fully achievable, and what this module does: build the ENTIRE
// new site (all three outputs, in their final relative layout) into ONE
// staging directory first, so the single most failure-prone phase —
// rendering N pages, assembling the sitemap and JSON — completes and is
// validated as a whole BEFORE touching production at all. Only then does
// production get updated, via the smallest possible number of independent
// renames, performed back-to-back with no computation between them, in an
// order chosen so that if the process is interrupted mid-sequence, the live
// site is still fully self-consistent and functional — at worst briefly
// stale, never broken, never serving a torn/partial page. See
// swapStagedSite's comment for the exact ordering rationale.
const fs = require('fs');
const path = require('path');

function uniqueSuffix() {
  return `${process.pid}-${Date.now()}`;
}

// Phase 1: create a fresh staging directory (sibling of the real output
// paths, i.e. directly under repoRoot) and call `buildFn(stagingDir)` to
// populate it. `buildFn` is expected to write staging/data/exams.json,
// staging/sitemap.xml, and staging/exams/<slug>/index.html. On any
// failure — a template bug, an ENAMETOOLONG on a pathological slug — the
// staging directory is fully cleaned up and the error rethrown; nothing
// under repoRoot's real output paths is ever touched by this phase.
function buildStagedSite(repoRoot, buildFn) {
  const stagingDir = path.join(repoRoot, `.publish-staging-${uniqueSuffix()}`);
  fs.mkdirSync(stagingDir, { recursive: true });
  try {
    buildFn(stagingDir);
  } catch (err) {
    fs.rmSync(stagingDir, { recursive: true, force: true });
    throw err;
  }
  return stagingDir;
}

// Phase 2: move a single already-staged FILE into place. fs.renameSync
// replacing an existing file is atomic on POSIX filesystems — no temp/swap
// dance needed here, the "staging" already happened in phase 1.
function swapFile(stagedPath, targetPath) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.renameSync(stagedPath, targetPath);
}

// Moving a DIRECTORY over an existing one is different: POSIX rename()
// fails (ENOTEMPTY) if the destination directory already exists and isn't
// empty, unlike files. So an existing target is renamed aside first and
// only removed after the real swap succeeds — if that swap itself throws,
// the previous directory is restored so production is never left without a
// valid target.
function swapDir(stagedDir, targetDir) {
  if (!fs.existsSync(targetDir)) {
    fs.renameSync(stagedDir, targetDir);
    return;
  }
  const prevDir = `${targetDir}.prev-${uniqueSuffix()}`;
  fs.renameSync(targetDir, prevDir);
  try {
    fs.renameSync(stagedDir, targetDir);
  } catch (err) {
    fs.renameSync(prevDir, targetDir); // best-effort rollback
    throw err;
  }
  fs.rmSync(prevDir, { recursive: true, force: true });
}

// Phase 3: swap every staged output into its real location and remove the
// now-empty staging directory. Order matters — chosen so that if the
// process dies between two of these renames, the live site is still fully
// functional, just briefly stale in a low-impact way:
//
//   1. exams/     first — once this lands, every exam page a visitor can
//                 reach is already fully correct for the new publish.
//   2. data/applications.generated.js second — the other user-facing,
//                 immediately-consumed output: index.html/exams.html/
//                 calendar.html read this at page load to drive the
//                 interactive tool. Same urgency as exams/, so it swaps
//                 right after.
//   3. sitemap.xml third — worst case if interrupted here: the sitemap
//                 (still old) is missing a brand-new exam's URL, or still
//                 lists an archived one whose page briefly still exists
//                 from before this swap even started. Neither is a broken
//                 page — search engines re-crawl and self-correct.
//   4. data/exams.json last — nothing on the live site consumes this file
//                 yet, so its timing matters least of the four.
//
// The reverse order (json/sitemap first, exams/ last) is the one that
// actually risks a bad outcome: a crawler could follow a brand-new sitemap
// URL to an exam page that doesn't exist on disk yet (404), which is why
// exams/ — the highest-stakes, user-facing output — always goes first.
function swapStagedSite(stagingDir, targets) {
  swapDir(path.join(stagingDir, 'exams'), targets.examsDir);
  swapFile(path.join(stagingDir, 'data', 'applications.generated.js'), targets.applicationsJsPath);
  swapFile(path.join(stagingDir, 'sitemap.xml'), targets.sitemapPath);
  swapFile(path.join(stagingDir, 'data', 'exams.json'), targets.examsJsonPath);
  fs.rmSync(stagingDir, { recursive: true, force: true }); // staging/data/ dir itself, now empty
}

function discardStagedSite(stagingDir) {
  fs.rmSync(stagingDir, { recursive: true, force: true });
}

module.exports = { buildStagedSite, swapStagedSite, discardStagedSite };
