# Gannon Ground integration — 2026-10-03

This is partial progress on the full Iribe recreation. Both Ground auditoriums already existed. This pass replaces Gannon’s fitted enclosure and synthetic furniture with the reviewed original plan placements, corrects its two east entrances and verifies their connection to the lobby. No commit or push was made.

## Evidence and interpretation

- [UMD room list](https://www.cs.umd.edu/meeting-event-request): Gannon IRB0318, published occupancy 100; Antonov IRB0324, occupancy 300. The [official 0318 drawing](https://www.cs.umd.edu/sites/default/files/images/floorplans/irb_0318_floorplan.png) identifies the smaller tiered classroom and has a different chair arrangement from the guide.
- [Original HDR/UMD guide](https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf): Ground main page index 6, 576 × 576 PDF points, top-left origin and +Y down. SHA256 `c1fe539a56ba3b97b7b1dcb2d4563792892294a59caeaa476f67ec810fcf7474`. Native paths were reviewed independently in `gannon-ground-source-2026-10-03.md` and the repository-root `docs/research/iribe/gannon-seating-2026-10-03.md`.
- Ground ledger: 708 unchanged native paths / 1861 commands. Runtime selects fifteen room-side runs (59 commands), sixteen leaf-edge commands and four swing commands. Two gaps are explicitly derived door thresholds; tiny rail/jamb joins and the NW fractional junction remain documented closure interpretations.
- Furniture ledger: 2727 unchanged paths / 2921 commands. The guide has **97 student symbols and one presenter**, with student row totals **14, 16, 18, 18, 18, 13**. It has eighteen shared student desks and one presenter desk. No chairs were added to force the published occupancy.

## Runtime changes

`gannon-ground-runtime-source.ts` and `gannon-seating-runtime-source.ts` are compact evaluated subsets. The full research ledgers are excluded from the browser bundle. `gannon-ground-layout.ts` maps every source point through the shared Ground guide registration once. It samples retained cubic spans with eight chords each, yielding a valid 172-vertex enclosure. Open leaf rings orient native line travel and midpoint endpoint discrepancies of at most 0.000888 PDF pt; raw commands remain unchanged.

The two native east pairs are physical open panels with collision, clear apertures and overhead beams. Room shortcuts and signs use these actual entrances. The old Antonov east walls now begin above the provisional lower-room ceiling rather than blocking the Ground corridor. The front single door is retained as source evidence but is not opened through conflicting continuous wall paint or an unconfirmed destination. The source southeast step mouth remains open; its current level transition is provisional, and its three drawn bands are not presented as a measured stair.

`gannon-seating-layout.ts` replaces the synthetic furniture grid with all 98 individual source centers and directions. Side banks follow the native fan, approximately 22.71 degrees. There is one desk per source group. Desk rectangles enclose the retained source outline control vertices; rounded corners and fragmented chair-side outlines are approximated. The presenter has a separate source desk/chair rather than the old four-chair front group and invented extra lectern.

Twenty-six floor pieces use the source boundary sets aligned to desk rows 0/2/4 and the source aisle rectangles. **Elevations are estimates:** the rear entrances share Ground datum, three platforms rise 0.30 m, the presentation floor is 0.90 m lower, and intermediate aisle treads rise 0.15 m. Physical chair/table heights, finishes, AV screens and ceiling fixtures are also estimates. These quantities are shared by rendering and navigation.

`gannon-section.ts` clips the lower ceiling beneath the existing Antonov seating with an estimated 0.19 m slab allowance and maximum height 3.3 m. Wall tops share this section, keeping both standing volumes clear. Its 334 ceiling pieces resolve a model overlap; they are **not** documentation of the actual auditorium section or reflected ceiling. A real section/interior photographs are still required.

The Ground lobby slab now has a hole over the lower room, and Ground navigation does not provide an invisible level support through the pit. Room shortcut selection filters nearby barriers and rejects worse candidate scores before doing expensive geometry checks, preserving the same clearance/ranking rule. This also lets the all-room shortcut check finish within its normal deadline.

## Verification

| Check | Result |
| --- | --- |
| Evaluated runtime subset against original PDF and independently evaluated source chairs | 135 selected commands exactly equal; all 98 chair centers/directions/roles/rows unchanged; native coordinate error 0 |
| Native enclosure and four derived door-leaf rings | Valid; all geometry inside the Ground footprint |
| All floor-piece polygons and coverage | 26 valid pieces; uncovered/outboard/overlap area below 1e-12 model m² |
| Ceiling polygons and coverage | 334 valid pieces; missing area 9.56e-9 model m²; no outboard area |
| Chair centers and desk envelopes | All within the source enclosure |
| Both east door pairs, both directions | Pass |
| Both native aisles, both directions; chair/platform and desktop/back separation | Pass |
| Lobby → east corridor → lower east pair, both directions | Pass; route keeps clear of the open leaf ends and fitted facade |
| Rendered aisle support/headroom; lower ceiling versus upper standing volume | Pass |
| Every room shortcut clear of walls/furniture | Pass |
| Coupled Ground entrance/structure/bench/south-stair, shell-visibility and auditorium selection | **97 pass**, 394 unselected of 491 cases; `--testTimeout 15000` allows the dense all-floor ray checks to finish |
| Final auditorium/shortcut repeat after attaching downlights to the lower ceiling | 29 pass, 462 unselected of 491 cases |
| Final typecheck, ESLint, Vite production build and whitespace gate | Pass; 3032 modules, 6.71 s build, lazy interior 871.26 kB / 303.53 kB gzip |

The first broader selection also checked Antonov’s exterior stair. Three assertions failed because its fitted first apron crosses the authentic courtyard glazing at original Ground path 54646. This is away from Gannon and remains unresolved; the outdoor connection is not counted as verified. Its legacy transform uses the fitted seating frame instead of the shared Level 1 source registration. A bounded native upper-shell/stair trace is underway for the next repair. The initial broad run also hit the five-second default deadline for dense south-stair ray checks; the unchanged assertions passed under the fifteen-second allowance.

A fresh browser scene was opened through Campus map → Enter building. Gannon’s shortcut showed `0318 · Gannon Auditorium`. The walker exited through the upper east opening, the selected-space label cleared, and forward walking reentered the room. No browser warnings/errors were captured. Actual view: `/tmp/iribe-reference/gannon-native-runtime-2026-10-03.jpg`.

Scratch verification: `/tmp/iribe-reference/gannon-final-audit.json`, `gannon-runtime-source-verification.json` and the original/overlay crops under `/tmp/iribe-gannon-seating-2026-10-03/`. Production interior remains lazy loaded; the build still reports the existing large-chunk and stale Browserslist warnings. No new frame-rate benchmark was performed.

## Remaining work

Obtain a measured section and present-day Gannon photographs. Resolve its front-door continuation, southeast stair grades/access, actual ceiling/furniture/AV/lighting and current chair configuration. Register the full upper Antonov shell/outdoor stair against the shared source frame, preserving the courtyard glazing. The wider all-floor recreation and its remaining evidence gaps stay active.
