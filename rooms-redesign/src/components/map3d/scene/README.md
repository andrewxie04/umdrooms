# map3d/scene — three.js campus renderer core

Self-contained three.js renderer for the UMD campus: loads `public/campus-data.json`, projects lng/lat to local meters, and draws merged buildings / roads / areas / trees / ground / lamps / shrubs (~10 draw calls) with PCFSoft shadows and day/night palettes.
Exports `createCampusScene(container, { darkMode }) → Promise<CampusSceneHandle>` per the plan.md Phase 2 contract — `setDarkMode`, `flyTo`, `project`, `onFrame`, `setPulseRing`, `clearPulseRing`, `dispose`. The extended `CampusSceneHandleV2` (scene.ts) adds `setTimeMode`, `getSunElevation`, and `getPose() → { x, z, distance, phi, theta }` (post-damping camera snapshot for QA/telemetry); it is re-exported from `index.ts`.
Pure TS + three.js: no React, no store imports; the overlay layer (`CampusMap3D`) drives it through the handle only.
Render loop is dirty-checked (renders on controls/tween/pulse/palette/resize changes) while `onFrame` callbacks fire every tick so HTML markers stay glued to projected positions.
Gesture notes: left-drag/1-finger pan, wheel zoom-toward-cursor, right- or ctrl-drag rotate+pitch, 2-finger pinch zoom + twist rotate + vertical pitch; flyTo tweens cancel on any pointer input.

## Ambience (geometry.ts + scene.ts)

Campus lamps (Mission A): road+path polylines are sampled every ~35m of arc length (per-road deterministic hash phase, alternating ribbon side at half-width + 0.9m), deduped with a 12m spatial hash, and — when over budget — spread campus-wide by sorting on a per-lamp hash and keeping 550, so lamps never cluster on first-listed roads. Real data: **exactly 550 lamps**. Each lamp = a 3.2m tapered dark pole (5-sided cylinder) + a 0.22m head sphere; poles merge into ONE geometry (`lampPoles`, `MeshLambertMaterial` #3d3a34), heads into ANOTHER (`lampHeads`, own material) — 2 draw calls. The head material is `color #6b675e` (unlit fixture by day) + `emissive #ffd9a0`; scene.ts drives `emissiveIntensity` from the same `effectiveElev` that feeds the palette: smoothstep 0→1 between elevations +6° and −3°, peak 1.35, touched only when the delta exceeds 0.004 (allocation-free, dirty-check friendly). No scale pulse: a uniform scale on the merged mesh would displace heads by 3% of their position from the origin — deliberately skipped.

Shrubs (Mission B): deterministic from the building id (`hash01`) — ~45% of buildings get 1–3 low squashed icosahedra (radius 0.8–1.6m, y-squash 0.55–0.70, random yaw, base nestled below grade) placed 1.2–2.8m outside a hashed footprint corner along the centroid→corner ray; plus a path-edge sprinkle (25% of accepted lamp points, jittered 0.9–2.0m off the pole, cap 140). Muted deep green #6f8457 with ±small per-shrub HSL variance in vertex colors. Over-budget building shrubs are hash-order spread (same trick as lamps). Real data: **894 shrubs (760 building + 134 path)**, ONE merged geometry, `receiveShadow = true` — 1 draw call.

Gesture review (Mission D, controls.ts): pan sign (content follows cursor: dx→−right, dy→+forward with right=(cos,sin), forward=(sin,−cos)), wheel direction (scroll down = zoom out), pinch zoom factor (spread = zoom in, anchored at midpoint), right-drag vs two-finger pitch consistency (drag down lowers the camera toward the horizon in both), and the damping step in `update()` were all derived and verified correct. **One real bug fixed: the two-finger twist sign.** Screen-space `atan2(dy, dx)` (y down) grows for a CLOCKWISE finger twist, but a positive `theta` rotates map content counter-clockwise (north goes 12→9 o'clock); `goal.theta += Δangle` therefore rotated the map against the fingers. Now `goal.theta -= Δangle` so content follows the twist.

## Phase 3 — surfaces & water (geometry.ts)

De-beiged palette (COLORS): grass #9cad88→#8ab06e, sport →#7b9c5e (deeper), water #8fa5b4→#7ea9c8, roads/service/path cooled to #9d9c96/#b1b0a8/#cccabf, parking →#84837b; buildings stay #f8f4ea with the tint jitter widened to ±2% hue.
Water: top-level `waterways` (river 10m / canal 6m / stream 4m / ditch+drain 2m — Paint Branch river runs along the east edge) render as ribbons from the shared ribbon builder, merged into the `areas` mesh (no extra draw call); `fountain` (tiny octagons) and `pool` areas render in the same water blue; Lake Artemesia (SE corner) is a large `water` area polygon.
Y-stagger (decimeter steps): ground 0 < grass .10 < sport .12 < water/fountain/pool .14 < waterway ribbons .15 < parking .16 < contactShadows .18 < path .20 < service .30 < road .40.
contactShadows contract: `CampusGeometries.contactShadows` is one merged, position-only, non-indexed BufferGeometry — every building footprint triangulated flat at y=.18, scaled 1.06× about its centroid, NaN-free. scene.ts consumes it defensively (`if (geoms.contactShadows)`) with `new Mesh(geoms.contactShadows, new MeshBasicMaterial({ color: 0x1a1410, transparent: true, opacity: 0.18, depthWrite: false }))`.

## Landmarks (landmarks/ + geometry.ts)

Apple-Maps-style landmark modeling: buildings whose id appears in the landmark registry (keyed by OSM way id = `CampusBuilding.id`) skip the default jittered box extrusion and get hand-tuned procedural detail instead. All landmark parts merge into the SAME buildings BufferGeometry with the identical position/normal/color attribute layout (colors ride in vertex colors), so scene.ts materials, shadows, and the palette are untouched. Landmark heights are exact — no hash jitter; omit `height` to keep the tagged height verbatim (McKeldin keeps its real 23.1m).

Structure (since the builder-module refactor):
- `landmarks/types.ts` — the builder API: `LandmarkSpec`, `LandmarkBuildContext`, `LandmarkHelpers`, `LandmarkBuilder`, `LandmarkModule`.
- `landmarks/presets.ts` — the five shared roof treatments (`landmarkPresetParts`, the former geometry.ts `landmarkParts` path, moved verbatim).
- `landmarks/index.ts` — auto-registry: collects `./buildings/*.ts` via `import.meta.glob` (eager), plus `makeLandmarkCtx`.
- `landmarks/buildings/<slug>.ts` — ONE self-contained module per building, exporting `const landmark: LandmarkModule = { id, spec, build?, maxHeight? }`. No central index to edit.
- `geom-utils.ts` — the shared low-level helpers (`extrudeFootprint`, `extrudeWithHoles`, `withColor`, `centroidOf`, `scaleAbout`, `outsetRing`, `bboxOf`, `hash01`, …), moved verbatim out of geometry.ts and re-exported to builders through `ctx.helpers`.

Config per entry (`LandmarkSpec`): `name` (docs only), `color` (hex, fixed — no tint jitter), `height?` (meters override), `roof?` treatment, `accent?` (secondary hex), `nightGlow?` (0..1). Modules with a custom `build(ctx)` return merge-ready parts themselves (see `landmarks/buildings/secu-stadium.ts` — the reference builder, byte-identical to the `bowl` preset); modules without one render through the preset `roof` path. Custom builds that rise above the preset silhouette must declare `maxHeight` so the selection-highlight shell envelops them.

Roof treatments:
- `parapet` — main extrusion + rooftop setback: footprint scaled ×0.82 about its centroid, +1.8m taller, slightly darker shade (HSL lightness −0.055).
- `hipped` — main extrusion to 80% height + roof converging the top ring to a ridge segment along the footprint's longest bbox axis (ridge length = 50% of that axis, centered on the centroid); rise = max(2.5m, 20% of height) so real tagged total heights are preserved; roof in a darker shade (−0.075).
- `spire` — main extrusion + `accent` cone at the footprint centroid, radius 12% of the footprint bbox min-dimension, height +12m.
- `bowl` — outer band (footprint between ×1.0 and ×0.78 about the centroid) extruded to full height + inner polygon at 35% height in `accent` (field green).
- `glass` — plain main extrusion in the cool blue-gray `color`; pair with a high `nightGlow`.

nightGlow NOTE: the buildings material emissive is global (scene.ts/palette.ts), so true per-landmark emissive is impossible without touching scene.ts. Instead `nightGlow` lerps the landmark's vertex colors toward warm amber #ffc98a by up to 0.18 at glow 1 — a subtle warm tint under the night palette, not actual window glow.

Current registry (7; verify ids against campus-data.json when regenerating data):
- way/23408799 McKeldin Library — #ece7d8 hipped, real 23.1m
- way/23543832 Stamp Student Union — #b5856c parapet, 14m
- way/684949095 Iribe Center — #c9d4d8 glass, 14m, nightGlow .6
- way/23579314 Memorial Chapel — #f5f2ea spire (white cone), 15m
- way/980371045 SECU Stadium — #c8c2b2 bowl, 18m, field #7b9c5e (unnamed in the baked data: the 201×204m bowl next to Tyser Tower)
- way/23544340 XFINITY Center — #b9b2a4 parapet, 22m
- way/23545077 Eppley Recreation Center — #d8d4c8 parapet, 15m

Known gaps (skip gracefully — simply absent from the registry): Main Administration Building and the Clarice Smith PAC are not in the baked campus-data.json; Hornbake Library (way/23580263) exists but is left untreated (plain mass, keeps the landmark set curated).

To add a landmark: find the OSM way id (grep the building name in public/campus-data.json, or locate the footprint by coordinates), drop ONE new file in `landmarks/buildings/<slug>.ts` exporting `const landmark: LandmarkModule` (pick a preset `roof` in the spec, or write a custom `build(ctx)` — copy `secu-stadium.ts` as the template), and rebuild — the glob registry picks it up automatically, no other file changes needed. Re-run `scripts/check-landmarks.ts` (bundle with esbuild, run in node) to confirm the merged geometry is NaN-free and every id resolves.
