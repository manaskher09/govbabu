// Every real published exam `code` today already matches ^[A-Z0-9-]+$, so
// lowercasing alone is a lossless, collision-free mapping — no dedicated
// `slug` column exists or is needed yet. This function is defensive against
// a future messier code (spaces, punctuation) without requiring a schema
// change now; duplicate results are still caught by publish/validate.js.
function slugify(code) {
  return String(code)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

module.exports = { slugify };
