const { SITE_ORIGIN } = require('./render');

// The static top-level pages that already exist at the repo root — kept as
// a small explicit list rather than scanned from disk, since it's a fixed,
// rarely-changing set and an explicit list is easier to reason about than
// directory-scanning logic that could accidentally pick up something it
// shouldn't (e.g. tools.html/applications.html, which are redirect stubs).
const STATIC_PAGES = [
  { path: '/index.html', priority: '1.0' },
  { path: '/exams.html', priority: '0.9' },
  { path: '/calendar.html', priority: '0.5' },
  { path: '/about.html', priority: '0.5' },
  { path: '/contact.html', priority: '0.5' },
  { path: '/privacy.html', priority: '0.3' },
  { path: '/terms.html', priority: '0.3' },
  { path: '/disclaimer.html', priority: '0.3' },
];

function xmlEscape(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function buildSitemap(exams, generatedAt) {
  const lastmod = generatedAt.slice(0, 10);
  const urls = [
    ...STATIC_PAGES.map((p) => ({ loc: `${SITE_ORIGIN}${p.path}`, lastmod, priority: p.priority })),
    ...exams.map((e) => ({ loc: `${SITE_ORIGIN}/exams/${e.slug}/`, lastmod: (e.lastUpdated || generatedAt).slice(0, 10), priority: '0.8' })),
  ];
  const body = urls
    .map((u) => `  <url>\n    <loc>${xmlEscape(u.loc)}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <priority>${u.priority}</priority>\n  </url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

module.exports = { buildSitemap, STATIC_PAGES };
