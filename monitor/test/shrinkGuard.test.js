const fs = require('fs');
const os = require('os');
const path = require('path');
const test = require('node:test');
const assert = require('node:assert/strict');
const { checkNoUnexpectedShrinkage } = require('../publish/shrinkGuard');

function makeExamsDir(count) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'govbabu-shrinkguard-'));
  for (let i = 0; i < count; i++) fs.mkdirSync(path.join(dir, `exam-${i}`));
  return dir;
}

test('allows the first-ever publish when exams/ does not exist yet', () => {
  const missingDir = path.join(os.tmpdir(), 'govbabu-shrinkguard-does-not-exist');
  assert.equal(checkNoUnexpectedShrinkage(missingDir, 5), null);
});

test('allows publishing the same or a larger exam count', () => {
  const dir = makeExamsDir(27);
  assert.equal(checkNoUnexpectedShrinkage(dir, 27), null);
  assert.equal(checkNoUnexpectedShrinkage(dir, 40), null);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('allows a small drop under the threshold', () => {
  const dir = makeExamsDir(53);
  assert.equal(checkNoUnexpectedShrinkage(dir, 49), null); // ~7.5% drop
  fs.rmSync(dir, { recursive: true, force: true });
});

test('refuses a publish that would delete a large fraction of live exam pages', () => {
  const dir = makeExamsDir(53);
  const error = checkNoUnexpectedShrinkage(dir, 27); // the exact real-world regression
  assert.ok(error, 'expected a refusal error message');
  assert.match(error, /53 folders to 27/);
  fs.rmSync(dir, { recursive: true, force: true });
});
