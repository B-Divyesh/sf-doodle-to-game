# Handoff — adversarial first-read review 2

## Outcome

Review 2 is complete at candidate
`dc2852ce2edc338bd4f6fa4d96fce2b4b282f6bd`. Verdict: **FAIL** with seven
blocking findings and one minor finding. No product source was changed.

The full report is `.factory/review-2.md`. The primary blockers are a demo game
below the first viewport, shared real license storage in demo mode, a deployed
service worker that cannot install, incomplete claim coverage, dark demo-banner
contrast, repeated terminology/action-copy defects, and incomplete 404
structure/metadata.

## Verification performed

- Cold live root at 390 × 844 and 1440 × 900.
- Live demo entry, Reset, project isolation, license-storage isolation, request
  interception, and attempted offline reload.
- Exact command for all nine `.factory/claims.json` entries from fresh clone
  `/tmp/dtg-review2-claims-xTEu7e`: 9/9 commands exited 0, two browser
  executions each.
- `npm test`: 13 unit tests passed; build passed; 46 Playwright tests passed
  with 4 expected skips.
- Live axe 4.10.2 on root, demo, privacy, and terms in light and dark/reduced
  motion at 390 px.
- Live metadata, H1/main, focus, Back/Forward, 404, link, asset, robots,
  sitemap, and checkout crawl.
- Full landing and README copy/word-count audit.
- Every prior review/polish finding checked against live behavior and source.

## Key production-only evidence

The built and deployed `sw.js` are byte-identical. Both precache
`/staticwebapp.config.json`, but that URL returns 404 on Azure. The worker's
atomic `cache.addAll` therefore fails; a fresh live context has no registration
and cannot satisfy **“Works after the first visit.”** Local tests pass because
Vite serves that file.

## Next verification

After repair, rerun the full checklist rather than only the eight findings.
Add deployed-origin offline coverage and demo-wide storage/axe/initial-viewport
assertions so the current local false positives cannot recur.
