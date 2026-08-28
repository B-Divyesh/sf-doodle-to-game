# Doodle to Game — verification handoff

- Work order: `doodle-to-game-verify-2`
- Candidate: `702679658faf66b7e06fa33b9f5f19ef80e1fc25`
- Live URL: <https://doodle-to-game.sociobot.in>
- Verified: 2026-08-28 UTC
- Result: **FAIL**

## Outcome

The live deployment is present and byte-for-byte matches the candidate production build. The free local-first workshop works end to end, including real local photo input, background cleanup, reversible clear/undo, two art slots, all three templates, keyboard/touch play, export/import, IndexedDB persistence, service-worker updating, and offline reload.

Release acceptance nevertheless fails:

1. **High:** The live US $9 buy link uses the pilot API and returns HTTP 404. The production checkout is also unregistered/disabled and returns 404.
2. **High:** Dark mode has six serious axe contrast failures (1.28:1 paid-strip text and 1.65:1 footer links).
3. **Medium:** Template radio cards do not support arrow navigation and selection rerender drops focus to `body`.
4. **Medium:** Three 390 px footer links have only 16 px target height.
5. **Medium:** Hashed assets use a 30-second revalidating cache instead of long-lived immutable caching.

Lower-severity findings cover raw JSON parse copy, missing browser hardening policies, and the manifest's generic MIME type. Full evidence and reproduction details are in [verification.md](verification.md).

## Verification commands

```sh
git fetch origin --prune
git rev-parse HEAD
npm ci
npm audit --audit-level=low
npm test
npm run build
```

Results: 4 unit tests passed; TypeScript passed; exact Vite production build passed; 9 Playwright tests passed across desktop and 390 px mobile with 1 intentional duplicate-offline skip; audit found 0 vulnerabilities. Fresh Lighthouse mobile scores were local 99/100/100 and live 100/100/100 for performance/accessibility/best practices. Initial JS is 34.84 KB and CSS is 20.31 KB uncompressed.

## Re-verification priorities

1. Register/enable the Sociobot product and return URL, deploy with the production billing API base, then complete checkout, return-token, daily verification, offline unlock, and restore tests.
2. Correct dark paid-strip/footer tokens and rerun axe in light/dark on desktop/mobile and dynamic workshop states.
3. Fix keyboard radio-group focus, mobile footer hit areas, and deployment cache rules.
4. Repeat `npm test`, live artifact hash comparison, response-header review, Lighthouse, service-worker update, and offline persisted-project reload.

No product code was modified by verification. Only this handoff and `.factory/verification.md` are intended changes.
