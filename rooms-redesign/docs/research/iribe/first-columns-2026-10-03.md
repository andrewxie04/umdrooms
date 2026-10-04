# Level 1 round columns: original guide trace, 2026-10-03

Created `src/components/interior/iribe/first-column-trace.ts` as pure source data: **25 verified round black structural symbols**, all **inside** the drawn exterior glass/wall line, with **zero outside** markers found. Twenty are fully on page 8, one is split by the page seam, and four are wholly on the page 7 continuation. Thirteen gray furniture-associated circular outlines are exported separately, with structural status unestablished. The historical illustrative plan does not supply a surveyed column schedule.

## Source and coordinate frame

- Official [UMD / HDR Computer Science Day guide](https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf), the same source identified in the completed Ground review. This pass uses the local original PDF.
- Local source: `/tmp/iribe-reference/guide.pdf`, 16 pages, SHA-256 `c1fe539a56ba3b97b7b1dcb2d4563792892294a59caeaa476f67ec810fcf7474`.
- Original zero-based page **8** (ninth PDF page), labeled **Level 1**, and page **7** continuation. Both are **576 x 576 pt**, unrotated, with top-left origin, +x right, +y down.
- Every exported position and source command stays in the original page 8 frame. The native page 7-to-page 8 translation is **[-576, 0] pt**. Negative coordinates are retained; no source coordinates are clamped to the page.
- PyMuPDF **1.28.2** `page.get_drawings()` produces **97,843** paths on page 8 and **61,255** on page 7. Path indices are zero-based in these original arrays. Each retained path's `seqno` equals its index.
- All 25 verified symbols are single opaque black nonzero fills. There are no compound/core duplicates among them. The module retains **38 original source paths / 160 commands**: 25 structural fills / 108 commands and 13 gray furniture outlines / 52 commands. Raw command coordinates, control boxes and styles are unrounded; derived values use six decimals.

## Complete selection and visual review

The source scan examined all **699 black filled paths** on page 8, including connected subpaths embedded in compound fills and contours with mixed line/curve commands. A broad small-contour audit produced **120 candidates** with curve extents 0.5-14 pt and aspect ratio 0.5-2. Contextual inspection separated repeated structural silhouettes from source lettering, wall piers, furniture and pictograms. Three genuine column paths have five, seven and eight cubic commands (**92828**, **92868**, **92881**); a four-quarter-only selector would miss them. The remaining 22 structural symbols use four cubics each. An independent page 7 round-fill scan found the same 25 symbols with no additional continuation column.

Rendered and inspected both complete source pages at **3x**, checked both labeled structural overlays, and inspected the west/cafe/atrium, full western continuation, seam, Sandbox, auditorium and central wall detail at **6x**. The round fills recur at facade and corridor positions, are visibly distinct from the pale furniture outlines, and remain inside the source exterior line. The six Sandbox marks are four at the east facade and two beside interior workbenches. The garden and auditorium show no additional round black column markers. Square/rectangular wall piers and the thick auditorium walls remain outside this round-marker trace.

All **25 verified paths** have original page 7 counterparts, with `page7PathIndex = page8PathIndex - 33820`. Corresponding commands agree after translating page 7 x by -576 pt; the maximum discrepancy is **0.000137329102 pt**, consistent with extraction float rounding. The thirteen furniture paths were also matched command by command, with a maximum discrepancy of **0.000122070312 pt**. Their index differences vary; the explicitly matched page 7 indices are retained rather than applying the structural index offset to them.

### Annotation recovery

Replayed original intersecting monochrome source paths before the guide's colored annotation block, preserving original lines, cubic commands and drawing order, and rendered PNGs without changing or saving the PDF. Inspected four replay crops: west/cafe/atrium (**14,589** paths), Sandbox (**30,266**), Room 1207 (**2,718**) and garden (**607**). The replay removes the cafe cup, red pictograms, yellow event bubbles, yellow callout dots and leaders. No additional round structural marker is concealed by those annotations. All 25 structural records therefore have `annotationOcclusion: 'none'`. Gray furniture covered by annotations remains excluded from the structural trace; no missing circle was inferred from another floor.

**93005** is page-cropped, rather than annotation-covered. Its original full contour is available on page 8 and matches continuation path **59185**. Its actual x silhouette spans approximately **[-3.725426, 1.079974] pt**, so it intersects both pages and must be counted once. Page 7 supplies the left portion visible at the spread seam. The four western markers **93057**, **93081**, **93105**, **93132** are wholly outside page 8's crop, but remain intact in its original vectors and visible on page 7.

## Source centers and silhouette radii

The Ground trace conventions are retained. `markerControlBoundsRadiusPt` is `(rect.width + rect.height) / 4` from `get_drawings().rect`, including Bezier controls. `markerRadiusPt` is the mean x/y half-extent of the actual curve, evaluated at endpoints and every derivative root in (0,1). `markerCurveBoundsPt` retains those evaluated bounds. The visible structural radii range approximately **2.399022-2.404348 pt**; control-box radii range approximately **2.656754-2.696754 pt**. Taking half of the control box as the visible radius would enlarge the markers.

Ordinary four-cubic records use their original control-bounds midpoint for `center`, preserving the existing registration convention. The subdivided contours **92828**, **92868**, **92881** use the actual curve-bounds midpoint, because their asymmetric controls bias the control-box midpoint by approximately **0.034601**, **0.073649**, **0.061929 pt**, respectively. Both the complete original controls and the derivation label are retained. These are reproducible source-marker centers, not surveyed shaft axes or circle fits.

The four `FIRST_GUIDE_ANCHORS` in `first-guide-layout.ts` match this trace's six-decimal centers exactly:

| Original PDF8 path | Trace / existing anchor center x, y (pt) |
| --- | --- |
| 92855 | 170.184509, 386.060211 |
| 92832 | 216.839401, 395.813599 |
| 92836 | 207.852097, 465.948792 |
| 92865 | 150.324905, 453.921219 |

Consumers should apply **`firstGuidePlan(x, y)` from the existing `first-guide-layout.ts`** to every source center and silhouette point, including negative continuation x. Radius conversion must use the common similarity scale; it can be obtained as the length of `firstGuidePlan(1, 0) - firstGuidePlan(0, 0)`. No separate fit, furniture clearance correction or per-column translation is introduced. The shared registration and all stair/opening files are outside this task's edit scope.

## Verified column ledger

Coordinates and radii are PDF pt in the page 8 frame. `r curve` means `markerRadiusPt`, `r controls` means `markerControlBoundsRadiusPt`. Context labels describe positions on the drawing.

| PDF8 path | PDF7 path | Center x, y | r curve | r controls | Building relation | Context |
| --- | --- | --- | ---: | ---: | --- | --- |
| 92510 | 58690 | 552.173431, 399.387070 | 2.404348 | 2.696739 | inside | Sandbox north-east corner |
| 92516 | 58696 | 547.208221, 438.148682 | 2.399306 | 2.693512 | inside | Sandbox east facade, north-middle |
| 92523 | 58703 | 543.261383, 468.975784 | 2.402754 | 2.693260 | inside | Sandbox east facade, south-middle |
| 92526 | 58706 | 538.246368, 508.056503 | 2.402071 | 2.693504 | inside | Sandbox south-east corner |
| 92539 | 58719 | 493.685501, 431.287994 | 2.404211 | 2.696754 | inside | Sandbox north interior workbench |
| 92542 | 58722 | 488.859299, 468.975784 | 2.402747 | 2.693253 | inside | Sandbox south interior workbench |
| 92749 | 58929 | 272.214493, 402.906982 | 2.400866 | 2.693504 | inside | Room 1207 north corridor |
| 92768 | 58948 | 263.746780, 468.975784 | 2.402747 | 2.693253 | inside | Room 1207 south corridor |
| 92828 | 59008 | 221.806190, 357.057822 | 2.403215 | 2.676750 | inside | Cafe / garden facade; five-cubic contour |
| 92832 | 59012 | 216.839401, 395.813599 | 2.399022 | 2.693504 | inside | Atrium stair east; shared anchor |
| 92836 | 59016 | 207.852097, 465.948792 | 2.401016 | 2.693504 | inside | Atrium south-east; shared anchor |
| 92851 | 59031 | 181.165298, 348.559204 | 2.404030 | 2.696754 | inside | Cafe / garden facade, west of 92828 |
| 92855 | 59035 | 170.184509, 386.060211 | 2.404215 | 2.696754 | inside | Atrium stair west; shared anchor |
| 92865 | 59045 | 150.324905, 453.921219 | 2.404342 | 2.696747 | inside | Atrium south edge; shared anchor |
| 92868 | 59048 | 142.353603, 333.799034 | 2.400766 | 2.656754 | inside | Cafe / garden facade; seven-cubic contour |
| 92875 | 59055 | 125.636101, 369.119370 | 2.402896 | 2.693249 | inside | Cafe floor, west of atrium tip |
| 92881 | 59061 | 106.284628, 313.224884 | 2.400465 | 2.660006 | inside | Cafe / west lounge facade; eight-cubic contour |
| 92887 | 59067 | 95.396198, 433.028488 | 2.401001 | 2.693499 | inside | Room 1116 / west atrium edge |
| 92892 | 59072 | 84.289097, 345.412598 | 2.402860 | 2.693506 | inside | West cafe alcove |
| 92936 | 59116 | 44.407898, 403.787277 | 2.400908 | 2.693254 | inside | West cafe alcoves / Room 1116 edge |
| 93005 | 59185 | -1.326400, 366.946289 | 2.402853 | 2.693506 | inside | West corridor / alcove; split by page seam |
| 93057 | 59237 | -46.314499, 173.307983 | 2.404068 | 2.696749 | inside | West wing northern tip; on continuation |
| 93081 | 59261 | -73.087605, 201.768517 | 2.402747 | 2.693251 | inside | West wing diagonal facade, north-middle; on continuation |
| 93105 | 59285 | -98.422405, 228.689301 | 2.402857 | 2.693499 | inside | West wing diagonal facade, south-middle; on continuation |
| 93132 | 59312 | -126.343208, 258.143181 | 2.401044 | 2.693245 | inside | West wing facade corner; on continuation |

## Furniture-associated candidates and other exclusions

`FIRST_COLUMN_UNCERTAIN_MARKS` keeps **13 unfilled gray circles** outside `FIRST_COLUMN_TRACE`. Their original stroke is `(0.6000000238418579, 0.6000000238418579, 0.6000000238418579)` with width **0.06700000166893005 pt**. Visual context associates them with tables, lounge seating or small furniture details. The guide does not establish exact furniture products or a structural identity. This separate set records all complete closed cubic-loop candidates from the small round-outline audit; it is not a complete furniture inventory. Many other table/chair outlines are split across separate strokes or use rounded straight-sided shapes.

The furniture curve radii exclude stroke width. Their path styles are retained individually in `FIRST_COLUMN_SOURCE_PATHS`, preventing them from being replayed as solid black columns.

| PDF8 path | PDF7 path | Control-bounds center x, y | r curve | Context / uncertainty |
| --- | --- | --- | ---: | --- |
| 9437 | 4551 | -73.304302, 260.039215 | 2.791243 | West office round meeting-table outline |
| 9728 | 4842 | 526.477600, 402.391510 | 0.309998 | Sandbox small circular furniture detail on north seating row |
| 9729 | 4843 | 531.033203, 502.468903 | 0.310242 | Sandbox small circular furniture detail on south workbench seating |
| 18845 | 13022 | 535.747070, 476.485199 | 1.581201 | Sandbox south-east lounge: round table between two seats |
| 18930 | 13077 | 512.191711, 469.888794 | 1.669728 | Sandbox south-west lounge: round table between two seats |
| 22141 | 15765 | -52.879599, 193.938911 | 3.313572 | West continuation: northern round meeting-table outline |
| 22386 | 16096 | -69.859203, 223.233192 | 3.313711 | West continuation: middle round meeting-table outline |
| 22387 | 16097 | -80.558701, 234.565811 | 3.313630 | West continuation: southern round meeting-table outline |
| 24955 | 18554 | 42.811798, 392.875595 | 2.325752 | West cafe: round table in southern two-seat alcove |
| 24956 | 18555 | 50.486401, 383.730911 | 2.325752 | West cafe: round table in next two-seat alcove |
| 24957 | 18556 | 67.304596, 358.541397 | 2.325752 | West cafe: round table in northern two-seat alcove |
| 24958 | 18557 | 74.759201, 348.318497 | 2.325752 | West cafe: round table in northernmost two-seat alcove |
| 24959 | 18558 | 46.461800, 362.500793 | 2.791243 | West cafe: round table in four-seat alcove |

Excluded yellow callout rings **97833**, **97838** and their filled centers **97832**, **97837**; yellow event bubbles **97839-97842**; red guide pictograms **97823-97829**; source letter/glyph fragments including the irregular nine-cubic path **92733**; and rounded rectangular wall/fitout fill **93141**. The last is part of a thick central wall assembly in the monochrome replay, not a round marker. The near-black fill **92574** is a tiny irregular source detail, not a repeated structural silhouette. No smaller black auditorium furniture-end marks matching the Ground uncertain set are present in the Level 1 round-fill inventory; no Ground candidates were copied onto this level.

## Inspection artifacts outside the repository

All scratch outputs are under `/tmp/iribe-reference/`, using the `first-columns-` prefix:

- Original renders `page-7.png`, `page-8.png`; full labeled overlays `overlay-page-7.png`, `overlay-page-8.png`.
- Source crops `west-cafe.png`, `sandbox-east.png`, `continuation.png`, `seam.png`, `auditorium.png`, `center-small-mark.png`.
- Annotation-free source replays `west-unannotated.png`, `sandbox-unannotated.png`, `room1207-unannotated.png`, `garden-unannotated.png`.
- Labeled furniture overlays `furniture-west-overlay.png`, `furniture-sandbox-overlay.png`, `furniture-continuation-overlay.png`.
- Original arrays `drawings-7.json`, `drawings-8.json`; candidate ledgers `candidates.json`, `stroke-round-candidates.json`, `selected.json`; direct counterpart map `page-correspondence.json`.
- Scratch analysis/replay/generation/validation scripts, exported module JSON and validation summaries are also outside the repository. Source PDF bytes are preserved.

## Validation and integration limits

The only task-owned repository outputs are this note and `first-column-trace.ts`. The module has no imports, functions, transforms or application integration. Its exports follow the completed Ground trace: `FIRST_COLUMN_DIAGRAM_SOURCE`, `FIRST_COLUMN_TRACE`, `FIRST_COLUMN_UNCERTAIN_MARKS`, `FIRST_COLUMN_SOURCE_PATHS` and readonly types.

Validation against the reopened original PDF passed: exact numeric equality of **160 commands and all retained styles** after JavaScript parsing; **38 closed contours**; analytic curve extrema and 101 samples per cubic within their silhouette bounds; every source-center/radius derivation; unique IDs/path ownership; **25 inside / zero outside**; every original page 7 counterpart; and exact six-decimal agreement with all **four existing registration anchors**. A TypeScript AST check confirms there are no imports, function declarations, calls or constructed objects. Source commands use Python's round-trip float decimals; a `no-loss-of-precision` exception is scoped to the exact source-path array and justified by the JavaScript numeric equality check. Standalone strict TypeScript, file-scoped ESLint and whitespace checks passed. No application build, generated inventories, commit or push was run.

The trace verifies the historical diagram symbols and their drawing context. It supplies no physical column diameters, heights, materials, present-day conditions, survey axes or verified structural status for the thirteen gray furniture candidates. Inside/outside is relative to the drawn exterior line. Rendering/collision integration and in-app review belong to the parent task; if a source column intersects existing estimated furniture, its source center should stay fixed while the parent reviews the fitout.

## Parent integration and application verification

The parent mapped the source records with the shared `firstGuidePlan`, using the common similarity scale for silhouette radii. Twenty-three markers replace the schematic Level 1 posts. Source **92881** and **93057** fall outside the current independently fitted floor shell (approximate main-plan coordinates 446.40/1298.97 and 213.38/1599.58). They remain intact in the raw trace and are explicitly listed in `FIRST_COLUMNS_PENDING_SHELL_ALIGNMENT`; they are not instantiated as detached posts or moved into the shell. This is a known registration/facade gap, not a claim that those physical columns are absent. All thirteen uncertain furniture circles remain uninstantiated as structure. Heights and materials are estimates. Levels 2–5 retain their prior schematic posts pending source review.

After integration, 114 focused navigation/rendering checks passed (307 skipped out of 421), including all instantiated Level 1 centers inside the current shell, source stair ascent/descent/headroom, central lift landings, Sandbox routes, west office/meeting furniture access, west-tip corridor connections, classroom/service connections, Family Garden paths and all room shortcuts. Browser review used a fresh scene, inspecting source columns beside the upper atrium flight and the Ground lounge. These checks do not establish every possible route, physical structural dimensions or exact facade alignment.

## Subsequent facade correction

The parent corrected the Level 1 west tip/cafe curtain-wall outline from fifty-four original glazing-pane baselines and the south corner-interface line; see `first-facade-2026-10-03.md`. The two previously deferred source markers **92881** and **93057** are now rendered at their unchanged `firstGuidePlan` centers. The current integration includes all **25** markers. Every source silhouette sample lies inside the corrected floor; rendered-cylinder rays and sixteen collision sides are checked for both restored columns. The remaining facade/room registration is fitted, and this is not a structural survey.
