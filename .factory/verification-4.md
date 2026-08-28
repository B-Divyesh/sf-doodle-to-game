# Independent product verification 4 — FAIL

- Candidate: `635d7247a95ab2db7c8054b8e227deba4dc79842`
- Repository/branch: `B-Divyesh/sf-doodle-to-game`, `main`
- Live URL: <https://doodle-to-game.sociobot.in>
- Verification date: 2026-08-28 UTC
- Work order: `doodle-to-game-verify-4`
- Overall result: **FAIL**

Fresh evidence confirms that the candidate is deployed and that the earlier production-checkout failure is repaired. The core local-first workshop, PWA, privacy, responsive/keyboard flows, accessibility, response policy, and performance gates pass. This candidate still fails the acceptance contract because its server-side Sociobot license-verification endpoint did not rate limit a deliberate rapid burst: 100 concurrent requests all returned `200`, with no `Retry-After`.

## Clean checkout and repository gates

The run began with a clean worktree at the requested SHA (`git status --short` empty; `HEAD` was the candidate).

| Gate | Result | Fresh evidence |
| --- | --- | --- |
| Clean install | PASS | `npm ci`: 57 packages installed; audit found 0 vulnerabilities |
| Tests | PASS | `npm test`: Vitest 4 files / 12 tests passed; Playwright last-run status `passed` (30 planned across desktop and 390 px; 26 passed and 4 expected skips) |
| Type check | PASS | `tsc --noEmit` completed in `npm run build` |
| Lint | N/A | No lint command/configuration is present |
| Exact production build | PASS | Vite emitted `dist/` and generated the versioned worker |

Build output: JS 36.33 KB (12.99 KB gzip), CSS 20.77 KB (5.60 KB gzip), no font payload, and mobile hero WebP 27.61 KB. All are inside the supplied static-product budgets.

## Live deployment identity

**PASS.** Fresh public artifacts were byte-identical to the candidate build.

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `211c225a58df9bdbed5ac7b25b08eb9ef1d78867d87b4c7c3c115991e375285b` |
| `assets/main-D0KxyDQK.js` | `296282fbed354dbf23effd8e1b276234898ac3e477e8768582e4619afcf74f9f` |
| `assets/main-3UWwpUST.css` | `5ab59b6e475f4c64873778915df9323ba1a005127aab2bb111cdcfacff730cf0` |
| `sw.js` | `0c059cb66c5c6f3576645f3d3e42ffac63c5303ebc534b8d570681ae6434cff5` |
| `manifest.webmanifest` | `8f337a70ff7a2f575fe4507f82b8f262b74f8d6a8cd3f016d77b5485afdd85d5` |

## End-to-end, responsive, and recovery evidence

Fresh live Playwright runs at desktop and 390 × 844:

- selected templates; drew and saved hero/object art; changed ink without loss (desktop 1,601→1,601 alpha pixels; mobile 3,800→3,800); changed speed; played with keyboard; and used Escape to return to tuning;
- verified all three fixed templates in the repository browser suite, plus persistence, local export/import, legal routes, photo cleanup, and offline regression cases;
- rejected a 15,000,001-byte photo, then an unreadable image, while retaining editor recovery; loaded a real PNG locally; removed paper; and undid it;
- rejected malformed JSON and a remote-image project, then imported a valid maze project. It persisted over reload and HTML-like title input rendered as text;
- observed no console errors, page errors, failed normal requests, or horizontal overflow. The 390 px layout intentionally removes the hero image, stacks the workshop, and keeps all content and controls visible.

## Accessibility and PWA

- Axe 4.10.2 found **0 serious/critical** WCAG 2 A/AA issues in live desktop/390 px light views and live 390 px dark/reduced-motion view.
- Baseline passes: `lang="en"`, descriptive title, one `h1`, one `main`, alt text, and direct legal routes. First Tab visibly focuses `Skip to game maker` (`rgb(24, 89, 201) solid 3px`), Enter focuses `main`, template arrows/Home retain roving focus after persistence, and Escape leaves play. Mobile footer links measured 51×44, 44×44, and 120×44 px.
- Reduced-motion transition and animation durations were `0.01ms`.
- The candidate worker controlled the page with cache `doodle-e79814868b09`. Network-disabled reload showed the offline notice and usable workshop.
- An update test served the exact built `dist/` from a local static server while changing only the response copy's cache-version string. The update toast appeared; after Reload the replacement worker was activated and only `doodle-update-e79814868b09` remained cached. Candidate files were not modified.

## Privacy, billing, response policy, and performance

- Normal drawing/photo/save/play traffic was same-origin resources plus local `blob:` URLs. No artwork upload, analytics, tracking, CDN font/script, account, or sign-in flow was found. The only app API is the optional user-initiated Sociobot license check.
- The live buy link targets `https://api.sociobot.in/api/v1/products/doodle-to-game/checkout`. Fresh GET returned **HTTP 303** to `checkout.dodopayments.com`, proving the earlier 404 deployment problem is repaired. No real paid charge was attempted.
- Invalid-license verification returns `valid:false`, `reason:"invalid"`, and `Cache-Control: no-store`; invalid online and offline returned tokens remain locked.
- Documents include self-restricted CSP (with production billing API), HSTS two-year preload, `X-Frame-Options: DENY`, `nosniff`, strict referrer policy, COOP/CORP, and Permissions-Policy. Documents/manifest/SW revalidate; hashed JS/CSS are one-year immutable; manifest MIME is `application/manifest+json`.
- Lighthouse 13.4.1 mobile: local preview **99 performance / 100 accessibility / 100 best practices**, live **99 / 100 / 100**. Both reported FCP/LCP 1.7 s, TBT 0 ms, CLS 0, 68 KiB transfer. Lab INP had no qualifying navigation interaction; direct game-input tests were responsive.

## Defects

### High

**H-1 — Production license verification has no observed rate limiting.**

- Endpoint: `GET https://api.sociobot.in/api/v1/products/doodle-to-game/verify?license=…`.
- Forty rapid sequential invalid-token requests all returned HTTP 200. A fresh burst of **100 concurrent** invalid-token requests also returned **100 × HTTP 200**. No response contained `Retry-After`; no HTTP 429 was observed, so no threshold exists to record.
- Impact: this directly fails the work-order requirement for every server-side endpoint and allows uncontrolled verification/token-guessing traffic.
- Required remediation: apply server-side per-client/IP and/or product/token limits to verification (and appropriate checkout protection), respond `429 Too Many Requests` with a positive `Retry-After`, then repeat the burst and record its threshold.

## Final disposition

**FAIL.** Do not mark this candidate release-complete until H-1 is fixed and independently rechecked. The earlier checkout deployment failure is resolved; this fresh failure is missing required API rate-limit behavior.
