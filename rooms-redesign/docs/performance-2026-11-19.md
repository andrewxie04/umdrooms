# Load-time and class-data performance — 2026-11-19

## Class data

**Live days (outside the baked range).** `availability-building` used to fetch
one 25Live request per room with `comptype=availability_daily`, which returns
~31 days (~40 KB) per room. It now sends one request per building with
`comptype=availability`, which returns only the requested day; 25Live answers
all of a building's rooms in about the time one room took. Today's slots were
compared with production's output for IRB, ESJ and MTH: identical apart from the
order of cross-listed course names.

| All 43 buildings, one day | Before | After |
|---|---|---|
| Wall time (Node, same network) | 13.5 s | 3.2 s |
| JSON transferred | 5.6 MB | 0.55 MB |
| 25Live requests | ~320 | 43 |

Splitting large buildings into parallel 25Live requests was tried and rejected:
for MTH alone three ~10-room chunks were 15–30% faster than one request, but for
the whole campus (24-way) whole buildings took 1.9–2.8 s and 10-room chunks
2.3–2.5 s over three runs, within noise, while adding upstream load. Six-room
chunks were slower.

The function also answers `GET ?date=&code=` with
`Netlify-CDN-Cache-Control: s-maxage=300, stale-while-revalidate=900`, so later
visitors are served from Netlify's CDN. The client tries GET first, falls back
to POST on a 405 (older deployment), and runs 24 buildings at once, largest first.
`dining-status` received the same GET/CDN treatment (upstream ~6–10 s).

**Baked days.** The client used to download the whole `buildings_data.json`
(~10–12 MB, about a month of slots) to show one day. The build now writes
`public/availability-days/<date>.json` (~0.2–0.3 MB; generated, git-ignored), and
the client merges that day onto the room inventory, falling back to the archive
if a shard is missing. The shard request starts at init instead of waiting about
2 s behind the 3D scene build.

**Repeat visits.** A same-day snapshot older than its 15/60-minute TTL (kept up
to 12 h in IndexedDB) is now shown immediately while the live refresh replaces
it building by building. If a building's refresh fails, its earlier data stays
visible, the day is reported as "N buildings showing earlier data", and nothing
is saved as fresh. Baked days are kept in memory for the session, and Schedule
mode prefetches the neighboring days' shards (never the full archive).

**Dining.** The day's menus are saved in the same IndexedDB store and shown at
once on the next visit (up to 12 h old) while the ~6–10 s refresh runs; a failed
refresh keeps them. Library study rooms are deliberately not restored from a
saved copy: they are bookable and change with every reservation.

**What loads first.** On a live day the open building, a deep-linked building
and favorites are requested before the rest (then largest first), so the rooms
someone is looking at arrive in the first wave.

**Forced refreshes stay fresh.** The Refresh button and the 15-minute "now"
refresh add a per-minute `fresh` token (part of the CDN cache key via
`Netlify-Vary`) and skip the browser cache; otherwise a refresh could return a
copy up to five minutes old. Dining does the same. While the 43 responses stream
in, main-thread work is negligible (12 ms total blocking in dev), so the
per-building re-derivation needs no batching.

**Older deployments.** The first GET doubles as a probe; other requests wait for
it, so an older deployment costs one 405 rather than one per building.

## Main thread

`buildSceneGeometries` (~0.65 s on an M-series laptop, several seconds on phones)
runs in `geometry.worker.ts`, whose script starts loading alongside
`campus-data.json`; geometries come back as transferred typed arrays
(`geometry-transfer.ts`, round-trip test included). Shaders are compiled with
`renderer.compileAsync` before the first frame (KHR_parallel_shader_compile).

Production builds served locally, same machine, cold load:

| | Old build | New build |
|---|---|---|
| Longest main-thread task | 1,036 ms | 145 ms |
| Total blocking time | 1,144 ms | 162 ms |
| Campus geometry ready | ~1.2 s (blocking) | ~1.1 s (in the background) |

The easter eggs (and `sonner`, used only by them) are lazy-loaded: main bundle
179 → 170 KB gzipped. The drawer library stays eager; it is the phone UI.

**Static data caching.** `netlify.toml` gives the day shards, campus data,
trees, inventory and metadata `max-age=300, stale-while-revalidate=86400`, so a
repeat visit starts from its cached copy instead of waiting on a 304 round trip
before the map and list can begin. They only change with the daily deploy.

`campus-data.json` is 2.1 MB raw but ~290 KB with Brotli, which Netlify applies;
quantizing its 7-decimal coordinates was judged not worth the fidelity risk.

## Opening the Iribe interior

Measured on a production build (marks added to a scratch copy only), click to
walkable view:

| | Before | After |
|---|---|---|
| Ready | 3.0 s | 1.5 s |
| Longest main-thread task | 1,150 ms | 350 ms |
| Total blocking time | 2,043 ms | 875 ms |

- `selectSurroundings` (campus context seen through the windows) ran the exact
  inside/edge-distance test for every 1.5 m road sample and footprint vertex;
  a bounding-box early exit in `outsideInterior` returns the same answers
  (checked against the brute-force test on 20,000 points) and cut it ~270 →
  ~30 ms in dev.
- Auditorium chairs (~400, ten parts each) are drawn as instanced meshes via a
  new optional `instance()` builder method instead of being cloned and merged:
  the Ground floor built in ~375 ms instead of ~1.1 s. Same parts and placement;
  the chair pedestal cylinder uses 12 segments instead of 32.

- When Iribe's building panel opens, the interior chunk (~360 KB gzipped) and
  the 1.4 MB sky HDR are fetched at low priority during idle time
  (`components/interior/prefetch.ts`), so "Enter building" does not wait on
  them over a real network. The chunk's contents were checked: the large
  research trace ledgers are already excluded; the biggest remaining item is
  three.js's RectAreaLight lookup tables (~240 KB), which the area lights need.

- Only Ground and Level 1 (seen through the atrium) are built before the
  interior opens; the other floors are built afterwards in idle slices with
  their shaders compiled first. Anything that needs a floor sooner — walking
  onto it, the floor picker, a room shortcut, a lift ride — builds it on the
  spot (`ensureFloor`), so collisions are never missing. Ready: 1.8 → 1.5 s.

## Trying local function changes

`LOCAL_FUNCTIONS=availability-building,dining-status npx vite` serves those
functions from `../netlify/functions` (see `vite-local-functions.ts`); other
calls still proxy to production.

## Checked and left alone

- Function cold load: `availability-building` parses the full
  `buildings_data.json` at startup, but that costs ~34 ms locally (38 MB heap),
  small next to 25Live's 1–3 s; the 17 supplemental rooms still read their
  schedules from it, so it was not restructured.

## Not measured

Phone CPUs, CDN hit rates (needs a deploy), and Netlify cold starts.
