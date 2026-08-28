# Doodle to Game — verification handoff

- Work order: `doodle-to-game-verify-3`
- Candidate tested: `0ca9bb76da0740ad160218d64e8578f052136050`
- Branch: `main`
- Live URL: <https://doodle-to-game.sociobot.in>
- Verified: 2026-08-28 UTC
- Result: **FAIL**

## Outcome

Independent verification is recorded in [`.factory/verification-3.md`](verification-3.md). The run started clean; `HEAD` and `origin/main` matched the candidate. The exact local production build is byte-identical to the live deployment.

The release fails for two high-severity reasons:

1. Production checkout returns HTTP 404 with `{"error":"enabled factory product","status":404}`, so the advertised US $9 Workshop Pack cannot be purchased.
2. Selecting another ink colour after drawing silently rerenders the editor and deletes all unsaved pixels (4,317 → 0 in the live reproduction).

Additional defects are an offline arbitrary-token paid unlock, a serious 1.84:1 dark-mode save-status contrast failure, invisible keyboard focus on both file inputs, two undersized mobile touch targets, and stale legal-page title metadata on one offline-root sequence.

## What passed

- `npm ci`: 57 packages; `npm audit --audit-level=low`: 0 vulnerabilities.
- `npm test`: 8 unit tests and the strict production build passed; Playwright finished 14 passed with 2 intentional project skips.
- Build output: 35.59 KB JS, 20.45 KB CSS, 27.61 KB mobile hero, no fonts.
- Live/local desktop and 390 px flows: two local art slots, photo input/background cleanup, undo, tune, play/reset, all three templates, 21-move maze completion, import/export, persistence, invalid-input recovery, and legal routes.
- Ordinary use made no third-party request or artwork upload. No normal-flow console/page errors occurred.
- PWA manifest and service-worker activation, offline routes/reload, and a synthetic update/toast/cache replacement passed.
- Live caching, MIME, CSP, permissions, anti-framing, isolation, HSTS, referrer, and `nosniff` headers passed.
- Lighthouse 13.4.1 mobile: local 99/100/100 and live 100/100/100 for performance/accessibility/best practices; live LCP 1.25 s, TBT 69 ms, CLS 0.

## Reproduce

```sh
git checkout 0ca9bb76da0740ad160218d64e8578f052136050
npm ci
npm audit --audit-level=low
npm test
npm run build
npm run preview -- --port 4174
```

For H-2, open Add art, draw without saving, and select another ink swatch; the canvas clears. For H-1, request `https://api.sociobot.in/api/v1/products/doodle-to-game/checkout` and observe the 404 response.

## Next steps

Repair H-2 and the local accessibility/licensing findings in product code. Billing registration is intentionally outside this repository: enable the production product and return URL, then run a real purchase/return/restore/revocation test. Rerun the full verification contract before promotion.

No product code was changed by this verification work.
