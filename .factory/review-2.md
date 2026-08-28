# Adversarial first-read review 2 — Doodle to Game

- Review date: 2026-08-28 UTC
- Live target: <https://doodle-to-game.sociobot.in>
- Candidate: `dc2852ce2edc338bd4f6fa4d96fce2b4b282f6bd`
- Work order: `doodle-to-game-review-2`
- Verdict: **FAIL**

PASS requires zero findings. This review found seven blocking findings and one
minor finding. Local tests pass, but the deployed PWA does not work offline in
a fresh browser, the demo is not isolated from real license storage, and the
one-click demo does not put the sample game in the first screen.

## Cold first screen

Fresh Chromium contexts opened `/` at 390 × 844 and 1440 × 900. Before
scrolling, the page answered all three questions:

- What it does: it turns two drawings into a small game.
- Who it is for: an adult and child making their first game together.
- What to click first: **Try it with sample drawings**, which says it opens a
  playable dodge game.

The exact first-screen copy was **“Turn two drawings into a tiny game”**, **“For
an adult and child making their first game together.”**, and **“Try it with
sample drawings”** followed by **“Opens a playable dodge game.”** The first-read
requirement passes at both sizes. The sole H1 is the job headline, not the
product name. Screenshots: `/tmp/dtg-review2-cold-mobile.png` and
`/tmp/dtg-review2-cold-desktop.png`.

## Findings

### F-2-1 — BLOCKING — The one-click demo repeats the landing page instead of showing the sample game (prior B2 repeated)

- Exact location: after clicking **“Try it with sample drawings”**, `/demo` at
  390 × 844.
- Evidence: the demo banner occupies y=100–218, the repeated landing H1 starts
  at y=273, the sample title **“Maya and Theo’s doodle dodge”** starts at
  y=1,155, and the game canvas starts at y=1,371. At 1440 × 900, the sample
  title starts at y=1,216 and the canvas at y=1,305.
- Why this fails: the first screen after the one click shows another hero, not
  the product being used with sample data. A 30-second phone visitor must
  scroll more than a viewport before seeing the promised game. This leaves B2
  only half-fixed.
- Concrete fix: make `/demo` route-specific. Place the demo banner, a demo H1
  such as **“Play Maya and Theo’s doodle dodge”**, the game canvas, **Start
  round**, and touch controls in the first 844 px. Move the landing hero below
  the sample. Add a 390 px assertion that the canvas and sample title intersect
  the initial viewport.

### F-2-2 — BLOCKING — Demo mode reads and writes real Workshop Pack storage (prior B2 repeated)

- Exact quote: **“Demo — sample data, nothing is saved.”**
- Exact code: `src/main.ts` calls `captureReturnedLicense()`,
  `hasOptimisticUnlock()`, and `verifyLicense()` without a demo guard;
  `renderPaid()` exposes license restore in demo; `src/license.ts` reads and
  writes `sb_license:doodle-to-game` and
  `sb_license_verdict:doodle-to-game` in ordinary `localStorage`.
- Live evidence: pre-seeding those real keys before opening `/demo` made
  **“Workshop Pack active”** appear while the demo banner was present. Entering
  `entered-in-demo` in **“Have a license?”** on `/demo` wrote both real keys,
  even when verification returned invalid. Leaving the demo retained the real
  license values.
- What passes: project edits use the separate `doodle-to-game-demo` IndexedDB;
  leaving and returning restores the supplied dodge game. Reset restored dodge
  after a maze change.
- Why this fails: the sandbox boundary covers all storage, not only the project
  record. The demo reads real paid state and can change it while promising that
  nothing is saved.
- Concrete fix: while `isDemo`, do not read, verify, restore, or write a real
  license. Hide those controls or use disposable `demo:` keys. Extend
  `@claim:demo-isolation` to pre-seed real project and license data, exercise
  every demo control, and compare every real IndexedDB/localStorage value
  before and after exit.

### F-2-3 — BLOCKING — The deployed offline claim is false (prior B3 repeated)

- Exact quote: landing and README: **“Works after the first visit.”**
- Local result: `@claim:offline-reload` passed in both browser projects.
- Live result: in a fresh context, `navigator.serviceWorker.ready` timed out
  after 10 seconds; `getRegistrations()` returned `[]`; no worker controlled
  the page.
- Root cause: the byte-identical local and live `sw.js` includes
  `/staticwebapp.config.json` in `SHELL`. Azure consumes that deployment file
  and its public URL returns 404. `cache.addAll(SHELL)` rejects, the install
  fails, and the registration disappears. Every other shell URL returned 200.
- Why this fails: offline use is part of the product class and a listed visitor
  claim. Local Vite serves the configuration file, so the current test gives a
  production-false positive.
- Concrete fix: exclude deployment-only files from the precache list. Add a
  host-parity test that makes that URL 404, plus a post-deploy fresh-context
  test that waits for an active worker, goes offline, reloads `/demo`, and
  starts the sample game.

### F-2-4 — BLOCKING — The claims manifest is still incomplete (prior B3 repeated)

`.factory/claims.json` exists and all nine commands pass, but these live or
README promises still lack a matching claim entry and exact tagged test:

| Unlisted claim | Location | Required fix |
| --- | --- | --- |
| **“Turn two drawings into a tiny game.”** | Landing H1; README | Add a tagged clean-state test that draws and saves two new inputs, then starts a game using those pixels. The untagged E2E is not a claims entry. |
| **“Pick dodge, collect, or maze for these two drawings.”** and the three game descriptions | Landing chooser | Add a listed `three-games` claim that verifies the observable rule of each game, not only that each canvas starts. |
| **“Use the pad or a clear photo on plain paper.”** | Landing How it works | Add a listed photo-import/background-cleanup claim using a fixture and assert resulting pixels. |
| **“Four bonus ink colours and a finish celebration.”** | Landing paid section | Extend `workshop-pack`: its test counts colours but never wins a game or observes the celebration. |
| **“The game maker, saving, and exports are free.”** | Landing paid section | Add a no-license test that completes, saves, and exports a game without a paywall. |
| **“Checkout is hosted by Sociobot/Dodo.”** | Landing paid section | Add a listed test for the Sociobot 303 and named hosted checkout, or remove “/Dodo.” |
| **“Every visitor-facing promise has a tagged browser check in .factory/claims.json.”** | README | Remove this sentence until the manifest is complete, or add the entries above. |
| **“It also checks accessibility, routes, controls, privacy, and offline reloads.”** | README | Add demo-route light/dark axe coverage and a host-parity offline check. |

Why this fails: B3 required one listed test for every visitor promise. The
manifest omits the central real-drawing job, all three rules, photo cleanup,
the paid celebration/free boundary, and the hosted-checkout statement. The
README completeness claim is false.

### F-2-5 — BLOCKING — The demo banner fails dark-mode contrast

- Exact location: `/demo`, system dark mode, the banner text **“Demo — sample
  data, nothing is saved”**, **“Reset demo”**, and **“Start for real.”**
- Evidence: live axe 4.10.2 reports one serious `color-contrast` violation
  affecting all three nodes. White `#ffffff` on dark gold `#b56c00` is 4.1:1;
  normal 16 px text requires 4.5:1.
- Why this fails: the banner contains the sandbox boundary and exit controls.
  Accessibility is a non-negotiable gate.
- Concrete fix: use a darker background or dark ink on gold, verify at least
  4.5:1, and run axe on `/demo` in both colour schemes. Current tests scan `/`,
  not the added demo banner.

### F-2-6 — BLOCKING — Drawing terminology and button labels remain inconsistent (prior M4 repeated)

- Exact locations: landing step tab **“Add art”**, primary button **“Add your
  art”**, draw-step button **“Save this doodle”**, restore button **“Restore”**,
  update button **“Reload”**, and control copy **“WASD.”**
- Why this fails: the source input is otherwise a **drawing**. “Art” and
  “doodle” revive the drift in M4. The one-word buttons **“Choose”**, **“Tune”**,
  and **“Play”**, plus **“Restore”** and **“Reload”**, do not name their results.
  “WASD” assumes game vocabulary from a first-game audience.
- Concrete rewrite: use **“Choose game”**, **“Add drawings”**, **“Tune rules”**,
  **“Play game”**, **“Add two drawings”**, **“Save drawing”**, **“Restore
  Workshop Pack”**, **“Load update”**, and **“W, A, S, and D keys.”** Use
  **drawing** for source artwork everywhere, including the illustration alt.

### F-2-7 — BLOCKING — The metadata/route repair is incomplete on the 404 route (prior M1 repeated)

- Exact location: live `/no-such-page`, HTTP 404.
- Evidence: it has one H1 and a styled paper/card treatment, but no meta
  description, canonical, Open Graph fields, Twitter card, favicon,
  apple-touch icon, skip link, header, or footer. The legal entry points also
  omit the apple-touch icon.
- Why this fails: site structure requires route metadata and the shared
  header/footer on every route. The static 404 is designed but is not the same
  product skeleton, so M1 is only partially repaired.
- Concrete fix: generate the 404 through the shared shell, retain HTTP 404 and
  `noindex`, and add route-specific description/canonical/social metadata,
  both icons, skip link, normal header, and normal footer. Add the apple-touch
  icon to the legal entry documents.

### F-2-8 — MINOR — Two mobile header links are narrower than the 44 px target

- Exact location: 390 px header on `/`, `/demo`, `/privacy`, and `/terms`.
- Evidence: **Demo** measures 40 × 44 CSS px and **Terms** measures 42 × 44 CSS
  px in both themes.
- Why this fails: every touch target must be at least 44 × 44 px.
- Concrete fix: give each header link `min-width: 44px` or more inline padding,
  then assert both dimensions for every interactive element at 390 px. The
  current test only checks footer links and the range control.

## Demo and sandbox results

| Check | Result | Evidence |
| --- | --- | --- |
| One click from landing | PASS | Hero action navigates to `/demo`. |
| Realistic seeded data | PASS | Maya and Theo’s two built-in drawings and dodge game are present. |
| Product visible in first post-click screen | **FAIL** | Game starts 1,371 px down at 390 px; F-2-1. |
| Persistent banner | PASS | Banner, Reset demo, and Start for real remain present. |
| Reset after mutation | PASS | Maze selection changed back to supplied dodge. |
| Project-data isolation | PASS | `doodle-to-game-demo` is separate; re-entry restores the sample. |
| All-storage isolation | **FAIL** | Demo reads and writes real license keys; F-2-2. |
| Same-origin drawing/play traffic | PASS | Live interception saw only the product origin. |
| Offline sample | **FAIL** | Live worker never activates; F-2-3. |

## Claims run from a clean clone

A fresh clone at `/tmp/dtg-review2-claims-xTEu7e` ran every exact command from
`.factory/claims.json`. Each command built the app and ran desktop and 390 px.

| Claim ID | Result | Executions |
| --- | --- | ---: |
| `sample-demo` | PASS | 2 passed |
| `demo-isolation` | PASS | 2 passed |
| `local-private` | PASS | 2 passed |
| `offline-reload` | PASS locally; **false live** | 2 passed locally |
| `saved-browser` | PASS | 2 passed |
| `project-export` | PASS | 2 passed |
| `project-import` | PASS | 2 passed |
| `controls` | PASS | 2 passed |
| `workshop-pack` | PASS for price/inks; celebration untested | 2 passed |

Summary: 9/9 listed commands exited 0. This does not clear F-2-3 or F-2-4.

## Copy audit

Counts use visible lexical words; symbols and decorative arrows are not words.
The landing table includes navigation, headings, labels, buttons, facts, alt
text, footer copy, and collapsed license/update controls. No unit exceeds 22
words and no banned marketing word appears. `FLAG` marks jargon, inconsistent
terms, vague headings/actions, or an unsupported claim.

### Landing page

| Words | Copy unit | Result |
| ---: | --- | --- |
| 4 | Skip to game maker | Pass |
| 3 | Doodle to Game | Pass |
| 1 | Demo | Pass |
| 1 | Privacy | Pass |
| 1 | Terms | Pass |
| 4 | No account · no uploads | Pass; listed claim |
| 7 | Turn two drawings into a tiny game | FLAG: unlisted central claim |
| 10 | For an adult and child making their first game together. | Pass |
| 5 | Try it with sample drawings | Pass |
| 5 | Opens a playable dodge game. | Pass; listed claim |
| 4 | No account or uploads | Pass; listed claim |
| 5 | Works after the first visit | FLAG: false live |
| 6 | US $9 once for extra inks | Pass; listed claim |
| 15 | Two paper doodle creatures passing through red and blue gates into a handmade game board | FLAG: “doodle” vs “drawing” |
| 2 | Your worktable | FLAG: metaphor; use “Game maker” |
| 6 | Make a game from two drawings | FLAG: unlisted central claim |
| 4 | Saved in this browser | Pass; listed claim |
| 1 | Choose | FLAG: use “Choose game” |
| 2 | Add art | FLAG: use “Add drawings” |
| 1 | Tune | FLAG: use “Tune rules” |
| 1 | Play | FLAG: use “Play game” |
| 2 | Step 1 | Pass |
| 4 | Choose a game rule | Pass |
| 9 | Pick dodge, collect, or maze for these two drawings. | FLAG: unlisted claim |
| 2 | Move + survive | Pass |
| 2 | Doodle dodge | Pass: game name |
| 10 | Steer your hero away from a shower of wobbly obstacles. | FLAG: unlisted rule claim |
| 3 | Choose Doodle dodge | Pass |
| 2 | Move + gather | Pass |
| 2 | Treasure dash | Pass: game name |
| 9 | Race around the board and collect your second drawing. | FLAG: unlisted rule claim |
| 1 | Chosen | Pass: selected state |
| 2 | Think + explore | Pass |
| 2 | Pocket maze | Pass: game name |
| 11 | Guide your hero through a fixed maze to the drawn goal. | FLAG: unlisted rule claim |
| 3 | Choose Pocket maze | Pass |
| 3 | Add your art | FLAG: use “Add two drawings” |
| 6 | Export or import a project file | Pass; listed claims |
| 10 | Move a game to another device with a project file. | Pass; export/import behavior |
| 2 | Export project | Pass |
| 2 | Import project | Pass |
| 2 | Optional extra | Pass as a section label |
| 5 | Workshop Pack · US $9 once | Pass; listed claim |
| 8 | Four bonus ink colours and a finish celebration. | FLAG: celebration untested |
| 8 | The game maker, saving, and exports are free. | FLAG: unlisted claim |
| 5 | Checkout is hosted by Sociobot/Dodo. | FLAG: unlisted claim |
| 3 | Buy Workshop Pack | Pass |
| 3 | Have a license? | Pass |
| 6 | Paste the token from your receipt | Pass |
| 1 | Restore | FLAG: use “Restore Workshop Pack” |
| 5 | How to make a game | Pass |
| 5 | How drawings become a game | Pass |
| 3 | Add two drawings | Pass |
| 10 | Use the pad or a clear photo on plain paper. | FLAG: unlisted photo claim |
| 4 | Choose a game rule | Pass |
| 5 | Choose dodge, collect, or maze. | FLAG: unlisted claim |
| 4 | Play side by side | Pass |
| 7 | Use arrows, WASD, or the touch pad. | FLAG: spell out keys; listed claim |
| 8 | A tiny game maker for adults and children. | Pass |
| 4 | Built by Param Factory | Pass |
| 2 | build 20260828-polish-1 | Pass |
| 5 | A fresh version is ready. | Pass |
| 1 | Reload | FLAG: use “Load update” |

The draw step adds one repeated term failure: **“Save this doodle”** should be
**“Save drawing.”**

### README

| Words | Copy unit | Result |
| ---: | --- | --- |
| 3 | Doodle to Game | Pass |
| 10 | Turn two drawings into a tiny game with a child. | FLAG: unlisted central claim |
| 12 | An adult and child can make dodge, collect, or maze games together. | FLAG: unlisted three-game claim |
| 9 | Try the playable sample at the demo URL. | Pass; listed claim |
| 3 | What it does | Pass |
| 10 | Opens a playable sample dodge game with two built-in drawings. | Pass; listed claim |
| 7 | Keeps demo work separate from personal work. | FLAG: false for license storage |
| 6 | Saves game settings in this browser. | Pass; listed claim |
| 6 | Exports and imports a project file. | Pass; listed claims |
| 9 | Accepts arrows, WASD, and the touch pad during play. | FLAG: spell out keys |
| 5 | Works after the first visit. | FLAG: false live |
| 10 | No account or upload is needed for the game maker. | Pass; listed claim |
| 8 | The optional Workshop Pack costs US $9 once. | Pass; listed claim |
| 6 | It adds four bonus ink colours. | Pass; listed claim |
| 9 | Read Privacy and Terms before using the optional checkout. | Pass |
| 2 | Run locally | Pass |
| 6 | Requires Node.js 20 or newer. | Pass: developer prerequisite |
| 7 | Open the local address printed by Vite. | Pass |
| 6 | Visit /demo to use the sample. | Pass |
| 3 | Verify and build | Pass |
| 16 | npm test runs unit checks, a production build, and browser checks at desktop and mobile sizes. | Pass |
| 10 | It also checks accessibility, routes, controls, privacy, and offline reloads. | FLAG: demo accessibility and host parity omitted |
| 10 | The build writes dist/index.html at the root of dist/. | Pass |
| 11 | Every visitor-facing promise has a tagged browser check in .factory/claims.json. | FLAG: false; F-2-4 |
| 12 | Run an individual claim from a clean install with its listed command. | Pass |
| 1 | Deploy | Pass |
| 11 | Run npm run build and publish dist/ as a static site. | Pass |
| 11 | The included static hosting configuration sets security headers and cache rules. | Pass: unit-covered note |
| 12 | It also preserves the application routes and supplies the standalone 404 document. | Pass: unit-covered note |
| 2 | Project notes | Pass |
| 10 | src/main.ts contains the workshop, routes, demo banner, and controls. | Pass |
| 10 | src/state.ts contains local project storage and the demo namespace. | FLAG: license storage is shared |
| 8 | src/game.ts contains the three canvas game rules. | Pass |
| 7 | scripts/build-sw.mjs creates the offline service worker. | Pass |
| 6 | .factory/demo.md explains the sample sandbox. | Pass |
| 9 | .factory/design.md records the visual system and art provenance. | Pass |
| 1 | License | Pass |
| 5 | MIT © 2026 Sociobot (Param Factory). | Pass |

## History audit

Every prior `.factory/review-*.md`, `.factory/polish-*.md`, and the incoming
handoff were read. Findings were checked live and in current source.

| Earlier finding | Current status | Evidence |
| --- | --- | --- |
| B1 — audience and job absent from H1 | FIXED | Cold screens have the job H1, audience, and sample action. |
| B2 — no isolated one-click demo | **HALF-FIXED / BLOCKING AGAIN** | Banner/Reset/project DB exist; game is below the viewport and license storage is shared (F-2-1, F-2-2). |
| B3 — no complete claims manifest/tests | **HALF-FIXED / BLOCKING AGAIN** | Nine entries pass locally; live offline is false and promises remain unlisted (F-2-3, F-2-4). |
| M1 — metadata and route contract incomplete | **HALF-FIXED / BLOCKING AGAIN** | Main routes, robots, sitemap, and styled 404 exist; 404 shell/metadata are incomplete (F-2-7). |
| M2 — route focus/announcement absent | FIXED | Live navigation, Back, and Forward focus H1 and update the polite region. |
| M3 — Demo nav/factory footer/build ID absent | FIXED | Present on application routes. |
| M4 — vague actions and inconsistent source-art terms | **HALF-FIXED / BLOCKING AGAIN** | “Art,” “doodle,” vague step buttons, Restore, and Reload remain (F-2-6). |
| M5 — README overlong/jargon-heavy copy | FIXED for length | No sentence exceeds 22 words; residual WASD jargon is in F-2-6. |

Earlier checkout, ink-loss, invalid-license, dynamic-success contrast,
file-focus, footer/range target, offline-title, and rate-limit defects recorded
in verification history remain repaired where rechecked. Checkout returns 303
to a 200 Dodo page; ink changes preserve pixels; invalid licenses stay locked;
route focus works; and footer/range targets pass. F-2-3 and F-2-5 are new
deployment/demo regressions not covered by those checks.

## Structure, links, accessibility, and visual identity

| Check | Result | Evidence |
| --- | --- | --- |
| Route titles | PASS | Root uses `Doodle to Game — turn drawings into a game`; Demo/Privacy/Terms are route-first and under 60 characters. |
| One H1 and main | PASS | Exactly one of each on all checked routes, including 404. |
| Description/canonical/OG/Twitter | PASS on app routes; **FAIL on 404** | F-2-7. |
| Favicons | PASS root/demo; partial legal; **FAIL 404** | Legal HTML omits apple-touch; 404 has neither icon. |
| Social image | PASS | Original product art exists at 1200 × 630. |
| Robots and sitemap | PASS | Both return 200; sitemap lists all four real routes. |
| Deep links | PASS | Demo, Privacy, and Terms open directly. |
| Back/forward and focus | PASS | H1 receives focus and polite announcement after navigation, Back, and Forward. |
| 404 | PARTIAL | HTTP status and designed treatment pass; shared structure/metadata fail. |
| Link crawl | PASS | Internal links/assets returned 200; checkout returned 303 and its final page 200. |
| Console | PASS ordinary routes | No root/demo/privacy/terms errors. The deliberate HTTP 404 logs its failed-document status. |
| Axe light | PASS | Zero serious/critical findings on root, demo, privacy, and terms at 390 px. |
| Axe dark | **FAIL** | Demo banner has three serious contrast nodes (F-2-5). |
| Touch targets | PARTIAL | Header Demo and Terms are under 44 px wide (F-2-8). |
| Reduced motion | PASS | Reduced-motion CSS removes transitions/animations; gameplay remains input-driven. |
| Visual identity | PASS | Paper dots, offset ink shadows, geometric portals, original art, and the tomato/cobalt/leaf palette are product-specific, not generic SaaS. |

## Full local quality gate

`npm test` passed in the review worktree: 13 Vitest checks; production build;
46 Playwright checks passed with 4 expected skips. The build emitted 38.40 KB
JavaScript (13.32 KB gzip), 21.62 KB CSS (5.73 KB gzip), and `dist/`.

These results do not override live failures. Local Vite serves
`staticwebapp.config.json`; production does not.

## Missed leverage

No AI feature is justified. Sending children’s artwork to a gateway would
conflict with the local-only brief, and local background cleanup serves the
implied job. Import/export is present. Cloud sync would weaken the privacy
premise. The higher-value work is making the current demo, offline behavior,
and claims truthful before adding scope.

## What would make this perfect

1. Put the seeded game in the first `/demo` viewport.
2. Isolate or suppress every license read/write and external verification in
   demo mode, then test all real storage before and after the flow.
3. Remove deployment-only files from the service-worker shell and pass an
   offline reload against the deployed origin.
4. Add claim entries/tests for the real drawing flow, all three rules, photo
   cleanup, free boundary, celebration, and hosted checkout.
5. Clear dark-demo contrast and all 44 × 44 target failures.
6. Finish the drawing terminology and result-naming button rewrite.
7. Give the HTTP 404 the shared shell and complete route metadata.
8. Re-run the entire review from a fresh browser and clean clone. PASS is
   appropriate only when that run produces zero findings.
