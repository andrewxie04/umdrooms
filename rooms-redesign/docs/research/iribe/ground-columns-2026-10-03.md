# Ground round columns: original guide trace, 2026-10-03

Created `src/components/interior/iribe/ground-column-trace.ts` as data for the parent recreation: **30 verified large round structural symbols**, of which **24 lie inside the source building's exterior glass/wall line and six lie outside it under the east canopy**. One of the 24 interior markers lies wholly left of page 6 and is visible on the page 5 continuation. Four smaller auditorium marks remain unresolved and are exported separately. This is a trace of a historical illustrative plan, not a surveyed structural schedule.

## Source and coordinate frame

- Official [UMD / HDR Computer Science Day event guide](https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf), copyright HDR 2023. The official URL was opened during this check.
- Local source: `/tmp/iribe-reference/guide.pdf`, 16 pages, SHA-256 `c1fe539a56ba3b97b7b1dcb2d4563792892294a59caeaa476f67ec810fcf7474`.
- Original zero-based page **6** (seventh PDF page), labeled **Ground Level**, and page **5** continuation. Both are **576 x 576 pt**, unrotated. Origin is top left; +x right, +y down.
- All exported positions remain in the original page 6 frame. The page 5-to-page 6 offset is **[-576, 0] pt**. Negative x is retained where the source vectors extend into the continuation; coordinates are never clamped to the page.
- PyMuPDF **1.28.2** `page.get_drawings()` returns **56,651** paths on page 6 and **25,380** on page 5. Index values in this note and module are zero-based indices in those original arrays; `seqno` is retained and equals the index for all selected fills.
- Every selected original fill is opaque black (`fill=(0,0,0)`, `fill_opacity=1`), with the nonzero fill rule. The module retains all original line, cubic and rectangle commands for **40 paths**: 32 for verified symbols and eight for the unresolved marks. Commands retain unrounded PyMuPDF float coordinates; derived bounds, centers and radii are rounded to six decimal places.

## Selection and source checks

Rendered both complete source pages at 3x (1,728 x 1,728 pixels), inspected the west cafe/atrium and auditorium/east corridor crops at 7x, and checked labeled overlays of the complete Ground plan, lower plan, eastern corridor and page seam. Large round black symbols repeat through the lab/support wing, cafe, atrium, lobby and east circulation. The six larger marks form two rows under the east canopy, beyond the exterior glass line. This visual repetition and architectural context support the column interpretation; an isolated circular outline alone does not.

Selection inspected **all black filled vector paths** for closed cubic loops, including loops embedded in compound paths and candidates with extra curve segments. It did not rely on the seven preliminary parent points or existing schematic column placements. The unusual 11-, 12- and nine-cubic contours at **52169**, **52195** and **52480** were retained after contextual inspection; rejecting anything other than four cubic quarters would miss these columns. No additional round column was found intersecting x=0: the continuation marker at **52583** lies wholly left of page 6, and the next verified marker at **52550** is fully inside the page.

Every one of the **32 verified paths** was checked against its page 5 counterpart. The correspondence is `page5PathIndex = page6PathIndex - 28118`; the x coordinates differ by 576 pt and y agrees. The largest coordinate discrepancy in original corresponding commands was **0.000152588 pt**, consistent with PDF extraction float rounding. The same check also passed for the eight retained paths belonging to unresolved auditorium marks.

A source-only crop replayed **3,653** intersecting non-colored-fill vector paths from page 6, retaining original line/cubic coordinates and black fills while omitting colored filled annotations. This directly exposes **52475**, whose entire column marker is covered by the cafe cup icon, and clarifies **52508**, which the restroom icon partly overlaps. The cafe callout leader remains a visible yellow stroke in this replay; **52480** has a full closed black contour in the original vectors despite that leader crossing its printed right edge. These recoveries are original-vector evidence, not extrapolated circles.

Scratch inspection files (outside the repository): `/tmp/iribe-reference/columns-page-5.png`, `columns-page-6.png`, `columns-east-auditorium.png`, `columns-west-cafe.png`, `columns-overlay-page6.png`, `columns-overlay-lower.png`, `columns-overlay-east.png`, `columns-overlay-seam.png`, and `columns-unannotated-west.png`. The exact extraction arrays are `/tmp/iribe-reference/columns-drawings-5.json` and `columns-drawings-6.json`.

## Centers and marker radii

The source markers are stylized closed Bezier contours, not mathematical circles. Two sizes must be distinguished:

- **`markerControlBoundsRadiusPt`** is `(rect.width + rect.height) / 4` from the original `get_drawings().rect`. That rectangle includes Bezier control points. The familiar approximately **5.47 pt** large-marker diameter and **4.09 pt** compound core diameter are preserved through this value and the exact `controlBoundsPt` of each source path. The canopy control extents are approximately **6.82 pt** across.
- **`markerRadiusPt`** is the mean x/y half-extent of the **actual outer curve**, computed from cubic endpoints and all derivative roots in `(0,1)`. It is approximately **2.40-2.44 pt** for the ordinary large markers and **3.18 pt** for the six canopy markers. It is a diagram silhouette approximation; it is not a circle fit or a physical radius. `markerCurveBoundsPt` preserves its evaluated bounds. Using half of the control-point box as the visible radius would enlarge most round silhouettes.

For ordinary four-cubic symbols, `center` is the original control-bounds midpoint. For the three optimized contours (**52169**, **52195**, **52480**), irregularly subdivided controls make that midpoint biased, so `center` uses the evaluated curve-bounds midpoint. The full original control box remains in `GROUND_COLUMN_SOURCE_PATHS`. At 52169 the difference is about 0.1185 pt on y; this is why the derivation is explicit for each record. None of these centers is represented as a surveyed CAD column axis.

At **52368/52369** and **52372/52374**, the outer symbol is a compound black fill containing an inner contour and an outer contour, followed by a separately filled core. Each pair denotes **one column**, not two. `center` uses the separately drawn core's bounds, `markerRadiusPt` uses the complete outer silhouette, and `coreMarkerRadiusPt` preserves the inner marker radius. This recovers the requested core centers **[341.997498, 411.459091]** and **[334.354797, 471.402908]** instead of the shifted aggregate outer control-box centers **[341.969986, 411.459595]** and **[334.312500, 471.396698]**. The shared registration file is outside this task's edit scope; the parent can review these distinctions when integrating.

## Verified column ledger

All coordinates and radii below are pt in the original page 6 frame. `r curve` is `markerRadiusPt`, `r controls` is `markerControlBoundsRadiusPt`. Locations describe positions on the drawing. Each row is one verified column symbol.

| PDF6 path(s) | PDF5 path(s) | Center x, y | r curve | r controls | Building relation | Context / visibility |
| --- | --- | --- | ---: | ---: | --- | --- |
| 52169 | 24051 | 405.214799, 295.959516 | 2.418029 | 2.530746 | inside | Auditorium east circulation; 11-cubic contour |
| 52195 | 24077 | 421.967466, 240.907787 | 2.418511 | 2.548004 | inside | Auditorium east circulation; 12-cubic contour |
| 52301 | 24183 | 511.203613, 428.703720 | 3.181670 | 3.408257 | outside | East canopy, upper-right marker |
| 52302 | 24184 | 505.207901, 475.752594 | 3.182289 | 3.411507 | outside | East canopy, lower-right marker |
| 52303 | 24185 | 455.487289, 130.842194 | 2.440168 | 2.737251 | inside | East glass corridor near northern vestibule |
| 52304 | 24186 | 454.694992, 423.350403 | 3.179266 | 3.408501 | outside | East canopy, upper-middle marker |
| 52305 | 24187 | 448.244797, 473.895996 | 3.179288 | 3.408501 | outside | East canopy, lower-middle marker |
| 52308 | 24190 | 438.752197, 185.859497 | 2.440061 | 2.737000 | inside | East glass corridor |
| 52327 | 24209 | 398.214188, 417.835205 | 3.179287 | 3.408501 | outside | East canopy, upper-left marker |
| 52330 | 24212 | 391.256714, 472.202118 | 3.182367 | 3.411758 | outside | East canopy, lower-left marker |
| 52368, 52369 | 24250, 24251 | 341.997498, 411.459091 | 2.442157 | 2.737251 | inside | East stair south-east; compound symbol plus core |
| 52372, 52374 | 24254, 24256 | 334.354797, 471.402908 | 2.442500 | 2.737747 | inside | Entrance east; compound symbol plus core |
| 52402 | 24284 | 285.732697, 404.250122 | 2.440061 | 2.737000 | inside | East stair south-west |
| 52406 | 24288 | 277.126694, 471.395813 | 2.442292 | 2.737251 | inside | Entrance west |
| 52419 | 24301 | 249.631409, 276.015594 | 2.442154 | 2.737251 | inside | Auditorium / lobby vestibule |
| 52428 | 24310 | 234.502098, 357.647522 | 2.443617 | 2.740749 | inside | Lobby, north-east preliminary anchor |
| 52429 | 24311 | 229.454300, 397.041107 | 2.438073 | 2.737000 | inside | Atrium stair east preliminary anchor |
| 52436 | 24318 | 220.320404, 468.319595 | 2.440282 | 2.737503 | inside | High-bay lab / south atrium edge |
| 52452 | 24334 | 204.981598, 308.741486 | 2.441766 | 2.737000 | inside | Lobby glazed entry |
| 52455 | 24337 | 193.198807, 349.015518 | 2.443152 | 2.740753 | inside | Lobby, north-west preliminary anchor |
| 52458 | 24340 | 182.038406, 387.128311 | 2.443335 | 2.740753 | inside | Atrium stair west |
| 52464 | 24346 | 161.854500, 456.096817 | 2.443756 | 2.740749 | inside | High-bay lab / atrium edge |
| 52468 | 24350 | 153.757004, 334.014282 | 2.440167 | 2.737251 | inside | Cafe / north atrium edge |
| 52475 | 24357 | 136.764809, 369.911301 | 2.441767 | 2.737003 | inside | Cafe seating; completely covered by cup icon |
| 52480 | 24362 | 117.125015, 313.064807 | 2.406480 | 2.625750 | inside | Cafe / west support edge; leader partly covers marker |
| 52484 | 24366 | 106.030396, 434.862000 | 2.440198 | 2.737000 | inside | High-bay lab / west atrium edge |
| 52508 | 24390 | 57.022499, 315.429489 | 2.444976 | 2.744001 | inside | West restroom area; icon partly covers marker |
| 52511 | 24393 | 54.210201, 405.144714 | 2.440169 | 2.737249 | inside | West atrium / lab edge |
| 52550 | 24432 | 7.730200, 367.702591 | 2.442010 | 2.737252 | inside | West support corridor; fully on page 6 |
| 52583 | 24465 | -30.638801, 325.639786 | 2.443335 | 2.740752 | inside | West lab/support wing; off page 6, visible on page 5 |

The continuation column's native page 5 center is **[545.361176, 325.639786] pt**, path **24465**. Translation into the retained frame gives x approximately **-30.6388 pt**. Its page 6 path **52583** remains fully available in the original vectors even though the page crop hides it. The small float differences between the two extracted copies are retained, not forced into artificial equality.

## Ambiguous small auditorium marks and exclusions

The four approximately 1.75-1.90 pt black marks at the ends of the auditorium furniture/desk rows are visually real, but their structural identity is not established by the guide. Their paths contain an inner rectangle and an outer rounded contour, followed by a separately filled rectangle; two outer contours also contain straight truncations. Their smaller size and furniture association warrant retaining them as **unresolved marks**, outside `GROUND_COLUMN_TRACE`, rather than silently instantiating structural posts. Their original commands and page 5 matches remain available for further review.

| PDF6 paths | PDF5 paths | Control-bounds center x, y | r controls |
| --- | --- | --- | ---: |
| 52290, 52291 | 24172, 24173 | 386.925995, 98.007492 | 0.944756 |
| 52294, 52295 | 24176, 24177 | 386.925995, 135.252502 | 0.907761 |
| 52292, 52293 | 24174, 24175 | 386.925995, 172.999512 | 0.917755 |
| 52288, 52289 | 24170, 24171 | 386.925995, 210.210999 | 0.944504 |

Excluded pale landscaping symbols with center crosses, scalloped tree outlines, small repeated planting circles, cafe tables with chairs, overlapping lounge-table outlines, yellow callout dots/rings, event bubbles, and the heads of red pictograms. Their appearance, fill/color and context differ from the repeated solid black structural symbols. The canopy's three large C-shaped pale symbols are furnishing outlines, not additional columns; the six black markers in that region remain included. Square/rectangular wall piers and thick auditorium walls are outside this round-column trace.

## Integration limits and verification

The module has no imports, executable transform, drawing creation or app integration. It exports `GROUND_COLUMN_DIAGRAM_SOURCE`, `GROUND_COLUMN_TRACE`, `GROUND_COLUMN_UNCERTAIN_MARKS`, `GROUND_COLUMN_SOURCE_PATHS` and their readonly types. A consumer can apply the existing shared `groundGuidePlan` registration to positions; it must account for the similarity's scale when converting radii. The trace intentionally retains original PDF6 coordinates, including the negative continuation x. Source building classifications follow the drawn exterior glass/wall line, with the east canopy classified outside; they do not establish current enclosures or legal floor area.

No physical column diameters, heights, materials, structural loads, exact shaft axes, present-day conditions or structural status of the four small auditorium marks are verified. The historical diagram's marker dimensions must not be presented as measured construction geometry. The approximate circular radii and six-decimal extraction values express a reproducible trace, not physical accuracy.

Validation against the reopened original PDF confirmed exact numeric equality of **186 retained source commands** after JavaScript parsing, **34 closed contours** across the 32 verified-symbol paths, sampled points within the analytic-extrema bounds, consistent radius calculations, no duplicated column IDs, 30 unique verified symbols / 32 source paths, 24 inside / six outside, and four unresolved marks / eight additional source paths. Python's round-trip source-coordinate decimals triggered ESLint's decimal-length heuristic; a narrowly scoped `no-loss-of-precision` exception covers only the exact source-path array, with the verified JavaScript numeric round trip documented in its comment. Standalone strict TypeScript, file-scoped ESLint and whitespace checks passed. The inventory-generating application build was not run. App integration and browser verification belong to the parent task.

## Parent application integration

`structure.ts` now maps all **24 source-inside** markers through `groundGuidePlan`; it does not filter or relocate them to fit existing furniture. Rendered radii use the analytic outer-curve marker radius times the common similarity scale. `model.ts` uses those radii for the white cylinder and its collision boundary. Ground height remains estimated at the existing 6.3 m ceiling; heights are not supplied by the plan.

Browser review found the two columns at PDF6 paths 52368 and 52372 floating above the modeled sunken entrance floor. Their bases and collision ranges now follow the existing local `amphitheaterHeight` support. The older independently fitted post at `amphPoint(6.4,1.0)` has been removed; it was only about 0.83 model units from the newly registered 52368 marker. This preserves source positions while fixing the duplicated post and discontinuous bases. Lower-floor elevation and court shape remain fitted estimates.

The six canopy markers remain raw data for later exterior integration. The four small auditorium marks remain unresolved. No upper-floor schematic columns were replaced in this pass.

Thirty-seven focused circulation/integrity checks passed with the integrated source columns, source lower stair and metal underside. They include both entrance-to-stair journeys in both directions, ascent/descent, sampled stair headroom, all central lift landings/cabs, both Level 1 lift-to-mezzanine routes, room shortcut clearance, approaches to every lounge furniture group, lateral lower-flight movement, and rendered/collision coverage of the two lower column bases. This selection does not verify every room-to-room route or all private/support fitouts. A fresh browser scene visibly confirmed the entrance column bases, absence of the extra post and movement along the lounge approach.
