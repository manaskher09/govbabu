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
      <a href="/tools.html" class="btn btn-outline btn-sm">Tools</a>
      <a href="/manjusha.html" class="btn btn-outline btn-sm">Downloads</a>
      <div class="nav-more" id="navMore"><button type="button" class="btn btn-outline btn-sm nav-more-btn" id="navMoreBtn" aria-haspopup="true" aria-expanded="false">More</button>
      <div class="nav-more-menu" id="navMoreMenu" role="menu"><a href="/about.html" role="menuitem">About</a>
      <a href="/contact.html" role="menuitem">Contact</a>
      <a href="/privacy.html" role="menuitem">Privacy Policy</a></div></div></nav>
      <button class="icon-btn header-search-toggle" id="headerSearchToggle" type="button" aria-label="Search exams" aria-expanded="false"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="var(--ink)" stroke-width="2"/><path d="M21 21l-4.35-4.35" stroke="var(--ink)" stroke-width="2" stroke-linecap="round"/></svg></button>
      <div class="header-search-box" id="headerSearchBox" hidden><input id="headerSearchInput" class="search-input" type="text" aria-label="Search exams, departments, qualifications" placeholder="Search exams, departments, qualifications" autocomplete="off"><div id="headerSearchResults" class="exam-result-list"></div></div>
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

// Internal cat key stays 'State PSC' (matches app.js's CAT_CLASS/filter
// values) — only the displayed label differs, same as app.js's CAT_LABEL_EN.
const CAT_LABEL_EN = { 'State PSC': 'State Exams' };
function catLabel(cat) { return CAT_LABEL_EN[cat] || cat; }

// Mirrors app.js's sentenceBreak() — splits compiled research prose into
// one line per sentence (on ". "/"; " before a capital letter, digit or ₹)
// so a run-on paragraph reads as separate lines on a phone instead of one
// dense block of tiny text. Escapes first (this is untrusted DB content),
// then splits on the escaped string — none of the escaped entities
// (&amp; &lt; &gt; &quot; &#39;) contain '.' or ';', so splitting after
// escaping can never land inside one.
function sentenceBreak(text) {
  if (!text) return text;
  return esc(text)
    .split(/(?<=[.;])\s+(?=[A-Z0-9₹])/)
    .map((s) => `<span class="sentence-break">${s}</span>`)
    .join('');
}

// ---- Exam analysis page: one data-driven section builder per topic ----
// Mirrors app.js's renderExamDetailPanel section builders class-for-class
// and id-for-id, so the static SEO page and the live client-rendered page
// read identically — this file just has no i18n (English only) and takes
// its own `esc()` on every interpolated field, since this is untrusted
// database content being embedded in HTML (see the escaping tests in
// monitor/test/publish.test.js). Each helper returns {navLabel, html} or ''
// when the exam has nothing for that topic — never a fabricated value.

function renderVacanciesSection(exam, details) {
  if (!exam.vacancies && !details.payGroups && !(exam.posts && exam.posts.length)) return '';
  let body = '';
  if (exam.vacancies) body += `<span class="vacancy-total-label">Total Vacancies</span><span class="vacancy-total-value">${esc(exam.vacancies)}</span>`;
  if (exam.posts && exam.posts.length) {
    const rows = exam.posts
      .map((p) => {
        const vac = p.vacancies != null ? String(p.vacancies) : p.vacanciesDisplay || '—';
        const pay = [p.payLevel, p.payBand].filter(Boolean).map(esc).join(' · ') || '—';
        return `<tr><td data-label="Post">${esc(p.postName)}</td><td data-label="Qualification">${esc(p.qualification || '—')}</td><td data-label="Pay Level">${pay}</td><td data-label="Vacancies">${esc(vac)}</td></tr>`;
      })
      .join('');
    body += `<div class="table-scroll"><table class="data-table"><thead><tr><th>Post</th><th>Qualification</th><th>Pay Level</th><th>Vacancies</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  } else if (details.payGroups) {
    const rows = details.payGroups.map((g) => `<tr><td data-label="Pay Level">${esc(g.level)}</td><td data-label="Pay Band">${esc(g.band)}</td><td data-label="Posts">${esc(g.posts)}</td></tr>`).join('');
    body += `<div class="table-scroll"><table class="data-table"><thead><tr><th>Pay Level</th><th>Pay Band</th><th>Posts</th></tr></thead><tbody>${rows}</tbody></table></div>`;
    if (details.payNote) body += `<p class="detail-footnote">${sentenceBreak(details.payNote)}</p>`;
  }
  return { navLabel: 'Vacancies &amp; Posts', html: `<section id="sec-vacancies" class="exam-section"><h2>🎟️ Vacancies &amp; Posts</h2>${body}</section>` };
}

function renderEligibilitySection(details, feeText) {
  const e = details.eligibility;
  if (!e) return '';
  const body = `
    <div class="detail-row"><b>Qualification</b><span>${e.qualification ? sentenceBreak(e.qualification) : 'Not available yet'}</span></div>
    <div class="detail-row"><b>Age</b>${renderFieldValue(e.age || 'Not available yet')}</div>
    ${e.ageRelax ? `<div class="detail-row"><b>Age Relaxation</b><span>${sentenceBreak(e.ageRelax)}</span></div>` : ''}
    ${feeText ? `<div class="detail-row"><b>Application Fee</b><span>${sentenceBreak(feeText)}</span></div>` : ''}`;
  return { navLabel: 'Eligibility', html: `<section id="sec-eligibility" class="exam-section"><h2>🎓 Eligibility</h2>${body}</section>` };
}

// Built entirely from fields that already exist for virtually every exam
// (photo/signature specs, application fee, any info-only otherDocs) —
// never a generic hardcoded checklist, per this page's "don't invent
// requirements" rule.
function renderBeforeApplySection(exam, feeText) {
  const items = [];
  if (exam.photo) { const line = specLine(exam.photo); items.push(['📷 Photo', line + (exam.photo.notes ? (line ? ' — ' : '') + sentenceBreak(exam.photo.notes) : '')]); }
  if (exam.signature) { const line = specLine(exam.signature); items.push(['✍️ Signature', line + (exam.signature.notes ? (line ? ' — ' : '') + sentenceBreak(exam.signature.notes) : '')]); }
  if (feeText) items.push(['💳 Application Fee', sentenceBreak(feeText)]);
  (exam.otherDocs || []).forEach((o) => {
    const line = o.spec ? specLine(o.spec) : '';
    items.push([esc(o.label), o.spec ? line + (o.spec.notes ? (line ? ' — ' : '') + sentenceBreak(o.spec.notes) : '') : sentenceBreak(o.notes)]);
  });
  if (!items.length) return '';
  const body = `<ul class="doc-checklist">${items.map(([label, val]) => `<li><span><b>${label}</b><span>${val}</span></span></li>`).join('')}</ul>
    <p style="margin-top:14px"><a class="btn btn-primary btn-sm" href="/index.html?exam=${encodeURIComponent(exam.code)}">Prepare your photo &amp; signature →</a></p>`;
  return { navLabel: 'Before You Apply', html: `<section id="sec-before" class="exam-section"><h2>🧾 Before You Apply</h2>${body}</section>` };
}

function renderHowToApplySection(exam, details) {
  if (!details.howToApply) return '';
  let body = '';
  if (exam.officialUrl) body += `<a class="btn btn-primary btn-sm apply-cta" href="${esc(exam.officialUrl)}" target="_blank" rel="noopener">Apply on the official site ↗</a>`;
  if (details.beforeYouStart) body += `<div class="apply-subhead">Before you start</div><ul class="apply-checklist">${details.beforeYouStart.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>`;
  body += `<ol class="step-list">${details.howToApply.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>`;
  if (details.commonMistakes) body += `<div class="apply-subhead apply-subhead-warn">⚠ Common mistakes to avoid</div><ul class="apply-checklist">${details.commonMistakes.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>`;
  return { navLabel: 'How to Apply', html: `<section id="sec-apply" class="exam-section"><h2>📝 How to Apply</h2>${body}</section>` };
}

function renderAboutSection(exam) {
  const body = `<div class="detail-row"><b>Conducted By</b><span>${esc(exam.orgName || catLabel(exam.cat))}</span></div>
    <div class="detail-row"><b>Category</b><span>${esc(catLabel(exam.cat))}</span></div>
    ${exam.notifTitle ? `<p class="section-lede">${sentenceBreak(exam.notifTitle)}</p>` : ''}`;
  return { navLabel: 'About', html: `<section id="sec-about" class="exam-section"><h2>ℹ️ About the Exam</h2>${body}</section>` };
}

function renderCareerSection(details) {
  if (!details.promotion) return '';
  return { navLabel: 'Career Path', html: `<section id="sec-career" class="exam-section"><h2>📈 Career Path</h2>${renderPromotion(details.promotion)}</section>` };
}

// The real per-exam "selection process" narrative already lives in
// examPattern.mode (e.g. "CBT-1, CBT-2, ... then Document Verification/
// Medical") — there's no separate structured stages list in the data, so
// this surfaces that same sentence as its own section instead of drawing
// an invented stage-by-stage pipeline graphic.
function renderSelectionSection(details) {
  const mode = details.examPattern && details.examPattern.mode;
  if (!mode) return '';
  return { navLabel: 'Selection', html: `<section id="sec-selection" class="exam-section"><h2>🧭 Selection Process</h2><p class="section-lede">${sentenceBreak(mode)}</p></section>` };
}

function renderPatternSection(details) {
  if (!details.examPattern) return '';
  const ep = details.examPattern;
  const chips = [ep.duration, ep.negativeMarking ? `Negative Marking: ${ep.negativeMarking}` : '', ep.passingMarks ? `Passing Marks: ${ep.passingMarks}` : ''].filter(Boolean);
  let body = chips.length ? `<p class="section-lede">${esc(chips.join(' · '))}</p>` : '';
  if (ep.sections && ep.sections.length) {
    const rows = ep.sections.map((s) => `<tr><td data-label="Section">${esc(s.name)}</td><td data-label="Details">${esc(s.detail)}</td></tr>`).join('');
    body += `<div class="table-scroll"><table class="data-table"><thead><tr><th>Section</th><th>Details</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }
  if (ep.note) body += `<p class="detail-footnote">${sentenceBreak(ep.note)}</p>`;
  if (!body) return '';
  return { navLabel: 'Exam Pattern', html: `<section id="sec-pattern" class="exam-section"><h2>📋 Exam Pattern</h2>${body}</section>` };
}

function renderFaqSection(details) {
  if (!details.faqs || !details.faqs.length) return '';
  const items = details.faqs.map((f) => `<details class="detail-note"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('');
  return { navLabel: 'FAQs', html: `<section id="sec-faq" class="exam-section"><h2>❓ Frequently Asked Questions</h2>${items}</section>` };
}

// Routes to the site's real Downloads/Syllabus destination (manjusha.html)
// rather than a syllabus route that doesn't exist yet — GovBabu's syllabus
// content isn't live per-exam, so this is the honest current destination.
function renderSyllabusSection() {
  const body = `<p class="section-lede">Want the complete topic-by-topic syllabus for this exam?</p><a class="btn btn-primary btn-sm" href="/manjusha.html">View Full Syllabus →</a>`;
  return { navLabel: 'Syllabus', html: `<section id="sec-syllabus" class="exam-section"><h2>📘 Full Syllabus</h2>${body}</section>` };
}

function renderLinksSection(exam, allExams) {
  const links = [];
  if (exam.officialUrl) links.push(`<a class="btn btn-outline btn-sm" href="${esc(exam.officialUrl)}" target="_blank" rel="noopener">Official Source ↗</a>`);
  const related = allExams.filter((e) => e.cat === exam.cat && e.code !== exam.code).slice(0, 5);
  const relatedHtml = related.length
    ? `<div class="apply-subhead">Related Exams</div><ul class="apply-steps">${related.map((e) => `<li><a href="/exams/${esc(e.slug)}/">${esc(e.name)}</a></li>`).join('')}</ul>`
    : '';
  return { navLabel: 'Links', html: `<section id="sec-links" class="exam-section"><h2>🔗 Important Links</h2><div class="links-grid">${links.join('')}</div>${relatedHtml}</section>` };
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
  const feeText = exam.applicationFee;
  const canonical = `${SITE_ORIGIN}/exams/${exam.slug}/`;
  const title = `${esc(exam.name)} — Notification, Eligibility & How to Apply | GovBabu`;
  const description = esc(buildMetaDescription(exam));

  const hasCoreDetails = (exam.posts && exam.posts.length) || d.payGroups || d.eligibility || d.promotion || d.howToApply;

  // At-a-glance strip: everything a candidate wants in the first 30
  // seconds, all short scalar values so each tile stays one line — the
  // free-text detail for age/qualification lives in Eligibility below.
  const overviewItems = [['Status', exam.status === 'open' ? 'Open' : 'Closed']];
  if (exam.vacancies) overviewItems.push(['Vacancies', exam.vacancies]);
  if (exam.applyStart) overviewItems.push(['Apply Start', exam.applyStart]);
  if (exam.applyEnd) overviewItems.push([exam.status === 'open' ? 'Last Date' : 'Applications Closed', exam.applyEnd]);
  overviewItems.push(['Conducted By', exam.orgName || catLabel(exam.cat)]);
  if (d.eligibility && d.eligibility.qualification) overviewItems.push(['Qualification', d.eligibility.qualification]);
  if (d.eligibility && d.eligibility.age) overviewItems.push(['Age', Array.isArray(d.eligibility.age) ? d.eligibility.age.join(' · ') : d.eligibility.age]);
  const quickOverview = `<div class="quick-overview">${overviewItems.map(([label, value]) => `<div class="quick-overview-item"><span class="quick-overview-label">${esc(label)}</span><span class="quick-overview-value">${esc(value)}</span></div>`).join('')}</div>`;

  const statusPillClass = exam.status === 'open' ? 'open' : 'closed';
  const statusLabel = exam.status === 'open' ? 'Open' : 'Closed';
  const deadline = exam.status === 'open' && exam.applyEnd ? `<div class="exam-deadline">Apply by ${esc(exam.applyEnd)}</div>` : '';
  // Open exams lead with a primary "Apply Now" action (plus a jump to
  // Eligibility, the next thing a candidate actually needs); closed exams
  // keep the lower-emphasis "Official Notice" link, since there's nothing
  // left to apply for.
  const applyBtn = exam.officialUrl
    ? exam.status === 'open'
      ? `<a class="btn btn-primary btn-sm" href="${esc(exam.officialUrl)}" target="_blank" rel="noopener">Apply Now ↗</a>`
      : `<a class="btn btn-outline btn-sm" href="${esc(exam.officialUrl)}" target="_blank" rel="noopener">Official Notice ↗</a>`
    : '';
  const eligBtn = exam.status === 'open' ? `<a class="btn btn-outline btn-sm" href="#sec-eligibility">Check Eligibility</a>` : '';

  // Apply Start/Last-Date get the prominent hero treatment; every other
  // date field is a plain row below.
  const heroDates = [];
  if (exam.applyStart) heroDates.push(['Apply Start', exam.applyStart]);
  if (exam.applyEnd) heroDates.push([exam.status === 'open' ? 'Last Date' : 'Applications Closed', exam.applyEnd]);
  const datesHtml = heroDates.length
    ? `<div class="dates-hero">${heroDates.map(([label, value], i) => `${i > 0 ? '<span class="dates-hero-arrow">→</span>' : ''}<div class="dates-hero-item"><span class="dates-hero-label">${esc(label)}</span><span class="dates-hero-value">${esc(value)}</span></div>`).join('')}</div>`
    : '';
  const secondaryRows = [];
  if (d.correctionWindow) secondaryRows.push(['Correction Window', d.correctionWindow]);
  if (exam.examDate) secondaryRows.push(['Exam Date', exam.examDate]);
  else if (exam.status === 'open') secondaryRows.push(['Exam Date', 'Not announced yet']);
  if (exam.admitCardDate) secondaryRows.push(['Admit Card', exam.admitCardDate]);
  if (exam.results && exam.results.stage) secondaryRows.push(['Result', exam.results.stage + (exam.results.date ? ' — ' + exam.results.date : '')]);
  if (exam.verified) secondaryRows.push(['Last Verified', exam.verified]);
  const secondaryHtml = secondaryRows.length
    ? `<div class="dates-table">${secondaryRows.map(([label, value]) => `<div class="dates-row"><span class="dates-label">${esc(label)}</span><span class="dates-value">${esc(value)}</span></div>`).join('')}</div>`
    : '';
  const datesSection = datesHtml || secondaryHtml ? { navLabel: 'Dates', html: `<section id="sec-dates" class="exam-section"><h2>📅 Important Dates</h2>${datesHtml}${secondaryHtml}</section>` } : '';

  const lastUpdated = exam.verified ? `<div class="detail-updated">Last verified: ${esc(exam.verified)}</div>` : '';

  const sections = [
    datesSection,
    renderVacanciesSection(exam, d),
    renderEligibilitySection(d, feeText),
    renderBeforeApplySection(exam, feeText),
    renderHowToApplySection(exam, d),
    renderAboutSection(exam),
    renderCareerSection(d),
    renderSelectionSection(d),
    renderPatternSection(d),
    renderFaqSection(d),
    renderSyllabusSection(),
    renderLinksSection(exam, allExams),
  ].filter(Boolean);

  const quicknav = `<nav class="exam-quicknav" aria-label="Section navigation">${sections.map((s) => `<a href="#${s.html.match(/id="([^"]+)"/)[1]}">${s.navLabel}</a>`).join('')}</nav>`;

  // Just the primary CTA — every fact and every other link here (status,
  // vacancies, dates, syllabus, official notice, prep-docs) is already
  // shown once, in its own section a scroll away; a second summary/"Quick
  // Links" list in the sidebar was pure duplication of the same page.
  const asideCard = `<div class="aside-card">
      ${exam.officialUrl ? `<a class="btn btn-primary btn-sm aside-cta" href="${esc(exam.officialUrl)}" target="_blank" rel="noopener">${exam.status === 'open' ? 'Apply Now ↗' : 'Official Notice ↗'}</a>` : ''}
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
      ${applyBtn}${eligBtn}
    </div>
    <div class="exam-detail-panel">
      ${exam.notifTitle ? `<p class="exam-hero-desc">${sentenceBreak(exam.notifTitle)}</p>` : ''}
      ${quickOverview}
      ${d.dataNote ? `<details class="detail-note"><summary>ⓘ Data note</summary><p>${sentenceBreak(d.dataNote)}</p></details>` : ''}
      ${hasCoreDetails ? '' : '<div class="detail-missing">Full details for this exam haven\'t been compiled yet — check the official notification linked above.</div>'}
      ${quicknav}
      <div class="exam-layout">
        <div class="exam-main">${sections.map((s) => s.html).join('')}</div>
        <aside class="exam-aside">${asideCard}</aside>
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
