# Atrium stairs and opening: source review and integration

Reviewed 2026-10-03. This is a partial structural correction, not a completed trace of the whole atrium stair.

## Sources and inspected evidence

- [UMD Computer Science / HDR building guide](https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf), original Ground PDF page index 6 (printed document page 7), 576 by 576 pt, top-left origin. PDF SHA256: `c1fe539a56ba3b97b7b1dcb2d4563792892294a59caeaa476f67ec810fcf7474`. Path numbers below are zero-based `get_drawings()` indices on this original page.
- The same guide's Level 1 page index 8 was visually inspected to distinguish the upper flight, its rounded landing and the opening.
- [HDR project](https://www.hdrinc.com/portfolio/brendan-iribe-center-computer-science-and-engineering) and its [stair photograph](https://www.hdrinc.com/sites/default/files/styles/carousel_image/public/2019-05/brendan-iribe-center-computer-science-engineering-stairs.jpg?itok=odGnMZt6) show two straight flights around a curved intermediate landing, pale perforated guards, a cooler metal underside, a timber lift enclosure and a black exposed upper ceiling.

The Ground source was inspected at high resolution, then its original gray vectors were replayed without colored filled annotations. This exposes the paired tread lines and architectural plan-cut fragments. The red stair pictogram is a generic marker; it is not treated as an ascending-direction arrow. Source images are inspected locally and are not redistributed in the application.

## Lower-flight geometry

The former fitted parallel flight ran too close to the independently traced column at PDF `(182.038406,387.128311)`. The source flight instead has angled, flared boundaries. Twenty retained cross-sections delimit nineteen drawn tread bands. Paired outline/nosing families do not become separate steps. Where the architectural plan cut splits a riser, only its outer endpoints are joined into a cross-section; reconstructing a continuous flight across that cut is an interpretation.

`atrium-stair-trace.ts` retains endpoints rounded to six decimal places with their original path IDs. `atrium-stair-layout.ts` applies the existing shared `groundGuidePlan` registration to every endpoint; no furniture/column offsets or per-feature fits are used. The first row is approximately 2.99 model units wide and the curved-end row approximately 2.23. These are scaled diagram extents, not measured construction dimensions. The north row is interpreted as the Ground approach and the south row as the intermediate landing, based on the photograph and the plan's topology.

| Row | Ground original path indices | Endpoint A, PDF pt | Endpoint B, PDF pt |
| --- | --- | --- | --- |
| 0 | 50445 | 187.873306, 390.178131 | 205.857300, 397.620117 |
| 1 | 50521, 50522 | 187.210800, 391.779694 | 204.942902, 399.117401 |
| 2 | 50519, 50520 | 186.547806, 393.380707 | 204.029800, 400.615417 |
| 3 | 50516, 50517 | 185.885406, 394.982269 | 203.115402, 402.113495 |
| 4 | 50513, 50514 | 185.222107, 396.584290 | 202.200897, 403.610901 |
| 5 | 50511, 50512 | 184.560699, 398.186310 | 201.287796, 405.108887 |
| 6 | 50510 | 183.897400, 399.788300 | 200.373398, 406.606293 |
| 7 | 50509 | 183.233795, 401.389313 | 199.458801, 408.104309 |
| 8 | 50508 | 182.571411, 402.992310 | 198.544403, 409.602295 |
| 9 | 50507 | 181.908295, 404.593689 | 197.631302, 411.099701 |
| 10 | 50506 | 181.245911, 406.194702 | 196.716904, 412.597717 |
| 11 | 50505 | 180.583511, 407.796204 | 195.802505, 414.095215 |
| 12 | 50504 | 179.919403, 409.399078 | 194.889404, 415.593079 |
| 13 | 50503 | 179.257004, 411.000183 | 193.975006, 417.091187 |
| 14 | 50502 | 178.593506, 412.601593 | 193.060501, 418.588593 |
| 15 | 50501 | 177.932098, 414.203705 | 192.146103, 420.086700 |
| 16 | 50500 | 177.267899, 415.804596 | 191.232895, 421.584595 |
| 17 | 50499 | 176.606110, 417.407288 | 190.325104, 423.085297 |
| 18 | 50498 | 175.943192, 419.009583 | 189.474197, 424.608582 |
| 19 | 50444 | 175.279099, 420.610199 | 188.676102, 426.154205 |

## Rendered and walking support

The lower flight's rendered tread polygons use these cross-sections, with pale risers/guards and a separate shared gray metal underside. Walking uses continuous ramp support for smooth motion, restricted to the same flared footprint. Its rise direction is perpendicular to the drawn cross-sections; projecting along a flared centerline would incorrectly change standing height during sideways movement.

The intermediate height of **3.25 model units**, allocated evenly across the nineteen bands, derives from half the existing estimated Ground-to-Level-1 height of 6.5. The plan does not supply a dimensioned stair section. Handrail heights, metal thicknesses, finish color/reflectance and tread elevations remain estimates.

A flat connector stitches the source lower endpoint to the previous fitted curved landing. The curve, upper flight, bridge, mezzanine opening and all associated elevations have **not** been newly traced in this pass. The large outer source boundary may describe the mezzanine void rather than the intermediate landing; its elevation must not be assigned blindly.

## Additional Level 1 registration analysis (subsequently integrated)

Four corresponding column symbols on the Level 1 original page index 8 and Ground original page index 6 provide a candidate shared-frame similarity:

| Level 1 path | Level 1 center, pt | Ground center, pt |
| --- | --- | --- |
| 92855 | 170.184509, 386.060211 | 182.038406, 387.128311 |
| 92832 | 216.839401, 395.813599 | 229.454300, 397.041107 |
| 92836 | 207.852097, 465.948792 | 220.320404, 468.319595 |
| 92865 | 150.324905, 453.921219 | 161.854500, 456.096817 |

The equal-weight least-squares similarity is `Gx = a*L1x - b*L1y + tx`, `Gy = b*L1x + a*L1y + ty`, with approximate `a=1.0163119739343582`, `b=-0.000001240733814275482`, `tx=9.077222184123517`, `ty=-5.228966813784325`. The maximum residual is approximately 0.00052 pt, consistent with a shared CAD underlay; it is not a measure of physical accuracy. The subsequent continuation implemented this fit in `first-guide-layout.ts`, deriving it from these stored anchors. Upper stair and broad opening source points now share it.

Potential upper tread lines include path 86896, 86924–86940 and 86942/86944/86946/86948/86949; the gap between 86934 and 86935 needs review before deciding which portions are treads or landings. Paired lines 86969–86995 should not be counted as extra steps. Curved guard/void contours and the intermediate landing need separate source/photograph reconciliation.

## Verification and limits

Thirty-seven focused circulation/integrity checks passed after the lower-flight, source-column and soffit integration. A new check actually walks sideways across every tread band and checks standing height and collision clearance; another ray/collision check verifies the two entrance-court columns reach their sunken floor. Existing checks cover up/down stair motion, sampled standing headroom, both entrance-to-stair journeys in both directions, central lift landings/cabs, both Level 1 lift exits onto the mezzanine, approaches around every lounge fixture, room shortcut clearance and merged rendering integrity.

Fresh browser review confirmed source columns, fixed entrance bases, removal of the older duplicate post, lobby materials and movement along the lounge approach. These checks do not prove the exact curved/upper stair geometry, every possible walking route, upper-floor structural alignment or current movable furniture. Temporary source overlays and screenshots are kept outside the checkout in `/tmp/iribe-reference/`.

## Upper-flight and opening continuation

`atrium-upper-stair-trace.ts` retains **23 visible original cross-sections**, source paths 86896, 86924–86940, 86942/86944/86946/86948/86949. Their endpoints are rounded to six decimals from original page 8. No paired nosing family is counted again. The upper source row phase agrees with the visible Ground flight; the source review independently found a maximum endpoint discrepancy of about 0.01890 Ground PDF pt between 86935 and 50452 under the common fit.

`atriumUpperFlight` preserves all these visible row outlines. It inserts **three explicitly estimated cross-sections** in the unresolved 86934–86935 span to maintain a navigable visual continuation. This does not establish a physical landing, plan cut, actual missing tread count or measured rise. The total upper rise remains the existing estimated 3.25, apportioned across the modeled bands. A new bilinear inverse for each band keeps standing height constant across its fanned cross-sections. Pale risers/guards, gray walking faces and a cooler metal underside have estimated photographic finishes.

The upper bridge follows the new top-flight direction; its 1.7 model-unit extension remains fitted. Rendered bridge and lift-apron fills are clipped to the slab mask, avoiding overlapping coplanar floor surfaces. Guards split at actual modeled bridge/apron intersections. The source opening review distinguishes a broad horizontal mezzanine guard from the sloping stair edge: the application now preserves that separation.

`atrium-opening-trace.ts` retains 71 original source segments and open contours, reviewed in `atrium-opening-review-2026-10-03.md`. `atrium-opening-layout.ts` maps the broad source guard and upper north flight edge through the same registration. A slab boolean requires **two estimated closures**, along the core/cab face and across the stair mouth. These are application interpretations, not asserted complete source geometry. The broad source guard remains separate and open; neither closure nor the upper stair edge receives a horizontal Level 1 railing.

The intermediate curve is still the previous fitted connector. Directly joining its endpoint to the new upper flight clipped the source core near a corner. Restoring its outer fitted corner cleared the route; the actual intermediate landing's contours and elevations still require a separate source trace.

Thirty-seven focused checks passed after the source opening and upper-flight integration, including ascent/descent, lateral movement on both source flights, three headroom rays per modeled tread band, both entrance journeys, all central lift cases, both Level 1 lift exits, furniture approaches, lower columns and shortcut clearance. This expands the original standing-clearance check beyond three samples over an entire source flight. It does not prove every possible public/private route or exact intermediate geometry.

The browser offers an `Atrium stair` arrival on Ground and Level 1, pointing into the appropriate flight. This is a navigation aid, not a claim that every stair dimension is verified.

Final visual cleanup adds an approximately 24 mm darker tread-edge band informed by the paired outline family; its manufactured finish and exact physical width remain estimates. The shared material uses polygon depth bias to keep it stable over the walking face. Consecutive tiny source joins are cleaned only for rendering, and shared guard posts are emitted once. The same thirty-seven focused checks, TypeScript, lint, production Vite build and whitespace gate passed after this cleanup. Browser review used both arrivals and walked into the lower flight and down the upper flight; final screenshots are listed in the opening review.

## Intermediate landing continuation

The fitted semicircle has subsequently been replaced by Ground's twelve original inner/outer boundary segments, a single flat deck and guards with open stair mouths. The complete trace, partial Level 1 comparison, remaining elevation/projection interpretations, finish changes and expanded verification are recorded in `atrium-middle-stair-review-2026-10-03.md`. Twenty-three source Level 1 columns are also integrated; two additional verified symbols await correction of the independently fitted shell, with coordinates preserved in the raw trace. The final combined selection passed 114 focused checks, leaving 307 unselected. Physical stair sections, the upper gap, bridge, slab closures and facade alignment remain unresolved.
