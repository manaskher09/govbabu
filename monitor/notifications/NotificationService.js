// The pipeline and the approval flow never talk to Telegram directly — they
// call notifyDetectedChange / notifyApprovedChange here, and this module
// decides whether a message is warranted and which provider(s) to use.
// Swapping or adding a provider (email, Slack, WhatsApp) means writing one
// more file shaped like TelegramProvider.js and adding it to PROVIDERS.
const TelegramProvider = require('./TelegramProvider');

const PROVIDERS = [TelegramProvider];

const FIELD_LABELS = {
  exam_date: 'Exam date changed',
  application_start_date: 'Application start date changed',
  application_end_date: 'Application deadline changed',
  vacancies: 'Vacancy count revised',
  application_fee: 'Application fee changed',
  __manual_review__: 'Notification changed — needs manual review',
  __unstructured_change__: 'Notification updated — worth a manual look',
};

function label(fieldName) {
  return FIELD_LABELS[fieldName] || `Field "${fieldName}" changed`;
}

function formatMessage(icon, exam, change) {
  return [
    `${icon} ${exam.name} Update`,
    label(change.field_name),
    `Previous: ${change.old_value ?? '(none)'}`,
    `New: ${change.new_value ?? '(none)'}`,
    change.classification ? `Status: ${change.classification}` : null,
    change.issues?.length ? `Flags: ${change.issues.join(', ')}` : null,
    `Source: ${change.evidence || 'official notification'}`,
  ].filter(Boolean).join('\n');
}

// Only these classifications ever generate an admin alert on detection.
// Explicitly excluded, per spec: rejected changes, parsing errors, source
// unavailable, and low-confidence/unverified suggestions (POSSIBLE_CHANGE).
const ALERTABLE_ON_DETECTION = new Set(['CONFIRMED_CHANGE', 'NEEDS_HUMAN_REVIEW']);

async function notifyDetectedChange(exam, change) {
  if (!ALERTABLE_ON_DETECTION.has(change.classification)) {
    return { status: 'skipped', reason: 'classification_not_alertable' };
  }
  const message = formatMessage('🔔', exam, change);
  return Promise.all(PROVIDERS.map((p) => p.sendAdmin(message)));
}

// Fires only from pipeline/applyApproval.js, i.e. only after a human
// approved the change — never for a rejection.
async function notifyApprovedChange(exam, change) {
  const message = formatMessage('✅', exam, change);
  return Promise.all(PROVIDERS.map((p) => p.sendPublic(message)));
}

module.exports = { notifyDetectedChange, notifyApprovedChange, formatMessage };
