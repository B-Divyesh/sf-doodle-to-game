# Independent product verification 5 — PASS

- Candidate: `635d7247a95ab2db7c8054b8e227deba4dc79842`
- Repository/branch: `B-Divyesh/sf-doodle-to-game`, `main`
- Live URL: <https://doodle-to-game.sociobot.in>
- Verification date: 2026-08-28 UTC
- Work order: `doodle-to-game-verify-5`
- Overall result: **PASS**

Fresh testing confirms that the exact candidate is deployed and satisfies the researched brief and factory contract. The deployment-only blocker recorded by verification 4 is repaired: the production license-verification endpoint now rate limits at an observed burst threshold of 30 accepted requests, then returns `429 Too Many Requests` with `Retry-After: 4`.

## Clean checkout and repository gates

Verification ran from a separate detached, initially clean worktree at the exact candidate SHA. Product source was not modified.

| Gate | Result | Fresh evidence |
| --- | --- | --- |
| Clean install | PASS | `npm ci`: 57 packages installed; 0 vulnerabilities |
| Dependency audit | PASS | `npm audit --audit-level=low`: 0 vulnerabilities |
| Unit/integration | PASS | Vitest: 4 files, 12 tests passed |
| Type check | PASS | Strict `tsc --noEmit` passed inside the production build |
| Lint | N/A | No lint script or lint configuration exists |
| Exact production build | PASS | `npm run build` via `npm test`: Vite 7.3.6 emitted `dist/` and generated the versioned service worker |
| Browser suite | PASS | Playwright 1.58.2: 26 passed across desktop Chromium and 390 × 844; 4 deliberate duplicate-project skips |
| Aggregate gate | PASS | `npm test` exited 0 |

The PWA is not a package, library, CLI, or owned backend, so consumer installation, public API/CLI, backend concurrency, and backend persistence tests do not apply. It has no sign-in flow, so Entra authority validation does not apply.

## End-to-end product exercise

The repository suite and independent browser flows covered the useful workshop on the local production preview and live deployment:

- Selected and started dodge, collect, and top-down maze; exercised Arrow/WASD input, the touch D-pad, reset, and Escape back to tuning.
- Drew and saved both required assets. Switching ink preserved the exact unsaved pixel count; Clear reduced it to zero and Undo restored the exact count.
- Imported a real PNG locally, removed the paper background, undid cleanup, saved the result, and confirmed the exported JSON held local `data:image/` assets.
- Changed speed, short/long score, and sound; choices persisted through IndexedDB reload.
- Empty art produced an actionable error. A 15,000,001-byte photo and unreadable image were rejected, after which valid input still worked.
- Malformed JSON, wrong-format JSON, and a project containing a remote image were rejected. A valid maze project then imported and survived reload.
- An overlong HTML-like project title was limited to 60 characters and rendered literally, with no injected element.
- Export produced the dated `doodle-game-YYYY-MM-DD.json` file in the documented format.
- Direct/client-side privacy and terms routes rendered correctly. Visual inspection found the documented paper-table visual system intact with intentional mobile stacking.
- No console errors, uncaught page errors, failed ordinary requests, or horizontal overflow occurred.

## Accessibility, keyboard, mobile, and motion

- Axe 4.10.2 reported **0 serious/critical** WCAG 2 A/AA findings for local light, live light, and live dark/reduced-motion views, both initially and after dynamic save feedback.
- `lang="en"`, a descriptive title, one `h1`, one `main`, semantic landmarks, labels, alt text, and direct legal routes are present.
- The first Tab exposes `Skip to game maker` with a 3 px designed outline; Enter focuses `main`. Template arrows retain roving focus, file controls expose a visible focus location, and no trap was found.
- At 390 px there was 0 px horizontal overflow. Footer targets measured 51×44, 44×44, and 120×44 px; the brush range was 358×44 px; all four D-pad controls were 60×60 px.
- Reduced-motion mode computed maximum animation and transition durations of `0.00001s`; gameplay remains user-controlled.

## PWA, offline, and update behavior

- Manifest fields are complete: versioned start URL, standalone display, product colors, 192/512 icons, and a maskable 512 icon. The live manifest uses `application/manifest+json`.
- The live service worker activated, controlled the page, and used cache `doodle-e79814868b09`.
- Network-disabled reload restored the correct workshop title and visible offline notice while keeping the maker usable from cache.
- A clean synthetic update changed only a served copy's cache version. The page displayed `A fresh version is ready. Reload`; the replacement worker activated, retained control, and removed the old cache.

## Privacy, billing, and API behavior

- Drawing, local photo cleanup, save, play, and axe flows generated only same-origin product requests. No artwork upload, analytics, tracking, CDN font/script, account, or sign-in traffic was observed.
- Static inspection finds only the documented, optional Sociobot billing API plus the user-invoked GitHub project-notes link. Artwork/project data use IndexedDB and explicit JSON export/import.
- A real invalid returned token was stripped while preserving `?keep=1#maker`, verified only against `api.sociobot.in`, cached as `valid:false`, and left the free tier at four inks. The verification response was `200`, `reason:"invalid"`, and `Cache-Control: no-store`.
- Checkout returned `303` to hosted Dodo checkout. The hosted page returned `200` and displayed `Doodle to Game Workshop Pack`, `$9.00`, and the correct bonus-ink/celebration description.
- No real-money purchase was submitted. Valid-return, refund, and revocation lifecycle testing therefore remains an operational post-purchase check, not a release defect; invalid, offline-unverified, cached-token binding, and restore behavior are covered by tests.

### Required rate-limit check

**PASS.** A fresh burst sent 150 concurrent unique invalid-token requests to:

`GET https://api.sociobot.in/api/v1/products/doodle-to-game/verify?license=…`

The burst completed in 1.269 seconds:

- 30 responses: HTTP 200
- 120 responses: HTTP 429
- first observed 429: zero-based request index 30
- observed threshold: **30 accepted requests per burst**
- all 429 responses: `Retry-After: 4`
- 429 body: `Too Many Requests! Wait for 4s`
- no other response status or transport error

This directly clears verification 4's only blocker, where 100/100 requests had returned 200 without `Retry-After`.

## Deployment identity and browser policy

Fresh downloads are byte-identical to the candidate's generated `dist/`:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `211c225a58df9bdbed5ac7b25b08eb9ef1d78867d87b4c7c3c115991e375285b` |
| `assets/main-D0KxyDQK.js` | `296282fbed354dbf23effd8e1b276234898ac3e477e8768582e4619afcf74f9f` |
| `assets/main-3UWwpUST.css` | `5ab59b6e475f4c64873778915df9323ba1a005127aab2bb111cdcfacff730cf0` |
| `sw.js` | `0c059cb66c5c6f3576645f3d3e42ffac63c5303ebc534b8d570681ae6434cff5` |
| `manifest.webmanifest` | `8f337a70ff7a2f575fe4507f82b8f262b74f8d6a8cd3f016d77b5485afdd85d5` |
| `privacy/index.html` | `6bfef61b8da91d737d357326edbd2d2ed3a8f0264d8398ee151cd35efe9c0391` |
| `terms/index.html` | `41317213760b59158072a0d47980c67eaaf9cc39e254aebb17042774cf75278d` |

Documents, manifest, and worker revalidate; hashed JS/CSS/images/icons are one-year immutable. Responses include the self-restricted CSP with only the production billing API in `connect-src`, two-year preload HSTS, `DENY` anti-framing, `nosniff`, strict referrer policy, COOP/CORP, and a restrictive Permissions Policy.

## Performance and budgets

- Production payloads: 36,326-byte JS (12.99 KB gzip), 20,774-byte CSS (5.60 KB gzip), 27,608-byte mobile hero, and no font payload. These are well below the 200 KB JS, 50 KB CSS, 300 KB hero, and 120 KB font budgets.
- Lighthouse 13.4.1 mobile local: **100 performance / 100 accessibility / 100 best practices**; FCP 0.9 s, LCP 1.2 s, TBT 80 ms, CLS 0, 47 KiB transfer.
- Lighthouse 13.4.1 mobile live: **100 / 100 / 100**; FCP 0.9 s, LCP 1.1 s, TBT 20 ms, CLS 0, 47 KiB transfer.
- Lighthouse navigation has no qualifying INP sample; direct drawing/game interaction remained responsive.

## Defects by severity

- Critical: none.
- High: none.
- Medium: none.
- Low: none.

## Final disposition

**PASS.** Candidate `635d7247a95ab2db7c8054b8e227deba4dc79842` is release-complete for the supplied acceptance contract. The previous deployment-only rate-limit failure is demonstrably resolved, and no product defect was found in this verification.
