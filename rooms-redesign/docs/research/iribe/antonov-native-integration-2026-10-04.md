# Antonov shared source-frame integration — 2026-10-04

## Evidence and scope

Primary plan: [HDR / UMD building guide](https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf), original PDF page index 8. SHA-256: `c1fe539a56ba3b97b7b1dcb2d4563792892294a59caeaa476f67ec810fcf7474`. Original 576 × 576 PDF points retain their top-left origin and downward Y axis. The upper-plan column similarity registers this source to Ground; the physical metric scale is an estimate, not a survey.

Independent full source records and reviews are retained in `antonov-first-shell-trace.ts`, `antonov-seating-native-trace.ts`, `antonov-first-shell-source-2026-10-03.md` and `antonov-seating-native-2026-10-03.md`. Original contextual renders, source replays and semantic overlays were inspected. Historical fitted-seating and stair notes describe an earlier stage; their artificial minimum pitch and separately fitted registration are superseded here.

## Integrated changes

- The primary seating-room mask follows 24 selected native face runs, 156 unchanged commands and explicit trimmed cubic intersections. Adaptive tessellation produces 194 vertices. Interrupted paths require small consumer joins; this closed mask is not a literal closed source path. The separate northeast recess is not silently included.
- The known northeast aperture uses original jamb endpoints. Door symbols over continuous opaque south/southwest paint remain uncut. The south white recess and transverse doors do not yet establish a connected runtime route or its elevation.
- All 298 student symbols and the presenter use their original individual centers and front/back facing. The banks contain 81 north, 137 center and 80 south students. No chair-center offset, minimum pitch or uniform replacement bank axis is applied.
- Thirty shared desks and one presenter desk follow original front edges. Their control-point envelopes approximate rounded ends and seat cutouts. Chair construction and desk thickness/leg details remain photo-informed estimates.
- The 47 original outdoor stair cross-sections now use the same registration as the room and furniture. The finite stair envelope opens the existing Ground ceiling. Apron/upper terminal extents and bridging fragments remain explicit model interpretations.
- Screens, ceiling folds, projectors and the existing area lights use the shared transform. Their source positions are photographic interpretations, not measured CAD fixtures. Garden-side glazing has provisional vertical sill/head values; the native opaque plan bands alone do not establish those elevations.
- Gannon's underside is partitioned under actual low upper-floor triangles rather than treating the concave Antonov outline as convex. This prevents an upper support volume from being assigned a ceiling above the modeled upper floor. Its visible stepped soffit is provisional; it is not an assertion about the building's actual structural section.
- Garden theater-side anchors use the original 2× guide frame. The corridor facade still has a separate schematic fit, so the corridor-to-garden registration uses a continuous fitted interpolation. The terrace follows the source room edge, leaves the south recess outside the seating room, and has no area overlap with the seating footprint. Landscape construction/setback remains estimated. Named outer guard edges replace obsolete fixed vertex numbers.
- Brick outer faces use physical UV scale and continuous distance phase along the curved walls. The original raw ledgers stay outside the lazy browser bundle; compact evaluated source subsets feed runtime geometry.

## Verification

Directly evaluated compact exports were compared with a freshly reopened original PDF, including all 156 selected commands, 299 individual chair centers/facing, 31 desk front commands and 47 stair cross-section endpoint pairs. Maximum coordinate error was zero. The full independent ledgers also retain native cubic controls, paint order/style and ownership checks; compact export verification is not a substitute for those records.

Geometric audit: the 194-vertex seating footprint is valid; all 299 chairs and 31 desk envelopes fit. The 120 upper floor pieces cover it with approximately `1.8e-10 m²` numerical remainder, no meaningful outboard area and no overlap. All 574 Gannon ceiling pieces are valid, cover the lower mask with approximately `8.5e-9 m²` numerical remainder, and have zero modeled area above the upper floor. No outdoor stair piece intrudes into the seating mask. The final terrace and all three planter polygons are valid; their outboard and auditorium-overlap areas are zero in the polygon audit.

All **39 coupled checks pass** for furniture count/fan/containment, long aisles and middle/rear routes in both directions, standing headroom, outdoor ascent/descent and unfinished terminal guard, both Gannon entrances/aisles/corridor, garden doorway round trip, planter bypasses, outer guard approaches and source-selected window rays. The atrium standing-headroom case passes separately with a sufficient test timeout; the first broad run timed out in that case without reporting a geometry assertion.

The initial full circulation review passed 480 of 491 cases. Besides the now-corrected three garden cases and the resolved atrium timeout, it exposed four upper north stair routes, an east Level 4 restroom approach and two west Level 1 office approaches. The two west office routes were subsequently corrected with source-based desk forms and small explicitly fitted visitor-seat adjustments; 34 selected office checks pass. The north stair conflict is in the legacy shaft placement, which intersects the independently registered Level 4 office. The original Ground/Levels 1/2/4 stair drawings have now been visually compared, showing that correcting it requires coordinated source-frame flight, enclosure, slab and floor-entry work. A restroom source correction is underway. The initial broad run is not recorded as a pass.

A fresh local scene was reloaded, entered from the campus building details, and reviewed using the site's controls. Antonov's rear aisle and screen/seating view were inspected and walked approximately 1.6 m. Gannon's selected-room view showed the provisional shared soffit. The garden view showed the revised brick/terrace/guards under the existing photographed sky; the entrance approach was walked approximately 1.5 m. An earlier fresh-scene outdoor check entered the first flight. Screenshots:

- `/tmp/iribe-reference/antonov-native-runtime-2026-10-04.png`
- `/tmp/iribe-reference/gannon-shared-section-runtime-2026-10-04.png`
- `/tmp/iribe-reference/gannon-final-review-2026-10-04.png` (selected room with a lower view pitch)
- `/tmp/iribe-reference/family-garden-native-interface-2026-10-04.png`

These checks establish modeled usability at the tested routes, not measured elevations, full-floor browser coverage, physical touch behavior or a new FPS benchmark.

## Still unresolved

Published capacity (Antonov 300 and Gannon 100) is separate from historical drawn furniture. Present-day movable seating, reliable sections/landing elevations, the south foyer and garden/seating door assignments, northeast secondary recess, outdoor recessed doorway destination, complete copper volume/roof collar and upper access remain incomplete. Provisional Antonov row rises are 0.55 m; outdoor levels are 0 / 2.8 / 5.6 / 8.4 m. Four paired drawn aisle-tier details do not prove ten measured rises. Garden elevation remains 6.5 m. The entire-building goal remains active and incomplete.

## Combined continuation check

The final combined auditorium/garden/west-office selection passes **71 checks** with 420 unrelated cases skipped. TypeScript, ESLint, a direct Vite production build and `git diff --check` pass. The build preserves the existing large-chunk and stale Browserslist warnings. The lazy interior chunk is about 1,013 kB / 326 kB gzip; native raw source ledgers are excluded. No FPS improvement is claimed. The four upper north stair routes remain unresolved while the native stair/enclosure registration is reviewed.

Final fresh-scene console capture contained no warnings or errors. The browser is left at the selected Gannon room. No commit or push was performed. The bounded restroom worker remains active; its eventual patch needs separate review/checks before being recorded as verified.
