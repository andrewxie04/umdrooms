# Level 4 facade, structure and common room registration

Reviewed 2026-10-03. This integrates the separately reviewed source ledgers. It does not establish surveyed geometry, present furniture inventory or full-building completion.

## Sources and unchanged evidence

The original UMD/HDR [event guide](https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf), zero-based pages 11/12, remains the architectural source. PDF SHA-256: `c1fe539a56ba3b97b7b1dcb2d4563792892294a59caeaa476f67ec810fcf7474`.

- `fourth-column-trace.ts`: twenty inside round-column symbols, including the five west continuation markers. Native centers, outline commands and identities are unchanged.
- `fourth-guide-layout.ts`: the reviewed equal-weight twenty-column similarity through Level 2/Level 1 into Ground. See `fourth-guide-registration-2026-10-03.md` for correspondence review and residuals. It is a historical CAD registration, not a survey.
- `fourth-facade-trace.ts`: 196 ordered original spans, with the original detail commands retained independently. See `fourth-facade-2026-10-03.md` for exact evaluated-source checks, original/overlay visual inspection and unresolved native joins.

The facade was not fitted to the column circles. No column was moved or dropped to make the facade contain it.

## Runtime integration

`fourth-facade-layout.ts` applies the existing `registeredClosedGlazingBaseline` convention through `fourthGuidePlan`. `footprintForFloor('4')` now returns this 196-vertex loop; floor, slab underside, ceiling, glass, frame and exterior walking barriers use the same contour.

The helper derives a closed polygon from separate native spans. Adjacent-line intersection is used only under the documented determinant and sub-2-point extension thresholds; other joins use endpoint midpoints. Native records remain unchanged. The one short cubic span is represented by its endpoint chord. Gray/black lateral transitions, physical corner/mullion profiles and roof aperture assignments remain unresolved; runtime use does not turn these derived joins into source measurements.

`structure.ts` instantiates the twenty registered source centers with marker-derived radii. The prior eight schematic posts are removed from Level 4 only. The same layout supplies rendered cylinders and standing-height collision. Heights and physical diameters remain estimates.

The old `fourthPlan` piecewise triangles were replaced by `fourthGuidePlan(x/2,y/2)`: the existing main-page room raster uses two pixels per original PDF point. `westFourthPlan` retains the historical joined-crop conversion before this common registration. Rooms, furniture, corridor boundaries and core traces now share the source frame. This is a registration correction; their earlier raster readings are not lossless native wall traces.

Facade-adjacent room partition junctions project to the source glass. `fourthFacadeRoom` follows the short native facade arc between those junctions, inserting its unchanged vertices. A straight chord between endpoints had cut outside concave parts of the facade; the corrected office/window edges now follow the actual derived envelope.

## Coupled navigation changes

The repeated west stair is defined through `westFourthPlan`, so this correction also changes its inferred repeated frame on Ground through Level 5. This was checked explicitly rather than treated as an isolated glass edit.

| Estimated frame value | Earlier fit | Common source registration |
| --- | ---: | ---: |
| Origin X | -13.858446 | -15.855987 |
| Origin Z | 37.565323 | 37.939115 |
| Width | 3.287431 | 3.183902 |
| Length | 7.858250 | 7.293503 |

These are model coordinates/metres at the existing estimated scale, not measured stair dimensions. Repeated Level 3 continuity remains inferred. The west cab interior and floor-specific shaft/landing survey remain undocumented.

The old far-west test route passed too close to source column `33820`, native centre approximately `[205.162010,392.597595]`. The post stays fixed. The route now uses the north aisle between that post and the enclosed stair wall, through native `[215,386]` and `[195,386]`, in both directions. These route waypoints are clearance choices, not additional source vertices.

## Furniture corrections prompted by source inspection

Fresh original page 12 crops were visually inspected, rather than inferring furniture from a failed test.

- Each of the three small west meeting rooms has **two** visible chairs, north and east of its table. The previous third chair was a mistaken interpretation. `west-huddles.ts` corrects the count and approximate raster centres. The six-chair larger room is retained. Table dimensions, tucked unoccupied chair poses and finishes remain estimates; small near-square table contours are still approximated as round surfaces.
- The north lounge shows a twelve-chair paired table, a five-chair facade counter and three separate round-table groups with four, four and two chair symbols. The former generic central table had placed furniture across the south corridor. `fourth-lounge-layout.ts` uses approximate original-page symbol positions through the same registration. It retains a clear corridor and renders physical table tops, legs and chairs with matching occupancy barriers. These are raster interpretations of historical symbols, not exact source commands or a current equipment inventory.
- Lighting, upholstery colours, chair form, furniture heights and construction details remain estimated. The previously photograph-informed black exposed ceiling and irregular pendants are retained.

## Independent geometry audit

The runtime exports were bundled/evaluated into scratch JSON and checked independently with Shapely, rather than checking intermediate author data against itself.

- Derived envelope: 196 vertices, valid/simple polygon; area **2782.470268947681 model square metres** at the estimated scale. This is a diagnostic, not a building-area measurement.
- All twenty circular column footprints lie inside the corrected envelope; checks use 128 segments per buffer quadrant. Source command validation remains in the separate facade/column notes.
- All **74** Level 4 room polygons are valid. Maximum computed room area outside the envelope is approximately **7.46e-16 model square metres**, floating-point residue.
- A runtime test additionally checks every room edge midpoint, so endpoint-only containment cannot hide an outboard facade chord.

Scratch reproduction: `/tmp/iribe-reference/fourth-structure-audit.mjs`, its evaluated bundle and `fourth-structure-before.json` / `fourth-structure-after.json`. Original source crops: `fourth-huddles-full-original.png`, `fourth-west-corridor-source.png`, `fourth-office-corridors-source.png` and `fourth-north-lounge-source.png` under the same scratch directory.

## Verification

Selected `circulation.test.ts` checks: **140 passed**, including all Level 4 office doorways, both far-west routes, north corridors, shared furniture, every small meeting room, the source facade/column render and collision checks, continuous west stair G–5, west support rooms, communicating stairs, room shortcuts and geometry checks. Separate north-lounge checks: **2 passed**, including all 27 chair approaches from its south entrance. These are focused tests, not proof of every full-building route.

`npx tsc -b`, `npm run lint`, `npx vite build` and `git diff --check` passed. Final production build after the source ledger and selected-space header updates: 3027 modules, 6.16 s; lazy interior chunk 822.23 kB / 291.16 kB gzip. Existing chunk-size and stale Browserslist warnings remain. Additional source data and geometry do not establish improved frame rate; no FPS/device benchmark was performed.

### Actual running website

Exited to the campus page and re-entered Iribe to recreate the scene after HMR. At the normal narrow preview viewport:

- Selected Level 4 and North study lounge. The new long table/chair group, facade counter and source columns are visible. Walked forward along the table/window aisle and backward, then looked toward the twelve-chair table.
- Selected West meeting room A and saw its two-chair arrangement. Turned toward the door, walked through it into the adjoining corridor, then walked back inside without using a shortcut for the return. DOM navigation marker positions were approximately `[-12.561858,23.029425]` inside initially, `[-12.843105,20.545089]` in the corridor and `[-13.864378,22.403705]` back inside. Narrow-screen turns needed several drags to align with the opening; no claim of a straight unrestricted route through furniture is made.
- Selected West stair and moved onto its first upward flight. The stairs, guards and landing render at the revised frame. A complete manual G–5 stair walk was not repeated in this browser check; the continuous route/headroom checks above are automated.

Fresh actual screenshot: `/tmp/iribe-reference/fourth-north-lounge-runtime-2026-10-03.jpg`.

## Remaining limits

Level 4 native room partitions/door hardware, the 4105 furniture/AV layout, exact facade transitions, the north lounge's current fitout, structural/storey dimensions and floor-to-floor shaft alignment still need evidence. Levels 3/5 remain fitted for structural posts/shells. This pass is concrete progress within the entire-building goal; it does not resolve the Ground auditoriums' separate connections or establish full completion.

### Selected-space header follow-up

The interior header now names a successfully visited room. It tracks that explicit selection rather than inferring auditorium identity from overlapping two-dimensional footprints; Gannon and Antonov occupy different vertical parts of the same projected volume. The name clears on leaving the selected polygon, changing floor or using another navigation shortcut. This adds one point-in-polygon check for the selected room when the existing location callback fires; no new renderer loop or blanket room search was added. Actual browser checks confirmed the Gannon and Antonov names, clearing on floor change, and clearing after walking out of West meeting room A. Fresh Gannon screenshot: `/tmp/iribe-reference/gannon-current-model-named-2026-10-03.jpg`. Browser warning/error log was empty. Ground Gannon geometry is still the earlier fitted model; its completed source handoff is documented separately.
