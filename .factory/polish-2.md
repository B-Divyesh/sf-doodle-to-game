# Polish round 2 — cumulative finding map

- Repaired candidate: `dc2852ce2edc338bd4f6fa4d96fce2b4b282f6bd`
- Repair commits: `c6f38dd`, `2ec24b6`, `19ae478`
- Live URL: <https://doodle-to-game.sociobot.in>
- Final deployment: `1088e06a-3cb8-460d-a5a9-d6c247e9c13e`
- Cold screenshots: `/tmp/dtg-polish2-evidence/live-root/screenshot-mobile.png`,
  `/tmp/dtg-polish2-evidence/live-demo/cold-mobile.png`, and
  `/tmp/dtg-polish2-evidence/live-demo/cold-desktop.png`

## Review 2

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-2-1 | Replaced the repeated landing page on `/demo` and `?demo=1` with a dedicated sample-first screen. The H1, canvas, Start round, and touch pad now fit in the initial 390 × 844 viewport. | `@claim:sample-demo`; live mobile boxes: H1 y=240, canvas y=517, Start y=733, pad y=740–833; screenshot `/tmp/dtg-polish2-evidence/live-demo/cold-mobile.png`; live `/demo` and `/?demo=1`. |
| F-2-2 | Demo detection now happens before any license helper. Demo never captures, reads, verifies, restores, or writes real license state. Paid controls are absent; bonus inks and celebration use disposable in-memory demo state. | `@claim:demo-isolation` pre-seeds and deep-compares real IndexedDB and both license keys. Live cold check found zero paid-state UI, zero license forms, zero verify requests, unchanged real keys, and the real collect project after exit. |
| F-2-3 | Excluded `staticwebapp.config.json` from the generated service-worker shell. Added a production-parity 404 interception and offline play assertion. | `@claim:offline-reload`; `does not precache the deployment-only Azure configuration`; live config URL is 404, worker controls a fresh context, offline `/demo` reloads, and Start round reaches `0 / 15s`. |
| F-2-4 | Expanded `.factory/claims.json` from 9 to 14 entries. Added exact tagged tests for two new drawings, all three game rules, photo cleanup, the free boundary, the paid celebration, and hosted checkout. | Every manifest command passed from clean clone `/tmp/dtg-polish2-final-4ScRhG/repo`; `npm test` passed 14 unit and 57 browser tests. Individual evidence: `@claim:drawing-game`, `@claim:three-games`, `@claim:photo-cleanup`, `@claim:free-maker`, `@claim:workshop-pack`, `@claim:hosted-checkout`. |
| F-2-5 | Set the demo banner to white on `#744400`, retaining the paper-and-ink identity while exceeding AA contrast. | `demo banner and controls pass accessibility checks in light and dark modes`; live axe returned no serious/critical violations in either scheme. |
| F-2-6 | Standardized source inputs as “drawings”; rewrote step and result actions to Choose game, Add drawings, Tune rules, Play game, Save drawing, Restore Workshop Pack, Load update, and Reset round. Expanded the key names. | `.factory/copy-audit.md`; `rg` terminology audit; live root/demo screenshots; `@claim:controls`. |
| F-2-7 | Rebuilt `404.html` through the shared Vite app shell. It now carries noindex, description, canonical, OG/Twitter metadata, social image, favicon, Apple icon, skip link, header, main, and footer while Azure retains HTTP 404. Added Apple icons to both legal entry documents. | `routes set metadata, announce their heading, and show a styled missing-page route`; live `/no-such-page` returned 404 with all metadata and one header/footer; `/privacy` and `/terms` each expose the Apple icon. |
| F-2-8 | Added a 44 px minimum width and centered layout to every header navigation link. | `mobile header, footer, and drawing controls have 44px touch targets`; live root/demo/privacy/terms: Demo 44×44, Privacy 52×44, Terms 44×44. |

## Earlier adversarial review

| Finding | Current repair status | Evidence |
| --- | --- | --- |
| B1 | Preserved the job-first H1, audience sentence, and adjacent one-click sample action. The action now uses the required `?demo=1` entry. | Live cold root H1 “Turn two drawings into a tiny game”, audience visible, and “Try it with sample data”; `/tmp/dtg-polish2-evidence/live-root/screenshot-mobile.png`. |
| B2 | Fully resolved by F-2-1 and F-2-2: first-screen game, banner, reset/exit, separate project database, no real license access, and discard on exit. | `@claim:sample-demo`; `@claim:demo-isolation`; live cold demo and offline checks. |
| B3 | Fully resolved by F-2-3 and F-2-4: complete manifest, exact tagged tests, whole-flow request interception, and deployed offline proof. | 14/14 claim commands passed from a clean clone; live service-worker/offline evidence. |
| M1 | Completed route titles, canonical/OG/Twitter metadata, robots, sitemap, legal entry icons, and shared-shell HTTP 404. | `routes set metadata...`; live robots/sitemap 200, unknown route 404, and byte-identical deployed documents. |
| M2 | Preserved H1 focus and polite route announcements for navigation and browser history. | Live Privacy navigation focused “Private by default”; Back focused “Turn two drawings into a tiny game”; live region matched each H1. |
| M3 | Preserved Demo navigation, factory credit, and build ID; updated build label to `20260828-polish-2`. | Live shared header/footer on root, demo, legal pages, and 404. |
| M4 | Completed the remaining terminology and action rewrite in F-2-6. | `.factory/copy-audit.md`; live copy crawl; `@claim:controls`. |
| M5 | Kept README sentences at 22 words or fewer and replaced the remaining key-name jargon. | `.factory/copy-audit.md`; banned-word and word-count scan. |

## Regression findings retained from polish 1

| Finding | Evidence it remains fixed |
| --- | --- |
| verification-3 H-1 — checkout failed | `@claim:hosted-checkout`: production endpoint returns 303 to the named Dodo page. |
| verification-3 H-2 — ink change erased pixels | `changing ink preserves every unsaved canvas pixel and undo history`. |
| verification-3 M-1 — unverified token unlocked offline | `an offline checkout-return token stays locked until server verification`; license unit tests. |
| verification-3 M-2 — dark success contrast | `dynamic success feedback passes dark-mode WCAG contrast`; live axe light/dark has zero serious/critical findings. |
| verification-3 M-3 — invisible file focus | `visible photo and project file controls expose the keyboard focus location`. |
| verification-3 M-4 — small touch targets | Mobile target test plus live 44×44-or-larger header measurements. |
| verification-3 L-1 — offline route title leaked | `offline root navigation restores workshop metadata after a legal page`. |
| verification-4 H-1 — billing verification rate limit | Fresh 40-request live burst: 30 HTTP 200, 10 HTTP 429, every 429 with `Retry-After: 4`. |

## Final evidence

- Clean clone: `/tmp/dtg-polish2-final-4ScRhG/repo`, exact deployed commit and clean after checkout.
- Aggregate: `npm test` — 14 unit tests and 57 browser tests passed; five
  intentional duplicate-project skips.
- Claims: all 14 exact commands in `.factory/claims.json` passed.
- Local Lighthouse: 100 performance / 100 accessibility / 100 best practices;
  LCP 1.2 s, CLS 0, TBT 0 ms.
- Live Lighthouse: 100 / 100 / 100; FCP 1.1 s, LCP 1.2 s, CLS 0, TBT 20 ms,
  43 KiB transfer.
- Live verifier: one H1, one main, `lang=en`, correct titles, no missing alt,
  no unlabeled buttons, and no console errors on root and demo.
- Exact deployment identity: local and live SHA-256 match for `index.html`,
  hashed JS/CSS, `sw.js`, and `404.html`.

No review finding remains open.
