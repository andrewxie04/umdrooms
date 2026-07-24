# Rooms — UMD Campus Map (redesign)

Ground-up redesign of the UMD campus availability map ("Rooms", umdrooms.com):
Vite + React + TypeScript + Tailwind + shadcn/ui + zustand, with a custom
three.js 3D campus renderer.

## The map — no external map vendor

The map is rendered in-house with three.js (`src/components/map3d/`), not by a
third-party map SDK. There is **zero Mapbox dependency** — no `mapbox-gl`
package, no access token, no `.env`, no external tile/font/api hosts.

- Campus geometry is baked from OpenStreetMap into
  `public/campus-data.json` by `scripts/fetch-campus-data.mjs` (Overpass API):
  extruded building footprints, road/path ribbons, grass/water/parking areas,
  and low-poly trees.
- The scene (`src/components/map3d/scene/`) draws this with day/night warm
  palettes, soft shadows, a map-style camera (pan/zoom/pitch/rotate), HTML
  status markers projected per frame, and a selection pulse ring.
- Campus geometry is © OpenStreetMap contributors, licensed ODbL — credited
  in an on-map chip and in `public/campus-data.LICENSE.txt`.

No environment variables or tokens are required to run the app.

## Data layer

`src/lib/*.js` is the legacy app's data layer, ported verbatim (kept as
JavaScript; `allowJs: true`, `checkJs: false` in `tsconfig.app.json`):

- `availabilityData.js` — bundled dataset fetch w/ progress, per-day
  availability via `/.netlify/functions/availability-building`
- `availability.js` — room/building availability + render-state logic
- `libcalData.js` — LibCal study rooms (availability + booking endpoints)
- `diningData.js` — dining halls via `/.netlify/functions/dining-status`
- `parkingData.js` — static parking rules + time-aware status
- `geo.js`, `cache.js`, `storage.js`, `haptics.js` — utilities

Runtime data in `public/`: `buildings_data.json` (~7.8MB bundled dataset),
`buildings_metadata.json` (map skeleton), `campus-data.json` (baked OSM campus
geometry), `map-icons/`.

State: `src/lib/store.ts` (zustand `useCampusStore`) implements the plan.md
architecture contract. Types: `src/types/campus.ts`. Theme tokens:
`src/index.css` (CSS vars) + `src/lib/theme.ts` (`STATUS_COLORS`).

## Scripts

```bash
npm run dev    # vite dev server
npm run build  # tsc -b && vite build
npm run preview
```

Regenerate the baked campus geometry (optional; a checked-in copy already
ships in `public/`):

```bash
node scripts/fetch-campus-data.mjs
```
