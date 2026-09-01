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

module.exports = { checkAllPublished, validatePublishSet };
