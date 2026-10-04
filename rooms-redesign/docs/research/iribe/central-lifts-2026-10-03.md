# Central lifts and lobby core — 2026-10-03

## Evidence and interpretation

The [HDR / UMD building guide](https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf) supplies the Ground, Level 1, Level 2 and Level 4 architectural drawings. The Ground sheet is PDF page index 6. Its central core contains two separately drawn cab outlines inside an asymmetrical curved enclosure. The Level 1 drawing shows a landing in front of those doors; the earlier broad modeled atrium void had incorrectly removed that landing. The Level 2 and Level 4 cores adjoin communicating stairs. Level 5 wayfinding identifies the repeated central core. No legible Level 3 room plan has been obtained; continuity through that floor is inferred.

The architect's [project page](https://www.hdrinc.com/portfolio/brendan-iribe-center-computer-science-and-engineering) publishes a [lobby stair photograph](https://www.hdrinc.com/sites/default/files/styles/carousel_image/public/2019-05/brendan-iribe-center-computer-science-engineering-stairs.jpg?itok=odGnMZt6). It was visually inspected alongside enlarged Ground and Level 1 plan crops. The photograph supports the tall rounded timber enclosure, vertical slats, dark joints between horizontal panels and the surrounding white stair guards. It does not document an open cab interior or a cab control panel.

Ground-sheet cab rear lines were extracted from the vector paths, retaining original PDF coordinates:

- Upper cab: `(207.193,418.455)`–`(205.884,428.678)`; opposite drawn corners `(220.729,420.190)` and `(219.419,430.413)`.
- Lower cab: `(205.433,432.194)`–`(204.120,442.442)`; opposite drawn corners `(218.969,433.929)` and `(217.656,444.177)`.

The curved enclosure now follows sampled source Bézier segments and line endpoints rather than a generic rounded rectangle. The shaft face is registered to the existing lobby/stair frame. Its fitted scale is 0.13 model metres per original PDF point. That scale, registration, door widths, storey heights and landing extents are estimates, not surveyed dimensions. The upper cab volumes are fitted inside the already registered paired core outlines, with estimated 1.90 m width and 2.55 m depth.

## Implemented

- Traced curved lobby enclosure, vertical timber slats and revealed panel joints.
- Two separate cab volumes, paired sliding leaves and door reveals on Ground through Level 5.
- A restored Level 1 lift landing with guard breaks where it rejoins the mezzanine. Only the missing area of the slab is filled, avoiding a coplanar floor overlay.
- Shared cab footprints for rendered floors and walking support, including the cabins within the Level 1 atrium opening.
- Sliding-door collision segments that move with the visible leaves. Closed doors block entry; open doors provide a usable doorway.
- Contextual call and floor controls. Travel is available only after entering the active cab and clearing its threshold. Walking is paused during closure and the short transition; arrival occurs behind closed doors, then the destination doors open and walking resumes.
- Floor shortcuts cancel the lift transition. Reference-dialog pause freezes travel; scene disposal ends its animation with the existing render loop. No independent lift timers or continuous idle redraws are introduced.

## Estimates and remaining work

The cab wall lining, floor finish, ceiling, brushed-metal response, door hardware and animation timing are estimated. Upper-core cladding extends the lobby material interpretation; it is not verified by upper-floor photographs. The simulation intentionally uses site controls rather than asserting a photographed physical button-panel arrangement. Both the contextual controls and the reference record disclose the estimated cab dimensions and finishes.

The existing independently registered upper cores do not establish a surveyed continuous vertical shaft alignment. Travel uses the respective fitted landing after the doors close. Exact shaft registration, cab photographs, the actual control layout, confirmed Level 3 landing geometry and rooftop lift service remain unverified. The west lift remains closed and its cab/inter-floor service is incomplete. This work completes a usable central-lift simulation; it does not establish those remaining architectural details.

## Verification

Geometry tests cover both cabs on every served floor: closed-door exclusion, open-door entry and exit, clear landing arrivals and containment within the core. Additional checks cover the complete positioned building's standing headroom and visible cab ceilings. Existing atrium and communicating-stair navigation is retained. State-machine tests cover every served floor pair in both directions for both cars, rejection of invalid/racing requests, threshold obstruction for closure, single arrival delivery, bounded door motion and reset.

In the running localhost website, Lift 1 was called on Ground and entered using the on-screen controls. It traveled to Level 1, where the restored landing was walked onto and back into the cab, then to Level 5, Level 4, Level 3, Level 2 and Ground. Lift 2 was approached from the lobby, called and entered, and traveled Ground → Level 4 → Ground. These checks verify the modeled transitions and controls; they do not verify estimated elevations or undocumented finishes.

The full-positioned cab headroom/ceiling test and the targeted landing, atrium, communicating-stair and room-shortcut selection passed (36 cases). The initial combined controller/geometry selection passed 114 cases, and the agent independently ran all 85 controller cases. The source disclosure was expanded and checked in the browser; captured console error logs were empty. TypeScript, ESLint, Vite production build and whitespace checks passed, with the existing bundle-size and stale Browserslist warnings.
