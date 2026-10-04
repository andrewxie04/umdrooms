# Antonov outdoor stair review — 2026-10-03

## Evidence

The [HDR / UMD guide](https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf), PDF page index 8, contains three front stair runs, curved lower risers, intermediate landings and transverse leaves. The riser cross-sections were inspected in a 9× crop and extracted from the vector paths while retaining the original page coordinates. Two interrupted cross-sections and the apron/upper landing bounds are fitted estimates.

[Nick Seitz's project record](https://www.nickseitz.com/portfolio/brendan-iribe-center/) identifies photographs made in 2019 for Radius Track, the auditorium's structural-steel engineering firm. These are primary photographs by their author:

- [Stair and scupper detail](https://www.nickseitz.com/_astro/Seitz19060377612-2-Edit-2.CkrHmJGU_Z1XnY6b.webp): open concrete steps beside curved masonry, a broad pale parapet cap, stainless handrails, transverse gates and a recessed doorway at a landing.
- [Auditorium roof oblique](https://www.nickseitz.com/_astro/Seitz19060377563-2-Edit-1.CIc9h7Or_1wueU6.webp): the stair rises outside the copper upper auditorium volume; the visible route continues toward the upper roof access.
- [Roof and Family Garden aerial](https://www.nickseitz.com/_astro/Seitz19060377329-2-Edit-6._PgDC4_L_ZqoBlK.webp): the garden deck lies below the upper copper volume and roof collar. Broad auditorium windows face the garden directly. The entire front stair must not be assumed to be an enclosed garden passage.
- [Connector corridor](https://www.nickseitz.com/_astro/D78A9433-Edit-5.CGrcmuuu_Z25FaYo.webp): curved masonry with glazed openings, white columns, pale ceilings and thin tube pendants. It does not expose the stair landing or the south foyer's floor height.

All four images were visually inspected. The larger views resolve the stair's open-air character and its relationship to the roof collar, but provide no surveyed elevations or labels for the recessed landing door. No copyrighted photograph is redistributed in the site.

## Implemented

- Three open outdoor flights, curved lower treads, both intermediate landings, start apron and upper landing.
- Concrete treads and risers, masonry at the building side and outer parapet, broad pale cap, stainless rail and open gate leaves.
- World-scaled brick joints, preserving texture phase along the curved sides, with a continuously sloping parapet cap beside the stepped treads.
- Independent masonry color and bump texture sources. Browser review exposed an existing texture-clone bug that replaced the reddish color data with gray height pixels; that shared-source mutation is corrected for auditorium masonry throughout the model.
- A destination shortcut and stair outline in the interior minimap.
- Shared rendered tread polygons and walking support. The upper continuation is guarded while its roof-access route remains incomplete.
- Removal of the schematic ground outline's erroneous curtain wall around this masonry front, which otherwise enclosed the outdoor stair.

## Estimates and remaining work

The existing undimensioned auditorium registration is reused. Metric scale, wall thickness, copper-band height, material colors, rail dimensions, gate opening pose and the extra landing bounds are estimated. The provisional grade and landings are **0, 2.8, 5.6 and 8.4 m**. These values are fitted model elevations, not source measurements. The treads interpolate each provisional flight rise.

The complete roof collar, copper roof shape and upper access continuation remain incomplete. The recessed landing doorway has not been assigned to a room or cut through the auditorium wall without evidence. The south foyer and its garden/seating doorway heights still need a legible section, spot elevations or a documented walk-through connecting those spaces. This work does not establish those connections.

## Verification

Geometry checks exercise ascent and descent through all three flights and both landings, ray-check every tread and landing against the support elevation, inspect standing headroom in the complete positioned building, verify the shortcut arrival and check the guard at the unfinished upper continuation. All six outdoor-stair tests passed after the continuous cap correction; the separate check of every room shortcut also passed.

After returning to the campus and reopening the interior to load the changed geometry, the running site was tested with its on-screen walking controls. The route was walked from the apron through the curved lower flight, both intermediate landings and the upper flight to the upper landing. Turning around and descending the upper flight returned to the second intermediate landing. Walking along the curved run requires steering with its bends. This browser check verifies the modeled route's usability, not its estimated elevations or the missing roof continuation. Captured console error logs were empty.

The source record was expanded in the running reference panel, confirming that provisional elevations and incomplete connections are disclosed. The lobby shortcut was then revisited to visually confirm the floor, seating, lighting and corrected reddish masonry. The walkthrough snapshots were saved locally for review; reference photographs remain outside the repository. TypeScript, ESLint, the production Vite build and `git diff --check` passed. The build retains the existing bundle-size and stale Browserslist-data warnings.
