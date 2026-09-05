const fs = require('fs');
const os = require('os');
const path = require('path');
const test = require('node:test');
const assert = require('node:assert/strict');
const { slugify } = require('../publish/slug');
const { checkAllPublished, validatePublishSet, validateStagedSite } = require('../publish/validate');
const { computeDiff } = require('../publish/diff');
const { toApplicationsShape, toPublicPost } = require('../sync/toApplicationsShape');
const { getCurrentExam } = require('../db/currentExam');
const { createTestDb, seedExamWithSource } = require('./helpers');
const { renderExamPage, buildJsonLd } = require('../publish/render');
const { buildSitemap } = require('../publish/sitemap');
const { buildStagedSite, swapStagedSite } = require('../publish/atomicWrite');

// ---------- getCurrentExam posts/org_name extension ----------

test('getCurrentExam returns posts ordered by display_order, and org_name', () => {
  const db = createTestDb();
  const { examId } = seedExamWithSource(db);
  db.prepare(`UPDATE exams SET content_status = 'published' WHERE id = ?`).run(examId);
  db.prepare(`INSERT INTO posts (exam_id, post_name, display_order) VALUES (?, 'Second', 1)`).run(examId);
  db.prepare(`INSERT INTO posts (exam_id, post_name, display_order) VALUES (?, 'First', 0)`).run(examId);

  const exam = getCurrentExam(db, examId);
  assert.equal(exam.posts.length, 2);
  assert.equal(exam.posts[0].post_name, 'First');
  assert.equal(exam.posts[1].post_name, 'Second');
  assert.equal(exam.org_name, 'Test Org');
});

test('getCurrentExam returns an empty posts array for an exam with none', () => {
  const db = createTestDb();
  const { examId } = seedExamWithSource(db);
  db.prepare(`UPDATE exams SET content_status = 'published' WHERE id = ?`).run(examId);
  const exam = getCurrentExam(db, examId);
  assert.deepEqual(exam.posts, []);
});

// ---------- slugify ----------

test('slugify lowercases a clean code', () => {
  assert.equal(slugify('SSC-CGL'), 'ssc-cgl');
});

test('slugify is idempotent on an already-clean slug', () => {
  assert.equal(slugify(slugify('IBPS-CL')), slugify('IBPS-CL'));
});

test('slugify collapses unsafe characters and trims stray dashes', () => {
  assert.equal(slugify('SSC CGL (2027)!!'), 'ssc-cgl-2027');
});

// ---------- validatePublishSet ----------

function validExam(overrides = {}) {
  return { code: 'X', name: 'Exam X', cat: 'Central Govt', slug: 'x', ...overrides };
}

test('validatePublishSet accepts a minimal valid set', () => {
  const { ok, errors } = validatePublishSet([validExam()]);
  assert.equal(ok, true);
  assert.deepEqual(errors, []);
});

test('validatePublishSet catches a missing name', () => {
  const { ok, errors } = validatePublishSet([validExam({ name: undefined })]);
  assert.equal(ok, false);
  assert.ok(errors.some((e) => e.includes("missing 'name'")));
});

test('validatePublishSet catches duplicate slugs', () => {
  const { ok, errors } = validatePublishSet([validExam({ code: 'A' }), validExam({ code: 'B' })]);
  assert.equal(ok, false);
  assert.ok(errors.some((e) => e.includes('Duplicate slug')));
});

test('validatePublishSet catches a malformed ISO date', () => {
  const { ok, errors } = validatePublishSet([validExam({ examDateIso: '2027/01/01' })]);
  assert.equal(ok, false);
  assert.ok(errors.some((e) => e.includes('malformed date')));
});

test('validatePublishSet catches a malformed official URL', () => {
  const { ok, errors } = validatePublishSet([validExam({ officialUrl: 'not-a-url' })]);
  assert.equal(ok, false);
  assert.ok(errors.some((e) => e.includes('malformed officialUrl')));
});

test('validatePublishSet does not require applyEnd/officialUrl to be present', () => {
  const { ok } = validatePublishSet([validExam()]);
  assert.equal(ok, true);
});

// ---------- checkAllPublished ----------

test('checkAllPublished catches a non-published record', () => {
  const errors = checkAllPublished([{ code: 'A', content_status: 'published' }, { code: 'B', content_status: 'draft' }]);
  assert.equal(errors.length, 1);
  assert.ok(errors[0].includes('B'));
});

// ---------- computeDiff ----------

test('computeDiff reports everything as new on a first run', () => {
  const { newlyAdded, updated, archived } = computeDiff([], [validExam({ code: 'A' }), validExam({ code: 'B' })]);
  assert.deepEqual(newlyAdded.sort(), ['A', 'B']);
  assert.deepEqual(updated, []);
  assert.deepEqual(archived, []);
});

test('computeDiff flags each interesting field individually', () => {
  const prev = [validExam({ code: 'A', vacancies: '100', applyEnd: '1 Jan' })];
  const next = [validExam({ code: 'A', vacancies: '200', applyEnd: '1 Jan' })];
  const { updated } = computeDiff(prev, next);
  assert.equal(updated.length, 1);
  assert.deepEqual(updated[0].changedFields, ['Vacancy']);
});

test('computeDiff ignores changes to fields outside the curated list', () => {
  const prev = [validExam({ code: 'A', name: 'Old Name' })];
  const next = [validExam({ code: 'A', name: 'New Name' })];
  const { updated } = computeDiff(prev, next);
  assert.deepEqual(updated, []);
});

test('computeDiff reports a disappeared code as archived', () => {
  const prev = [validExam({ code: 'A' }), validExam({ code: 'B' })];
  const next = [validExam({ code: 'A' })];
  const { archived } = computeDiff(prev, next);
  assert.deepEqual(archived, ['B']);
});

// ---------- toApplicationsShape / toPublicPost (posts extension) ----------

test('toPublicPost maps DB row shape to camelCase, JSON-parsing category_breakdown', () => {
  const post = toPublicPost({
    post_name: 'Inspector', department: 'Income Tax', vacancies: 50, vacancies_display: null,
    qualification: 'Graduate', age_limit: '18-30', pay_level: 'Level 7', pay_band: '₹44,900–₹1,42,400',
    category_breakdown: '{"UR":10,"OBC":5}', notes: null,
  });
  assert.equal(post.postName, 'Inspector');
  assert.equal(post.vacancies, 50);
  assert.deepEqual(post.categoryBreakdown, { UR: 10, OBC: 5 });
  assert.equal(post.notes, undefined);
});

test('toApplicationsShape includes posts[] when the exam has post rows', () => {
  const currentExam = {
    code: 'X', name: 'Exam X', category: 'Central Govt', updated_at: '2026-01-01',
    fields: {}, org_name: 'Test Org',
    posts: [{ post_name: 'Clerk', vacancies: 10 }],
  };
  const shaped = toApplicationsShape(currentExam);
  assert.equal(shaped.posts.length, 1);
  assert.equal(shaped.posts[0].postName, 'Clerk');
  assert.equal(shaped.orgName, 'Test Org');
});

test('toApplicationsShape leaves posts undefined (not []) when there are no post rows', () => {
  const currentExam = { code: 'X', name: 'Exam X', category: 'Central Govt', updated_at: '2026-01-01', fields: {}, posts: [] };
  const shaped = toApplicationsShape(currentExam);
  assert.equal(shaped.posts, undefined);
});

// ---------- JSON-LD datePosted must be ISO-8601, never the free-text display string ----------

test('buildJsonLd converts a free-text verified date to ISO for datePosted', () => {
  const jsonLd = buildJsonLd({ code: 'X', name: 'Exam X', cat: 'Central Govt', slug: 'x', verified: '26 Aug 2026' });
  const jobPosting = JSON.parse(jsonLd.match(/<script type="application\/ld\+json">(.*?)<\/script>/)[1]);
  assert.equal(jobPosting.datePosted, '2026-08-26');
});

test('buildJsonLd omits datePosted entirely when verified does not parse as a date', () => {
  const jsonLd = buildJsonLd({ code: 'X', name: 'Exam X', cat: 'Central Govt', slug: 'x', verified: 'sometime last year' });
  const jobPosting = JSON.parse(jsonLd.match(/<script type="application\/ld\+json">(.*?)<\/script>/)[1]);
  assert.equal(jobPosting.datePosted, undefined);
});

// ---------- Security: JSON-LD <script> breakout ----------

test('a malicious exam name cannot break out of the JSON-LD <script> tag', () => {
  const evil = '</script><script>alert(document.cookie)</script>';
  const html = renderExamPage({ code: 'X', name: evil, cat: 'Central Govt', slug: 'x' }, []);
  // The literal sequence "</script>" must never appear anywhere except at
  // the two real, intentional closing tags this function emits.
  const scriptCloseCount = (html.match(/<\/script>/g) || []).length;
  assert.equal(scriptCloseCount, 4, 'expected exactly 4 real </script> tags (2 JSON-LD + applications.generated.js + app.js) — any more means the payload broke out');
  assert.ok(html.includes('\\u003cscript>alert'), 'the payload should survive escaped, inert, inside the JSON-LD string');
});

// ---------- Security: HTML injection via database content ----------

test('HTML-shaped content in exam fields is escaped, not executed, in the rendered page', () => {
  const exam = {
    code: 'X', name: 'Exam <img src=x onerror=alert(1)>', cat: '<b>Cat</b>', slug: 'x',
    officialUrl: 'https://example.gov.in/notice.pdf',
    details: { eligibility: { age: '<script>alert(2)</script>', qualification: 'Grad' } },
  };
  const html = renderExamPage(exam, []);
  assert.ok(!html.includes('<img src=x onerror=alert(1)>'), 'exam name must be escaped');
  assert.ok(!html.includes('<script>alert(2)</script>'), 'nested field content must be escaped');
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
});

test('a javascript: officialUrl is rejected by validation before it ever reaches the page template', () => {
  const { ok, errors } = validatePublishSet([{ code: 'X', name: 'X', cat: 'Y', slug: 'x', officialUrl: 'javascript:alert(1)' }]);
  assert.equal(ok, false);
  assert.ok(errors.some((e) => e.includes('malformed officialUrl')));
});

test('a data: officialUrl is rejected by validation', () => {
  const { ok } = validatePublishSet([{ code: 'X', name: 'X', cat: 'Y', slug: 'x', officialUrl: 'data:text/html,<script>alert(1)</script>' }]);
  assert.equal(ok, false);
});

// ---------- Security: path traversal via slug ----------

test('slugify never produces a value capable of path traversal, for a range of adversarial codes', () => {
  const adversarial = ['../../etc/passwd', '..\\..\\windows', '/etc/passwd', '....//....//etc', 'a/../../b', '~/.ssh/id_rsa'];
  for (const code of adversarial) {
    const slug = slugify(code);
    assert.ok(!slug.includes('..'), `slug for "${code}" must not contain ".."; got "${slug}"`);
    assert.ok(!slug.includes('/') && !slug.includes('\\'), `slug for "${code}" must not contain a path separator; got "${slug}"`);
    assert.ok(!path.isAbsolute(slug), `slug for "${code}" must not be an absolute path; got "${slug}"`);
  }
});

test('an empty-after-slugify code is caught by validation, not silently written to the exams-root itself', () => {
  const { ok, errors } = validatePublishSet([{ code: '###', name: 'X', cat: 'Y', slug: slugify('###') }]);
  assert.equal(ok, false);
  assert.ok(errors.some((e) => e.includes("missing 'slug'")));
});

test('a pathologically long code is rejected with a clean validation error, not a filesystem crash', () => {
  const longCode = 'X'.repeat(300);
  const { ok, errors } = validatePublishSet([{ code: longCode, name: 'X', cat: 'Y', slug: slugify(longCode) }]);
  assert.equal(ok, false);
  assert.ok(errors.some((e) => e.includes('too long')));
});

test('Unicode-only codes collapse to an empty slug rather than crashing or producing unsafe output', () => {
  assert.equal(slugify('परीक्षा'), '');
  assert.equal(slugify('SSC-परीक्षा-2027'), 'ssc-2027');
});

test('two different codes that collapse to the same slug are caught as a duplicate, not silently overwritten', () => {
  const { ok, errors } = validatePublishSet([
    { code: 'SSC CGL', name: 'A', cat: 'Y', slug: slugify('SSC CGL') },
    { code: 'SSC--CGL', name: 'B', cat: 'Y', slug: slugify('SSC--CGL') },
  ]);
  assert.equal(ok, false);
  assert.ok(errors.some((e) => e.includes('Duplicate slug')));
});

// ---------- Publish safety: staged-site build-before-touch ----------

test('buildStagedSite failing never touches production, and cleans up its own staging dir', () => {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'govbabu-staged-test-'));
  const examsDir = path.join(repoRoot, 'exams');
  fs.mkdirSync(examsDir);
  fs.writeFileSync(path.join(examsDir, 'sentinel.txt'), 'previous good content');

  assert.throws(() => {
    buildStagedSite(repoRoot, () => {
      throw new Error('simulated render failure');
    });
  }, /simulated render failure/);

  assert.equal(fs.readFileSync(path.join(examsDir, 'sentinel.txt'), 'utf8'), 'previous good content');
  const entries = fs.readdirSync(repoRoot);
  assert.deepEqual(entries, ['exams'], 'no .publish-staging- directory should be left behind');
  fs.rmSync(repoRoot, { recursive: true, force: true });
});

test('a full staged publish replaces all four outputs, in the documented safe order, leaving no staging residue', () => {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'govbabu-staged-test-'));
  const examsDir = path.join(repoRoot, 'exams');
  const sitemapPath = path.join(repoRoot, 'sitemap.xml');
  const examsJsonPath = path.join(repoRoot, 'data', 'exams.json');
  const applicationsJsPath = path.join(repoRoot, 'data', 'applications.generated.js');
  fs.mkdirSync(examsDir);
  fs.writeFileSync(path.join(examsDir, 'old-only.txt'), 'stale, must be gone after swap');
  fs.writeFileSync(sitemapPath, 'OLD SITEMAP');
  fs.mkdirSync(path.dirname(examsJsonPath), { recursive: true });
  fs.writeFileSync(examsJsonPath, 'OLD JSON');
  fs.writeFileSync(applicationsJsPath, 'OLD APPLICATIONS JS');

  const stagingDir = buildStagedSite(repoRoot, (staging) => {
    fs.mkdirSync(path.join(staging, 'exams', 'ssc-cgl'), { recursive: true });
    fs.writeFileSync(path.join(staging, 'exams', 'ssc-cgl', 'index.html'), '<html>new page</html>');
    fs.writeFileSync(path.join(staging, 'sitemap.xml'), 'NEW SITEMAP');
    fs.mkdirSync(path.join(staging, 'data'), { recursive: true });
    fs.writeFileSync(path.join(staging, 'data', 'exams.json'), 'NEW JSON');
    fs.writeFileSync(path.join(staging, 'data', 'applications.generated.js'), 'NEW APPLICATIONS JS');
  });
  swapStagedSite(stagingDir, { examsDir, sitemapPath, examsJsonPath, applicationsJsPath });

  assert.deepEqual(fs.readdirSync(examsDir), ['ssc-cgl'], 'the old exams/ contents must be fully replaced, not merged');
  assert.equal(fs.readFileSync(sitemapPath, 'utf8'), 'NEW SITEMAP');
  assert.equal(fs.readFileSync(examsJsonPath, 'utf8'), 'NEW JSON');
  assert.equal(fs.readFileSync(applicationsJsPath, 'utf8'), 'NEW APPLICATIONS JS');
  const rootEntries = fs.readdirSync(repoRoot);
  assert.ok(!rootEntries.some((e) => e.includes('.publish-staging-') || e.includes('.prev-')), 'no staging or rollback residue should remain after a successful publish');
  fs.rmSync(repoRoot, { recursive: true, force: true });
});

test('the full end-to-end publish transaction: if the staged build fails, ALL THREE production outputs are byte-for-byte untouched', () => {
  // This is the exact scenario Issue 1 was about: prove that a failure
  // partway through generation can never leave exams.json/sitemap.xml
  // updated while exams/ (or vice versa) is stale — because with the
  // staged-site design, nothing under production is written until AFTER
  // the entire new site has been built and validated as a whole.
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'govbabu-staged-test-'));
  const examsDir = path.join(repoRoot, 'exams');
  const sitemapPath = path.join(repoRoot, 'sitemap.xml');
  const examsJsonPath = path.join(repoRoot, 'data', 'exams.json');
  fs.mkdirSync(examsDir);
  fs.writeFileSync(path.join(examsDir, 'sentinel.txt'), 'old exams content');
  fs.writeFileSync(sitemapPath, 'OLD SITEMAP');
  fs.mkdirSync(path.dirname(examsJsonPath), { recursive: true });
  fs.writeFileSync(examsJsonPath, 'OLD JSON');
  const beforeMtimes = [examsDir, sitemapPath, examsJsonPath].map((p) => fs.statSync(p).mtimeMs);

  assert.throws(() => {
    buildStagedSite(repoRoot, (staging) => {
      fs.mkdirSync(path.join(staging, 'exams', 'ssc-cgl'), { recursive: true });
      fs.writeFileSync(path.join(staging, 'exams', 'ssc-cgl', 'index.html'), 'partial page 1 of 2');
      // Simulate the SECOND page in a multi-exam batch failing mid-render —
      // exactly the scenario that used to leave production inconsistent.
      throw new Error('simulated failure rendering exam 2 of 2');
    });
  }, /simulated failure/);

  const afterMtimes = [examsDir, sitemapPath, examsJsonPath].map((p) => fs.statSync(p).mtimeMs);
  assert.deepEqual(afterMtimes, beforeMtimes, 'no production path may be touched when the staged build fails partway through');
  assert.equal(fs.readFileSync(path.join(examsDir, 'sentinel.txt'), 'utf8'), 'old exams content');
  assert.equal(fs.readFileSync(sitemapPath, 'utf8'), 'OLD SITEMAP');
  assert.equal(fs.readFileSync(examsJsonPath, 'utf8'), 'OLD JSON');
  fs.rmSync(repoRoot, { recursive: true, force: true });
});

// ---------- validateStagedSite: catches a bad BUILD, not just bad source data ----------

test('validateStagedSite catches a staged exams/ directory whose exam count does not match the expected set', () => {
  const stagingDir = fs.mkdtempSync(path.join(os.tmpdir(), 'govbabu-staged-validate-'));
  fs.mkdirSync(path.join(stagingDir, 'data'), { recursive: true });
  fs.writeFileSync(path.join(stagingDir, 'data', 'exams.json'), JSON.stringify({ exams: [{ code: 'A' }] }));
  fs.writeFileSync(path.join(stagingDir, 'sitemap.xml'), '<urlset></urlset>');
  fs.mkdirSync(path.join(stagingDir, 'exams', 'a'), { recursive: true });
  fs.writeFileSync(path.join(stagingDir, 'exams', 'a', 'index.html'), '<html>a</html>');

  const { ok, errors } = validateStagedSite(stagingDir, [{ code: 'A', slug: 'a' }, { code: 'B', slug: 'b' }]);
  assert.equal(ok, false);
  assert.ok(errors.some((e) => e.includes('missing directories for: b')));
  fs.rmSync(stagingDir, { recursive: true, force: true });
});

test('validateStagedSite catches an empty generated page', () => {
  const stagingDir = fs.mkdtempSync(path.join(os.tmpdir(), 'govbabu-staged-validate-'));
  fs.mkdirSync(path.join(stagingDir, 'data'), { recursive: true });
  fs.writeFileSync(path.join(stagingDir, 'data', 'exams.json'), JSON.stringify({ exams: [{ code: 'A' }] }));
  fs.writeFileSync(path.join(stagingDir, 'sitemap.xml'), '<urlset><url><loc>https://x/exams/a/</loc></url></urlset>');
  fs.mkdirSync(path.join(stagingDir, 'exams', 'a'), { recursive: true });
  fs.writeFileSync(path.join(stagingDir, 'exams', 'a', 'index.html'), '');

  const { ok, errors } = validateStagedSite(stagingDir, [{ code: 'A', slug: 'a' }]);
  assert.equal(ok, false);
  assert.ok(errors.some((e) => e.includes('is empty')));
  fs.rmSync(stagingDir, { recursive: true, force: true });
});

test('validateStagedSite accepts a correctly-built staged site', () => {
  const stagingDir = fs.mkdtempSync(path.join(os.tmpdir(), 'govbabu-staged-validate-'));
  fs.mkdirSync(path.join(stagingDir, 'data'), { recursive: true });
  fs.writeFileSync(path.join(stagingDir, 'data', 'exams.json'), JSON.stringify({ exams: [{ code: 'A' }] }));
  fs.writeFileSync(path.join(stagingDir, 'sitemap.xml'), '<urlset><url><loc>https://x/exams/a/</loc></url></urlset>');
  fs.mkdirSync(path.join(stagingDir, 'exams', 'a'), { recursive: true });
  fs.writeFileSync(path.join(stagingDir, 'exams', 'a', 'index.html'), '<html>real content</html>');
  fs.writeFileSync(path.join(stagingDir, 'data', 'applications.generated.js'), `const APPLICATIONS=${JSON.stringify([{ code: 'A' }])};\n`);

  const { ok, errors } = validateStagedSite(stagingDir, [{ code: 'A', slug: 'a' }]);
  assert.deepEqual(errors, []);
  assert.equal(ok, true);
  fs.rmSync(stagingDir, { recursive: true, force: true });
});

test('validateStagedSite catches an applications.generated.js exam count mismatch', () => {
  const stagingDir = fs.mkdtempSync(path.join(os.tmpdir(), 'govbabu-staged-validate-'));
  fs.mkdirSync(path.join(stagingDir, 'data'), { recursive: true });
  fs.writeFileSync(path.join(stagingDir, 'data', 'exams.json'), JSON.stringify({ exams: [{ code: 'A' }] }));
  fs.writeFileSync(path.join(stagingDir, 'sitemap.xml'), '<urlset><url><loc>https://x/exams/a/</loc></url></urlset>');
  fs.mkdirSync(path.join(stagingDir, 'exams', 'a'), { recursive: true });
  fs.writeFileSync(path.join(stagingDir, 'exams', 'a', 'index.html'), '<html>real content</html>');
  fs.writeFileSync(path.join(stagingDir, 'data', 'applications.generated.js'), `const APPLICATIONS=${JSON.stringify([])};\n`);

  const { ok, errors } = validateStagedSite(stagingDir, [{ code: 'A', slug: 'a' }]);
  assert.equal(ok, false);
  assert.ok(errors.some((e) => e.includes('applications.generated.js has 0 exams, expected 1')));
  fs.rmSync(stagingDir, { recursive: true, force: true });
});

// ---------- Idempotency: no wall-clock in generated content ----------

test('renderExamPage output is byte-identical across two calls with identical input (no hidden wall-clock dependency)', () => {
  const exam = { code: 'X', name: 'Exam X', cat: 'Central Govt', slug: 'x', verified: '01 Sep 2026' };
  const html1 = renderExamPage(exam, []);
  const html2 = renderExamPage(exam, []);
  assert.equal(html1, html2);
  assert.ok(!html1.includes(String(new Date().getFullYear() + 1)), 'no dynamically-computed future year should leak in from a live Date() call');
});

test('buildSitemap output is deterministic for identical input (no generatedAt parameter)', () => {
  const exams = [{ slug: 'ssc-cgl', lastUpdated: '2026-01-01 00:00:00' }];
  assert.equal(buildSitemap(exams), buildSitemap(exams));
});

test('static pages in the sitemap omit lastmod rather than claiming a fabricated "changed today"', () => {
  const xml = buildSitemap([{ slug: 'ssc-cgl', lastUpdated: '2026-01-01 00:00:00' }]);
  const indexBlock = xml.split('<url>')[1];
  assert.ok(!indexBlock.includes('<lastmod>'), 'a static page with no real content-modification date must not get a fabricated lastmod');
});

test('an exam page in the sitemap uses its real, content-derived lastUpdated date', () => {
  const xml = buildSitemap([{ slug: 'ssc-cgl', lastUpdated: '2026-03-15 12:00:00' }]);
  assert.ok(xml.includes('<lastmod>2026-03-15</lastmod>'));
});

// ---------- Sitemap correctness ----------

test('sitemap only contains the exams it was given, plus the fixed static pages, all as absolute canonical URLs', () => {
  const xml = buildSitemap([{ slug: 'ssc-cgl', lastUpdated: '2026-01-01 00:00:00' }]);
  assert.ok(xml.includes('<loc>https://www.govbabu.com/exams/ssc-cgl/</loc>'));
  assert.ok(xml.includes('<loc>https://www.govbabu.com/index.html</loc>'));
  // Every <loc> entry specifically must be https — the xmlns namespace
  // declaration is separately, correctly, the standard sitemaps.org
  // protocol URI, which really is http:// per spec; that's not a bug.
  const locs = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  assert.ok(locs.length > 0);
  assert.ok(locs.every((l) => l.startsWith('https://www.govbabu.com/')), 'every <loc> must be an absolute https canonical URL');
});

test('sitemap XML-escapes any special characters in a URL', () => {
  const xml = buildSitemap([{ slug: 'a&b', lastUpdated: '2026-01-01' }]);
  assert.ok(xml.includes('a&amp;b'));
  assert.ok(!xml.includes('a&b/'));
});
