# North stair registration review — 2026-10-04

The broad circulation review exposed four legacy enclosed-stair failures: ascent/descent between Levels 3–4 and 4–5. The blockers are Level 4 office `4-west-office-1` walls/furniture, not Antonov's Ground barriers. The legacy center, converted into the original Level 4 frame, is approximately `[330.8818, 377.5379]` PDF points. Its shaft extends through the office beside the actual stair. No office collision, column, wall or source position was removed to bypass this error.

Primary evidence: [HDR / UMD building guide](https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf), native original pages 6, 8, 10 and 12. The original four stair crops were freshly rendered and visually compared. Ground has a western entrance in its lower wall; the three upper spreads show an eastern entrance. Their projected tread patterns differ, so the old repeated switchback and same-end landing cannot be called an exact section.

On original Level 1 page 8, the left wall's native inside endpoints are retained in path **92745**, including `[279.00018310546875,363.0132141113281]` to `[275.586181640625,389.70721435546875]`. The right side has separately painted fragments **92666**, **92670**, **92677**; the latter includes the inner face from `[328.24249267578125,368.18609619140625]` through `[327.802490234375,371.6531066894531]` and `[325.1604919433594,392.26708984375]`. Compound fills and door rebates must be preserved; a fitted rectangle would omit their topology.

Corresponding masonry fragments on Level 4 include **33791** (left side), **33784/33785** (lower side) and **33757/33758/33759/33761** (right side and rebates). Ground includes **52364** and **52400**. These native identities were inspected in context; they are not yet a reviewed ordered flight/enclosure trace or a runtime correction. The red wayfinding stair symbols overpaint some gray tread evidence; original paths remain available beneath those annotations.

A correction needs a shared source-frame route/enclosure/slab opening and actual floor entry, with distinct Ground topology. The existing fitted Level 1 north-room registration uses the legacy center and must be revised with that correction. Level 3/5 intermediate plan continuity and vertical stair elevations remain unverified. Do not shift the native Level 4 office/columns or weaken walking clearance to accommodate the legacy shaft.

Scratch diagnostics and fresh original crops: `/tmp/iribe-reference/bounded-north-stair-root-causes.json`, `north-stair-parent-page-{6,8,10}.png`, `north-stair-parent-original.png`, `north-stair-parent-page-{6,8,10}-masonry.json`, `north-stair-parent-masonry.json`. Source data is read-only; the PDF was not modified. The preceding paragraphs record the initial diagnosis. The correction below supersedes their runtime status.

## Integrated correction

`north-stair-source.ts` retains **47 original paths / 257 commands** from pages 6, 8, 10 and 12. A separately evaluated TypeScript export compared against a fresh original-PDF extraction has zero coordinate error and identical paint/style/null fields. `north-stair-solids.ts` derives the nonzero opaque paint union from the unchanged native paths, including small holes and door rebates; it does not simplify masonry to a fitted box.

`north-stair-source-layout.ts`, `north-stair-layout.ts` and `north-stairs.ts` now share the registered enclosure, slab opening, source flight cross-sections, western turning deck and floor entries. Ground retains its distinct western entrance; upper levels use the eastern opening. The shared source frame replaces the old shaft through Level 4 offices. Rendering and walking use the same cross-sections and landings. Ground brick cladding follows the UMD lobby photograph; the Ground masonry extends to the existing estimated sunken-court datum, avoiding a duplicate fitted enclosure through its door.

The four Level 1 north-office raster readings now use the same native guide transform. Other Level 1 north-room registration still uses its existing fitted wayfinding anchor: changing that anchor alone would warp all rooms, so that legacy registration is explicitly retained for those unrelated fitted interiors.

One estimated column marker on each of Levels 3 and 5 intersected the corrected shaft. Those markers now inherit the adjacent native Level 4 column position rather than deleting a physical column or moving the Level 4 source marker. This is **inferred structural continuity**, not an independently confirmed Level 3/5 plan. All native Level 4 offices and columns retain their source positions.

The metric scale, floor heights, half-storey rise allocation, extra subdivisions needed for at-most-0.19 m modeled risers, turning-deck closures, opening/landing margins, fixture dimensions and finishes remain estimates. Levels 3, 5 and roof repeat the documented upper-plan topology with explicit inferred continuity. The source does not establish a measured section, rooftop stair-head arrangement or surveyed shaft alignment. Native upper-door differences, missing intermediate plan evidence and actual section/finish photographs remain to be resolved.

## Navigation verification

The corrected stair passes all Ground-to-roof ascent/descent routes, adjacent Level 1 north-office/corridor checks and Level 5 service connections. The roof route now follows the actual eastern landing and opening. The Family Garden door has been independently corrected to its original page-8 hinge midpoint, with a documented 0.231 m projection onto the existing fitted facade; see `family-garden-door-registration-2026-10-04.md`.

The sunken-court return uses a clear route around the native enclosure and source furniture, retaining the 0.24 m body radius and 0.26 m route clearance. A 0.2 m search grid is constrained to the main Ground datum, so it cannot disguise the defect by walking through a wall or across a lower court on air. Both directions pass.

The complete circulation suite after these integrations reports **491 passed, 0 failed** with a 45-second per-test allowance (`/tmp/iribe-reference/iribe-lobby-final-navigation-2026-10-04.json`). This verifies the existing route assertions, not surveyed architectural fidelity or the entire building's unmodeled connections. A later lobby-enclosure correction must receive its own coupled checks. The full-building goal remains incomplete.
