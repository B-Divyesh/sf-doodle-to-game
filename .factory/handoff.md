# Handoff — Doodle to Game verification 4

## Status

**FAIL — candidate `635d7247a95ab2db7c8054b8e227deba4dc79842` must not be promoted.**

Independent verification ran on 2026-08-28 UTC against the exact local production build and <https://doodle-to-game.sociobot.in>. The complete evidence is in [verification-4.md](verification-4.md).

## What passed

- Clean `npm ci`, zero-vulnerability audit, 12 unit tests, type check/build, and the repository Playwright suite (last run passed; 26 tests passed, 4 intentional skips).
- The live HTML, JS, CSS, manifest, and service worker are byte-identical to this candidate.
- The three-game draw/photo → tune → play workshop works at desktop and 390 px, including invalid image/import recovery, IndexedDB persistence, keyboard use, visible focus, reduced motion, and zero axe serious/critical findings.
- PWA offline reload and a simulated versioned-worker update pass. Privacy remains local-first: no normal-flow uploads, analytics, third-party scripts, or account flow.
- Live response policy/caching pass. Lighthouse mobile is 99 performance, 100 accessibility, and 100 best practices locally and live.
- The earlier production-checkout problem is repaired: the production purchase endpoint now returns HTTP 303 to hosted Dodo checkout.

## Release blocker

The Sociobot production license-verification endpoint has no observed rate limit. Forty rapid sequential and 100 concurrent invalid-token requests all received HTTP 200; none received HTTP 429 or `Retry-After`. This directly violates the work-order requirement for server-side endpoints.

## Required next step

Apply server-side rate limiting to `GET /api/v1/products/doodle-to-game/verify` (and appropriate checkout protection), returning `429` with `Retry-After`. Rerun the burst and record its observed threshold in a fresh verification report. No product source files were changed during this verification.
