# Handoff — polish round 2

## Outcome

All findings in `.factory/review-1.md`, `.factory/polish-1.md`, and
`.factory/review-2.md` are resolved. The product remains a static offline PWA
with its paper-table geometry, original illustration, and local-first workflow.

Live: <https://doodle-to-game.sociobot.in>

Repair commits: `c6f38dd`, `2ec24b6`, `19ae478`
Final deployment ID: `1088e06a-3cb8-460d-a5a9-d6c247e9c13e`

## What changed

- Added a dedicated first-screen demo at `/demo` and `/?demo=1`.
- Kept all demo project and paid-preview state disposable.
- Prevented every real license read, write, restore, and verification in demo.
- Fixed production service-worker installation by excluding Azure config.
- Expanded the claims manifest and added observable tests for every promise.
- Completed drawing terminology and result-based button labels.
- Rebuilt the 404 through the shared shell with complete metadata and icons.
- Added legal-entry Apple icons and 44 px mobile navigation targets.
- Kept route focus, announcements, offline metadata, file focus, and license
  safety regressions covered.

The exact finding-to-change-to-evidence map is in `.factory/polish-2.md`.

## Verification

From `/tmp/dtg-polish2-final-4ScRhG/repo` at the exact deployed commit:

```sh
npm ci
npm test
```

Results:

- `npm ci`: 57 packages, 0 vulnerabilities.
- Vitest: 4 files, 14 tests passed.
- Playwright 1.58.2: 57 passed across desktop and 390 × 844; five intentional
  duplicate-project skips.
- All 14 `test` commands in `.factory/claims.json` passed verbatim.
- Production build: JS 40.76 KB / 13.71 KB gzip; CSS 23.47 KB / 6.06 KB gzip;
  no font payload; mobile hero 27.61 KB.
- Local Lighthouse mobile: 100 performance, 100 accessibility, 100 best
  practices; LCP 1.2 s, CLS 0, TBT 0 ms.
- Live Lighthouse mobile: 100 / 100 / 100; FCP 1.1 s, LCP 1.2 s, CLS 0,
  TBT 20 ms, 43 KiB transfer.
- Playwright axe: zero serious/critical WCAG 2 A/AA findings on demo in light
  and dark/reduced-motion modes.
- URL verifier: correct title/lang, one H1/main, all image alt text, no unlabeled
  buttons, and no console errors on live root and demo.

Live offline proof used a fresh browser context. The deployed worker activated
without requesting `/staticwebapp.config.json`; after network disable, `/demo`
reloaded, showed the offline notice, and started the sample round.

Live route proof:

- `/`, `/demo`, `/privacy`, `/terms`, `/robots.txt`, `/sitemap.xml`, manifest,
  and service worker return 200.
- `/no-such-page` returns HTTP 404 with the shared header/footer, complete
  metadata, noindex, favicon, Apple icon, and a way home.
- Privacy navigation and browser Back both focus and announce the new H1.
- Demo/Privacy/Terms mobile targets measure 44×44, 52×44, and 44×44 px.
- Production checkout returns HTTP 303 to the named Dodo checkout.
- A fresh verification burst returned 30×200 then 10×429 with
  `Retry-After: 4`.

Live deployment files are byte-identical to `dist/`:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `b78a9608ebcf9228bfd4db075665796e44228da63e2c7c4943f9c4fb6d22ddde` |
| `assets/main-DJQ02q1n.js` | `9fa22be1323b3e8e053c52b57e52c77e6fee37b0ac6703e41daee93c6b8c93ff` |
| `assets/main-BSkkqXof.css` | `22aacefc9a8faf516ba716b78b41e21642f97aa6313c2ce1560c67146cccf3b2` |
| `sw.js` | `5fa7594d6b9a46420d5ece11cf18f604193df523fa1ae854427ff93bbf795aa7` |
| `404.html` | `f8511b970cf52a3f086747b3081d4c9ef10fc228b6d92bdc97d6b3815674b378` |

Evidence screenshots:

- `/tmp/dtg-polish2-evidence/live-root/screenshot-mobile.png`
- `/tmp/dtg-polish2-evidence/live-root/screenshot-desktop.png`
- `/tmp/dtg-polish2-evidence/live-demo/cold-mobile.png`
- `/tmp/dtg-polish2-evidence/live-demo/cold-desktop.png`

## Run, test, and deploy

```sh
npm ci
npm test
npm run build
npm run preview
```

Publish `dist/` with the static work-order deployer. `dist/index.html` is the
site root.

## Known gaps and next steps

No acceptance finding or product defect remains. No real-money purchase was
submitted during verification; checkout, invalid-token, cached-verdict, offline,
and rate-limit paths were verified without charging a card.
