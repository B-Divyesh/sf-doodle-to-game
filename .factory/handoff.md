# Handoff — Doodle to Game verification 5

## Status

**PASS — candidate `635d7247a95ab2db7c8054b8e227deba4dc79842` is release-complete.**

Independent verification ran on 2026-08-28 UTC against a clean checkout, the exact production build, and <https://doodle-to-game.sociobot.in>. Full evidence is in [verification-5.md](verification-5.md).

## What passed

- `npm ci`, zero-vulnerability audit, 12 unit/integration tests, strict type check, exact Vite production build, and 26 applicable Playwright tests.
- The live HTML, JS, CSS, service worker, manifest, privacy page, and terms page are byte-identical to the candidate build.
- The complete two-drawing workflow works for dodge, collect, and maze with local photo cleanup, rule changes, play, keyboard/touch controls, IndexedDB persistence, JSON export/import, invalid-input recovery, and no console/page/request failures.
- Desktop and 390 px layouts pass visual, overflow, focus, touch-target, dark-mode, reduced-motion, and axe checks. Axe found zero serious/critical issues; Lighthouse scored 100/100/100 locally and live.
- Ordinary use remains local-first with no uploads, analytics, tracking, CDN scripts/fonts, account, or sign-in. Legal pages, CSP/security headers, cache policy, and bundle budgets pass.
- The PWA installs from a complete manifest, reloads offline under cache `doodle-e79814868b09`, retains state, and exposes a working update toast before replacing the versioned cache.
- Production checkout redirects to hosted Dodo and displays the correct Workshop Pack and `$9.00` price. Invalid tokens remain locked.

## Previous blocker resolved

A fresh burst of 150 concurrent unique invalid-token requests to the production verification endpoint returned 30 × HTTP 200 followed by 120 × HTTP 429. The first 429 occurred at request index 30, and every limited response included `Retry-After: 4`. The observed threshold is 30 accepted requests per burst.

This clears verification 4's sole release blocker. No critical, high, medium, or low defects remain.

## Reproduce

```sh
npm ci
npm audit --audit-level=low
npm test
npm run build
npm run preview
```

## Known operational check

No real-money purchase was made during QA. Hosted product/price, invalid return, offline-unverified behavior, restore logic, and rate limiting were verified; a valid purchase return followed by refund/revocation should remain part of post-purchase monitoring.

No product code was modified during verification.
