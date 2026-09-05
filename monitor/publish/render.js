// Generates one static, SEO-ready HTML page per published exam. Markup for
// the header/footer/detail cards is copied from the real site's own
// index.html / app.js (renderExamDetailPanel) so a generated page looks and
// reads identically to the live client-rendered version — the difference is
// this content is already IN the HTML, not injected by JS after load.
//
// This file is loaded by monitor/bin/publish.js, which lives inside the
// monitor/ package, but every generated page is served from the SITE root
// (https://www.govbabu.com/exams/<slug>/), so every href here is
// root-relative (/styles.css, /exams.html, ...), never relative to this
// script's own location.

const { normalizeDate } = require('../extract/fields');

const SITE_ORIGIN = 'https://www.govbabu.com';

function esc(s) {
  return (s ?? '').toString().replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Verbatim copy of index.html's <header>, with every href made root-relative.
const SITE_HEADER = `
<a href="/index.html#main" class="skip-link">Skip to main content</a>
<div class="gov-bar"><div class="wrap"><span class="gov-bar-clock" id="govClock"></span></div></div>
<div class="tricolor-strip"><span></span><span></span><span></span></div>
<header class="site-header">
  <div class="header-inner">
    <a href="/index.html" class="brand"><span class="brand-mark"><svg viewBox="0 0 46 46" fill="none"><rect x="8" y="24" width="28" height="18" rx="5" stroke="var(--brand)" stroke-width="3.4"/><path d="M14 24V16A8 8 0 0 1 30 16" stroke="var(--brand)" stroke-width="3.4" stroke-linecap="round"/><path d="M32 14L40 10" stroke="var(--accent)" stroke-width="3" stroke-linecap="round"/><path d="M32 19L38 17" stroke="var(--accent)" stroke-width="3" stroke-linecap="round"/><path d="M8 31Q20 39 35 26" stroke="var(--accent)" stroke-width="3" stroke-linecap="round"/></svg></span>GovBabu</a>
    <div class="header-actions">
      <nav class="header-nav" id="headerNav"><a href="/index.html" class="btn btn-outline btn-sm">Home</a>
      <a href="/exams.html" class="btn btn-outline btn-sm" aria-current="page">Find Your Exam</a>
      <a href="/calendar.html" class="btn btn-outline btn-sm">Calendar</a>
      <a href="/manjusha.html" class="btn btn-outline btn-sm">Downloads</a>
      <a href="/tools.html" class="btn btn-outline btn-sm">Tools</a>
      <div class="nav-more" id="navMore"><button type="button" class="btn btn-outline btn-sm nav-more-btn" id="navMoreBtn" aria-haspopup="true" aria-expanded="false">More</button>
      <div class="nav-more-menu" id="navMoreMenu" role="menu"><a href="/about.html" role="menuitem">About</a>
      <a href="/contact.html" role="menuitem">Contact</a>
      <a href="/privacy.html" role="menuitem">Privacy Policy</a></div></div></nav>
      <button class="icon-btn lang-toggle" id="langToggle" aria-label="Change language" title="भाषा बदलें / Change language"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true"><rect x="2" y="4" width="13" height="13" rx="3" stroke="var(--brand)" stroke-width="1.6"/><text x="8.5" y="14" font-size="9" font-weight="700" text-anchor="middle" fill="var(--brand)" font-family="Arial, sans-serif">A</text><rect x="9" y="9" width="13" height="13" rx="3" fill="var(--surface)" stroke="var(--accent)" stroke-width="1.6"/><text x="15.5" y="19" font-size="9" font-weight="700" text-anchor="middle" fill="var(--accent)" font-family="Arial, sans-serif">अ</text></svg></button>
      <button class="theme-toggle" id="themeToggle" type="button" aria-label="Toggle dark mode" aria-pressed="false"><span class="theme-toggle-track"><span class="theme-toggle-thumb"></span></span></button>
      <button class="icon-btn nav-toggle" id="navToggle" type="button" aria-label="Menu" aria-expanded="false"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="var(--ink)" stroke-width="2" stroke-linecap="round"/></svg></button>
    </div>
  </div>
</header>`;

// Verbatim copy of index.html's <footer>, root-relative hrefs.
const SITE_FOOTER = `
<footer class="site-footer">
  <div class="wrap footer-cols">
    <div class="footer-col footer-col-brand">
      <div class="footer-brand">GovBabu</div>
      <p class="footer-tagline">Simple exam information for Indian aspirants.</p>
    </div>
    <div class="footer-col">
      <div class="footer-col-title">Explore</div>
      <a href="/index.html">Home</a>
      <a href="/exams.html">Find Your Exam</a>
      <a href="/calendar.html">Calendar</a>
      <a href="/manjusha.html">Downloads</a>
      <a href="/tools.html">Tools</a>
    </div>
    <div class="footer-col">
      <div class="footer-col-title">Company</div>
      <a href="/about.html">About</a>
      <a href="/contact.html">Contact</a>
      <a href="/privacy.html">Privacy Policy</a>
      <a href="/terms.html">Terms of Use</a>
      <a href="/disclaimer.html">Disclaimer</a>
    </div>
    <div class="footer-col">
      <div class="footer-col-title">Connect</div>
      <a href="https://t.me/GovBabu_official" target="_blank" rel="noopener">Telegram</a>
      <a href="https://www.youtube.com/@GovBabu_official" target="_blank" rel="noopener">YouTube</a>
      <a href="https://www.instagram.com/govbabu_official" target="_blank" rel="noopener">Instagram</a>
    </div>
  </div>
  <div class="wrap footer-bottom">
    <p class="disclaimer">GovBabu is an independent tool and is not affiliated with UPSC, SSC, IBPS, Railway, BPSC or any government body.</p>
    <p class="footer-copyright">© 2026 GovBabu. All Rights Reserved.</p>
  </div>
</footer>
<script src="/data/applications.generated.js" defer></script>
<script src="/app.js" defer></script>`;

function renderFieldValue(v) {
  if (Array.isArray(v)) return `<ul>${v.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
  return `<span>${esc(v)}</span>`;
}

function renderPromotion(p) {
  if (!p) return '';
  if (typeof p === 'string') return `<p>${esc(p)}</p>`;
  let html = '';
  if (p.caveat) html += `<p class="promotion-caveat">${esc(p.caveat)}</p>`;
  if (p.steps && p.steps.length) html += `<ul class="promotion-steps">${p.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>`;
  return html;
}

// Every field here already exists on every published exam (applyStart/
// applyEnd/verified are required by validatePublishSet) — never a fee or
// exam-date/admit-card/result-date row, since GovBabu doesn't track those
// yet and this site's whole premise is sourced data, not a guessed number.
function renderImportantDates(exam, details) {
  const rows = [];
  if (exam.applyStart) rows.push(['Apply Start', exam.applyStart]);
  if (exam.applyEnd) rows.push([exam.status === 'open' ? 'Apply Last Date' : 'Applications Closed', exam.applyEnd]);
  if (details.correctionWindow) rows.push(['Correction Window', details.correctionWindow]);
  if (exam.examDate) rows.push(['Exam Date', exam.examDate]);
  if (exam.admitCardDate) rows.push(['Admit Card', exam.admitCardDate]);
  if (exam.results && exam.results.stage) rows.push(['Result', exam.results.stage + (exam.results.date ? ' — ' + exam.results.date : '')]);
  if (exam.verified) rows.push(['Last Verified', exam.verified]);
  if (!rows.length) return '';
  return `<div class="detail-card detail-card-wide"><h4>Important Dates</h4><div class="dates-table">${rows
    .map(([label, value]) => `<div class="dates-row"><span class="dates-label">${esc(label)}</span><span class="dates-value">${esc(value)}</span></div>`)
    .join('')}</div></div>`;
}

// Structured posts[] (new admin-created exams) if present, else the legacy
// free-text details.payGroups (imported exams) — never both, since real
// data never has both populated for the same exam today (see publish/
// render.js's header comment / the Phase 2 plan for the fallback rationale).
function renderPostsAndPay(exam, details) {
  if (exam.posts && exam.posts.length) {
    const rows = exam.posts
      .map((p) => {
        const vac = p.vacancies != null ? String(p.vacancies) : p.vacanciesDisplay || '';
        const bits = [p.department, p.qualification, p.ageLimit].filter(Boolean).map(esc).join(' · ');
        const pay = [p.payLevel, p.payBand].filter(Boolean).map(esc).join(' · ');
        return `<div class="pay-group"><b>${esc(p.postName)}${vac ? ' — ' + esc(vac) + ' vacancies' : ''}</b>${pay ? `<span>${pay}</span>` : ''}${bits ? `<span>${bits}</span>` : ''}</div>`;
      })
      .join('');
    return `<div class="detail-card"><h4>Posts &amp; Pay</h4>${rows}</div>`;
  }
  if (details.payGroups) {
    const rows = details.payGroups.map((g) => `<div class="pay-group"><b>${esc(g.level)} · ${esc(g.band)}</b><span>${esc(g.posts)}</span></div>`).join('');
    const note = details.payNote ? `<p class="detail-footnote">${esc(details.payNote)}</p>` : '';
    return `<div class="detail-card"><h4>Posts &amp; Pay</h4>${rows}${note}</div>`;
  }
  return '';
}

// Mirrors app.js's specLine() — a compact "dims · size · format" line for a
// photo/signature/other-document spec.
function specLine(spec) {
  if (!spec) return '';
  const parts = [];
  if (spec.dims) parts.push(spec.dims);
  if (spec.minKB || spec.maxKB) parts.push(`${spec.minKB ? spec.minKB + '–' : ''}${spec.maxKB || '?'} KB`);
  if (spec.format) parts.push(spec.format);
  return esc(parts.join(' · '));
}

// The site's clearest differentiator (exact photo/signature specs, backed by
// a real in-browser resize tool) was previously invisible on the static SEO
// page — only reachable via the interactive upload flow on index.html. This
// surfaces the same real spec data as its own reference card, so a visitor
// (or a search snippet) sees it without needing to start the tool.
function renderDocumentSpecs(exam) {
  const rows = [];
  if (exam.photo) rows.push(['Photo', exam.photo]);
  if (exam.signature) rows.push(['Signature', exam.signature]);
  (exam.otherDocs || []).filter((o) => o.spec).forEach((o) => rows.push([o.label, o.spec]));
  if (!rows.length) return '';
  return `<div class="detail-card detail-card-wide"><h4>Document Requirements</h4>${rows
    .map(([label, spec]) => {
      const line = specLine(spec);
      return `<div class="detail-row"><b>${esc(label)}</b><span>${line}${spec.notes ? (line ? ' — ' : '') + esc(spec.notes) : ''}</span></div>`;
    })
    .join('')}</div>`;
}

// Internal cat key stays 'State PSC' (matches app.js's CAT_CLASS/filter
// values) — only the displayed label differs, same as app.js's CAT_LABEL_EN.
const CAT_LABEL_EN = { 'State PSC': 'State Exams' };
function catLabel(cat) { return CAT_LABEL_EN[cat] || cat; }

// Optional research-backed additions (duration/sections/negative-marking,
// and a short FAQ list) — most exams won't have either populated yet, so
// both render to '' rather than showing an empty card.
function renderExamPattern(d) {
  if (!d.examPattern) return '';
  const ep = d.examPattern;
  const modeRow = ep.mode || ep.duration ? `<div class="detail-row"><b>${esc([ep.mode, ep.duration].filter(Boolean).join(' · '))}</b></div>` : '';
  const sectionRows = (ep.sections || []).map((s) => `<div class="detail-row"><b>${esc(s.name)}</b><span>${esc(s.detail)}</span></div>`).join('');
  const negRow = ep.negativeMarking ? `<div class="detail-row"><b>Negative Marking</b><span>${esc(ep.negativeMarking)}</span></div>` : '';
  const passRow = ep.passingMarks ? `<div class="detail-row"><b>Passing Marks</b><span>${esc(ep.passingMarks)}</span></div>` : '';
  const note = ep.note ? `<p class="detail-footnote">${esc(ep.note)}</p>` : '';
  return `<div class="detail-card detail-card-wide"><h4>Exam Pattern</h4>${modeRow}${sectionRows}${negRow}${passRow}${note}</div>`;
}

function renderFaqs(d) {
  if (!d.faqs || !d.faqs.length) return '';
  const items = d.faqs.map((f) => `<details class="detail-note"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('');
  return `<div class="detail-card detail-card-wide"><h4>Frequently Asked Questions</h4>${items}</div>`;
}

function renderRelatedExams(exam, allExams) {
  const related = allExams.filter((e) => e.cat === exam.cat && e.code !== exam.code).slice(0, 5);
  if (!related.length) return '';
  return `<div class="detail-card detail-card-wide"><h4>Related exams in ${esc(catLabel(exam.cat))}</h4><ul class="apply-steps">${related
    .map((e) => `<li><a href="/exams/${esc(e.slug)}/">${esc(e.name)}</a></li>`)
    .join('')}</ul></div>`;
}

function buildJsonLd(exam) {
  const jobPosting = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: exam.name,
    description: exam.notifTitle || `${exam.name} — official recruitment notification, eligibility, important dates and how to apply.`,
    identifier: { '@type': 'PropertyValue', name: 'GovBabu', value: exam.code },
    hiringOrganization: { '@type': 'Organization', name: exam.orgName || exam.cat },
    jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressCountry: 'IN' } },
    employmentType: 'FULL_TIME',
  };
  // datePosted/validThrough are approximations from the fields we actually
  // track (verified date, application close date) — never fabricated when
  // absent. JobPosting requires ISO-8601 dates for Google's Rich Results to
  // accept them, but `verified` is a free-text display string ("26 Aug
  // 2026"), so it's run through the same regex-based normalizer the
  // extraction pipeline itself uses (extract/fields.js's normalizeDate) —
  // if it doesn't confidently parse, datePosted is omitted rather than
  // shipping a non-ISO value that would fail schema validation.
  const postedIso = exam.verified ? normalizeDate(exam.verified) : null;
  if (postedIso) jobPosting.datePosted = postedIso.iso;
  if (exam.applicationEndDateIso) jobPosting.validThrough = exam.applicationEndDateIso;
  const vacNum = exam.vacancies ? Number(String(exam.vacancies).replace(/[^\d]/g, '')) : null;
  if (vacNum) jobPosting.totalJobOpenings = vacNum;
  // Only attach a salary when payBand cleanly parses as a ₹min–max range —
  // never guessed from free text that doesn't match this exact shape.
  const payBand = exam.posts && exam.posts[0] && exam.posts[0].payBand;
  if (payBand) {
    const m = String(payBand).match(/₹\s?([\d,]+)\s?[–-]\s?₹?\s?([\d,]+)/);
    if (m) {
      jobPosting.baseSalary = {
        '@type': 'MonetaryAmount',
        currency: 'INR',
        value: { '@type': 'QuantitativeValue', minValue: Number(m[1].replace(/,/g, '')), maxValue: Number(m[2].replace(/,/g, '')), unitText: 'MONTH' },
      };
    }
  }

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/index.html` },
      { '@type': 'ListItem', position: 2, name: 'Browse Exams', item: `${SITE_ORIGIN}/exams.html` },
      { '@type': 'ListItem', position: 3, name: exam.name, item: `${SITE_ORIGIN}/exams/${exam.slug}/` },
    ],
  };

  const scripts = [
    `<script type="application/ld+json">${jsonForScriptTag(jobPosting)}</script>`,
    `<script type="application/ld+json">${jsonForScriptTag(breadcrumb)}</script>`,
  ];

  const faqs = exam.details && exam.details.faqs;
  if (faqs && faqs.length) {
    const faqPage = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    };
    scripts.push(`<script type="application/ld+json">${jsonForScriptTag(faqPage)}</script>`);
  }

  return scripts.join('\n');
}

// JSON.stringify does NOT escape '<', so a field containing the literal
// text "</script>" (a malicious post title, exam name, etc. — database
// content is not assumed trustworthy) would prematurely close this script
// tag and let arbitrary attacker-controlled HTML/JS follow it. Escaping '<'
// to its unicode escape is the standard mitigation for embedding JSON
// inside an HTML <script> tag; it's semantically inert for JSON parsing
// (JSON.parse treats < identically to a literal '<' in a string).
function jsonForScriptTag(obj) {
  return JSON.stringify(obj).replace(/</g, '\\u003c');
}

function buildMetaDescription(exam) {
  const bits = [];
  if (exam.notifTitle) bits.push(exam.notifTitle);
  if (exam.vacancies) bits.push(`${exam.vacancies} vacancies`);
  if (exam.applyEnd) bits.push(`apply by ${exam.applyEnd}`);
  const text = bits.length
    ? `${exam.name}: ${bits.join(', ')}. Eligibility, important dates and how to apply on GovBabu.`
    : `${exam.name} — eligibility, important dates, vacancies and how to apply, on GovBabu.`;
  return text.length > 155 ? text.slice(0, 152) + '...' : text;
}

function renderExamPage(exam, allExams) {
  const d = exam.details || {};
  const canonical = `${SITE_ORIGIN}/exams/${exam.slug}/`;
  const title = `${esc(exam.name)} — Notification, Eligibility & How to Apply | GovBabu`;
  const description = esc(buildMetaDescription(exam));

  const infoOnlyDocs = (exam.otherDocs || []).filter((o) => !o.spec);
  const otherDocsCard = infoOnlyDocs.length
    ? `<div class="detail-card detail-card-wide"><h4>Other Documents</h4>${infoOnlyDocs.map((o) => `<div class="detail-row"><b>${esc(o.label)}</b><span>${esc(o.notes)}</span></div>`).join('')}</div>`
    : '';

  const hasCoreDetails = (exam.posts && exam.posts.length) || d.payGroups || d.eligibility || d.promotion || d.howToApply;

  // Short scalar values only — a KPI tile truncates to one line, so
  // free-text fields that sometimes run long (applyEnd occasionally carries
  // a parenthetical caveat, qualification is a full sentence) go in
  // Important Dates / Eligibility below instead, where wrapping is fine.
  const overviewItems = [];
  overviewItems.push(['Status', exam.status === 'open' ? 'Open' : 'Closed']);
  if (exam.vacancies) overviewItems.push(['Vacancies', exam.vacancies]);
  if (exam.cat) overviewItems.push(['Category', catLabel(exam.cat)]);
  const quickOverview = overviewItems.length
    ? `<div class="quick-overview">${overviewItems.map(([label, value]) => `<div class="quick-overview-item"><span class="quick-overview-label">${esc(label)}</span><span class="quick-overview-value">${esc(value)}</span></div>`).join('')}</div>`
    : '';

  const statusPillClass = exam.status === 'open' ? 'open' : 'closed';
  const statusLabel = exam.status === 'open' ? 'Open' : 'Closed';
  const deadline = exam.status === 'open' && exam.applyEnd ? `<div class="exam-deadline">Apply by ${esc(exam.applyEnd)}</div>` : '';

  const eligibilityCard = d.eligibility
    ? `<div class="detail-card"><h4>Eligibility</h4>
        <div class="detail-row"><b>Age</b>${renderFieldValue(d.eligibility.age)}</div>
        ${d.eligibility.ageRelax ? `<div class="detail-row"><b>Age Relaxation</b><span>${esc(d.eligibility.ageRelax)}</span></div>` : ''}
        <div class="detail-row"><b>Qualification</b><span>${esc(d.eligibility.qualification)}</span></div>
        ${exam.applicationFee ? `<div class="detail-row"><b>Application Fee</b><span>${esc(exam.applicationFee)}</span></div>` : ''}
      </div>`
    : '';
  const promotionCard = d.promotion ? `<div class="detail-card"><h4>Career Progression</h4>${renderPromotion(d.promotion)}</div>` : '';
  const howToApplyCard = d.howToApply
    ? `<div class="detail-card detail-card-wide"><h4>How to Apply</h4>
        ${exam.officialUrl ? `<a class="btn btn-primary btn-sm apply-cta" href="${esc(exam.officialUrl)}" target="_blank" rel="noopener">Apply on the official site ↗</a>` : ''}
        ${d.beforeYouStart ? `<div class="apply-subhead">Before You Start</div><ul class="apply-checklist">${d.beforeYouStart.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>` : ''}
        <ol class="apply-steps">${d.howToApply.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
        ${d.commonMistakes ? `<div class="apply-subhead apply-subhead-warn">Common Mistakes</div><ul class="apply-checklist">${d.commonMistakes.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>` : ''}
      </div>`
    : '';

  const lastUpdated = exam.verified ? `<div class="detail-updated">Last verified: ${esc(exam.verified)}</div>` : '';

  const toolCta = `<div class="detail-card detail-card-wide" style="text-align:center">
    <a class="btn btn-primary" href="/index.html?exam=${encodeURIComponent(exam.code)}">Prepare your photo &amp; signature for ${esc(exam.name)} →</a>
  </div>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="GovBabu">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${canonical}">
<meta name="twitter:card" content="summary">
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%230f2440'/%3E%3Crect x='20' y='30' width='24' height='20' rx='5' fill='none' stroke='%23d4af37' stroke-width='4'/%3E%3Cpath d='M24 30v-6a8 8 0 0 1 16 0v3' fill='none' stroke='%23d4af37' stroke-width='4' stroke-linecap='round'/%3E%3C/svg%3E">
<link rel="stylesheet" href="/styles.css">
${buildJsonLd(exam)}
</head>
<body>
${SITE_HEADER}
<main id="main">
  <div class="wrap exam-detail-topbar">
    <a class="exam-back-link" href="/exams.html"><span class="exam-back-arrow" aria-hidden="true">←</span> Browse all exams</a>
  </div>
  <div class="wrap flow-intro">
    <h1>${esc(exam.name)}</h1>
  </div>
  <div class="wrap">
    <div class="selected-exam-bar">
      <span class="exam-badge-sm">${esc(exam.code.slice(0, 2))}</span>
      <span class="exam-result-text"><b>${esc(exam.name)}</b><small>${esc(catLabel(exam.cat))}</small>${deadline}</span>
      <span class="status-pill ${statusPillClass}">${statusLabel}</span>
      ${exam.officialUrl ? `<a class="btn btn-outline btn-sm" href="${esc(exam.officialUrl)}" target="_blank" rel="noopener">Official Notice ↗</a>` : ''}
    </div>
    <div class="exam-detail-panel">
      ${quickOverview}
      ${d.dataNote ? `<details class="detail-note"><summary>ⓘ Data note</summary><p>${esc(d.dataNote)}</p></details>` : ''}
      ${hasCoreDetails ? '' : '<div class="detail-missing">Full details for this exam haven\'t been compiled yet — check the official notification linked above.</div>'}
      <div class="detail-grid">
        ${renderImportantDates(exam, d)}
        ${renderPostsAndPay(exam, d)}
        ${eligibilityCard}
        ${renderExamPattern(d)}
        ${promotionCard}
        ${howToApplyCard}
        ${renderDocumentSpecs(exam)}
        ${otherDocsCard}
        ${renderFaqs(d)}
        ${toolCta}
        ${renderRelatedExams(exam, allExams)}
      </div>
      ${lastUpdated}
    </div>
    <p class="flow-disclaimer">GovBabu is independent and not affiliated with UPSC, SSC, IBPS, Railway, BPSC or any government body. Requirement details are compiled from official notifications where available — always confirm against the current official notification before submitting.</p>
  </div>
</main>
${SITE_FOOTER}
</body>
</html>
`;
}

module.exports = { renderExamPage, esc, SITE_ORIGIN, buildJsonLd };
