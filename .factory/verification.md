# Independent product verification — FAIL

- Candidate: `702679658faf66b7e06fa33b9f5f19ef80e1fc25`
- Repository/branch: `B-Divyesh/sf-doodle-to-game`, `main`
- Live URL: <https://doodle-to-game.sociobot.in>
- Verification date: 2026-08-28 UTC
- Work order: `doodle-to-game-verify-2`
- Overall result: **FAIL**

The core local-first game workshop works, and the live static files match the candidate exactly. The release nevertheless fails the contract because the advertised purchase cannot be completed and the system dark treatment has serious WCAG contrast violations. These are fresh findings from the deployed URL, not a reliance on the builder's earlier report.

## Clean checkout and repository gates

The checkout began clean at the requested SHA and matched `origin/main` after `git fetch origin --prune`.

| Gate | Result | Evidence |
| --- | --- | --- |
| Clean dependency install | PASS | `npm ci`: 57 packages installed; 0 vulnerabilities |
| Dependency audit | PASS | `npm audit --audit-level=low`: 0 vulnerabilities |
| Unit tests | PASS | 2 files, 4 tests |
| Type check | PASS | `tsc --noEmit` runs inside the build |
| Lint | N/A | No lint script or lint configuration is present |
| Exact production build | PASS | `npm run build`: Vite 7.3.6 emitted `dist/` |
| Repository E2E | PASS | 9 passed across desktop Chromium and 390 × 844; 1 intentionally skipped duplicate mobile offline case |
| Aggregate repository gate | PASS | `npm test` exited 0 |

Build output: JS 34.84 KB / 12.54 KB gzip, CSS 20.31 KB / 5.50 KB gzip, mobile hero WebP 27.61 KB. There are no font downloads. The initial JS and CSS are well below the 200 KB and 50 KB budgets.

## Deployment identity

**PASS.** The live deployment is the candidate build. Fresh downloads of the following live artifacts were byte-identical to the locally generated files:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `1285d710aff60385e2b5e7e265a07fd5d0a55c0dd22e6510d8ed3ae1d9003c0e` |
| `assets/main-C9cJfGCj.js` | `2a2484f14c9c8314eae1bd8781fa222594beaf8b0cefc93953679656ba7e4a8f` |
| `assets/main-2Hheiv32.css` | `6d3eb6f2140d073db92d55cd37c39b9184654b2dcc7642b87ab15fb89ead9923` |
| `sw.js` | `a8e88e99b6db80f5a69dc385afc11be610bef4f508eafe03a026bb6ff45d7559` |
| `manifest.webmanifest` | `403304cd6a4a38191d220770ba9123eab7a6f01fc66574d75e20cc8d46cc2679` |
| `privacy/index.html` | `6df037ebb2aa3f5d4ad5ace4d929bad39ee7cdc40a2ca3e4bad75d3cbd03cc33` |

## End-to-end product evidence

Tested independently against the local production preview and repeated on the live URL where applicable:

- Chose and started dodge, collect, and maze; completed the maze with 21 keyboard moves and received `Maze solved in 21 moves!`.
- Drew art, saved both slots, changed speed/score/sound, played, reset, and used Escape to return to tuning.
- Empty art save produced `Add something to the hero pad first.`; clear followed by Undo restored all 1,856 sampled nontransparent pixels and the restored art saved successfully.
- Loaded a real PNG through the photo input, ran `Remove paper`, undid it, and saved the result. Observed requests were only local app files plus a local `blob:` URL.
- A 15,000,001-byte image was rejected with the documented 15 MB limit; unreadable image content was rejected and the editor remained usable.
- Malformed JSON and a project containing a remote image were rejected. A subsequent valid project imported successfully, a 60-character title boundary was enforced, and HTML-like title input rendered as text rather than markup.
- Export produced `doodle-game-2026-08-28.json`; project selection and drawings persisted across reload through IndexedDB.
- Direct and client-side `/privacy` and `/terms` routes worked.
- Desktop and 390 × 844 mobile had no horizontal overflow. Mobile intentionally drops the hero art and stacks the maker. No console errors, uncaught page errors, or failed normal requests were observed.

## PWA and offline

**PASS.** Chromium reported no manifest or installability errors. The service worker activated, controlled the page, and created cache `doodle-ewogICJfbWFp`. After the network was disabled, the shell reloaded, the visible offline notice appeared, and an imported maze remained selected from IndexedDB.

A service-worker update was tested using a temporary byte-identical served build with only the cache version changed. The old cache was removed, the new worker reached `activated`, and the visible toast read `A fresh version is ready. Reload`. No update errors occurred.

## Accessibility and responsive checks

- Light theme: 0 serious/critical axe findings on initial, dynamic, desktop, and 390 px states.
- Dark theme with reduced motion: **1 serious rule affecting 6 nodes**; see H-2.
- Semantic basics pass: `lang="en"`, descriptive title, one `h1`, one `main`, image alt text, ordered headings, and a working skip link.
- First Tab focuses the skip link with a visible 3 px cobalt outline; Enter moves focus to `main`.
- Reduced motion computes transition/animation duration as `0.01ms` and eliminates decorative transform movement.
- Touch D-pad controls are 60 × 60 px, but three mobile footer links miss the 44 px target requirement; see M-2.
- Custom radio cards can be chosen with Space, but their arrow behavior and post-selection focus are defective; see M-1.

## Privacy, requests, and browser policies

Ordinary drawing/play made no third-party requests: only same-origin HTML/JS/CSS/image/manifest requests and local `blob:` image URLs occurred. No analytics, CDN fonts, third-party scripts, accounts, or artwork uploads were found. A license token was removed from the browser URL and only sent to the configured Sociobot verification endpoint.

Live response headers include HSTS, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`, and `X-DNS-Prefetch-Control: off`. Missing/weak hardening and MIME/caching details are recorded below.

## Performance

Fresh Lighthouse 12.8.2 mobile runs:

| Target | Performance | Accessibility | Best practices | FCP | LCP | TBT | CLS | Transfer |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Local production preview | 99 | 100 | 100 | 0.90 s | 1.65 s | 113 ms | 0 | 69.5 KB |
| Live deployment | 100 | 100 | 100 | 0.90 s | 1.05 s | 14 ms | 0 | 48.6 KB |

No lab INP was available because the Lighthouse navigation had no qualifying interaction. Interactive game input was responsive in browser tests. HTTP caching still violates the explicit immutable-asset policy; see M-3.

## Defects

### High

**H-1 — The advertised US $9 purchase is unusable on the live release.**

- Live `Buy Workshop Pack` resolves to `https://pilot-api.sociobot.in/api/v1/products/doodle-to-game/checkout`, not the required production API.
- Fresh GETs to both that pilot URL and `https://api.sociobot.in/api/v1/products/doodle-to-game/checkout` return HTTP 404 with `{"error":"enabled factory product","status":404}`.
- An invalid returned token was stripped safely, but verification also went to the pilot host.
- Impact: nobody can buy the advertised one-time unlock. This is a release acceptance failure even though the free workshop remains usable.
- Required fix: register/enable the product and return URL, build the release with `VITE_BILLING_API_BASE=https://api.sociobot.in/api/v1`, deploy, and complete a real checkout/return/restore smoke test.

**H-2 — Dark mode has six serious axe color-contrast failures.**

- With `prefers-color-scheme: dark` and reduced motion, axe reports serious `color-contrast` failures.
- Workshop Pack heading, body, and `Have a license?` are `#1a2738` on `#070d17`: 1.28:1 (required 3:1 for the large heading and 4.5:1 for normal text).
- Footer Privacy, Terms, and project-notes links are `#9fc0ff` on `#f8f3e7`: 1.65:1 (required 4.5:1).
- Impact: paid information and legal/provenance links are unreadable for many users; the non-negotiable “0 serious/critical” and both-theme contrast gates fail.

### Medium

**M-1 — The game-template radio group has incomplete keyboard behavior and loses focus.** ArrowRight from a focused Dodge `role="radio"` did not select/focus Collect. Space selected Dodge, but the rerender moved focus to `BODY`; the next Tab restarts at the skip link. Implement roving focus/arrow selection and restore focus to the selected card after rendering.

**M-2 — Mobile footer links miss the minimum touch target.** At 390 px, Privacy measured 51 × 16 px, Terms 41 × 16 px, and project notes 120 × 16 px. Add at least 44 px target height without reducing separation or legibility.

**M-3 — Hashed production assets are not long-lived immutable.** Live HTML, hashed JS, hashed CSS, images, manifest, and service worker all return `Cache-Control: public, must-revalidate, max-age=30`. Hashed assets should receive a long `max-age` plus `immutable`; HTML and `sw.js` should retain short/revalidation caching.

### Low

**L-1 — Malformed project JSON exposes a parser message without a recovery action.** The UI announces `Unexpected end of JSON input`. Use product language such as “That project file is incomplete. Export it again or choose another Doodle to Game JSON file.” Recovery itself works.

**L-2 — Response hardening is incomplete.** The document has no `Content-Security-Policy`, `Permissions-Policy`, or anti-framing policy. HSTS advertises `preload` with `max-age=10886400`, below the one-year preload requirement. Add policies appropriate to the first-party static PWA.

**L-3 — The live manifest has a generic MIME type.** It is served as `application/octet-stream` rather than `application/manifest+json`. Chromium still parsed it and reported no installability errors, so this is currently interoperability hardening rather than a functional blocker.

## Final disposition

**FAIL.** Do not promote this candidate as complete. Re-verify at minimum H-1 and H-2 after changes; M-1 through M-3 are also direct acceptance-contract violations and should be cleared before release.
