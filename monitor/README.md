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

## Daily automated check (GitHub Actions)

`.github/workflows/daily-sanity-check.yml` (in the repo root, not here)
runs `npm run daily-check` every day at 06:00 IST against every active
source, and sends one Telegram summary regardless of outcome — separate
from the per-change alerts `pipeline/runCheck.js` already sends for
anything `CONFIRMED_CHANGE`/`NEEDS_HUMAN_REVIEW`. It never writes to
`field_history` (see "one approval path" above) — a run only ever adds
rows to `change_events` (status='pending') for a human to review.

The database itself lives in a **separate private repo**
(`manaskher09/govbabu-data`), never in this public one — it holds an admin
password hash and must not be exposed. The workflow checks that repo out,
runs the check against it, and commits the result back.

### The daily review loop

One-time setup: `git clone https://github.com/manaskher09/govbabu-data.git
~/Desktop/govbabu-data` (or anywhere — set `GOVBABU_DATA_DIR` if not
`~/Desktop/govbabu-data`).

Then, each day:

```bash
npm run morning       # pulls last night's results, (re)starts the dashboard
#   ... review/approve in the dashboard at http://localhost:8745 ...
npm run save-review   # commits + pushes your approvals to govbabu-data
npm run deploy        # regenerates the site, commits it locally
git push               # from the repo root — the one deliberately manual step
```

`save-review` matters even if you change nothing else: skip it and
tomorrow's automated check starts from the *pre-approval* database and
overwrites what you just approved. `deploy` never auto-pushes to the public
repo — that stays a conscious, separate action.

Required GitHub Actions secrets (repo Settings → Secrets and variables →
Actions, on the **public** `govbabu` repo):
- `DATA_REPO_TOKEN` — a fine-grained PAT scoped to only `govbabu-data`,
  contents read+write.
- `TELEGRAM_BOT_TOKEN` / `TELEGRAM_ADMIN_CHAT_ID` — same as the local
  `.env.local` values, see `.env.example`.

## What this MVP deliberately does NOT do yet

- **OCR** for scanned PDFs, and **headless-browser rendering** for
  JS-rendered pages — both route to manual review instead of guessing.
  4 exams (UPSC, NDA, CDS, IB-ACIO) actively block automated requests
  (real HTTP 403s) and 1 (MPPSC) is disallowed by its own robots.txt —
  none of these are bypassed; they're registered as manual reference
  documents instead, needing a human to check periodically.
- **Auto-publishing after approval** — approving a change updates
  `field_history` (GovBabu's recorded truth) immediately, but regenerating
  the live site is still a manual `npm run publish:site` + `git push`
  step, by design (nothing auto-writes what the public sees).
- **A real queue/worker system** (BullMQ, etc.) — `pipeline/scheduler.js`
  is a single-process interval loop, correct for 2–20 sources; the daily
  GitHub Actions workflow above covers "run once a day" without needing
  this at all. `runCheck` itself doesn't change if you ever outgrow both.

## Tests

```bash
npm test
```

149 tests, zero network calls (everything network-shaped is dependency-
injected — see `test/helpers.js`), covering the 12 scenarios from the
spec (no change, exam date change, deadline extension, vacancy change, new
notification, revised/corrigendum notification, PDF replacement, source
unavailable, parser failure, OCR failure routes to manual review,
conflicting sources, duplicate/reworded notifications) plus the admin API,
publish pipeline, data-import sync, and WAL-checkpoint-on-exit behavior.
