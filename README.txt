GovtBabu
=========
Local dev: `node dev-server.js` (serves the static site + the /api payment
endpoints on the same origin). Plain `python3 -m http.server` also works if
you only need the frontend and don't care about testing payments.

Tests: `node --test` runs the unit suite in test/unit.test.js (unlock-token,
Razorpay signature verification, pricing — zero dependencies, uses Node's
built-in test runner).

Pages:
- index.html    The whole app: a single linear flow — search your exam,
                upload photo/signature, get files sized to spec, pay ₹29 to
                unlock the downloads. No separate tools/applications pages
                or modal — one path, start to finish.
- exams.html    Browse-all-exams directory, grouped by field (Central Govt,
                Railway, Banking, Teaching, State PSC, Defence), each group
                and each exam within it ordered by aspirant-strength.
- calendar.html Every exam sorted by application deadline, grouped by month,
                with a live "closes in Nd" countdown for open ones.
- about.html    Why GovtBabu exists, values, and the roadmap.
- tools.html / applications.html
                Redirect stubs to index.html — kept only so old bookmarks/
                links don't 404. The standalone tools grid and exam browser
                they used to serve are now folded into the single flow.

Shared:
- styles.css     Design system: navy + gold, flat surfaces, minimal shadow,
                 light & dark mode. Tricolor strip + live IST date/time bar
                 on every page (generic patriotic styling — not the State
                 Emblem/Ashoka Chakra, which is legally protected and would
                 misrepresent this as an official government site).
- app.js         Theme toggle, the gov-bar clock, the payment/unlock module,
                 the image compression + PDF engine (including PDF.js,
                 lazy-loaded from a CDN only when a PDF-reading tool is
                 used — the one exception to zero dependencies, since no
                 browser can decode PDF natively), the Application data, and
                 the single-flow / directory / calendar controllers.
- api/           Backend for the payment flow (Vercel-Functions-shaped, zero
                 npm dependencies): create-order.js, verify-payment.js,
                 razorpay-webhook.js, and _lib/ for the Razorpay wrapper,
                 pricing and the signed unlock-token. Runs in mock mode
                 (real pipeline, no real money) until RAZORPAY_KEY_ID/
                 KEY_SECRET are set — see .env.example.
- dev-server.js  Plain-Node local server: static files + the /api handlers
                 on one origin, unchanged from how they'd run on Vercel.
- test/          Unit tests (node:test + node:assert, no dependencies).

Working in this prototype:
- Single linear flow: search/select an exam (or skip for a generic file),
  upload photo + signature (auto-processed to that exam's exact px/KB spec),
  see that exam's posts/pay/eligibility/promotion/how-to-apply for free
  where compiled, then one ₹29 payment unlocks every download.
- Image compression to a target KB (browser-side), signature resize reuses
  the same engine.
- PDF tools: JPG/PNG → PDF, PDF → JPG (first page), and PDF compression to a
  target KB (multi-page-aware) — all via PDF.js rendering pages to canvas,
  then the same compression engine as photos.
- Payment flow wired end-to-end against the mock backend; flips to real
  Razorpay the moment API keys are set, no code changes needed.
- Responsive layout with working dark mode (persisted via localStorage).
- Batch mode: the generic (skip-exam) tool accepts multiple files at once,
  resizing each to the same target KB under one payment.
- All 15 exams now have full posts/pay/eligibility/promotion/how-to-apply
  data, from real sourced research (official notification PDFs where
  reachable) with honest caveats wherever sources conflicted or a figure
  couldn't be independently confirmed — never silently guessed. Several
  exams' `otherDocs` (thumb impression, handwritten declaration) are also
  real functional upload slots, not just free-info text.
- Application windows/dates naturally go stale as cycles open and close —
  this isn't a one-time fix, expect to re-verify periodically.

Not yet implemented:
- A real Razorpay account (currently mock mode — see .env.example)
- Accounts, SEO pages, analytics
