// Converts a getCurrentExam() record into the exact object shape the
// frontend's APPLICATIONS array already uses (see app.js). This is the
// "frontend-compatible exam object" the spec's STEP 7 compatibility layer
// calls for — it lets the existing UI consume live data with zero changes
// to its rendering code, whenever it's wired up to fetch from the API
// instead of (or as an overlay on top of) the static array.
function formatVacancies(raw) {
  if (raw == null || raw === '') return undefined;
  const digits = String(raw).replace(/[^\d]/g, '');
  if (!digits) return String(raw); // already a display string (e.g. "25,000+") we can't safely reformat
  return Number(digits).toLocaleString('en-IN');
}

function toApplicationsShape(currentExam) {
  if (!currentExam) return null;
  const f = currentExam.fields;
  const tentative = f.tentative_next_json || {};
  return {
    code: currentExam.external_code || currentExam.code,
    name: currentExam.name,
    cat: currentExam.category,
    status: f.status || 'open',
    popularity: f.popularity != null ? Number(f.popularity) : undefined,
    vacancies: formatVacancies(f.vacancies),
    notifTitle: f.notif_title,
    applyStart: f.apply_start,
    applyEnd: f.apply_end,
    officialUrl: f.official_url,
    photo: f.photo_json || undefined,
    signature: f.signature_json || undefined,
    details: f.details_json || undefined,
    hi: f.hi_json || undefined,
    otherDocs: f.other_docs_json || undefined,
    results: f.results_json || undefined,
    tentativeNextMonth: tentative.month,
    tentativeNext: tentative.text,
    verified: f.verified,
    // Canonical machine fields the monitor actually tracks live, exposed
    // alongside the display strings above rather than replacing them.
    examDateIso: f.exam_date,
    applicationStartDateIso: f.application_start_date,
    applicationEndDateIso: f.application_end_date,
    lastUpdated: currentExam.updated_at,
  };
}

module.exports = { toApplicationsShape, formatVacancies };
