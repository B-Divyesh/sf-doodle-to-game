# Handoff — perfection-loop round 1

## Status

**Ready to publish.** This repair addresses every blocking item in
`review-1.md` for candidate `635d7247a95ab2db7c8054b8e227deba4dc79842`.
The source repair is commit `64af89d7f9f82c6d2701242e13071bbe154d6a17`.

## What changed

- Replaced the brand H1 with the plain job headline and named the adult-and-child
  audience on the first screen.
- Added `/demo` and `?demo=1`: a seeded playable dodge game, persistent demo
  banner, reset control, and real-work exit. Demo projects use the separate
  `doodle-to-game-demo` IndexedDB database.
- Added the claims manifest, nine tagged browser checks, demo documentation,
  plain-language copy audit, and catalog description.
- Added route titles, dynamic canonical/social metadata, Demo navigation,
  route focus and live announcement, legal H1s, a designed application 404,
  standalone `404.html`, robots, sitemap, factory footer credit, and build ID.
- Preserved the kitchen-table geometry visual system while making the 390 px
  first screen, banner, navigation, and workshop stack work cleanly.
- Added a 1200 × 630 social crop derived from the approved original hero art.

## Verification evidence

- `npm ci` completed from a clean clone.
- `npm test` passed: 12 unit checks; production build; 44 browser checks passed
  across desktop and 390 px, with 4 intentionally scoped mobile offline skips.
- Every command in `.factory/claims.json` was run from a fresh clone of
  `64af89d`; all 9 claim commands passed in desktop and mobile contexts.
- The claim suite exercises the demo seed/reset/isolation, same-origin request
  flow including photo input, offline reload, browser saving, project export
  and import, keyboard/touch controls, and the Workshop Pack display.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173/demo` passed: HTTP 200,
  title `Demo — Doodle to Game`, `lang=en`, one H1, main landmark, zero missing
  image alts, zero unlabeled buttons, and zero console errors. Measured local
  load time was 575 ms.
- Playwright axe checks passed in light and dark treatments with zero serious or
  critical WCAG 2 A/AA findings. The standalone axe CLI could not start its
  Selenium Chrome session in this worker; the repository uses the Playwright
  axe integration against the preinstalled browser instead.
- Production bundle: 38.15 KB JavaScript (13.29 KB gzip), 21.62 KB CSS
  (5.73 KB gzip), no downloaded fonts, and 27 KB mobile hero WebP.
- Lighthouse mobile on `/demo` scored 100 performance and 100 accessibility
  (`/tmp/doodle-lighthouse-final.json`, with full-page screenshots disabled).

## Run and deploy

```sh
npm ci
npm test
npm run build
/opt/fleet/lib/deploy-static.sh doodle-to-game dist
```

## Known gaps

None. The only non-product tooling limitation was the standalone axe CLI's
browser launch; equivalent Playwright axe coverage passed in the supported
browser environment.
