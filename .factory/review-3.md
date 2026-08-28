# Adversarial first-read review 3 — Doodle to Game

- Review date: 2026-08-28 UTC
- Live target: <https://doodle-to-game.sociobot.in>
- Repository candidate: `74f3d2df532719bd2b4f4cc6d44394ae8519f6b3`
- Verdict: **PASS**

This review found zero findings. The result is PASS because the cold-read,
demo, claim, storage, route, copy, accessibility, and earlier-finding checks
all passed independently.

## Cold first screen

Fresh Chromium contexts loaded the live root with no stored data at 390 × 844
and 1440 × 900. Both returned HTTP 200 and recorded no console errors.

Before scrolling, the reviewer understood:

- **What it does:** turn two drawings into a tiny game.
- **Who it is for:** an adult and child making their first game together.
- **What to click first:** **“Try it with sample data”**; the adjacent text
  says **“Opens a playable dodge game.”**

The exact visible first-screen text is **“Turn two drawings into a tiny game”**
and **“For an adult and child making their first game together.”** The action
was visible at y=468 on the 844 px phone viewport. This satisfies the
five-second first-read check.

The paper field, hand-drawn portal icon, offset ink shadows, warm palette, and
cut-paper artwork visibly follow the recorded kitchen-table geometry direction.
This is not a generic SaaS template.

## Copy audit

Counts are visible word counts. The first table lists every landing-page prose
sentence; the second lists every README sentence. Short headings, labels, and
actions are checked after the tables. No prose is over 22 words, no banned
marketing term or unexplained jargon is present, and no visitor-facing claim is
unlisted.

### Landing-page sentences

| Words | Sentence | Result |
| ---: | --- | --- |
| 7 | Turn two drawings into a tiny game | Pass — job-first H1 |
| 10 | For an adult and child making their first game together. | Pass |
| 5 | Opens a playable dodge game. | Pass — `sample-demo` |
| 8 | No account or uploads | Pass — `local-private` |
| 5 | Works after the first visit | Pass — `offline-reload` |
| 6 | US $9 once for extra inks | Pass — `workshop-pack` |
| 6 | Make a game from two drawings | Pass — `drawing-game` |
| 4 | Saved in this browser | Pass — `saved-browser` |
| 9 | Pick dodge, collect, or maze for these two drawings. | Pass — `three-games` |
| 11 | Steer your player drawing away from a shower of wobbly obstacles. | Pass — `three-games` |
| 9 | Race around the board and collect your second drawing. | Pass — `three-games` |
| 12 | Guide your player drawing through a fixed maze to the drawn goal. | Pass — `three-games` |
| 10 | Move a game to another device with a project file. | Pass — `project-export`, `project-import` |
| 8 | Four bonus ink colours and a finish celebration. | Pass — `workshop-pack` |
| 8 | The game maker, saving, and exports are free. | Pass — `free-maker` |
| 8 | Sociobot/Dodo hosts checkout as the merchant of record. | Pass — `hosted-checkout` |
| 4 | Read Privacy and Terms. | Pass — route links verified |
| 10 | Use the pad or a clear photo on plain paper. | Pass — `photo-cleanup` |
| 5 | Choose dodge, collect, or maze. | Pass — `three-games` |
| 14 | Use arrow keys, the W, A, S, and D keys, or the touch pad. | Pass — `controls` |

### README sentences

| Words | Sentence | Result |
| ---: | --- | --- |
| 10 | Turn two drawings into a tiny game with a child. | Pass — `drawing-game` |
| 12 | An adult and child can make dodge, collect, or maze games together. | Pass — `three-games` |
| 9 | Try the playable sample at the demo URL. | Pass — `sample-demo` |
| 10 | Opens a playable sample dodge game with two built-in drawings. | Pass — `sample-demo` |
| 7 | Keeps demo work separate from personal work. | Pass — `demo-isolation` |
| 6 | Saves game settings in this browser. | Pass — `saved-browser` |
| 6 | Exports and imports a project file. | Pass — project claims |
| 14 | Accepts arrow keys, the W, A, S, and D keys, and the touch pad. | Pass — `controls` |
| 5 | Works after the first visit. | Pass — `offline-reload` |
| 10 | No account or upload is needed for the game maker. | Pass — `local-private` |
| 8 | The optional Workshop Pack costs US $9 once. | Pass — `workshop-pack` |
| 6 | It adds four bonus ink colours. | Pass — `workshop-pack` |
| 9 | Read Privacy and Terms before using the optional checkout. | Pass |
| 6 | Requires Node.js 20 or newer. | Pass — developer prerequisite |
| 7 | Open the local address printed by Vite. | Pass |
| 6 | Visit `/demo` to use the sample. | Pass |
| 16 | `npm test` runs unit checks, a production build, and browser checks at desktop and mobile sizes. | Pass |
| 10 | It also checks accessibility, routes, controls, privacy, and offline reloads. | Pass |
| 10 | The build writes `dist/index.html` at the root of `dist/`. | Pass |
| 11 | Every visitor-facing promise has a tagged browser check in `.factory/claims.json`. | Pass |
| 12 | Run an individual claim from a clean install with its listed command. | Pass |
| 11 | Run `npm run build` and publish `dist/` as a static site. | Pass |
| 11 | The included static hosting configuration sets security headers and cache rules. | Pass |
| 12 | It also preserves the application routes and supplies the standalone 404 document. | Pass |
| 10 | `src/main.ts` contains the workshop, routes, demo banner, and controls. | Pass |
| 10 | `src/state.ts` keeps personal projects and disposable demo projects separate. | Pass |
| 8 | `src/game.ts` contains the three canvas game rules. | Pass |
| 7 | `scripts/build-sw.mjs` creates the offline service worker. | Pass |
| 6 | `.factory/demo.md` explains the sample sandbox. | Pass |
| 9 | `.factory/design.md` records the visual system and art provenance. | Pass |

### Headings, terms, and actions

The remaining visible heading/action units are: **Game maker** (2), **Choose
game** (2), **Add drawings** (2), **Tune rules** (2), **Play game** (2),
**Choose a game rule** (4), **Doodle dodge** (2), **Treasure dash** (2),
**Pocket maze** (2), **Add two drawings** (3), **Export project** (2),
**Import project** (2), **Workshop Pack · US $9 once** (5), **Buy Workshop
Pack** (3), **How drawings become a game** (5), **Try it with sample data**
(5), and **Choose Doodle dodge** / **Choose Pocket maze** (3 each).

They make sense out of context and either name the result or are the required
sample-data action. The product consistently uses **drawing** for source art,
**game** for the result, **game rule** for dodge/collect/maze, and **project
file** for transfer. No rewrite is required.

## Demo and sandbox

The root action opens `/?demo=1` in one click. Direct `/demo` returned its own
page title, **“Demo — Doodle to Game”**, with the persistent **“Demo — sample
data, nothing is saved”** banner, **Reset demo**, and **Start for real**.

At 390 × 844, the demo H1 begins at y=240, the sample canvas intersects
y=517–708, Start round intersects y=733–785, and the touch pad intersects
y=740–833. The first screen therefore shows an in-use sample game, not a
repeated marketing screen. Reset restored the seed and showed **“Fresh sample
drawings are ready.”** The demo made only same-origin requests.

Code inspection confirms the boundary rather than relying only on the banner:
`src/state.ts` selects the separate `doodle-to-game-demo` database while demo
mode is enabled and clears it when leaving. `src/main.ts` sets demo mode before
license helpers and explicitly skips returned-license capture, license reads,
writes, restores, and verification. The isolated claim pre-seeds a real project
and both real license keys, mutates the demo, leaves it, then deep-compares the
real values; it passed in desktop and mobile.

In a fresh live context, the service worker activated, `/demo` was reloaded
after `context.setOffline(true)`, the offline notice appeared, and **Start
round** changed the score from Ready. The observed complete demo-flow request
origin was only `https://doodle-to-game.sociobot.in`.

## Claims and test evidence

`.factory/claims.json` has 14 entries. From a separate clean clone at
`/tmp/doodle-review3-5FzCpf/repo`, all 14 exact listed build-and-test commands
passed. Each command ran the claim test in desktop and mobile except the
checkout contract, which intentionally runs once.

| Claim id | Result |
| --- | --- |
| `sample-demo` | Pass — 2 tests |
| `demo-isolation` | Pass — 2 tests |
| `local-private` | Pass — 2 tests |
| `offline-reload` | Pass — 2 tests |
| `saved-browser` | Pass — 2 tests |
| `drawing-game` | Pass — 2 tests |
| `three-games` | Pass — 2 tests |
| `photo-cleanup` | Pass — 2 tests |
| `project-export` | Pass — 2 tests |
| `project-import` | Pass — 2 tests |
| `controls` | Pass — 2 tests |
| `free-maker` | Pass — 2 tests |
| `workshop-pack` | Pass — 2 tests |
| `hosted-checkout` | Pass — 1 desktop test; mobile intentionally skipped |

The separate log is `/tmp/doodle-review3-claims.log`. It records 14 passing
claim invocations and no failures. `npm test` also passed locally: 14 unit
tests, production build, and 57 browser tests (five documented duplicate-flow
skips). No landing or README claim lacked a manifest entry; the mapping is in
the copy tables above.

## Structure, routes, and links

All live checks passed:

| Route | HTTP | Title | H1 |
| --- | ---: | --- | --- |
| `/` | 200 | Doodle to Game — turn drawings into a game | Turn two drawings into a tiny game |
| `/demo` | 200 | Demo — Doodle to Game | Play Maya and Theo’s Doodle dodge |
| `/privacy` | 200 | Privacy — Doodle to Game | Private by default |
| `/terms` | 200 | Terms — Doodle to Game | Terms of use |
| `/no-such-page` | 404 | Page not found — Doodle to Game | This game board is blank |

Every route above has `lang="en"`, exactly one H1 and main landmark, a
description under 155 characters, canonical URL, OG/Twitter title,
description, and the original 1200 × 630 social image, favicon, Apple icon,
consistent header/footer, skip link, Privacy, Terms, factory credit, and build
label. The 404 is designed in the product style, has `noindex`, and offers a
working path back to the maker.

Following Privacy focused **“Private by default”** and updated the polite live
region. Browser Back returned focus and the live region to **“Turn two drawings
into a tiny game.”** Root, Demo, Privacy, Terms, `robots.txt`, `sitemap.xml`,
manifest, and worker all returned 200; the checkout link returned the expected
303 to Dodo. The sitemap lists all public routes. No discovered ordinary link
was dead.

## Earlier finding regression check

Every finding in `review-1.md`, `review-2.md`, `polish-1.md`,
`polish-2.md`, and the previous handoff was rechecked in live behavior and the
current code/tests.

| Earlier id(s) | Current confirmation |
| --- | --- |
| B1 | Current root H1, audience sentence, and adjacent sample action are visible on both cold viewports. |
| B2; F-2-1; F-2-2 | Dedicated sample-first demo, banner/reset/exit, separated IndexedDB, no demo license UI/request, and isolated-storage claim all pass. |
| B3; F-2-3; F-2-4 | Manifest contains 14 tagged claims; all pass from clean clone. Live worker activates and the offline demo reload/play check passes. |
| M1; F-2-7 | Per-route metadata, robots, sitemap, icons, and the styled HTTP 404 are present live. |
| M2 | Live navigation and browser Back focus the new H1 and update `#route-status`. |
| M3; F-2-8 | Header/footer are consistent and include Demo, legal links, factory credit, build label, and 44 px mobile navigation targets in the regression suite. |
| M4; F-2-6 | Current wording uses the recorded terms and result-naming actions; this review’s full audit found no exception. |
| M5 | README audit above has no sentence over 22 words and no avoided jargon. |
| F-2-5 | The aggregate suite’s light/dark axe checks passed; the demo banner remains readable in the live screenshot. |
| verification-3 H-1/H-2, M-1–M-4, L-1 | The full suite passed its ink-preservation, license safety, dark contrast, roving focus, touch-target, file-focus, and offline-title regressions. Checkout remains production-hosted. |
| verification-4 H-1 | Fresh direct check: 31 concurrent invalid verification requests produced 30 × 200, then 1 × 429 with `Retry-After: 4`. |

## Missed leverage

The brief implies a local drawing/photo capture step, background cleanup,
playable output, simple rule controls, and a way to retain or move the result.
The current product includes each: camera-capable photo input, local cleanup,
three playable rules, save/export/import, and an offline sample. AI would not
improve this child-art workflow enough to justify a key, network, cost, or
privacy burden; no decorative AI feature is present.

## What would make this perfect

Nothing remains to change for the reviewed contract. Preserve the existing
claim and regression tests when changing the workshop, demo boundary, billing
integration, or service worker.
