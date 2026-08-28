# Doodle to Game — build handoff

Work order: `doodle-to-game-build-1`
Completed: 2026-08-28

## What shipped

- A responsive four-step workshop: choose a fixed game, add two doodles, tune three rules, and play.
- Three complete canvas games: **Doodle dodge**, **Treasure dash**, and **Pocket maze**. Each works with arrow keys, WASD, or the on-screen direction pad.
- A local drawing editor with pen/touch/mouse input, brush size and colour, eraser, clear, and reversible undo. Pen input suppresses simultaneous touch marks for basic palm rejection.
- Local JPG/PNG/WebP photo loading and a deterministic high-contrast paper remover. Camera images are never uploaded.
- IndexedDB autosave, validated JSON export/import, and geometric fallbacks if an art slot is empty.
- An installable PWA with 192/512 and maskable icons, a generated versioned precache, cached navigation fallback, dedicated offline page, and an in-app update notice.
- Offline, loading/storage-error, empty-art, invalid-import, and inactive-license states with a next action.
- A US $9 one-time Workshop Pack: hosted Sociobot checkout, return-token capture, local token storage, cached daily verification, restore form, bonus inks, and finish celebration. Free play, export, and accessibility are not gated.
- Real static `/privacy/` and `/terms/` entries plus client-side navigation.
- A product-specific “generative geometry on the kitchen table” system and an original generated hero. Prompt and provenance are in `.factory/design.md` and `assets/src/`.

## Run and deploy

```sh
npm install
npm test
npm run build
```

Publish `dist/`; `dist/index.html` is at its root. The build command from the work order is exactly `npm run build`.

Staging uses the pilot billing API by default. For release, build with:

```sh
VITE_BILLING_API_BASE=https://api.sociobot.in/api/v1 npm run build
```

## Verification

- `npm test`: passes 4 unit tests and 9 browser checks across desktop Chromium and a 390 × 844 viewport; the duplicate mobile offline case is intentionally skipped.
- Browser checks cover the full two-drawing flow, all three game templates, direct legal routes, axe WCAG 2 A/AA serious/critical findings, console errors, and a real `context.setOffline(true)` reload.
- Axe: 0 serious or critical violations in both tested viewports.
- `npm audit`: 0 vulnerabilities.
- Production budgets: initial JS 34.84 KB uncompressed / 12.54 KB gzip; CSS 20.31 KB / 5.50 KB gzip; mobile hero WebP 27 KB; no downloaded fonts.
- Lighthouse 12.8.2 mobile, local production preview: **Performance 100, Accessibility 100, Best Practices 100**; FCP 0.9 s, LCP 1.7 s, CLS 0, TBT 50 ms. Lighthouse 12 no longer emits a PWA category; manifest presence and offline behavior are covered directly by browser tests.
- Manual visual review completed at desktop and 390 px. Generated hero checked for text, logo, seam, anatomy, and unwanted-symbol artifacts.

## Known gaps

- Background removal intentionally targets plain, light paper. Busy or shadowed photos need the built-in eraser; the UI says so before use.
- The factory still needs to register the billing product/return URL and set the production billing base at release. Until then, the staging buy link can return “product not found.”
- Automated browser coverage uses the supplied Chromium build; a final physical iPad/Android camera and pen smoke test is advisable before a workshop rollout.

## Suggested next steps

1. Register `doodle-to-game` with Sociobot billing and make a pilot checkout using the documented test card.
2. Run a 15-minute session on one physical tablet, checking camera orientation and stylus palm behavior.
3. Build with the production billing environment variable and deploy the resulting `dist/` through factory infrastructure.
