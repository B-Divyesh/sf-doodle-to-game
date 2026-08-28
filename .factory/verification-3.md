# Independent product verification — FAIL

- Candidate: `0ca9bb76da0740ad160218d64e8578f052136050`
- Repository/branch: `B-Divyesh/sf-doodle-to-game`, `main`
- Live URL: <https://doodle-to-game.sociobot.in>
- Verification date: 2026-08-28 UTC
- Work order: `doodle-to-game-verify-3`
- Overall result: **FAIL**

The candidate builds cleanly, the live static application is byte-identical to that build, and the free three-game workshop is useful online and offline. It is not release-complete: the advertised checkout still returns 404, changing ink after drawing silently destroys unsaved work, and additional paid-unlock, accessibility, and touch defects remain. This result comes from fresh local and deployed testing rather than the builder's earlier deployment report.

## Clean checkout and repository gates

The run began with a clean checkout at the requested SHA. `HEAD` and `origin/main` both resolved to `0ca9bb76da0740ad160218d64e8578f052136050` after `git fetch origin --prune`.

| Gate | Result | Evidence |
| --- | --- | --- |
| Clean dependency install | PASS | `npm ci`: 57 packages installed |
| Dependency audit | PASS | `npm audit --audit-level=low`: 0 vulnerabilities |
| Unit tests | PASS | 4 files, 8 tests |
| Type check | PASS | `tsc --noEmit` completed inside the production build |
| Lint | N/A | No lint script or lint configuration exists |
| Exact production build | PASS | `npm run build`: Vite 7.3.6 emitted `dist/` and generated the versioned service worker |
| Repository E2E | PASS | 14 passed on desktop Chromium and 390 × 844; 2 intentional duplicate-project skips |
| Aggregate gate | PASS | `npm test` exited 0 |

Build output is 35.59 KB JS (12.78 KB gzip), 20.45 KB CSS (5.54 KB gzip), 27.61 KB mobile hero WebP, and no font downloads. It is comfortably within the 200 KB JS, 50 KB CSS, 120 KB font, and 300 KB hero budgets.

## Deployment identity

**PASS.** Fresh downloads from the public URL were byte-identical to the candidate's generated `dist/` files.

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `23f1d4c214fa29f3d45b547a72699f18471a843935fc21b09e944df72fc75045` |
| `assets/main-BGmlB9Lr.js` | `07a49cd2a3e9ca74ca0e420f6309ba17fa3ac4a34ff587bb35fcbb252620dfeb` |
| `assets/main-CjRs45aM.css` | `dbc75a178b922f91a5af601b63ed91c10dc6f846dae4d56cf1c0d63871c9d393` |
| `sw.js` | `77996c345f48f2425807dc89a420685248c6ca6becda10129eeed9536c9c8590` |
| `manifest.webmanifest` | `8f337a70ff7a2f575fe4507f82b8f262b74f8d6a8cd3f016d77b5485afdd85d5` |
| `privacy/index.html` | `65e9a0ea7309470aef0988af42f799923e33264f5b108ec4901731c591b76773` |

## Product exercise

The following were exercised independently against the local production preview and repeated on the live release where relevant:

- Chose and started dodge, collect, and maze. The maze was completed by keyboard in 21 valid moves and announced `Maze solved in 21 moves!`.
- Drew and saved both personal art slots, imported a real PNG locally, ran background removal, changed speed/score/sound, started/reset a round, moved with the keyboard, and used Escape to return to tuning.
- Empty art save returned `Add something to the hero pad first.` Clear reduced nontransparent pixels to 0; Undo restored the exact prior pixel count.
- A 15,000,001-byte image and unreadable image content were rejected with actionable messages, after which the editor remained usable.
- Malformed JSON, the wrong export format, and a remote-image project were rejected. A valid project imported, a title was limited to 60 characters, HTML-like title input rendered as text, and the project persisted through reload in IndexedDB.
- Export downloaded `doodle-game-2026-08-28.json` with format `doodle-to-game`.
- Direct and client-side privacy/terms routes worked. Desktop and 390 px mobile had no horizontal overflow. Visual review found a product-specific, coherent light/dark treatment with intentional mobile stacking.
- No console errors, uncaught page errors, or failed requests occurred during the ordinary drawing/play flows.

The ink-change data-loss finding below occurred identically in local production and live tests.

## Accessibility and responsive behavior

- Semantic baseline passes: `lang="en"`, descriptive title, exactly one `h1`, exactly one `main`, image alt text, ordered headings, labels, and a working skip link.
- First Tab visibly focuses the skip link with a 3 px cobalt outline in both themes; Enter moves focus to `main`. Template arrow navigation and game arrow/WASD controls work. The maze is fully keyboard-playable.
- Axe 4.10.2 reported 0 serious/critical findings for choose, draw, tune, play, privacy, and the open license form in desktop light mode. Mobile dark/reduced-motion passed except for the dynamic success notice in M-2.
- Reduced motion computes transitions/animations at `0.01ms` and removes decorative transforms.
- All D-pad buttons are 60 × 60 px, but the range and one text link miss the 44 × 44 target requirement; see M-4.
- The two hidden file inputs enter the tab order without a visible focus location; see M-3.

## PWA and offline

- Chromium's manifest inspection reported no errors. The production service worker was activated and controlled the page; cache `doodle-ewogICJfbWFp` was present.
- With network disabled, `/`, `/privacy/`, and `/terms/` rendered from the service worker, the offline notice appeared, and the workshop remained usable. Project state also survived reload through IndexedDB.
- A fresh service-worker update test replaced only the generated cache version in the local production output, called `registration.update()`, and observed the visible `A fresh version is ready. Reload` toast. The new worker activated, retained control, and removed the old versioned cache. The original candidate `sw.js` was restored byte-for-byte afterward.
- Navigating to a legal entry before going offline can leave the root workshop with the wrong document title; see L-1.

## Privacy, requests, billing, and response policy

Ordinary drawing, photo cleanup, save, export, and play produced only same-origin app requests plus a local `blob:` image URL. No artwork upload, analytics, tracking, CDN script, or remote font request was observed. Static inspection found only the documented production Sociobot billing API and the user-invoked GitHub project-notes link.

A returned invalid license was stripped from the URL while preserving the other query parameter and fragment, stored locally, checked only against `https://api.sociobot.in`, and then locked with an actionable notice. Blank and invalid restore inputs recovered correctly. A real purchase/valid-return test could not be completed because the checkout is not registered; see H-1. An offline unverified token can nevertheless bypass the paid gate; see M-1.

Live response policy now passes the repaired checks:

- Documents, `sw.js`, and the manifest: `Cache-Control: public, max-age=0, must-revalidate`.
- Hashed JS/CSS and image/icon assets: `Cache-Control: public, max-age=31536000, immutable`.
- Manifest MIME: `application/manifest+json`.
- Root responses include CSP restricted to self plus the production billing API, `Permissions-Policy`, `X-Frame-Options: DENY`, COOP/CORP, two-year preload HSTS, strict referrer policy, and `nosniff`.
- Invalid-license verification returned HTTP 200, `valid:false`, `reason:"invalid"`, `Cache-Control: no-store`, and the correct production-origin CORS header.

## Performance

Fresh Lighthouse 13.4.1 mobile runs:

| Target | Performance | Accessibility | Best practices | FCP | LCP | TBT | CLS | Transfer |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Local production preview | 99 | 100 | 100 | 0.90 s | 1.65 s | 72 ms | 0 | 69.8 KB |
| Live deployment | 100 | 100 | 100 | 1.02 s | 1.25 s | 69 ms | 0 | 49.9 KB |

Lighthouse's accessibility score covers only its initial page state; the dynamic dark-mode axe failure below was found after the save status appeared. No lab INP was available because navigation runs contained no qualifying interaction; browser interaction tests remained responsive.

## Defects

### High

**H-1 — The advertised US $9 purchase is unavailable.**

- The live `Buy Workshop Pack` correctly points at `https://api.sociobot.in/api/v1/products/doodle-to-game/checkout`.
- A fresh GET on 2026-08-28 returned HTTP 404 and `{"error":"enabled factory product","status":404}`.
- Impact: no customer can complete the advertised one-time purchase, and checkout/valid-return/restore cannot be accepted end to end.
- Required action: factory billing must register and enable `doodle-to-game` at US $9 with the production return URL, then rerun a real checkout, returned-token, cached offline unlock, restore, refund/revocation, and daily-verification test.

**H-2 — Changing ink silently deletes the current unsaved drawing.**

- In Step 2, draw a stroke, then choose another ink swatch before pressing `Save this doodle`.
- Local evidence: 4,493 nontransparent canvas pixels became 0. Live evidence: 4,317 became 0.
- The swatch handler rerenders the entire stage instead of preserving the dirty canvas. No warning is shown; a child attempting a normal multicolour drawing loses the preceding strokes.
- Impact: silent data loss in the core job-to-be-done. Undo happened to remain enabled from stale history in the tested session, but the blank canvas gives no recovery guidance and users cannot reasonably know that colour changes require an intermediate save.

### Medium

**M-1 — An arbitrary returned token unlocks paid features indefinitely while offline.** After one online visit cached the shell, going offline and opening `/?license=not-a-real-license` stripped the query, wrote `{"valid":true,"checkedAt":0}`, showed `Workshop Pack active`, exposed all 8 inks instead of 4, and remained unlocked after offline reload. The code creates a positive verdict before any successful verification. Do not treat an unverified return token as a cached valid verdict; offline optimism should use only a prior server-validated result.

**M-2 — Dark-mode success feedback has a serious WCAG contrast failure.** After advancing from Draw, axe reports `#app-status` at 1.84:1: white 16 px text on dark-mode leaf `#62d497`, versus 4.5:1 required. The notice contains important save confirmation and remains visible through Tune and Play. This is the only serious/critical axe finding in the tested dynamic states.

**M-3 — Photo and project file controls have invisible keyboard focus.** In the tab sequence, `#photo-file` and `#import-file` receive the designed 3 px outline while their 1 × 1 px boxes remain clipped by `.visually-hidden`. The visible `Use a photo` and `Import project` labels are not keyboard-focusable, so keyboard users have no visible location for these actions. Use a focusable visible control or expose the input on focus.

**M-4 — Two mobile touch targets are smaller than 44 × 44 CSS px.** At 390 px, the brush-size range measured 358 × 32 px and the footer Terms link measured 41 × 44 px. Both are interactive and fail the contract's per-axis minimum.

### Low

**L-1 — An offline root reload can inherit legal-page metadata.** Visit `/privacy/` online, then go offline and navigate to `/`. The workshop renders and remains usable, but the title is `Privacy — Doodle to Game` because every successful navigation response is stored under `/index.html`. Cache the canonical app-shell document rather than whichever navigation document most recently succeeded, or update route metadata in the client.

## Final disposition

**FAIL.** Do not promote the candidate as complete. H-1 prevents the advertised purchase, while H-2 causes silent data loss in the core drawing flow. Re-verify all listed defects after repair; the otherwise healthy build, deployment identity, privacy behavior, offline shell, headers, and performance do not offset these acceptance failures.
