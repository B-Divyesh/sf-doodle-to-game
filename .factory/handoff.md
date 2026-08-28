# Handoff — perfection-loop round 1

## Status

Published and verified. The repair starts from candidate
`e94d9abc25c6a831bb7cad6b7459cb0f023f3313`; source repairs are commits
`6be617a`, `5100a44`, and `54ff888`.

## Delivered

- First screen now names the job, the adult-and-child audience, and the
  one-click sample result in plain words.
- `/demo` and `?demo=1` open Maya and Theo’s playable dodge sample. The demo
  banner includes Reset demo and Start for real. Sample data uses a separate
  IndexedDB database and is deleted on exit.
- Nine visitor claims are listed in `.factory/claims.json` with observable
  browser tests. The catalog sentence is verb-first and 48 characters.
- Routes have focused/announced headings, titles, canonical/social metadata,
  real legal pages, Demo navigation, and an HTTP 404 designed in the product’s
  kitchen-table geometry style.
- Prior drawing-loss, focus, mobile-target, contrast, offline-metadata, and
  license safety regressions remain covered by tests.

## Verification

- Clean install: `npm ci` completed with 57 packages and 0 vulnerabilities.
- `npm test` passed: 13 Vitest checks; production build; 46 Playwright checks
  passed across desktop and 390 px, with four intentional duplicate mobile
  offline skips.
- Every command in `.factory/claims.json` passed from a clean clone. The nine
  commands each exercise desktop and mobile demo contexts (18 passing claim
  executions total).
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4174/demo` passed with a
  584 ms load, title `Demo — Doodle to Game`, `lang=en`, one H1, main landmark,
  image alts, labeled buttons, and no console errors. Screenshots:
  `/tmp/doodle-local-evidence/screenshot-desktop.png` and
  `/tmp/doodle-local-evidence/screenshot-mobile.png`.
- Playwright axe checks pass in the browser suite in light/dark states. A live
  Playwright axe scan of `/demo` found zero serious/critical WCAG 2 A/AA
  findings. The standalone axe CLI was also attempted but cannot locate a
  system Chrome binary in this worker; the preinstalled Playwright Chromium
  scan is the equivalent supported evidence.
- Production bundle: 38.40 KB JavaScript (13.32 KB gzip), 21.62 KB CSS
  (5.73 KB gzip), no web fonts, and a 27 KB mobile hero. Lighthouse was
  attempted with the installed Chromium but its launcher could not attach;
  the previously recorded candidate Lighthouse evidence remains 100/100/100.
- Deployed `dist/` with Azure Static Web Apps deployment
  `3e18f2ef-1ad0-48d5-9a8c-2ff6634990da`.
- Cold live check: `https://doodle-to-game.sociobot.in/demo` passed
  `verify-url.sh` in 886 ms with no console errors, title/lang/H1/main/alt
  checks passing. Evidence: `/tmp/doodle-live-evidence-round1/verify.json`,
  `/tmp/doodle-live-evidence-round1/screenshot-desktop.png`,
  `/tmp/doodle-live-evidence-round1/screenshot-mobile.png`, and
  `/tmp/doodle-live-evidence-round1/cold-demo-mobile.png`. `/no-such-page`
  now returns HTTP 404 and the designed missing-page screen.

## Run and deploy

```sh
npm ci
npm test
npm run build
/opt/fleet/lib/deploy-static.sh doodle-to-game dist
```

## Known gaps

None in the product. The worker’s standalone axe and Lighthouse launchers
cannot attach to a system Chrome binary; equivalent Playwright axe coverage
passed, and the browser suite covers the runtime flows.
