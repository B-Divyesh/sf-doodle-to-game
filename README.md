# Doodle to Game

Doodle to Game is a tablet-friendly, offline-first workshop that turns a child’s drawing or paper photo into a playable character. An adult and child can make a complete **dodge**, **collect**, or **top-down maze** game together without an account, asset folders, or a game engine.

Live product: <https://doodle-to-game.sociobot.in>

## What it includes

- A pen-, touch-, mouse-, and keyboard-friendly drawing pad with brush colours, eraser, clear, and undo
- Local photo capture/import and simple high-contrast paper-background removal
- Two personal art slots mapped directly to the hero and obstacle, treasure, or goal
- Three fixed games with only speed, score goal, and sound controls
- Arrow/WASD controls and an on-screen 60 px direction pad
- IndexedDB autosave plus private JSON export/import
- Installable app manifest, versioned service-worker shell cache, update notice, and tested offline reload
- Direct `/privacy` and `/terms` pages
- Optional US $9 one-time Workshop Pack license (bonus inks and finish celebration); the complete core maker remains free

Artwork and project data stay in the browser. There are no analytics, third-party scripts, cloud artwork storage, or accounts. The optional license check sends only the saved license token to Sociobot’s billing API.

## Run locally

Requires Node.js 20 or newer.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Camera capture depends on browser/device support; file selection works everywhere.

## Test and build

```sh
npm test
npm run build
npm run preview
```

`npm test` runs unit tests, a clean production build, desktop and 390 px browser flows, axe WCAG checks, every game template, legal routes, and an explicit offline reload. The production output is exactly `dist/`, with `dist/index.html` at its root.

The pinned Playwright version is `1.58.2`. The factory worker image already provides its Chromium browser; elsewhere run `npx playwright install chromium` once if needed.

## Billing environments

Development/staging defaults to the Sociobot pilot API. The factory can switch the static build to live billing at release without changing source:

```sh
VITE_BILLING_API_BASE=https://api.sociobot.in/api/v1 npm run build
```

The factory must register the `doodle-to-game` product and return URL before checkout is usable. No payment provider is embedded in this app.

## Project structure

- `src/main.ts` — workshop UI, drawing editor, routing, import/export, and install/update behavior
- `src/game.ts` — the three fixed canvas game rules
- `src/state.ts` — validated project format and IndexedDB persistence
- `src/image.ts` — local paper-background cleanup
- `src/license.ts` — Sociobot checkout, restore, daily verification, and cached offline unlock
- `scripts/build-sw.mjs` — generates a versioned service worker from the built asset list
- `.factory/design.md` — visual system and generated-art provenance

## Deployment

Run `npm run build` and publish `dist/` as a static site. Configure the production billing environment variable shown above. Both direct legal routes are emitted as real HTML entry points; ordinary app navigation also works client-side.

## License

[MIT](LICENSE) © 2026 Sociobot (Param Factory).
