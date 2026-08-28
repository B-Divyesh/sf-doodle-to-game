# Adversarial first-read review 1 — Doodle to Game

- Review date: 2026-08-28 UTC
- Live target: https://doodle-to-game.sociobot.in
- Candidate: 5aa3592c0957520a65d81721bd2fb0b5a043b936
- Verdict: **FAIL**

PASS requires zero blocking findings. This review found three.

## Cold first screen

Fresh Chromium contexts loaded the live root at 390 × 844 and 1440 × 900 with
HTTP 200, no console errors, and no failed requests. Before scrolling, the
reviewer could infer that this turns two drawings or paper photos into a small
game and that the visible action is **“Make a game.”** The reviewer could not
identify the intended adult-and-child audience from that screen. The only
audience-adjacent copy is **“Their drawing. Your tiny game.”** and **“Draw or
photograph two characters, pick one simple rule, then play together.”** Neither
names an adult, child, or the shared situation required by the brief.

The cold mobile image is a paper-table illustration and bold type treatment,
not a generic gradient/card SaaS template. The visual-identity check passes.

## Blocking findings

### B1 — The hero does not state who this is for, and its actual H1 is the product name

- Quote: <h1>Doodle to Game</h1>; visible hero heading: **“Their drawing. Your
  tiny game.”**
- Why a first-time visitor is lost: the only H1 is the brand, not the
  job-to-be-done. A parent, teacher, child, or solo maker cannot tell whether
  this is meant for them in the allotted first screen.
- Concrete fix: make the H1 **“Turn two drawings into a tiny game”**. Directly
  below it write **“For an adult and child making their first game together.”**
  Put **“Try it with sample drawings — opens a playable dodge game”** beside it.

### B2 — There is no one-click, isolated sample-data demo

- Quote: the only hero action is **“Make a game →”**. Neither the hero nor the
  navigation contains **“Try it with sample data.”**
- Check: in fresh contexts, both /demo and /?demo=1 return the normal empty
  workshop, titled **“Doodle to Game — make their drawing playable.”** Neither
  contains “Demo”, “sample data”, “Reset demo”, or “Start for real”; neither
  shows a completed game, seeded drawings, or a demo banner.
- Why a first-time visitor is lost or misled: the visitor must create two
  drawings before seeing the product's result. There is no 30-second try-out or
  sandbox boundary that protects real data.
- Concrete fix: link **“Try it with sample drawings”** to /demo (or ?demo=1).
  It must immediately open a realistic two-drawing game with a persistent
  **“Demo — sample data, nothing is saved”** banner, **“Reset demo”**, and
  **“Start for real.”** Use a separate demo: IndexedDB namespace, discard it
  on exit, and document this in .factory/demo.md.

### B3 — No claims manifest or claim-tagged tests exist

- Quote: **“Works offline after the first visit”**, **“Autosaves locally”**,
  **“Your drawings stay on this device”**, and **“No account. No uploads.”**
- Check: .factory/claims.json is absent. Repository search found no @claim:
  tag. There were therefore zero listed claim commands to run from a clean
  clone, instead of executable evidence for each visitor promise. npm ci did
  complete successfully: 57 packages installed and zero vulnerabilities.
- Why a first-time visitor is lost or misled: privacy, persistence, time,
  price, and offline statements have no independently runnable proof. The
  missing demo also makes the required sandbox/privacy/offline interception
  test impossible.
- Concrete fix: add .factory/claims.json and one clean-state test tagged
  @claim:<id> for every claim below. Exercise each only through /demo. Intercept
  the whole demo flow and assert only same-origin product traffic; then go
  offline after the first demo visit and reload the seeded game. Remove any
  statement that cannot be tested.

### Unlisted claims covered by B3

The absent manifest has no entry for: **“No account.”**, **“No uploads.”**,
**“Everything happens right here on your device.”**, **“Works offline after the
first visit”**, **“About 15 minutes”**, **“Autosaves locally”**, **“Same
drawings, three dependable rules.”**, **“You can switch later.”**, **“Move this
game to another device with a private project file.”**, **“Unlock four bonus
ink colours and a geometric finish celebration.”**, **“The complete three-game
maker, saving, and exports stay free.”**, **“Refunds are handled there.”**,
**“Use the built-in pad or photograph bold art on plain paper.”**, **“Nothing
else to configure.”**, **“Use arrows, WASD, or the roomy touch pad.”**, **“Made
for side-by-side play.”**, and **“Your drawings stay on this device.”**

The first cold load requested only same-origin root, JS, CSS, and hero image.
That does not prove broader privacy claims because it does not cover drawing,
storage, export, photo input, or the absent demo flow.

## Other findings

### M1 — Metadata and route contract are incomplete

- Quote: /demo has **“Doodle to Game — make their drawing playable”**, not a
  Demo title. The document has a description and favicons but no canonical,
  Open Graph, or Twitter-card fields.
- Check: /robots.txt and /sitemap.xml return the root application. /no-such-page
  returns the ordinary landing workshop with HTTP 200, not a designed 404.
- Concrete fix: emit canonical, OG, and Twitter metadata with a 1200 × 630
  product-art image; add real robots and sitemap files; make a styled 404; set
  /demo to **“Demo — Doodle to Game.”**

### M2 — Client-side navigation does not focus the new H1 or announce it

- Quote: after following **“Privacy”** and then using Back, the active element
  was <main id="main"> on each route. The only aria-live region remained empty.
  Both route H1s read **“Doodle to Game.”**
- Why a first-time visitor is lost or misled: keyboard and screen-reader users
  do not receive the route identity or announcement.
- Concrete fix: use one route-specific H1, focus it after pushState and
  popstate, and update a polite live region with the new page name.

### M3 — Required navigation/footer items are absent

- Quote: header **“Doodle to Game / Privacy / Terms”**; footer **“Privacy ·
  Terms · Generated hero artwork disclosed in the project notes.”**
- Check: no Demo navigation item; no **“Built by Param Factory”** or build ID.
- Concrete fix: add a visible Demo link, factory credit, and build ID.

### M4 — Copy uses vague slogans and inconsistent asset terms

- Quote: **“Their drawing. Your tiny game.”**, **“The whole trick”**, **“Paper
  in. Play out.”**, **“Choose the kind of fun”**, and **“Choose this.”**
- Why a first-time visitor is lost or misled: these headings do not stand alone
  in a screen-reader heading list, and **“Choose this”** does not name the
  result. The same input is called **drawing**, **character**, **art**,
  **doodle**, and **hero**; the product is a **workshop**, **worktable**,
  **maker**, and **game**.
- Concrete fix: use **“How to make a game”**, **“How drawings become a game”**,
  and **“Choose a game rule.”** Name actions **“Choose Doodle dodge”**,
  **“Choose Treasure dash”**, and **“Choose Pocket maze.”** Retain drawing for
  source artwork and game for the result.

### M5 — README has overlong sentences and avoidable jargon

- Quote: **“An adult and child can make a complete dodge, collect, or top-down
  maze game together without an account, asset folders, or a game engine.”**
  (24 words); the npm test sentence (28); the staticwebapp.config sentence
  (26).
- Why a first-time visitor is lost or misled: opening copy adds
  **“offline-first”**, **“asset folders”**, and **“game engine”** before the
  simple result. Reader-facing sections also expose **IndexedDB**, **service
  worker**, **manifest**, **JSON**, and **cached offline unlock** without plain
  language.
- Concrete fix: use **“An adult and child can make a dodge, collect, or maze
  game together. No account or game engine is needed.”** Split long test and
  deployment sentences. Say **“saved in this browser”**, **“works after the
  first visit,”** and **“project file”** in product copy.

## Copy audit

Counts use whitespace-separated visible words. The tables include every landing
and README copy unit, including headings, labels, buttons, commands, and source
path descriptions where they are visible prose. Short fragments are included
because they remain exposed to visitors and assistive technology. The three
README entries above 22 words are marked **FLAG**; no landing unit exceeds 22.

### Landing page

| Words | Copy unit |
| ---: | --- |
| 4 | Skip to game maker |
| 3 | Doodle to Game |
| 1 | Privacy |
| 1 | Terms |
| 2 | No account. |
| 2 | No uploads. |
| 2 | Their drawing. |
| 3 | Your tiny game. |
| 12 | Draw or photograph two characters, pick one simple rule, then play together. |
| 7 | Everything happens right here on your device. |
| 3 | Make a game |
| 6 | Works offline after the first visit |
| 3 | About 15 minutes |
| 2 | Your worktable |
| 5 | Make one small, playable thing |
| 2 | Autosaves locally |
| 1 | Choose |
| 2 | Add art |
| 1 | Tune |
| 1 | Play |
| 2 | Step 1 |
| 5 | Choose the kind of fun |
| 5 | Same drawings, three dependable rules. |
| 4 | You can switch later. |
| 3 | Move + survive |
| 2 | Doodle dodge |
| 10 | Steer your hero away from a shower of wobbly obstacles. |
| 2 | Choose this |
| 3 | Move + gather |
| 2 | Treasure dash |
| 9 | Race around the board and collect your second drawing. |
| 1 | Chosen |
| 3 | Think + explore |
| 2 | Pocket maze |
| 11 | Guide your hero through a fixed maze to the drawn goal. |
| 3 | Add your art |
| 3 | Keep your work |
| 11 | Move this game to another device with a private project file. |
| 2 | Export project |
| 2 | Import project |
| 2 | Optional extra |
| 6 | Workshop Pack · US $9 once |
| 10 | Unlock four bonus ink colours and a geometric finish celebration. |
| 9 | The complete three-game maker, saving, and exports stay free. |
| 8 | Hosted checkout by Sociobot/Dodo, the merchant of record. |
| 4 | Refunds are handled there. |
| 3 | Buy Workshop Pack |
| 3 | Have a license? |
| 6 | Paste the token from your receipt |
| 1 | Restore |
| 3 | The whole trick |
| 2 | Paper in. |
| 2 | Play out. |
| 3 | Make two doodles |
| 11 | Use the built-in pad or photograph bold art on plain paper. |
| 3 | Pick one rule |
| 4 | Dodge, collect, or solve. |
| 4 | Nothing else to configure. |
| 3 | Pass the controls |
| 8 | Use arrows, WASD, or the roomy touch pad. |
| 4 | Made for side-by-side play. |
| 6 | Your drawings stay on this device. |
| 8 | Generated hero artwork disclosed in the project notes. |

### README

| Words | Copy unit |
| ---: | --- |
| 3 | Doodle to Game |
| 20 | Doodle to Game is a tablet-friendly, offline-first workshop that turns a child’s drawing or paper photo into a playable character. |
| 24 | **FLAG** An adult and child can make a complete dodge, collect, or top-down maze game together without an account, asset folders, or a game engine. |
| 2 | Live product: |
| 3 | What it includes |
| 15 | A pen-, touch-, mouse-, and keyboard-friendly drawing pad with brush colours, eraser, clear, and undo |
| 8 | Local photo capture/import and simple high-contrast paper-background removal |
| 14 | Two personal art slots mapped directly to the hero and obstacle, treasure, or goal |
| 11 | Three fixed games with only speed, score goal, and sound controls |
| 9 | Arrow/WASD controls and an on-screen 60 px direction pad |
| 6 | IndexedDB autosave plus private JSON export/import |
| 13 | Installable app manifest, versioned service-worker shell cache, update notice, and tested offline reload |
| 5 | Direct /privacy and /terms pages |
| 18 | Optional US $9 one-time Workshop Pack license (bonus inks and finish celebration); the complete core maker remains free |
| 8 | Artwork and project data stay in the browser. |
| 11 | There are no analytics, third-party scripts, cloud artwork storage, or accounts. |
| 14 | The optional license check sends only the saved license token to Sociobot’s billing API. |
| 2 | Run locally |
| 5 | Requires Node.js 20 or newer. |
| 7 | Open the local URL printed by Vite. |
| 10 | Camera capture depends on browser/device support; file selection works everywhere. |
| 3 | Test and build |
| 28 | **FLAG** npm test runs unit tests, a clean production build, desktop and 390 px browser flows, axe WCAG checks, every game template, legal routes, and an explicit offline reload. |
| 11 | The production output is exactly dist/, with dist/index.html at its root. |
| 6 | The pinned Playwright version is 1.58.2. |
| 18 | The factory worker image already provides its Chromium browser; elsewhere run npx playwright install chromium once if needed. |
| 2 | Billing environments |
| 19 | Release builds default to the production Sociobot API, so a public buy link cannot accidentally send customers to pilot. |
| 7 | Local staging can opt into pilot explicitly: |
| 14 | The factory must register the doodle-to-game product and return URL before checkout is usable. |
| 8 | No payment provider is embedded in this app. |
| 2 | Project structure |
| 11 | src/main.ts — workshop UI, drawing editor, routing, import/export, and install/update behavior |
| 8 | src/game.ts — the three fixed canvas game rules |
| 8 | src/state.ts — validated project format and IndexedDB persistence |
| 5 | src/image.ts — local paper-background cleanup |
| 11 | src/license.ts — Sociobot checkout, restore, daily verification, and cached offline unlock |
| 12 | scripts/build-sw.mjs — generates a versioned service worker from the built asset list |
| 7 | .factory/design.md — visual system and generated-art provenance |
| 1 | Deployment |
| 11 | Run npm run build and publish dist/ as a static site. |
| 26 | **FLAG** The build includes staticwebapp.config.json, which supplies immutable caching for /assets and /icons, revalidation for documents and sw.js, the web-manifest MIME type, and first-party browser hardening headers. |
| 17 | Both direct legal routes are emitted as real HTML entry points; ordinary app navigation also works client-side. |
| 1 | License |
| 6 | MIT © 2026 Sociobot (Param Factory). |

## Structure and link checks

| Check | Result | Evidence |
| --- | --- | --- |
| Title | Pass for /, /privacy, /terms | Root is 44 characters and follows Product — what; /demo incorrectly reuses root title. |
| Description, language, favicon | Pass | lang="en", a 78-character description, SVG favicon, and Apple icon are present. |
| Canonical, OG, Twitter card | Fail | None is present (M1). |
| One H1 | Fail | One H1 exists, but it is the product name rather than the job headline (B1). |
| Direct legal routes / back | Pass | /privacy and /terms return 200 and Back restores the workshop. |
| Focus / route announcement | Fail | Focus lands on main, not H1; live region is blank (M2). |
| Designed 404 | Fail | Unknown route returns the ordinary root with 200 (M1). |
| Robots / sitemap | Fail | Both are rewritten to the ordinary root (M1). |
| Header/footer legal links | Pass | Privacy and Terms are consistently linked. |
| Required Demo nav, factory/footer build data | Fail | Missing (M3). |
| Linked targets | Pass | Root, Privacy, Terms, and GitHub returned 200; checkout returned its expected external 303. No dead linked target was found. |
| Visual identity | Pass | Cold 390 px review shows the documented warm paper, ruled geometry, original hero art, and tomato/cobalt treatment; it is not a generic SaaS template. |

## Required re-check after repair

1. From a new browser context at 390 px and desktop, verify the first screen
   names the adult-and-child audience, job, and sample action without scrolling.
2. Visit /demo and ?demo=1; verify the seeded playable game, banner, Reset,
   Start for real, separate demo: storage, discard behavior, and no writes to
   normal storage.
3. Run each command in the new claims manifest from a clean clone. Capture the
   offline reload and whole-demo-flow request interception evidence.
4. Re-crawl routes and links after adding metadata, real robots/sitemap, and a
   designed 404. Verify H1 focus and polite announcement on forward and Back.
