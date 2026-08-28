# Doodle to Game — visual thesis

## Direction: generative geometry on the kitchen table

The product should feel like a sheet of drawing paper has become a tiny working game board. A sparse field of dots, paths, gates, and cut-paper polygons is generated from CSS/canvas primitives; those shapes explain the central promise by moving from the capture “portal” into a playable arena. The irregular child-made image remains the loudest object. Interface chrome is quiet, sturdy, and adult-readable.

This is deliberately not pixel-art nostalgia or a generic children’s rainbow. Its geometry gives children predictable game rules while the warm paper and imperfect marks preserve the handmade source.

## Palette

Light mode is the primary workshop treatment; dark mode is a low-light “blueprint” variant selected from system preference.

| Token | Light | Dark | Role |
| --- | --- | --- | --- |
| `paper` | `#F7F1E3` | `#111B2A` | page / night-blueprint field |
| `surface` | `#FFFDF7` | `#1A2738` | raised work areas |
| `ink` | `#172033` | `#F8F3E7` | primary text |
| `muted` | `#586174` | `#B7C1D0` | secondary text |
| `rule` | `#C8C2B5` | `#42516A` | rules and quiet outlines |
| `tomato` | `#C93624` | `#FF7864` | primary action / player portal |
| `tomato-ink` | `#FFFFFF` | `#17111A` | content on primary action |
| `cobalt` | `#1859C9` | `#75A7FF` | focus / collectible / links |
| `leaf` | `#237A4B` | `#62D497` | success |
| `success-ink` | `#FFFFFF` | `#111B2A` | readable text on success feedback |
| `gold` | `#9A6100` | `#FFC35A` | warning |
| `danger` | `#B4232F` | `#FF8791` | destructive/error |

Body text and controls meet WCAG AA (4.5:1); large decorative geometry is never the only state cue.

## Type

- Display: `Trebuchet MS`, `Avenir Next`, system sans. Rounded diagonals make the title feel drawn without depending on a downloaded font.
- Utility/body: `Atkinson Hyperlegible`, `Segoe UI`, system sans. (The installed system fallback is intentional: zero font bytes, immediate offline rendering, strong differentiation of letters.)
- Scale: 14 / 16 / 20 / 28 / fluid 40–64 px. Body is always at least 16 px. Scores use tabular figures.

## Space and shape

- Base rhythm: 4 px, with 8 / 12 / 16 / 24 / 32 / 48 / 64 increments.
- Working content max width: 1180 px; reading measure: 68 characters.
- Corners: 12 px for controls, 20 px for work surfaces, circular only for game controls and portals.
- Lines: 2 px ink-like rules with occasional 3 px offset shadows. Cards appear only for independent templates/assets.
- Touch targets: minimum 48 × 48 px; the play D-pad is 60 × 60 px.

## Interaction grammar

The app is a four-stop workshop strip: **Choose → Draw → Tune → Play**. Only one stop is expanded at a time, while completed choices remain visible as compact “paper tabs.” A bright tomato portal marks the next action. Selection produces a physical two-pixel press. Undo is persistent wherever pixels or project state can change.

Keyboard: tab/enter operate every control; arrows/WASD operate games; Escape leaves play. Touch uses an on-screen D-pad, and pointer drawing distinguishes pen/mouse from touch so a palm does not paint when a pen is present.

## Motion

- UI transitions: 180–240 ms, transform and opacity only.
- Template selection and play start use a short 240 ms “fold” from their origin.
- Canvas game motion follows input and therefore has physical meaning. No ornamental loop runs indefinitely.
- With `prefers-reduced-motion: reduce`, transitions are instant, illustration drift is removed, and gameplay remains user-controlled.

## Asset plan

1. One generated editorial hero showing two handmade paper creatures passing through geometric portals into a simple tabletop game board. It clarifies the product promise; it must contain no text, UI, real person, brand, or copyrighted character.
2. Hand-authored SVG PWA icons (portal, pencil, spark) and CSS template diagrams. These stay crisp, tiny, and share the geometric system.
3. User drawings are the game art. Built-in geometric fallback characters ensure the empty project is playable, but the onboarding explicitly asks for two personal assets.

### Image prompt sheet and provenance

- **Use case:** illustration-story
- **Asset:** wide welcome/hero illustration
- **Subject/world:** two charming, original childlike paper doodle creatures, visibly made with crayon and marker on white paper, moving through red and blue circular geometric portals into a top-down board of paths, stars, and obstacles on a warm cream tabletop
- **Composition:** wide 3:2 scene; action runs left to right; useful calm space at upper left; all important content inside a generous safe area
- **Materials/light/lens:** cut paper, wax crayon, felt-tip ink, soft daylight, slight overhead 35mm editorial view, tangible shadows but no photoreal hands or people
- **Palette words:** warm paper, ink navy, tomato red, cobalt blue, leaf green, sparing mustard
- **Negative list:** no text, letters, numbers, watermark, logos, recognizable characters, screens, devices, gradients, neon, extra limbs, disturbing faces
- **Tool/model:** `/opt/fleet/lib/gen-image.sh`, deployment `factory-image` (Azure AI Foundry image model)
- **Generation date:** 2026-08-28
- **License/provenance:** original generated image for this product; prompt above. Source PNG and prompt sidecar retained in `assets/src/`; optimized WebP ships in `public/assets/`.

## Responsive intent

At 390 px, the decorative hero crop and secondary template prose drop away; the workshop becomes a single column and the selected step stays near the top. During play, the game fills available width and the D-pad moves below it. On desktop, setup and preview share two columns. Safe-area padding protects installed-app controls.
