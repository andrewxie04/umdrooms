# Rooms — Ground-Up Redesign Plan

Redesign the UMD campus map tool ("Rooms", umdrooms.com) from the ground up:
new stack (Vite + React 18 + TypeScript + Tailwind + shadcn/ui), new 3D map
experience (Mapbox GL v3 Standard style, 3D buildings/terrain, custom campus
marker layers), responsive by design (desktop floating panel + mobile bottom
sheet), dark/light mode.

## Non-negotiables

- **Preserve all existing features**: classroom availability (Now / Schedule /
  All Rooms), search (building/room/class), min-duration filter, building
  detail with room timelines, LibCal study-room browsing + booking flow,
  dining halls (status + menus by day), parking overlay (time-aware status),
  favorites (buildings + rooms), dark mode, navigation/deep links, map legend.
- **Reuse the data layer untouched where possible**: `src/availabilityData.js`,
  `src/availability.js`, `src/libcalData.js`, `src/diningData.js`,
  `src/parkingData.js`, `src/geo.js`, `src/cache.js`, `src/storage.js`,
  `src/haptics.js` (haptics optional), `public/buildings_data.json`,
  `public/buildings_metadata.json`, `public/map-icons/*`.
- Mapbox token: old app has `REACT_APP_MAPBOX_ACCESS_TOKEN` in `.env`. New app
  needs `VITE_MAPBOX_ACCESS_TOKEN` — transform with sed, NEVER print the value.
- Netlify deploy must keep working: update `netlify.toml` to build the new app
  (publish `rooms-redesign/dist`), keep `netlify/functions/**` as-is.
- Visual policy: low-saturation, warm neutrals, ample whitespace, clear
  hierarchy. UMD red as the single accent (light + dark themes). No blue-purple
  gradients, no Google-y design.

## New app location

`rooms-redesign/` inside the workspace. Scaffold with the webapp-building
skill script (0-origin base, no template).

## Architecture contract (all agents MUST code against this)

### State: zustand store at `src/lib/store.ts`

```ts
// src/types/campus.ts
export type ViewMode = 'now' | 'schedule' | 'all';
export type Status = 'available' | 'opening-soon' | 'unavailable' | 'unknown';
export type OverlayKind = 'classrooms' | 'library' | 'dining' | 'parking';

export interface BuildingEntry {
  id: string;            // building code, e.g. 'IRB'
  name: string;
  code: string;
  lat: number;
  lng: number;
  kind: 'classroom' | 'library';
  totalRooms: number;
  availableRooms: number;
  status: Status;
  rooms: RoomEntry[];    // may be [] until detail loads
  raw?: any;             // original record for detail views
}
export interface RoomEntry {
  id: string;
  name: string;
  buildingCode: string;
  status: Status;
  events?: any[];        // timeline blocks from availability.js
  raw?: any;
}
export interface DiningHall { id: string; name: string; lat: number; lng: number;
  status: Status; statusText: string; meals?: any[]; raw?: any; }
export interface ParkingLot { id: string; name: string; lat: number; lng: number;
  status: Status; statusText: string; raw?: any; }
export interface MapFlyTarget { lat: number; lng: number; zoom?: number; pitch?: number; }
```

### Store shape (`useCampusStore`)

```ts
{
  // data
  buildings: BuildingEntry[];        // classrooms + library merged
  dining: DiningHall[];
  parking: ParkingLot[];
  loading: { status: 'idle'|'loading'|'ready'|'error'; progress: number; error?: string|null };
  coverage: { start?: string; end?: string } | null;

  // ui state
  viewMode: ViewMode;
  scheduleDate: Date;                // selected date/time window (schedule mode)
  minDurationMin: number;            // 0 | 60 | 120 | 180
  searchQuery: string;
  activeOverlays: Set<OverlayKind> | OverlayKind[]; // which marker layers show
  selected: { kind: 'building'|'room'|'dining'|'parking'; id: string } | null;
  darkMode: boolean;
  favorites: string[];               // 'b:CODE' | 'r:CODE/ROOMID'
  flyTo: MapFlyTarget | null;        // map listens and clears after flying
  legendOpen: boolean;

  // actions
  init(): Promise<void>;             // full data load pipeline (ported from App.js)
  setViewMode(m: ViewMode): void;
  setScheduleDate(d: Date): void;    // triggers availability refetch for that day
  setSearchQuery(q: string): void;
  setMinDuration(min: number): void;
  toggleOverlay(k: OverlayKind): void;
  select(s: CampusStore['selected']): void;
  clearSelection(): void;
  toggleDarkMode(): void;
  toggleFavorite(key: string): void;
  requestFlyTo(t: MapFlyTarget): void;
  clearFlyTo(): void;
  setLegendOpen(open: boolean): void;
}
```

### Component ownership (parallel stage, NO shared files)

- **MapEngine agent** → `src/components/map/**` ONLY.
  `CampusMap.tsx` (default export) reads the store directly. Features:
  Mapbox GL v3 `mapbox://styles/mapbox/standard` style with setConfigProperty
  theming (light preset follows darkMode: 'day'/'dusk'/'night'), 3D buildings
  ON, pitch ~60 default, campus camera bounds (UMD center ≈ 38.9869, -76.9426),
  2D/3D tilt toggle, geolocate control, building markers via GeoJSON source +
  symbol/circle layers colored by status (available/opening-soon/unavailable),
  separate layers for library/dining/parking per activeOverlays, selected
  building highlight (fill-extrusion on composite `building` layer + pulsing
  marker), popup on marker tap → store.select, flyTo listener, compact
  in-map legend chip, navigation "open in Maps" link generator kept in
  `src/lib/geo.ts`.
- **Shell agent** → `src/components/shell/**` + `src/components/browse/**` ONLY.
  Responsive shell: ≥1024px floating left panel (420px, rounded, glassy),
  <1024px map-first with bottom sheet (vaul Drawer via shadcn, snap points
  ~15% / 55% / 92%). Inside: AppHeader (logo, dark toggle, overlay toggles,
  legend), SearchBar (buildings/rooms/classes, keyboard nav), ModeTabs
  (Now/Schedule/All + date-time picker in schedule mode + min-duration chips),
  BuildingList (virtualized-feel, status dot, "n/m available", favorite star),
  BuildingDetail (room list sorted available-first, room row → RoomTimeline
  bars from availability.js event blocks, favorite, navigate, back).
- **Features agent** → `src/components/features/**` ONLY.
  DiningPanel (3 halls, open/closed status, meal sections by day, menu link),
  ParkingPanel (lots list w/ time-aware status + rules text + nav links),
  LibraryPanel (LibCal buildings, room list, booking flow UI — port from old
  Sidebar.js booking: date browse, slot options, submit via existing
  `/.netlify/functions/libcal-booking-*` endpoints), FavoritesView,
  LegendSheet, Empty/Loading states + full-screen boot loader with progress.

### Wiring (integration stage)

`src/App.tsx`: init store on mount, `<CampusMap/>` full-bleed + `<Shell/>`
overlay + feature panels routed by `selected`/overlay state. Data loading
pipeline ported from old `App.js` into store actions (bundled
`buildings_data.json` fetch w/ progress, coverage check, per-day refetch,
libcal + dining fetch, parking static computation). Keep `src/lib/` JS modules
as `.js` (set `allowJs`, `checkJs:false`).

# Phase 2 — Kill Mapbox, build our own 3D campus

Goal: zero Mapbox at runtime. Render UMD ourselves with three.js from real
campus geometry baked into a local asset.

- **Data**: `scripts/fetch-campus-data.mjs` pulls the campus bbox from
  OpenStreetMap Overpass (the reference data Mapbox is built on; ODbL — needs
  "© OpenStreetMap contributors" credit) → normalizes →
  `rooms-redesign/public/campus-data.json`:

```jsonc
{
  "center": [-76.9426, 38.9869],
  "bbox": [-76.958, 38.979, -76.928, 38.995],
  "buildings": [{ "id": "way/123", "name": "Stamp Student Union", "footprint": [[lng,lat],...], "height": 14.0, "levels": 4 }],
  "roads":    [{ "kind": "road|path|service", "highway": "residential", "name": "Campus Dr", "width": 9, "line": [[lng,lat],...] }],
  "areas":    [{ "kind": "grass|water|parking|sport", "polygon": [[lng,lat],...] }],
  "trees":    [[lng,lat]]
}
```

- **Renderer** (`src/components/map3d/**`, replaces `src/components/map/**`):
  three.js scene — extruded building meshes (warm pastel tint, soft shadows),
  ground plane, roads/paths as flat ribbons, grass/water/parking areas,
  optional low-poly trees; sun/hemisphere lighting follows `darkMode`;
  custom map-style camera (pan/zoom/pitch/rotate with damping + campus
  bounds); HTML overlay markers projected per-frame (status dots, code
  labels, dining/parking icons); click = nearest projected marker within
  threshold → `select(..., {source:'map'})`; selection = 3D pulse ring +
  camera fly; OSM credit chip. Same store contract — no store changes.

- **Scene/overlay interface contract** (`src/components/map3d/scene/index.ts`):

```ts
export interface CampusSceneHandle {
  setDarkMode(dark: boolean): void;
  flyTo(t: { lat: number; lng: number; zoom?: number; pitch?: number; bearing?: number }): void;
  project(lng: number, lat: number): { x: number; y: number; visible: boolean }; // css px
  onFrame(cb: () => void): () => void;   // unsubscribe
  setPulseRing(lng: number, lat: number): void;
  clearPulseRing(): void;
  dispose(): void;
}
export function createCampusScene(container: HTMLElement, opts: { darkMode: boolean }): Promise<CampusSceneHandle>;
```

- **Stages**: (1) data pipeline agent → campus-data.json + fetch script;
  (2) parallel: SceneCore agent (scene/** per contract) + Overlay agent
  (CampusMap3D.tsx + markers/controls/legend per contract, codes against the
  interface above); (3) integration: swap into App.tsx, uninstall mapbox-gl,
  remove token + old map dir, netlify CSP cleanup, headless-browser QA
  screenshots incl. mobile viewport, build green.

## Stages

- **Stage 1 (1 coder agent)**: scaffold, deps (mapbox-gl, zustand, date-fns,
  date-fns-tz), port `src/lib` + public data, .env transform, types + store
  skeleton with real init pipeline, theme tokens in Tailwind/global CSS,
  verify `npm run build` green.
- **Stage 2 (3 coder agents in parallel)**: MapEngine / Shell / Features per
  ownership above. Each: `npm run build` must stay green for their files.
- **Stage 3 (1 coder agent)**: integration, App.tsx wiring, responsive +
  dark-mode QA, netlify.toml update, `npm run build` green, dev-server smoke
  test, fix everything.
- **Stage 4**: final report + preview link.
