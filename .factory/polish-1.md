# Polish round 1 — finding map

Candidate repaired: `e94d9abc25c6a831bb7cad6b7459cb0f023f3313`.
Release repairs: `6be617a`, `5100a44`, and `54ff888`.
Live deployment: <https://doodle-to-game.sociobot.in> (Azure deployment
`3e18f2ef-1ad0-48d5-9a8c-2ff6634990da`).

| Finding | Change made | Evidence |
| --- | --- | --- |
| B1 | Made the sole landing H1 “Turn two drawings into a tiny game”; added the adult-and-child sentence and adjacent sample action/result. | `makes two drawings and opens a playable game`; live cold `/demo` screenshot `/tmp/doodle-live-evidence-round1/cold-demo-mobile.png`. |
| B2 | Added seeded `/demo` and `?demo=1`, persistent banner, Reset demo, Start for real, separate IndexedDB database, synchronous sample first paint, and deletion of demo work on exit. | `@claim:sample-demo`; `@claim:demo-isolation`; live `https://doodle-to-game.sociobot.in/demo` cold check. |
| B3 | Added nine enumerated, tagged, clean-state claims and removed unprovable review-era copy. | Every command in `.factory/claims.json` passed from a fresh clone; `@claim:local-private` intercepts the whole photo/play flow and `@claim:offline-reload` reloads offline. |
| M1 | Added route-specific title/canonical/OG/Twitter metadata, robots, sitemap, a `/demo` route, and a real static 404 response. | `routes set metadata, announce their heading, and show a styled missing-page route`; live `/no-such-page` returns HTTP 404 and its designed page. |
| M2 | Route navigation and history focus the route H1 and update a polite live region. | `routes set metadata, announce their heading, and show a styled missing-page route`. |
| M3 | Added Demo navigation, Param Factory footer credit, and build ID. | Live `/demo` screenshot `/tmp/doodle-live-evidence-round1/screenshot-desktop.png`; cold check at `https://doodle-to-game.sociobot.in/demo`. |
| M4 | Rewrote vague headings/actions and standardized drawing, game, workshop, and project file terms; recorded the audit. | `.factory/copy-audit.md`; live cold screenshot `/tmp/doodle-live-evidence-round1/cold-demo-mobile.png`. |
| M5 | Rewrote README into short plain-language sentences and retained only tested visitor promises. | `.factory/copy-audit.md`; fresh-clone claim run. |
| verification-3 H-1 | The hosted Sociobot checkout is now registered; the client retains the production billing URL. | Existing `advertises the registered production checkout without a pilot fallback`; verification-5 records hosted checkout success. |
| verification-3 H-2 | Changing an ink no longer rerenders the drawing canvas. | `changing ink preserves every unsaved canvas pixel and undo history`. |
| verification-3 M-1 | Unverified or offline returned license tokens remain locked. | `an offline checkout-return token stays locked until server verification`; unit license tests. |
| verification-3 M-2 | Set a dark-mode success-ink token with AA contrast. | `dynamic success feedback passes dark-mode WCAG contrast`; live axe scan. |
| verification-3 M-3/M-4 | Made file controls visibly focusable and sized mobile controls/links to 44 px. | `visible photo and project file controls expose the keyboard focus location`; `mobile footer links have 44px touch targets`. |
| verification-3 L-1 | Corrected route metadata after offline navigation and preserves separate document cache keys. | `offline root navigation restores workshop metadata after a legal page`; static-hosting unit suite. |
| verification-4 H-1 | Billing-service rate limiting was fixed outside this static repository. | verification-5: 30 accepted requests then HTTP 429 with `Retry-After: 4`. |

No review finding remains open.
