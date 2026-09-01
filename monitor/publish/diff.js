// Compares this run's transformed exams against the PREVIOUS publish's
// output (read before any write this run). Only a curated set of
// "interesting" fields are compared, not a full deep diff — a change to
// something cosmetic like notifTitle shouldn't show up as noise every run.
const INTERESTING_FIELDS = {
  status: 'Status',
  vacancies: 'Vacancy',
  applyStart: 'Apply start',
  applyEnd: 'Last date',
  examDateIso: 'Exam date',
  officialUrl: 'Official URL',
};

function computeDiff(previousExams, newExams) {
  const prevByCode = new Map((previousExams || []).map((e) => [e.code, e]));
  const newByCode = new Map(newExams.map((e) => [e.code, e]));
  const newlyAdded = [];
  const updated = [];
  const archived = [];

  for (const e of newExams) {
    const prev = prevByCode.get(e.code);
    if (!prev) {
      newlyAdded.push(e.code);
      continue;
    }
    const changedFields = Object.keys(INTERESTING_FIELDS).filter((f) => prev[f] !== e[f]);
    if (changedFields.length) {
      updated.push({ code: e.code, changedFields: changedFields.map((f) => INTERESTING_FIELDS[f]) });
    }
  }
  for (const code of prevByCode.keys()) {
    if (!newByCode.has(code)) archived.push(code);
  }

  return { newlyAdded, updated, archived };
}

module.exports = { computeDiff, INTERESTING_FIELDS };
