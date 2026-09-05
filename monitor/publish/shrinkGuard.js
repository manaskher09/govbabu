// Guards against publishing a set that would delete real, live exam pages
// the database doesn't know about. computeDiff (publish/diff.js) only ever
// compares against THIS pipeline's own prior manifest (data/exams.json), so
// it's blind to anything that landed under exams/ by some other means — and
// that has actually happened: a one-off script once wrote 25+ exam folders
// straight from app.js, with no DB row behind them at all. This checks the
// real filesystem instead: if publishing would shrink the live directory by
// more than DROP_THRESHOLD, something upstream is almost certainly missing
// exams from the DB, not intentionally retiring them.
const fs = require('fs');

const DROP_THRESHOLD = 0.1;

function countExistingExamDirs(examsDir) {
  try {
    return fs.readdirSync(examsDir, { withFileTypes: true }).filter((d) => d.isDirectory()).length;
  } catch {
    return 0; // no exams/ dir yet -> nothing to protect
  }
}

/**
 * @returns {string|null} an error message if publishing should be refused, else null
 */
function checkNoUnexpectedShrinkage(examsDir, newCount) {
  const existingCount = countExistingExamDirs(examsDir);
  if (existingCount === 0) return null; // first-ever publish
  if (newCount >= existingCount * (1 - DROP_THRESHOLD)) return null;
  return (
    `Refusing to publish: this would shrink exams/ from ${existingCount} folders to ${newCount} ` +
    `(a drop of more than ${DROP_THRESHOLD * 100}%). The live directory has exams the database ` +
    `doesn't know about yet — import them first (see monitor/scripts/import-existing-exams.js) ` +
    `rather than letting a publish delete their pages.`
  );
}

module.exports = { checkNoUnexpectedShrinkage, countExistingExamDirs, DROP_THRESHOLD };
