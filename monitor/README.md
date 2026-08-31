# GovBabu Monitor — recruitment notification monitoring & change detection

Watches official government recruitment sources, detects when something
changed, extracts structured fields, and puts every change in front of a
human before it becomes GovBabu's recorded truth. Nothing here writes to
GovBabu's live site automatically.

## Why this is a separate app

The main GovBabu site (`../`) is a deliberately zero-dependency static
site. This system needs a real relational database and real PDF/HTML
parsing, which a hand-rolled implementation can't do reliably — so it lives
here with its own `package.json` and does not touch the main site's build.

## Quick start

```bash
cd monitor
npm install
npm run init-db        # creates monitor/db/monitor.sqlite3, seeds SSC CGL + BPSC 72nd CCE
npm run check-now       # runs the pipeline once against every active source
npm run admin           # http://localhost:8745 — review queue + source health
```

Copy `.env.example` to `.env.local` to configure Telegram alerts / AI
assist / admin auth — everything works with none of them set.

## How a check works (see `pipeline/runCheck.js`)

1. **Level 1** — conditional fetch (ETag/Last-Modified) + content hash.
   Unchanged → stop here, cheap and fast.
2. **Level 2** — the source's adapter (`adapters/`) turns bytes into text:
   `cheerio` for HTML, `pdf-parse` for PDF. Scanned PDFs and JS-rendered
   pages route straight to `NEEDS_HUMAN_REVIEW` (`adapters/manualReview.js`)
   rather than guessing — real OCR/headless-rendering are a deliberate
   follow-up, not faked here.
3. **Level 3** — text similarity vs. the last stored version
   (`diff/compare.js`), used to catch "this is a completely different
   document" rather than a routine edit.
4. **Level 4** — regex field extraction (`extract/fields.js`) against a
   small, deliberately non-AI vocabulary ("Last Date for Submission...",
   "Date of Examination...", "Total Number of Vacancies...").
5. **Level 5** — optional AI assist (`extract/aiAssist.js`), only for
   fields the regex vocabulary missed, gated entirely behind
   `ANTHROPIC_API_KEY`. Its output is treated exactly like a regex hit —
   one more candidate for a human to approve.
6. **Sanity checks** (`validate/sanityChecks.js`) — date ordering, numeric
   vacancies, no silent null-overwrite, unusual date jumps, cross-source
   disagreement, AI/regex conflicts. These annotate and classify, they
   never block a change from reaching the queue.
7. Every change lands in `change_events` with `status='pending'` — that
   row **is** the review queue. `pipeline/applyApproval.js` is the only
   code path that ever writes to `field_history` (the approved-value
   ledger), and only after a human calls `approveChange`.

## Adding a new source

No new code required for a plain HTML or PDF notification — insert a row
into `sources` (label, url, source_type, monitoring_frequency_minutes,
extract_keywords). For a source with quirky markup, add a `selector_config`
JSON blob (`{"selector": "#notice-board"}`) so `adapters/genericHtml.js`
scopes extraction to the right part of the page. A source that needs OCR or
JS rendering: set `source_type` to `pdf_scanned_ocr` / `js_rendered` — it
will correctly surface as "needs manual review" until a real adapter for
that type is written (see `adapters/index.js` — register it there, nothing
else changes).

## What this MVP deliberately does NOT do yet

- **OCR** for scanned PDFs, and **headless-browser rendering** for
  JS-rendered pages — both route to manual review instead of guessing.
- **Auto-sync approved changes back into `app.js`'s `APPLICATIONS`
  array** — that array has no schema today, so writing to it safely is
  separate work. For now, an approved change is GovBabu's recorded truth
  inside `field_history`; updating the live site from it is a manual (or
  future scripted) step.
- **A real queue/worker system** (BullMQ, etc.) — `pipeline/scheduler.js`
  is a single-process interval loop, correct for 2–20 sources. `runCheck`
  itself doesn't change when you outgrow that; only the scheduler does.
- **Multi-user admin auth** — one shared token via `MONITOR_ADMIN_TOKEN`.
  `admin_users`/`audit_logs` already track *who* approved what, so real
  per-user login is additive, not a schema change.

## Tests

```bash
npm test
```

41 tests, zero network calls (everything network-shaped is dependency-
injected — see `test/helpers.js`), covering the 12 scenarios from the
spec: no change, exam date change, deadline extension, vacancy change, new
notification, revised/corrigendum notification, PDF replacement, source
unavailable, parser failure, OCR failure (routes to manual review),
conflicting sources, and duplicate/reworded notifications.
