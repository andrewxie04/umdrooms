# Level 1 atrium opening and guard: source review

Reviewed 2026-10-03. This is source data for parent integration. It does not change the application, stair rows, intermediate landing, elevations, or the shared registration helper.

## Source and visual inspection

The original [UMD Computer Science / HDR building guide](https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf) is `/tmp/iribe-reference/guide.pdf`, SHA256 `c1fe539a56ba3b97b7b1dcb2d4563792892294a59caeaa476f67ec810fcf7474`. Level 1 is PDF page index **8** (ninth PDF page), 576 by 576 points, with a top-left origin and positive Y down. Every path index here is zero-based on that original page's PyMuPDF `get_drawings()` result; item indices are zero-based within that path. A crop or vector replay has different indices and must not replace these references.

I inspected the complete rendered pages 7 and 8, an 8x crop of page 8, the gray architectural vectors replayed without colored guide overlays, a 32x stroke-only detail of the upper gap, and an overlay of the exported sampled contours on the gray underlay. The whole atrium opening and its guard interfaces are on page 8. Page 7 is the western spread continuation and supplies no additional atrium boundary or seam correction.

The cached HDR stair photograph (`/tmp/iribe-reference/hdr-atrium-stairs.jpg`, also linked in the parent review as [HDR's stair image](https://www.hdrinc.com/sites/default/files/styles/carousel_image/public/2019-05/brendan-iribe-center-computer-science-engineering-stairs.jpg?itok=odGnMZt6)) supports the separation of the upper floor edge, sloping stair guards, intermediate curved stair landing, and vertical timber lift enclosure. It supplies no surveyed dimensions or elevations.

## Which boundary is the opening

The broad rounded western shoulder, long west side and sweeping southern boundary enclose the dashed void mark (paths **92123** and **92126**). The corresponding black bands are predominantly paths **92876** and **92882**. Their stroked outlines are the most defensible evidence for the Level 1 atrium opening guard. The two drawn faces are retained separately; PDF stroke width is a graphics setting, not construction thickness.

The upper approach divides into a broad opening guard on its south side and a guard beside the upper flight on its north side. The opening guard terminates at its south approach cap, **96370**. The upper flight's north guard starts at cap **96366**, continues east around a rounded corner, then terminates against the lift/core region. These are distinct interfaces. A line connecting the two approach caps would be an inferred threshold; the guide does not draw a transverse guard there or establish a separate flat bridge footprint.

The thin curve **86863** beside the lower flight and the compact enclosure/band **92852 / 92854**, including north curve **96769**, are excluded from the broad slab opening trace. They describe intermediate stair or lift/core geometry. Promoting their compact curve to the complete Level 1 opening would lose the large marked void. Assigning the broad southern sweep to the intermediate landing would place a Level 1 guard at the wrong stair height.

The lift/core interrupts the eastern side. The source guard ends are preserved where they meet that region. The trace does **not** fabricate a straight closing edge through the shafts, follow a core curve as though it were a slab edge, or erase the lift apron. A complete slab boolean mask needs the parent's stair/core/apron synthesis. This module therefore exports open contours, not an asserted closed hole polygon.

## Retained original vectors

`src/components/interior/iribe/atrium-opening-trace.ts` contains **71 original line/cubic segments** with all original endpoints and cubic control points rounded to six decimals. It preserves path index, item index, operator, and a separate travel-direction flag. Source points remain in their original order even when `reversed: true` is used for contour traversal. No tread cross-sections are authored in this module.

The broad void-facing run travels from the south approach, around the northwestern shoulder and west/south opening, to the south core/apron junction. The table lists traversal endpoints; the full cubic controls are in the module.

| Original page 8 path | Operator / travel | Start, PDF pt | End, PDF pt | Opposite outline path |
| --- | --- | --- | --- | --- |
| 96371 | `c`, reverse | 165.097610, 402.792389 | 156.896606, 400.267395 | 96372 |
| 96374 | `c`, reverse | 156.896912, 400.267181 | 152.337906, 397.232178 | 96375 |
| 96387 | `l`, forward | 152.337906, 397.232178 | 136.423904, 378.654175 | 96386 |
| 96388 | `c`, forward | 136.424698, 378.654907 | 124.301697, 380.278900 | 96389 |
| 96391 | `l`, forward | 124.302002, 380.278595 | 103.327003, 424.595581 | 96390 |
| 96393 | `c`, forward | 103.326302, 424.596100 | 106.994301, 434.392090 | 96394 |
| 96395 | `c`, forward | 106.994400, 434.391907 | 198.439392, 461.009918 | 96396 |
| 96397 | `c`, forward | 198.439407, 461.009796 | 206.788406, 454.734802 | 96398 |
| 96401 | `l`, forward | 206.788498, 454.734985 | 207.439499, 449.651978 | 96400 |

The opposite face follows **96372, 96375, 96386, 96389, 96390, 96394, 96396, 96398, 96400**. A **0.746358 pt** gap separates the endpoints of strokes 96372 and 96375 near the northwestern shoulder. The filled black band continues there, but those strokes do not supply a continuous smooth curve. The sampler splits this face into two open runs. This graphic gap is not asserted to be a physical break in the guard.

The upper flight's north interface is retained as **96365, 96368, 96364** on the flight-facing side, and **96367, 96369, 96342** on its opposite side. These follow the flight and rounded upper stair end; they must not become one uniformly horizontal Level 1 guard. The continuous south tread-facing baseline **91378** is retained with its 46 original items. Its curve lies on the tread side of the black guard band, so it is not interchangeable with the void-facing slab/guard outline.

## Curve sampling and registration

`sampleAtriumOpeningSegment()` uses adaptive de Casteljau subdivision. Its default **0.01 PDF pt** chord tolerance describes approximation of the diagram's original cubic curves. It is unrelated to a physical measurement tolerance. `get_drawings().rect` is a control-point bounding rectangle; its corners and extrema are not used to create a polygon. For example, path 96388's actual north extremum is approximately `(130.905264, 376.107293)`, rather than its control-bound Y of `374.643921`.

`sampleAtriumOpeningContours()` retains both endpoints of small source joins and never closes a loop. The maximum join gap within the main void-facing chain is **0.001080 pt**; these tiny joins are explicitly permitted up to 0.002 pt to accommodate the original split path coordinates. Larger gaps begin separate runs. The derived main contour has 145 points; the opposite face has runs of 3 and 144 points. These counts include retained source join endpoints and do not describe construction joints.

Use the parent's **`firstGuideGround(x, y)`** and **`firstGuidePlan(x, y)`** from `first-guide-layout.ts`. That helper derives the equal-weight similarity from the four original column-symbol pairs recorded in `atrium-stair-review-2026-10-03.md`. It was read, not edited, and this trace introduces no independent fit or feature offsets. The Level 1 source paths 92855, 92832, 92836 and 92865 correspond to Ground source paths 52458, 52429, 52436 and 52464. The common helper's maximum residual for those anchors is **0.000518 Ground PDF pt**, measuring drawing agreement only.

A parent can map each point of `ATRIUM_OPENING_SAMPLED_SOURCE.voidFacing` with `firstGuidePlan(...point)`. Keep the runs open until the stair approach and lift/core/apron closures have been explicitly reconciled. Applying the final point-to-first-point edge automatically would invent a diagonal boundary across the void.

## Upper stair / bridge and core junctions

These are original guard cap or termination points, not newly surveyed intersections. `ATRIUM_OPENING_INTERFACE_POINTS` preserves each point's original path/item/point index. The Ground column below is derived by the existing common helper, not a second registration.

| Interface | Original path / item / point | Level 1 PDF pt | Ground PDF pt, common fit |
| --- | --- | --- | --- |
| Upper approach north guard cap | 96366 / 0 / 1 | 165.803299, 388.470490 | 177.585582, 389.578038 |
| Opening / approach south guard cap | 96370 / 0 / 0 | 165.098694, 402.792786 | 176.869502, 404.133960 |
| Upper north guard / core, flight-facing | 96364 / 0 / 0 | 212.283401, 411.849121 | 224.823895, 413.337963 |
| Upper north guard / core, opposite | 96342 / 0 / 1 | 212.957703, 412.086395 | 225.509197, 413.579106 |
| South opening guard / core, void-facing | 96401 / 0 / 1 | 207.439499, 449.651978 | 219.901027, 451.757465 |
| South opening guard / core, corridor-facing | 96400 / 0 / 0 | 208.146606, 449.622894 | 220.619668, 451.727906 |

The caps at the upper approach do not themselves define a perpendicular tread cross-section or a level bridge. The south cap and path 96371's endpoint differ by only about 0.00115 pt in the source. The north guard's core ends and the southern opening guard's core ends are separated by the enclosure/apron region; connecting them blindly would confuse floor opening, shaft enclosure and lift landing.

## Evidence on the 86934-86935 gap

The parent's approximately 4.4-pitch gap remains visible in the gray replay after the generic red stair marker is removed. Colored annotation therefore does not fully explain the absent cross-sections. The gray north edge **86911** is a single uninterrupted cubic spanning the gap, from `(188.101898, 395.133179)` through controls `(190.558899, 395.684174)` and `(193.021896, 396.205170)` to `(195.492905, 396.696167)`. The south baseline **91378** also continues through this region. The black flanking guard geometry remains continuous.

I found no visually identifiable complete zigzag/diagonal plan-break symbol across the upper flight's width. Short fragments **86899 / 86968** near its north edge and **86881 / 86882 / 86966** near its south/lower-flight overlap exist, but do not establish a complete break, a level platform, or a height change. The boundary continuity is compatible with both a blank landing span and an omitted/cut portion of a continuous flight. A two-dimensional guide does not resolve that distinction.

Ground **50452** agrees approximately with the right-side Level 1 cross-section **86935** under the common fit. Independently checking the existing parent's row with the helper gives a maximum endpoint discrepancy of about **0.01890 Ground PDF pt** against original 50452. This supports correspondence and registration; it supplies no evidence about slope or tread count inside the blank span.

Treat the gap as **unresolved missing cross-sections**, not a proven physical flat landing or a proven plan cut. If the parent needs to bridge it for rendering/walking, the chosen rise profile and any interpolated divisions must remain explicitly estimated. No upper rows, missing tread count or landing elevations were added here.

## Parent integration handoff

The parent reports a separate `atrium-opening-layout.ts` that preserves the broad source run and constructs an explicitly estimated mask by joining the south-core end to the upper north-core end and closing the stair mouth. Neither inferred closure nor the upper sloping guard is assigned a horizontal Level 1 rail; the horizontal rail follows only the broad traced guard. That distinction agrees with this source review. It remains an application interpretation, not newly observed slab geometry. The parent's 23 visible upper rows and three estimated gap rows remain outside this module; the gap classification above is unchanged. This source task does not validate the parent's application behavior.

## Verification and limits

- Strict local TypeScript compilation of the new standalone module passed with no emit. Scoped ESLint passed.
- Independently reopened original page 8 and compared every coordinate of all 71 exported segments, plus all six interface points and four excluded-context rectangles, against original path/item indices. Maximum coordinate rounding error was **0.0000004981 pt**; all source references matched.
- Checked finite samples, unchanged segment endpoints, and rejection of invalid curve tolerances. Dense evaluation at 1,001 parameters on every retained cubic gave a maximum source-to-derived-polyline distance of **0.007469 pt**, below the default 0.01 pt sampling tolerance.
- Visually inspected the exported contour overlay: broad guard curves align with the source, stair/core contours remain distinct, the opposite-face gap stays split, and no artificial closing edge crosses the opening.

Only `src/components/interior/iribe/atrium-opening-trace.ts` and this review were created in the workspace. Existing dirty files were preserved. No build/inventory generation, application integration, commits or pushes were performed. No rendering, walking or collision behavior is claimed to have changed.

All source crops and replay/validation scratch files remain under `/tmp/iribe-reference/`, including `atrium-opening-source-crop.png`, `atrium-opening-gray-vectors.png`, `atrium-opening-upper-gap-vectors.png`, `atrium-opening-exported-overlay.png`, `atrium-opening-precision-check.json`, and `atrium-opening-registration-check.json`. The parent-provided `atrium-level1-source-gray-continued.png` was also inspected. Source images are not copied into application assets.

## Parent application verification

The source broad guard now renders under the common Level 1 registration. The boolean mask retains its two explicitly estimated closures; no horizontal guard is placed on either closure or the sloping stair edge. Rendered contours collapse only consecutive split-path joins within 0.35 mm in model coordinates, preserving the untouched provenance arrays and preventing submillimeter guard panels. Shared posts are emitted once at a joint. The tolerances describe rendering cleanup, not measured building accuracy.

Thirty-seven focused application checks passed after integration and final tread/guard cleanup. The expanded stair headroom case casts three rays per modeled source band; the lateral-walking case covers both source flights. Both entrance journeys, descent/ascent, central lifts, modeled room shortcuts, lounge fixture approaches and lower column bases passed the same selection. TypeScript, application lint, production Vite build and whitespace checks passed. The ordinary build warnings for large chunks and older Browserslist data remain; no frame-rate benchmark is claimed.

Fresh browser scenes verified both Atrium stair shortcuts, movement into the lower flight and descent along the upper flight, plus the lounge view. Saved review images include `/tmp/iribe-reference/atrium-upper-stair-source-final-2026-10-03.jpg`, `atrium-lower-flight-walk-review-2026-10-03.jpg` and `lobby-upper-stair-opening-final-2026-10-03.jpg`. Browser logs retained a transient 13:47 UTC missing-import HMR failure from between the mask replacement and its import patch. The import was fixed; subsequent fresh entry/review succeeded and the inspected log contained no newer error. This is a focused browser review, not exhaustive route/device validation.
