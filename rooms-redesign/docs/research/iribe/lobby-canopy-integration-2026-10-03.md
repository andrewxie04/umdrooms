# East canopy entrance integration

Reviewed 2026-10-03. This integrates the existing exact source ledger documented in `lobby-canopy-doors-2026-10-03.md` and continues the lobby accuracy work. The full-building goal remains incomplete.

Subsequent structural pass: the six exterior supports, bronze underside and expanded finite plaza are now modeled with explicit dimensional estimates. The earlier 4 m landing description below records the preceding stage; see [current canopy structure and checks](lobby-canopy-structure-2026-10-03.md).

## Source and registration

Authority: UMD-hosted HDR architectural guide, original Ground page index 6:
https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf

The previously reviewed ledger preserves 46 original paths / 73 items, including three paired openings, six open leaf lines and six original swing cubics. One pair is obscured by a yellow callout on the published page but is retained in its original underlying vectors. The plan and labeled vector replay were inspected again before modeling. UMD's cantilever photograph shows brick paving and inclined external columns:
https://www.cs.umd.edu/sites/default/files/images/floorplans/cantilever_photo.jpg

Every modeled leaf hinge/open endpoint, jamb fill and adjoining pane follows the existing `groundGuidePlan` registration. Five opaque jamb fill paths, including the tiny original patch at the first shared jamb, are retained as separate extrusions. The two adjoining glass panes use native lobby-side edges 49168 and 49281; the remaining regional facade connections still join the earlier fitted outline. No column or door source point was shifted to accommodate a route.

## Corrected geometry and elevations

The old local facade line lay inside the native door positions. Replacing only the drawn leaves would leave a continuous glass wall across the openings. The local perimeter now follows the native flanking pane and hinge positions, and the canopy builder supplies the corresponding glazing, frames and six open leaves.

The first movement check then exposed an elevation error: the approach lies in the modeled sunken amphitheater court, below the main lobby. The original entrance photograph and plan show this lower court. The new doors and finite exterior landing therefore share the existing **estimated 1.8 m drop**. This is not a newly verified physical elevation.

The lower floor now reaches the corrected facade. The upper lobby slab is triangulated as an open notch at the court instead of a hole with a thin upper-floor ledge beside the glass. That ledge would cross the entrance at standing head height. The obsolete glass below the main lobby datum is omitted across the source door/pane section. Rendered and walking surfaces agree through all three pairs.

The exterior landing uses the existing masonry material with world-aligned running-bond UVs. The brick size is approximately 220 × 110 mm, an explicit visual estimate. Geometry merges into existing glass, metal and masonry shell batches, with no additional texture or material, controller or animation loop. The open-leaf helper is shared with the courtyard entrance; its default base remains zero for that vestibule.

Door heights, transom/rail elevations, frame profiles, hardware, operational state, masonry appearance, metric scale, landing depth/grade and the absolute court elevation are estimates. The 4 m landing is a finite exploration surface, not the traced perimeter of the whole canopy plaza. The photographed inclined columns, copper soffit, benches and complete external cantilever still need source-backed integration; round plan symbols alone do not establish vertical columns.

## Verification

- All three pairs: movement through the opening and back, rendered floor support and standing headroom along 21 samples per route.
- Source leaf and adjoining glass visibility and collision coverage; the entrance shortcut is clear.
- The three interior door approaches connect to the lower court and the amphitheater's north return stair, in both directions, using the actual movement model. The upper stair approach then connects to the furnished lounge and atrium stair through the same model.
- Walking stops at the finite exterior landing edge.
- Courtyard entrance routes, adjacent column footings, lobby furniture, atrium/headroom routes, amphitheater journeys, lift landings, room shortcut arrivals and west stair coverage are included in the broader selection: **73 passed, 368 skipped, 441 total**. This is a focused verification, not proof of the whole building.
- TypeScript, ESLint, Vite production build and whitespace gates passed. Existing large-chunk and Browserslist-age build warnings remain; no measured frame-rate claim follows from these gates.

### Browser walkthrough

Reviewed the running site at `http://127.0.0.1:5173/` in the normal 999 × 983 browser viewport. Entered Iribe from the campus site and used the canopy shortcut to establish the approach. From there, the on-screen walking controls crossed the **middle pair** onto the finite brick landing, turned around, and returned through the same opening. A second walk followed the lower court, climbed the north return stair and continued through its narrow upper passage into the furnished lounge without another shortcut. The post beside the landing required aligning with the passage; the route remained walkable. The two other pairs have the movement/rendered-support checks above but were not independently walked in this browser pass. Physical touch gestures remain unverified.

After completing that continuous route, selected the lounge shortcut to inspect the core and window views. The photographic clouds were visible beyond the lobby glazing; no warning or error messages were captured during this final review. Source or reference edits can trigger a Vite reload and reset the interior to the campus scene, so the successful walk was performed after application edits were finished.

Saved original browser screenshots:

- Exterior landing and middle-pair view: `/tmp/iribe-reference/lobby-canopy-exterior-final-2026-10-03.jpg`.
- Arrival in the lounge after the continuous entrance/return-stair walk: `/tmp/iribe-reference/lobby-canopy-return-final-2026-10-03.jpg`.
- Lounge, atrium stair and lift view: `/tmp/iribe-reference/lobby-canopy-lobby-final-2026-10-03.jpg`.
- Seating, auditorium frontage and daylight through glazing: `/tmp/iribe-reference/lobby-canopy-window-final-2026-10-03.jpg`.

## Parallel source progress and remaining correction

The reviewed south vestibule ledger now preserves two rows / four double-door pairs / eight leaves and eight distinct paired jambs, plus two adjacent single stair doors. It contains 304 paths / 617 items, including 33 opaque fill paths with 34 native closed contours. Parent review visually inspected its labeled replay and reran exact-coordinate/style/completeness validation: both replay comparisons had zero changed pixels. It is source-only and remains unregistered/unmodeled; see `lobby-south-doors-2026-10-03.md`.

A full Ground source-column silhouette audit identified a **preexisting** north auditorium corner problem at `column-pdf6-52303`: eleven of sixty-four circle samples were outside the floor both before and after this entrance change. The other twenty-three interior source circles fit the current footprint. Correct that corner against its original adjacent facade geometry in a subsequent pass; do not move or shrink the source column. Other full-building gaps remain in `reconstruction-progress.md`.
