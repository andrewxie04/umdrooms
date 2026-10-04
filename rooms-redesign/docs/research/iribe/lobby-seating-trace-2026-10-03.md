# Ground lobby furniture trace - 2026-10-03

## Source and coordinate contract

Primary source: the official UMD-hosted [Brendan Iribe Center event guide](https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf), copyright 2023 HDR. The trace uses original zero-based PDF page index **6** (the seventh PDF page, labeled Ground Level), **576 x 576 pt**. Coordinates are original page points: origin at the upper left, x increases right, y increases down. They are diagram coordinates, not surveyed building dimensions.

Local source `/tmp/iribe-reference/guide.pdf`, SHA-256 `c1fe539a56ba3b97b7b1dcb2d4563792892294a59caeaa476f67ec810fcf7474`. Inspected `/tmp/iribe-reference/canonical-page-6.png`, `/tmp/iribe-reference/ground-lounge-detail-2026-10-03.png`, and an extended render of PDF rectangle **[228, 307, 369, 403]**. The extension includes the lower chairs/tables and shows their relation to the adjacent stair enclosure. Cafe tables, lifts, the stair enclosure, structural columns and annotation graphics are excluded from the furniture trace.

The supplied `/tmp/iribe-reference/ground-lounge-paths-2026-10-03.json` contains **2,140 path fragments**. This was cross-checked against `pymupdf.Page.get_drawings()` on the original page; that page has 56,651 drawing records. Path indices in the code refer to that original extraction. Degenerate subfragments absent from the supplied JSON were checked in the PDF, and no crop or registration transform was applied.

The companion TypeScript file is `rooms-redesign/src/components/interior/iribe/lobby-seating-trace.ts`. It exports raw records only. The parent owns the common Ground guide registration, rendering, material choices, heights and tests.

## Counts and exclusions

| Visible category | Count | Export treatment |
| --- | ---: | --- |
| Curved sofa modules with complete outside boundaries | **5** | `LOBBY_SOFA_TRACE`, full `seat` polygons |
| Sofa back strips supported by visible inset lines | **4** | `back` polygons; the fifth `back` is empty |
| Complete lounge-chair symbols | **15** | `LOBBY_CHAIR_TRACE`, verified diagram center and back point |
| Partly covered lounge-chair symbol, fully recovered | **1** | `LOBBY_CHAIR_TRACE`, complete source center/back plus full glyph paths, recovery provenance |
| Complete round-table symbols | **22** | `LOBBY_TABLE_TRACE`, visible outlines plus circle fits |
| Partly covered round-table symbols, fully recovered | **2** | Same array, `partly-obscured` describes the annotated page; complete recovered source paths used for fits |
| Round-table pairs | **12** | Stable `pairId`; **24** total visible table symbols |
| Exact source path fragments retained, including verified recovery | **291** | `LOBBY_SEATING_SOURCE_PATHS` |
| Wholly covered furniture added or estimated | **0** | No placement records |

The inventory is **5 sofas, 16 complete chair placement records, 24 table symbols**, with **4 traced sofa backs**. One chair (`chair-41616`) and the two `pair-08` table outlines are **recovered from PDF vector paths behind callout**. They are actual source geometry, not guessed completions. Their records are labeled `provenance: 'recovered-behind-callout'`. `visibility: 'partly-obscured'` on those tables describes their appearance in the annotated page, not missing source contours.

The yellow overlay is filled path **56640**, four cubics, with bounding rectangle **[261.993, 335.082, 282.169, 355.225]**. A scan found **119** gray furniture fragments whose bounds overlap the marker rectangle. They belong to the existing chair/table symbols and nearby sofa strokes; control-point bounds crossing that rectangle do not imply an additional furniture item. Rendering the gray vector paths alone reveals the complete chair and both tables and an otherwise empty covered area. No additional fully hidden sofa, chair or table appears. No contour was filled by inference.

The central module's complete outer boundary contains no visible back-strip line. Its `backStatus` is `not-drawn`; this is a statement about the guide symbol, not proof that the physical furniture has no back. No additional back or furniture is inferred under the marker.

## Sofas: outside footprint and back strip

The sampled `seat` arrays follow each complete outside boundary. Four `back` arrays follow the visible inset line and the adjoining portion of the outside boundary. Inset endpoints lie on straight outside-boundary segments: only numerical joins/projections were needed, with a maximum source endpoint gap **0.001378 pt** and maximum inset endpoint projection **0.001054 pt**. The broad strip follows the symbol's back; fine upholstery/seam strokes are not additional furniture.

Cubic curves were adaptively subdivided with **0.005 pt** control-point-to-chord flatness tolerance. Sampled coordinates are rounded to **0.00001 pt**. The arrays omit a repeated closing point and use positive signed area, clockwise in the PDF's downward y axis. Raw line/cubic source commands retain their original floating-point coordinates. Position IDs describe the page, not geographic directions.

| Sofa ID | Seat vertices | Back vertices | Outside path indices | Back inset path indices |
| --- | ---: | ---: | --- | --- |
| `upper-left-long` | 104 | 93 | 43896-43907 | 43887-43895 |
| `upper-left-elbow` | 104 | 93 | 43861-43872 | 43852-43860 |
| `lower-left-elbow` | 104 | 93 | 42673-42684 | 42664-42672 |
| `upper-middle-curve` | 104 | 93 | 41582-41593 | 41573-41581 |
| `middle-backless` | 104 | 0 | 41965-41976 | No back line drawn |

Total sampled polygons: **5 seat polygons / 520 vertices**, **4 nonempty back polygons / 372 vertices**. Original outside boundaries contain 12 line/cubic fragments apiece, or **60** fragments; the four open back inset traces contain nine apiece, or **36** fragments. The back polygons close against the existing outside curve rather than a guessed straight back or a uniform primitive.

## Chairs: centers and back direction

Each complete chair uses the midpoint of the back curve and the midpoint of the front curve, each evaluated at Bezier parameter t=0.5. `center` is the midpoint between those two points, and `back - center` indicates the chair's back direction in PDF axes. The `front` point is also exported for checking orientation. These are consistent glyph placements, not measured swivel pivots. Width is the front curve's endpoint chord; depth is the distance between the front and back midpoint. Both are stored only as diagram points and are not physical widths/depths.

The parent can transform `center` and `back` through the shared guide registration and compute the back angle from their transformed difference. This module applies no rotation, scale, mirror, page spread offset or world coordinate convention.

| Chair ID | Center x, y (pt) | Back point x, y (pt) | Back / front source path |
| --- | --- | --- | --- |
| `chair-41848` | 290.2552, 315.9795 | 291.7004, 314.4257 | 41862 / 41867 |
| `chair-41733` | 280.0061, 317.0859 | 279.0272, 315.2031 | 41747 / 41752 |
| `chair-43503` | 267.3494, 317.754 | 268.4823, 315.9593 | 43517 / 43522 |
| `chair-43272` | 345.3336, 322.1702 | 344.7077, 320.1425 | 43286 / 43291 |
| `chair-43155` | 354.1082, 324.0636 | 355.666, 322.6217 | 43169 / 43174 |
| `chair-43388` | 271.6018, 326.465 | 273.7101, 326.7102 | 43402 / 43407 |
| `chair-43046` | 330.5205, 331.8693 | 330.4121, 329.7499 | 43060 / 43065 |
| `chair-41342` | 318.1147, 333.4091 | 317.9202, 331.2956 | 41356 / 41361 |
| `chair-41616` | 279.8074, 338.9511 | 278.3713, 337.3886 | 41630 / 41635 |
| `chair-42547` | 241.5538, 341.5621 | 240.0346, 340.0804 | 42561 / 42566 |
| `chair-41457` | 302.5503, 343.9551 | 300.8928, 345.2796 | 41471 / 41476 |
| `chair-42930` | 350.5603, 357.2132 | 351.2138, 359.2322 | 42944 / 42949 |
| `chair-43733` | 268.0731, 357.8676 | 267.6949, 355.7795 | 43747 / 43752 |
| `chair-42433` | 240.3242, 371.0129 | 238.2458, 371.4436 | 42447 / 42452 |
| `chair-42318` | 246.8959, 376.4284 | 246.9964, 378.5484 | 42332 / 42337 |
| `chair-43618` | 272.5915, 385.5472 | 272.6758, 387.6679 | 43632 / 43637 |

The recovered chair is northeast of the marker in page coordinates. Its complete symbol occupies original path indices **41616-41732 inclusive: 117 fragments**, all retained in `LOBBY_SEATING_SOURCE_PATHS`. Its back/front curves are **41630 / 41635**. Its recovered center is **[279.80744, 338.95112] pt**, and its back point is **[278.37129, 337.3886] pt**. These come directly from the original curves and were checked in the isolated source-path crop; the callout does not remove the underlying vector data.

## Tables: pairs and circular fits

Each source table has four cubic quarters stored in two path fragments. The outline is stylized and is not mathematically a perfect circle; `radius` is a least-squares circular fit, not an exact CAD radius. Fits sample source curves at 256 intervals per quarter. For the two tables partly covered in the annotated page, the complete underlying vector curves were recovered and included. The separate `visibleOutline` arrays remain clipped to what is visible in that annotated page for comparison. The largest radial residual against the complete source curves is **0.127178 pt**. Table placement uses that fit; `visibleOutline` preserves the annotated view and exact source paths preserve all actual curves, including the recovered portions.

| Pair | Table 1 center x, y / radius (pt) | Table 2 center x, y / radius (pt) | Visibility |
| --- | --- | --- | --- |
| `pair-01` | 264.1177, 322.334 / 2.96296 | 265.0212, 323.5219 / 2.96296 | Visible on page |
| `pair-02` | 285.9728, 322.4031 / 2.96265 | 285.5488, 321.9333 / 2.96254 | Visible on page |
| `pair-03` | 345.8681, 328.1419 / 2.96261 | 347.7634, 327.8577 / 2.96268 | Visible on page |
| `pair-04` | 306.4393, 339.3915 / 2.96296 | 304.158, 336.7577 / 2.96256 | Visible on page |
| `pair-05` | 320.8027, 344.1092 / 2.96271 | 318.8089, 341.2513 / 2.9628 | Visible on page |
| `pair-06` | 330.5657, 335.705 / 2.96281 | 331.2334, 339.1243 / 2.96244 | Visible on page |
| `pair-07` | 243.9212, 348.7191 / 2.96229 | 245.9886, 345.8236 / 2.96268 | Visible on page |
| `pair-08` | 283.5109, 346.2067 / 2.96257 | 284.3342, 342.8214 / 2.96279 | Recovered from PDF vector paths behind callout |
| `pair-09` | 348.8174, 348.1269 / 2.96276 | 346.9739, 351.0833 / 2.96252 | Visible on page |
| `pair-10` | 270.4951, 363.7517 / 2.96289 | 268.7326, 365.1121 / 2.96291 | Visible on page |
| `pair-11` | 245.7187, 369.2628 / 2.9626 | 247.4478, 369.4446 / 2.96268 | Visible on page |
| `pair-12` | 272.8958, 378.5351 / 2.96244 | 272.1728, 380.0944 / 2.96248 | Visible on page |

Each pair visibly overlaps in plan. The guide does not specify table heights or which member is higher. Different estimated tabletop heights can avoid coplanar overlap in a rendering, but that choice is a rendering estimate and is intentionally absent from the raw trace.

## Photograph: form interpretation only

Inspected the local `/tmp/iribe-reference/lobby-official.jpg`, corresponding to UMD's [public lobby photograph](https://www.cs.umd.edu/sites/default/files/images/floorplans/lobby_photo.jpg). It supports low gold upholstered curved modules with rounded cushion edges and taller upholstered back bands, separate dark blue/teal lounge chairs on metal swivel bases, and small low tables. Foreground furniture confirms that a curved silhouette should remain a curved module rather than being reduced to a rectangular bench.

The photograph is perspective evidence for general forms. It does not give reliable numeric heights, exact furniture product names, dimensions, individual plan colors, or a one-to-one match to all guide symbols. The source guide is historical; neither the plan nor this trace establishes current movable furniture positions.

## Verification and limits

A labeled overlay was visually checked against the extended original PDF crop: red outside sofa outlines, green back strips, blue chair center-to-back segments and purple visible table curves. The sofa outlines/back strips coincide with the original curves, and all 12 table pairs and the lower chair symbols are included. Scratch proof is `/tmp/iribe-reference/lobby-seating-research/overlay.png`; extraction data is `/tmp/iribe-reference/lobby-seating-research/trace.json`.

The callout recovery was separately verified by rendering **1,996** original gray source path fragments in isolation, preserving their line/cubic coordinates, widths and closure flags while omitting the filled annotation. Inspected `/tmp/iribe-reference/lobby-seating-research/uncovered-vector-crop.png` and `/tmp/iribe-reference/lobby-seating-research/callout-underlying-vector-detail.png`. These show the complete recovered chair, both complete table contours and the empty region behind the rest of the marker. The original source was not edited. This Ground-page vector recovery does not rely on a raster annotation or extrapolation.

Checks confirmed polygon closure within source rounding tolerance, consistent winding and all sofa polygons outside the marker. All 15 directly visible chair placements lie outside it; the 16th is verified from the recovered source curves. Table centers lie outside it. Exact source-path count is **60 + 36 + 30 + 117 + 48 = 291**: sofa boundaries, back insets, two direction curves for each of 15 visible chairs, all 117 fragments of the recovered chair glyph, and two fragments for each of 24 table outlines. Strict TypeScript validation and ESLint passed for the standalone module, as did whitespace checks for both new files. Runtime counts and all exact source-command numbers were checked against the extracted data. No app-wide test suite was run for this data extraction.

No application rendering, references, registration, test files, existing dirty files, commits or pushes were changed by this extraction task. App integration and its verification belong to the parent. Limits include illustrative plan scale, stylized table curves, source endpoint rounding, annotation occlusion of the printed page, unknown heights/dimensions and unknown current furniture placement.

## Parent rendering integration

`lobby-layout.ts` applies the common `groundGuidePlan` transform to every sofa contour, chair center/back direction and circular outline, without fixture-specific offsets. `lobby-furniture.ts` renders the five different sofa forms, including the one without a drawn back; tapered upholstered lounge-chair shells on estimated metal bases; and white pedestal tables. Gold, blue and teal upholstery interprets the official photograph. Heights, radii of beveled upholstery edges, base hardware and individual color placement remain estimates. The circular pairs are shown at staggered estimated heights of 0.44 and 0.55 m to avoid coplanar overlap; twenty-four source outlines should not be claimed as twenty-four independently verified physical tables.

The former repeated sofa groups were removed. Ground polished-concrete material uses roughness 0.72 before its varying roughness map, and broad downward fill was reduced from 0.8 to 0.6, to soften excessive white glare. These are rendering parameters rather than measurements. The warm gray mottled floor, pale lounge ceiling, dark circulation soffit, reddish brick and timber palette continue to use the official photographs.

Focused checks passed for all furniture collision boundaries staying within the Ground envelope, all room shortcuts, successful material merging, entrance routes and lift/stair movement. A new navigation check reaches an approach around every chair, sofa and table group through the traced open lounge region using the actual walking collision routine. The open region used by this check is larger than the older semantic lounge shortcut polygon; it is not presented as a new physical room enclosure.

The pale ceiling region was then extended over the traced sofa/chair groups, because the older semantic lounge polygon omitted several of them. Its source-frame extent `(229,299)`–`(368,388)`, conservatively stopped before the atrium opening, is a photo-interpreted finish area rather than a traced reflected-ceiling plan. Tube pendants, panel joints and paired slots were redistributed within it; broad fills now use the same frame. Sofa edges use softer estimated bevels and a smaller ground gap. The final focused selection passed **35 cases**, including the newly added furniture access and positioned stair headroom checks. TypeScript and ESLint passed.

Final browser review used the existing 638 by 982 viewport. Fresh interior entry showed the new arrangement and finish region; looking around and stepping through the lounge changed the view normally. Central Lift 1 was called, entered using the walking controls, ridden from Ground to Level 1, and exited onto its landing. The blank view ahead of that landing was traced to an existing Level 1 wall approximately 4.32 m ahead, rather than an overlapping lift surface; a separate test passed both cab-to-mezzanine exits and their reverse routes. This adds one successful focused case to the earlier 35. The preview was returned to Ground / Lobby lounge. Screenshot: `/tmp/iribe-reference/lobby-source-layout-final-2026-10-03.jpg`.

The latest production build, TypeScript, ESLint and `git diff --check` passed. Vite retained its bundle-size and stale Browserslist data warnings. Captured browser logs contain earlier 12:06 UTC hot-reload errors from the temporary missing `PLAN_SCALE` import; that import was corrected before these fresh browser checks and no later errors were recorded in the retrieved error log. This pass did not measure frame rates or verify physical touch. No commit or push was made. The entire-building reconstruction remains incomplete.
