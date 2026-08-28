# Doodle to Game

Turn two drawings into a tiny game with a child.

An adult and child can make dodge, collect, or maze games together. Try the
playable sample at <https://doodle-to-game.sociobot.in/demo>.

## What it does

- Opens a playable sample dodge game with two built-in drawings.
- Keeps demo work separate from personal work.
- Saves game settings in this browser.
- Exports and imports a project file.
- Accepts arrow keys, the W, A, S, and D keys, and the touch pad.
- Works after the first visit.

No account or upload is needed for the game maker. The optional Workshop Pack
costs US $9 once. It adds four bonus ink colours.

Read [Privacy](privacy/index.html) and [Terms](terms/index.html) before using
the optional checkout.

## Run locally

Requires Node.js 20 or newer.

```sh
npm ci
npm run dev
```

Open the local address printed by Vite. Visit `/demo` to use the sample.

## Verify and build

```sh
npm test
npm run build
npm run preview
```

`npm test` runs unit checks, a production build, and browser checks at desktop
and mobile sizes. It also checks accessibility, routes, controls, privacy, and
offline reloads. The build writes `dist/index.html` at the root of `dist/`.

Every visitor-facing promise has a tagged browser check in
[.factory/claims.json](.factory/claims.json). Run an individual claim from a
clean install with its listed command.

## Deploy

Run `npm run build` and publish `dist/` as a static site. The included static
hosting configuration sets security headers and cache rules. It also preserves
the application routes and supplies the standalone 404 document.

## Project notes

- `src/main.ts` contains the workshop, routes, demo banner, and controls.
- `src/state.ts` keeps personal projects and disposable demo projects separate.
- `src/game.ts` contains the three canvas game rules.
- `scripts/build-sw.mjs` creates the offline service worker.
- `.factory/demo.md` explains the sample sandbox.
- `.factory/design.md` records the visual system and art provenance.

## License

[MIT](LICENSE) © 2026 Sociobot (Param Factory).
