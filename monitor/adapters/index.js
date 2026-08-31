// Registry: source.source_type -> adapter. Adding a new source type (e.g. a
// bespoke UPSC adapter that follows redirect chains a certain way) means
// adding one module here and registering it — nothing else in the pipeline
// changes, which is the whole point of the adapter architecture.
const html = require('./genericHtml');
const pdf = require('./pdf');
const manual = require('./manualReview');

const registry = {
  html,
  pdf,
  pdf_scanned_ocr: manual,
  js_rendered: manual,
  manual,
};

function getAdapter(sourceType) {
  const adapter = registry[sourceType];
  if (!adapter) throw new Error(`No adapter registered for source_type "${sourceType}"`);
  return adapter;
}

module.exports = { getAdapter, registry };
