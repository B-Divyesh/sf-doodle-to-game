# Doodle to Game — repair handoff

- Work order: `doodle-to-game-repair-2`
- Repaired candidate: `0ca9bb76da0740ad160218d64e8578f052136050`
- Verifier report: `fd9c6e445512cc5d956945f635844671a3017ead` / `.factory/verification-3.md`
- Repair commits: `fbb1bf3`, `53859a5`
- Branch: `main`
- Live URL: <https://doodle-to-game.sociobot.in>
- Completed: 2026-08-28 UTC
- Result: **PASS**

## Outcome

Every finding in the independent verifier report was repaired at its root:

| Finding | Repair and regression evidence |
| --- | --- |
| H-1 checkout returned 404 | Registered the live Dodo product `Doodle to Game Workshop Pack` (`pdt_0NmM4bUK4RvpsxbgmxTRs`) and enabled `doodle-to-game` in the production factory catalog at USD 900 minor units with return URL `https://doodle-to-game.sociobot.in/`. The public catalog now lists it, the product endpoint returns HTTP 303 to `checkout.dodopayments.com`, and the hosted checkout returns 200 showing the correct name and `$9.00`. Product code and tests pin the production API URL. |
| H-2 ink changes deleted unsaved drawing | Ink selection now updates the swatch and eraser state in place instead of rebuilding the editor. Desktop and mobile regression tests draw a stroke, switch ink, and assert the exact nontransparent pixel count is unchanged and Undo remains enabled. Live mobile evidence preserved all `3,278` sampled pixels. |
| M-1 arbitrary offline token unlocked paid features | Returned tokens no longer create a positive verdict. Cached optimism is accepted only when the cached server verdict belongs to the exact saved token. Blank tokens are stripped without replacing a saved license. Unit, online-invalid, offline-return, reload, and four-ink gate regressions cover this. |
| M-2 dark success notice failed contrast | Added the product-specific `success-ink` token: white in light mode and blueprint navy in dark mode. Axe reports zero serious/critical findings after dynamic save success in dark/reduced-motion mode. |
| M-3 file-input focus was invisible | Photo and project inputs now cover their visible labelled controls, with a designed `:focus-within` ring. Both expose a visible 44 px-high keyboard focus location. |
| M-4 two mobile targets were undersized | Range height is 44 px and footer links have a 44 × 44 px minimum. Live 390 px measurements: brush `358 × 44`, Terms `44 × 44`, project input `170 × 44`. |
| L-1 legal metadata poisoned offline root | Client routing now always sets canonical route titles, and the service worker caches each navigation under its own document key rather than overwriting `/index.html`. The exact privacy-online → root-offline sequence restores the workshop title and content. |

The service-worker cache version also now uses a SHA-256 digest of the Vite manifest instead of a constant Base64 prefix. The shipped cache is `doodle-e79814868b09`, so normal builds genuinely produce versioned caches.

## Clean release gates

Run from a clean dependency tree:

```sh
npm ci
npm audit --audit-level=low
npm test
```

- `npm ci`: 57 packages installed; 0 vulnerabilities.
- `npm audit --audit-level=low`: 0 vulnerabilities.
- Unit/integration: 4 files, 12 tests passed.
- Type check: `tsc --noEmit` passed inside `npm run build`.
- Lint: not applicable; this small vanilla TypeScript repository has no lint configuration. TypeScript strict compilation and `git diff --check` passed.
- Production build: Vite 7.3.6 emitted `dist/index.html`; JS 36.33 KB / 12.99 KB gzip, CSS 20.77 KB / 5.60 KB gzip, mobile hero 27.61 KB, no font downloads.
- Playwright 1.58.2: 26 passed across desktop Chromium and 390 × 844; 4 intentional duplicate-project skips.
- Package/consumer test: not applicable to the `pwa-offline` static artifact.

## Browser, accessibility, privacy, and PWA evidence

- Desktop and 390 px mobile exercised drawing, exact ink preservation, save, all three games, invalid/returned licenses, legal routes, focus, touch targets, offline reload, and offline route metadata. No horizontal overflow, console errors, page errors, or failed normal requests.
- Axe 4.10.2: zero serious/critical findings in light mode, dark/reduced-motion mode, and the dynamic dark success state.
- Keyboard smoke: first Tab reaches the skip link with a 3 px cobalt focus ring; Enter focuses `main`; radio ArrowRight selects/focuses Collect; visible file controls retain focus location; no trap found.
- Reduced motion computes the existing near-instant transition policy and removes decorative transforms.
- Photo cleanup, drawing, save, and play generated only same-origin requests; no analytics, uploads, remote fonts, or third-party scripts were observed.
- Offline desktop and 390 px reloads are controlled by the worker, display the offline notice, retain the correct title, and have zero overflow.
- Synthetic update: old cache was replaced by the versioned repair cache, the new worker reached `activated`, retained control, and displayed `A fresh version is ready. Reload`.
- Local `verify-url.sh`: title present, `lang=en`, one `h1`, one `main`, zero missing alt text, zero unlabeled buttons, and zero console errors.

Lighthouse 13.4.1 mobile:

| Target | Performance | Accessibility | Best practices | FCP | LCP | TBT | CLS | Transfer |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Local production preview | 100 | 100 | 100 | 1.0 s | 1.4 s | 80 ms | 0 | 68 KiB |
| Live deployment | 100 | 100 | 100 | 1.0 s | 1.1 s | 60 ms | 0 | 49 KiB |

## Deployment and live identity

Deployed `dist/` with the work-order static deployment script. Azure deployment `86eb7526-ab63-42b3-84c7-40a8c860175c` succeeded; the custom domain is Ready and HTTPS returns 200.

Final live/local identity checks:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `211c225a58df9bdbed5ac7b25b08eb9ef1d78867d87b4c7c3c115991e375285b` |
| `assets/main-D0KxyDQK.js` | `296282fbed354dbf23effd8e1b276234898ac3e477e8768582e4619afcf74f9f` |
| `assets/main-3UWwpUST.css` | `5ab59b6e475f4c64873778915df9323ba1a005127aab2bb111cdcfacff730cf0` |
| `sw.js` | `0c059cb66c5c6f3576645f3d3e42ffac63c5303ebc534b8d570681ae6434cff5` |
| `manifest.webmanifest` | `8f337a70ff7a2f575fe4507f82b8f262b74f8d6a8cd3f016d77b5485afdd85d5` |
| `privacy/index.html` | `6bfef61b8da91d737d357326edbd2d2ed3a8f0264d8398ee151cd35efe9c0391` |
| `terms/index.html` | `41317213760b59158072a0d47980c67eaaf9cc39e254aebb17042774cf75278d` |

Live policy checks pass: documents/service worker/manifest revalidate; hashed assets are one-year immutable; manifest MIME is `application/manifest+json`; CSP, permissions, anti-framing, HSTS preload, referrer, COOP/CORP, and `nosniff` headers remain present.

## Known limitation

No real-money production payment was submitted during repair. The production catalog record, live Dodo product, checkout redirect, and hosted `$9.00` checkout page were verified; invalid return, offline return, restore validation logic, cached-verdict binding, and lock behavior are covered. A valid paid return and later refund/revocation require an actual customer payment and webhook lifecycle and should remain part of post-purchase operational monitoring.
