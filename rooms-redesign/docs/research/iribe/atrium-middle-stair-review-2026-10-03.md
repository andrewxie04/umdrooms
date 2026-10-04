# Intermediate atrium landing: source outline and application review

Reviewed 2026-10-03. This replaces the fitted semicircle with a plan-derived deck. It does not establish a measured stair section or complete the full-building reconstruction.

## Source and interpretation

The [UMD / HDR guide](https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf) supplies the Ground stair projection on original page index 6 and the partial below-floor projection on Level 1, page index 8. Both are 576 by 576 PDF points, with top-left origin and positive Y down. Original PDF SHA256 is `c1fe539a56ba3b97b7b1dcb2d4563792892294a59caeaa476f67ec810fcf7474`. Path indices are zero-based `get_drawings()` IDs on the original page.

The [HDR stair photograph](https://www.hdrinc.com/sites/default/files/styles/carousel_image/public/2019-05/brendan-iribe-center-computer-science-engineering-stairs.jpg?itok=odGnMZt6) was visually inspected again. It distinguishes the curved intermediate stair from the broader upper opening, white perforated guards, pale risers, satin metal underside and timber enclosure. It does not supply elevations or verify every projected straight return as a physical intermediate edge.

The original Ground monochrome vectors were replayed without colored annotation, with selected boundaries labeled. `atrium-middle-ground-source-overlay.png` in `/tmp/iribe-reference/` was visually inspected. The smaller stair envelope begins at the lower flight, rounds the lift enclosure and has straight southern/eastern/northern returns. It is distinct from the broad western/southern Level 1 void traced in the preceding opening review.

| Original Ground path | Role / traversal |
| --- | --- |
| 50420 | Lower outer interface to the curve |
| 50404 | Full smaller outer cubic |
| 50418 | Southern straight return |
| 50441 | Eastern straight return |
| 50415 | Northern straight return |
| 50440 | Projected upper interface, trimmed at the modeled flight mouth |
| 50421, 50411 | Inner lower interface and approach to the core curve |
| 50409, 50407 | Inner western/southern curves |
| 50442, reversed | Lift-side straight return |
| 50439 | Upper inner corner |

`atrium-middle-stair-trace.ts` retains these twelve segments and ten separate Level 1 comparison segments (86863–86872), with operators, original cubic controls, path/item IDs and six-decimal coordinates. The Level 1 data remains context only. Its outer 86863 projection is not geometrically identical to the Ground 50404 cubic under the common registration: dense nearest-curve sampling found a maximum discrepancy of approximately **0.677 PDF pt** over its visible span. It is not silently spliced into the Ground contour, independently fitted, or presented as exact physical agreement.

Independent reopening of the PDF matched all **22 retained segments / 148 coordinate values**, maximum rounding error **0.0000004961 pt**. Original controls are sampled by the existing adaptive de Casteljau helper at 0.01 PDF pt chord tolerance. Sampling precision describes the illustration, not physical construction accuracy.

## Application geometry and finishes

`atrium-middle-stair-layout.ts` maps the Ground outline with the existing shared `groundGuidePlan`. There are no per-feature offsets. The end cross-sections of the source lower/upper flights trim its two open interfaces; short joins at those interfaces remain interpretations. A paired-boundary interior route serves navigation verification rather than claiming a surveyed centerline.

The renderer now uses one triangulated flat concave deck and open inner/outer guard contours. It no longer layers mitered semicircle strips. The two flight mouths have no transverse guard. Walking support uses that same polygon at an estimated **3.25 model-unit** height. The floor label may show Level 1 at the intermediate landing because floor selection uses the nearest modeled elevation; this is not an elevation measurement.

The source drawings do not establish the complete three-dimensional height allocation of the projected returns. Assigning this envelope to one intermediate flat deck, its 220 mm depth, guard heights and physical finish sizes are model interpretations. The upper unresolved tread span still contains three explicitly estimated interpolated cross-sections, and the upper bridge and two slab-mask closures remain estimated.

The stair underside uses shared mipmapped brushed-metal color/bump maps, cooler satin reflectance and subtle panel joints. All source-flight underside UVs follow the same world plan frame rather than a per-tread index. Colors, panel dimensions and reflectance remain photo-informed estimates. The lounge palette adds two green accent chairs visible as a color family in UMD/HDR photographs; their individual plan-position assignments are estimated.

## Verification

- **114 focused circulation/rendering checks passed; 307 of the 421 total tests were not selected.** These cover both complete atrium directions, lateral movement across both source flights, standing headroom on every modeled band and the entire intermediate route, both entrance journeys, central lift cabs/landings, Level 1 lift exits, furniture approaches and all modeled room shortcuts.
- The broader Level 1 selection also covers Sandbox equipment/doors, classroom and service corridor connections, west office desks/seating, west meeting seats, office-to-conference circulation and Family Garden routes. The integrated-column shell-containment check is included.
- The browser was used after a fresh interior entry. Reviewed the lounge, ascended the lower stair onto the curve, descended the upper stair toward the new landing and checked stopping at the timber/guard boundary. This is selected browser use, not a comprehensive walk of every possible route or a physical-device performance benchmark.
- Final TypeScript, ESLint, production Vite build and whitespace checks passed. Vite retained its bundle-size/Browserslist notices; this is not a measured frame-rate claim. The final fresh-scene browser error log returned no entries.
- Final lobby proof: `/tmp/iribe-reference/lobby-curved-landing-color-final-2026-10-03.jpg`.

Raw source images, replays and numerical scratch data stay outside the checkout. No source images are redistributed by the application. The overall goal remains active and incomplete.
