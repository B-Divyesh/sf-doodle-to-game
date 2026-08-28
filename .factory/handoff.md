# Doodle to Game — repair handoff

- Work order: `doodle-to-game-repair-1`
- Repair base: `d2f64b8ce4add771cee46e2a34fdfa6b97921ffb`
- Product-code commit deployed: `06d9e5d` (`fix: repair release QA blockers`)
- Live URL: <https://doodle-to-game.sociobot.in>
- Deployed: 2026-08-28 UTC, Azure Static Web Apps deployment `440ab137-a1cc-464a-9456-334a3a4f7d17`

## What was repaired

- The public build now defaults to `https://api.sociobot.in/api/v1`, not the pilot host. The live Buy Workshop Pack link is now `https://api.sociobot.in/api/v1/products/doodle-to-game/checkout`; pilot remains an explicit local-staging override only.
- Dark-mode paid-strip and footer tokens now use the dark night panel with high-contrast ink/link colours. Axe serious/critical findings are zero in both light and dark/reduced-motion browser tests.
- Template cards are now a roving-focus radio group: Arrow keys wrap/select, Home/End choose first/last, and a selection rerender restores focus to the chosen card.
- All footer links are 44 px high at the 390 px layout.
- Added checked-in `public/staticwebapp.config.json`, deployed with the app: hashed `/assets/*` and `/icons/*` are one-year immutable; documents, manifest, and `sw.js` revalidate; manifest MIME is `application/manifest+json`; CSP, Permissions Policy, anti-framing, COOP/CORP, HSTS, referrer, and nosniff policies are set.
- Malformed JSON import now says the project is incomplete and tells the maker to export again or choose another Doodle to Game JSON file.
- Manifest start URL version advanced to `v=2`, preserving the PWA update path.

## Regression coverage and verification

Clean install and repository gates run from this checkout:

```sh
npm ci
npm audit --audit-level=low
npm test
```

- `npm ci`: 57 packages installed; audit: 0 vulnerabilities.
- `npm test`: 8 unit tests passed; `tsc --noEmit` passed inside `npm run build`; Vite emitted `dist/`; 16 Playwright project tests completed (14 passed, 2 intentional desktop/mobile duplicate skips). Coverage includes all three games, local drawing/photo flow, legal routes, desktop and 390 × 844 mobile, light and dark axe checks, keyboard radio focus, 44 px footer targets, and offline reload.
- Exact regression tests cover the production checkout base, static host caching/MIME/security config, incomplete JSON copy, dark axe, roving keyboard selection/focus, and mobile target dimensions.
- There is no standalone lint configuration in this Vite/TypeScript project; strict TypeScript checking is run by the production build.
- Local Lighthouse 13.4.1 desktop: Performance 100, Accessibility 100, Best Practices 100; FCP 0.2 s, LCP 0.3 s, CLS 0. Initial output is 35.59 KB JS and 20.45 KB CSS uncompressed.

Live post-deploy evidence:

- `dist/index.html` and live `/` SHA-256: `23f1d4c214fa29f3d45b547a72699f18471a843935fc21b09e944df72fc75045`.
- `dist/assets/main-BGmlB9Lr.js` and the live asset SHA-256: `07a49cd2a3e9ca74ca0e420f6309ba17fa3ac4a34ff587bb35fcbb252620dfeb`.
- Live root and `sw.js`: `Cache-Control: public, max-age=0, must-revalidate`; live hashed JS: `public, max-age=31536000, immutable`; live manifest: `Content-Type: application/manifest+json` and revalidation caching.
- Live headers include CSP with first-party-only/script/frame protections, `Permissions-Policy`, `X-Frame-Options: DENY`, `Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Resource-Policy: same-origin`, and two-year preload HSTS.
- Live desktop dark and 390 px mobile browser smoke checks both found one `h1`, one `main`, no console errors, the production checkout URL, three 44 px footer links, and a service-worker-controlled offline reload. Live keyboard ArrowRight moves focus and selection from Dodge to Collect without dropping focus to `body`.
- No product artwork leaves the device in the tested drawing/play paths. The built bundle contains the production Sociobot API base and no pilot endpoint; the CSP permits only same-origin requests plus that billing API.

## Known external release blocker

The app-side H-1 routing defect is fixed, but the production Sociobot product itself is still not registered/enabled: a fresh request to `https://api.sociobot.in/api/v1/products/doodle-to-game/checkout` on 2026-08-28 returns HTTP 404 with `{"error":"enabled factory product","status":404}`. Therefore a real checkout, return-token, and paid restore smoke test cannot complete yet.

The repository contract explicitly keeps billing registration outside this repo. Factory billing must register/enable `doodle-to-game` at US $9 with return URL `https://doodle-to-game.sociobot.in/`; then rerun checkout, return-token stripping, daily verification, offline cached unlock, and restore-purchase smoke tests. No other product behavior was removed or gated by this repair.
