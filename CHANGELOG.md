# Changelog

One line per meaningful change, newest first. Generated from commit
history — see `git log` for full diffs and detail.

## 2026-09-06
- Fixed a real bug: the monitoring pipeline detected fee changes under
  `fee`, but the site reads `application_fee` — a detected-and-approved
  change could never reach the live page. Renamed consistently.
- Admin dashboard can now edit `vacancies_display`, `exam_date_text`,
  `admit_card_date_text`, and `application_fee` — the fields the site
  actually displays, previously only settable via a direct DB edit.
- Added `.github/workflows/test.yml` — the test suite now runs on every
  push/PR, not just when someone remembers to run it locally.
- `daily-check.js` now sends a Telegram alert if it crashes outright, not
  only when an individual source fails.
- Added login rate-limiting (5 attempts / 15 min, per username) to the
  admin dashboard.
- Added Dependabot for npm + GitHub Actions dependencies.
- Added a dead-man's-switch healthcheck ping to the daily workflow, for
  the one failure mode nothing inside the workflow can detect on its own:
  the job never running at all.
- Documented the de facto backup policy for the private data repo.
- Added application fee data, a header search box, and a homepage/nav
  redesign.

## 2026-09-05
- Unified exam data onto the monitor database: retired app.js's
  hand-written 1,127-line exam array and a second, separate page-generator
  script — `monitor/bin/publish.js` is now the only thing that generates
  the SEO pages, `data/exams.json`, and the frontend's exam data.
- Fixed two silent data-loss bugs found while unifying: rich Hindi/detail
  content was being truncated on import, and compound vacancy figures
  (e.g. "8,868 (5,810 Graduate + 3,058 Undergraduate)") were being mangled
  into nonsense by digit-only reformatting.
- Added a publish-pipeline safety guard refusing to shrink `exams/` by
  more than 10% in one run, closing the gap that let a stale database
  silently delete live pages.
- Went from 3 to 49 (of 53) exams under real, HTTP-verified automated
  monitoring; found and fixed a scoped TLS-verification issue affecting 6
  known `.gov.in`/`.nic.in` hosts with broken certificate chains.
- Added `.github/workflows/daily-sanity-check.yml`: a daily 6am IST check
  against every active source, with a Telegram summary, backed by a
  separate private repo for the database (which holds an admin password
  hash and must never be public).
- Admin dashboard: real source management (add/check-now), a category
  filter + grouping on the Exams list.
- Added `morning`/`save-review`/`deploy` scripts automating the daily
  review loop.

## 2026-09-01 – 2026-09-02
- Added the static publish pipeline (monitor DB → SEO-ready public
  pages), made it atomic and deterministic.
- Added the exam data foundation: posts, content lifecycle, admin
  exam-creation workflow.
- Rebuilt the monitor admin dashboard with real auth, a sidebar shell, and
  change-password.
- Redesigned the homepage around exam analysis and a real-data product
  showcase.

## 2026-08-31 and earlier
- Added the source-monitoring pipeline (fetch → diff → extract → sanity
  checks → human approval) and a site-wide UX pass.
- Rebranded to GovBabu; added the core exam directory, i18n, notice
  board/results panels, and the document-prep tool (photo/signature
  resize, PDF tools) that the site is built around.
