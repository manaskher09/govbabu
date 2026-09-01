// Safe-publish primitives: build everything in a temp location, validate,
// and only then atomically swap it into place. fs.renameSync is atomic as
// long as source and destination share a filesystem/mount, which is
// guaranteed here since every temp path is a sibling of its real target.
const fs = require('fs');
const path = require('path');

function tempSiblingPath(targetPath) {
  return `${targetPath}.tmp-${process.pid}-${Date.now()}`;
}

// Writes `content` to a temp sibling of `targetPath`, then renames it over
// the real target. Caller is responsible for validating `content` BEFORE
// calling this — this function performs the swap only, no validation.
function atomicWriteFile(targetPath, content) {
  const tmp = tempSiblingPath(targetPath);
  fs.writeFileSync(tmp, content, 'utf8');
  fs.renameSync(tmp, targetPath);
}

// Directory-tree version, split into two phases so a CALLER can build every
// other output (single files, via atomicWriteFile) only after the directory
// build has *already proven it works*, and swap the directory in last. That
// ordering matters: if any single step in a multi-output publish can throw
// (template bugs on unusual data, disk errors, ENAMETOOLONG on a pathological
// slug), doing the most failure-prone work FIRST — before anything in
// production is touched — is what keeps a partial failure from leaving
// production in a mixed old/new state (e.g. a new sitemap.xml pointing at
// exam pages an aborted directory build never created).

// Phase 1: populate a fresh temp directory (sibling of `targetDir`) via
// `buildFn(tmpDir)`. Throws (and cleans up the temp dir) on failure; touches
// nothing under `targetDir` either way. Returns the temp dir's path for
// `swapInTempDir`.
function buildTempDir(targetDir, buildFn) {
  const parent = path.dirname(targetDir);
  const base = path.basename(targetDir);
  const tmpDir = path.join(parent, `${base}.tmp-${process.pid}-${Date.now()}`);
  fs.mkdirSync(tmpDir, { recursive: true });
  try {
    buildFn(tmpDir);
  } catch (err) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    throw err;
  }
  return tmpDir;
}

// Phase 2: swap an already-built temp directory (from buildTempDir) in for
// `targetDir`. If `targetDir` already exists, it's renamed aside first and
// only removed after the swap succeeds — if the swap itself throws, the
// previous directory is restored so production is never left without a
// valid target.
function swapInTempDir(targetDir, tmpDir) {
  if (!fs.existsSync(targetDir)) {
    fs.renameSync(tmpDir, targetDir);
    return;
  }
  const parent = path.dirname(targetDir);
  const base = path.basename(targetDir);
  const prevDir = path.join(parent, `${base}.prev-${process.pid}-${Date.now()}`);
  fs.renameSync(targetDir, prevDir);
  try {
    fs.renameSync(tmpDir, targetDir);
  } catch (err) {
    // Best-effort rollback: put the previous good directory back so
    // production is never left in a broken/missing state.
    fs.renameSync(prevDir, targetDir);
    throw err;
  }
  fs.rmSync(prevDir, { recursive: true, force: true });
}

module.exports = { atomicWriteFile, buildTempDir, swapInTempDir, tempSiblingPath };
