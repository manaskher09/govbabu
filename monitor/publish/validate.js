const fs = require('fs');
const path = require('path');
const { isValidIsoDate } = require('../validate/sanityChecks');

// Defense-in-depth: listCurrentExams already filters WHERE content_status =
// 'published' (see db/currentExam.js), so this should never actually catch
// anything in practice — it exists so a future refactor that accidentally
// bypasses that filter fails loudly here too, rather than silently
// publishing draft/unverified content.
function checkAllPublished(currentExams) {
  return currentExams
    .filter((e) => e.content_status !== 'published')
    .map((e) => `Exam ${e.code}: content_status is '${e.content_status}', not 'published'`);
}

// Only code/name/cat/slug are hard-required — matching what the live
// renderer (app.js's renderExamDetailPanel) already tolerates being absent
// for every other field (it shows a graceful placeholder, never breaks).
// applyEnd/officialUrl are validated for FORMAT only when present, never
// for presence, so real sparse exams aren't blocked from publishing.
function validatePublishSet(transformedExams) {
  const errors = [];
  const seenSlugs = new Map();
  const seenCodes = new Set();

  for (const e of transformedExams) {
    if (!e.code) errors.push(`Exam missing 'code'`);
    if (!e.name) errors.push(`Exam ${e.code || '?'}: missing 'name'`);
    if (!e.cat) errors.push(`Exam ${e.code || '?'}: missing 'cat'`);
    if (!e.slug) errors.push(`Exam ${e.code || '?'}: missing 'slug'`);
    // A pathologically long code (hence slug) would otherwise surface as a
    // raw ENAMETOOLONG filesystem error mid-render, well past validation —
    // catching it here keeps that failure mode a clean, reported one.
    if (e.slug && e.slug.length > 200) errors.push(`Exam ${e.code}: slug is too long (${e.slug.length} chars)`);

    if (e.slug && seenSlugs.has(e.slug)) {
      errors.push(`Duplicate slug '${e.slug}': ${seenSlugs.get(e.slug)} and ${e.code}`);
    } else if (e.slug) {
      seenSlugs.set(e.slug, e.code);
    }

    if (e.code && seenCodes.has(e.code)) {
      errors.push(`Duplicate code '${e.code}'`);
    } else if (e.code) {
      seenCodes.add(e.code);
    }

    for (const field of ['examDateIso', 'applicationStartDateIso', 'applicationEndDateIso']) {
      if (e[field] && !isValidIsoDate(e[field])) {
        errors.push(`Exam ${e.code}: malformed date in ${field}: '${e[field]}'`);
      }
    }

    if (e.officialUrl) {
      let ok = false;
      try {
        ok = /^https?:$/.test(new URL(e.officialUrl).protocol);
      } catch {
        ok = false;
      }
      if (!ok) errors.push(`Exam ${e.code}: malformed officialUrl '${e.officialUrl}'`);
    }
  }

  return { ok: errors.length === 0, errors };
}

// Validates the ACTUAL BUILT OUTPUT sitting in a staging directory, as a
// whole, before any of it is swapped into production — distinct from
// validatePublishSet, which validates the SOURCE data before generation
// even starts. This catches bugs in the generation step itself (a page
// that silently failed to write, a slug/directory mismatch) that source
// validation can't see because it never inspects what actually landed on
// disk.
function validateStagedSite(stagingDir, expectedExams) {
  const errors = [];

  const examsJsonPath = path.join(stagingDir, 'data', 'exams.json');
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(examsJsonPath, 'utf8'));
  } catch (err) {
    errors.push(`Staged data/exams.json is missing or not valid JSON: ${err.message}`);
    return { ok: false, errors };
  }
  if (!Array.isArray(parsed.exams) || parsed.exams.length !== expectedExams.length) {
    errors.push(`Staged data/exams.json has ${parsed.exams ? parsed.exams.length : 'no'} exams, expected ${expectedExams.length}`);
  }

  const sitemapPath = path.join(stagingDir, 'sitemap.xml');
  let sitemapXml = '';
  try {
    sitemapXml = fs.readFileSync(sitemapPath, 'utf8');
  } catch (err) {
    errors.push(`Staged sitemap.xml is missing: ${err.message}`);
  }
  const sitemapExamUrlCount = (sitemapXml.match(/<loc>https?:\/\/[^<]*\/exams\//g) || []).length;
  if (sitemapXml && sitemapExamUrlCount !== expectedExams.length) {
    errors.push(`Staged sitemap.xml references ${sitemapExamUrlCount} exam URLs, expected ${expectedExams.length}`);
  }

  const examsDir = path.join(stagingDir, 'exams');
  let onDiskSlugs = [];
  try {
    onDiskSlugs = fs.readdirSync(examsDir).sort();
  } catch (err) {
    errors.push(`Staged exams/ directory is missing: ${err.message}`);
  }
  const expectedSlugs = expectedExams.map((e) => e.slug).sort();
  if (onDiskSlugs.length && JSON.stringify(onDiskSlugs) !== JSON.stringify(expectedSlugs)) {
    const missing = expectedSlugs.filter((s) => !onDiskSlugs.includes(s));
    const unexpected = onDiskSlugs.filter((s) => !expectedSlugs.includes(s));
    if (missing.length) errors.push(`Staged exams/ is missing directories for: ${missing.join(', ')}`);
    if (unexpected.length) errors.push(`Staged exams/ has unexpected extra directories: ${unexpected.join(', ')}`);
  }
  for (const slug of onDiskSlugs) {
    const pagePath = path.join(examsDir, slug, 'index.html');
    let stat;
    try {
      stat = fs.statSync(pagePath);
    } catch {
      errors.push(`Staged exams/${slug}/index.html is missing`);
      continue;
    }
    if (stat.size === 0) errors.push(`Staged exams/${slug}/index.html is empty`);
  }

  const applicationsJsPath = path.join(stagingDir, 'data', 'applications.generated.js');
  let applicationsJsSrc = '';
  try {
    applicationsJsSrc = fs.readFileSync(applicationsJsPath, 'utf8');
  } catch (err) {
    errors.push(`Staged data/applications.generated.js is missing: ${err.message}`);
  }
  if (applicationsJsSrc) {
    const match = applicationsJsSrc.match(/const APPLICATIONS=(.*);\s*$/s);
    let parsedApplications;
    try {
      parsedApplications = match ? JSON.parse(match[1]) : null;
    } catch (err) {
      errors.push(`Staged data/applications.generated.js does not contain valid JSON: ${err.message}`);
    }
    if (!Array.isArray(parsedApplications) || parsedApplications.length !== expectedExams.length) {
      errors.push(
        `Staged data/applications.generated.js has ${parsedApplications ? parsedApplications.length : 'no'} exams, expected ${expectedExams.length}`
      );
    }
  }

  return { ok: errors.length === 0, errors };
}

module.exports = { checkAllPublished, validatePublishSet, validateStagedSite };
