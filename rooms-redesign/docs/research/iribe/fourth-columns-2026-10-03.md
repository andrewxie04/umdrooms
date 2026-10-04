# Level 4 round columns: original guide trace, 2026-10-03

Created `src/components/interior/iribe/fourth-column-trace.ts` as pure source data: **20 verified black round structural symbols**, all **inside** the drawn exterior glass/wall line, with **zero outside-building** symbols found. Fifteen are fully on page 12; five are wholly on the page 11 continuation. **Three gray furniture-associated round outlines** have unestablished structural status and are exported separately. **Five selected nonround black details** are also separate and excluded from the round-column count. These are historical illustrative markers, not a surveyed column schedule.

## Original source and page identity

- Official [UMD / HDR Computer Science Day guide](https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf), read from `/tmp/iribe-reference/guide.pdf` without saving or changing its bytes.
- SHA-256: `c1fe539a56ba3b97b7b1dcb2d4563792892294a59caeaa476f67ec810fcf7474`; original file size **10,150,888 bytes**, **16 pages**, PDF 1.7. Producer is Adobe PDF Library 17.0; creation/modification metadata dates are 2023-10-05.
- Original zero-based page **12** is the **thirteenth PDF page** and visibly carries the explicit **Level 4** title at its lower right. Original page **11**, the **twelfth PDF page**, has no explicit level title; it carries **ROOM 4105**, west reset-zone photographs and the continuation of the same plan. The next titled spread is **Rooftop Level**, on page 14. Level 4 was established from the original title and visually joined spread, not inferred from page numbering.
- Both source pages have **576 x 576 pt** media/crop boxes, zero rotation, top-left origin, +x right, +y down. Main records remain in the original page 12 frame, including negative x. Each continuation command array and `page11Center` stays in the original page 11 frame. The spread relation is page 11 x minus **576 pt** into page 12; it is source-page provenance, not an application registration.
- `/tmp/iribe-reference/venv/bin/python` with **PyMuPDF 1.28.2** `page.get_drawings()` yields **40,353** original paths on page 12 and **18,172** on page 11. All indices in this note and the module are zero-based indices in those original arrays. Original `seqno` equals `pathIndex` for every retained path.
- Every raw path records `pageIndex`, `pathIndex`, `sequenceNumber` and **explicit original `sourceItemIndices`**, paired one-to-one with `commands`. Commands preserve original order, command letters and unrounded floating-point coordinates. Every returned style field is retained, including nulls: render type, fill/color, both opacities, width, fill rule, closePath, line caps/join and dashes.

## Complete selection and visual inspection

The initial scan examined every black filled path: **450** on page 12 and **437** on page 11. It split connected subpaths and examined mixed line/cubic contours. The broad small-contour audit found **34** black candidates on each page with actual extents 0.5-14 pt and aspect ratio 0.5-2; **20** have the repeated near-round structural silhouette. Nineteen have four cubics; **33817 / 15022** has **five**, and was retained in full. No four-quarter-only shortcut was used.

A second audit removed size, aspect-ratio and command-count filters. Each original page has **59 curved black subpaths**, all explicitly closed. Evaluating all of them gives **21** near-round contours: the same twenty structural symbols plus one tiny loop embedded in a larger facade/partition fill. That extra loop is page 12 path **33859**, subpath **2**, original items **37-40**, paired with page 11 path **15064**, subpath **2**, items **37-40**. Its curve radius is **0.169938 pt** on page 12, inside a **41-item** assembly whose control box is `[115.737602, 324.565094, 130.401596, 352.630096]` pt. The full original assembly and detailed crop were inspected: this is a small embedded facade/fitout detail, not a separate round-column symbol. The twenty large fills recur at facade and corridor positions and are visually distinct from the gray table/chair layouts and square piers.

Inspected both complete original pages and both complete labeled overlays at **3x**, with source crops and labeled details at **6x or 8x** for the east reset zone, Room 4105/central circulation, full west continuation, both sides of the seam, north facade, south curtain-wall details, wall ends and roof/auditorium outline. Overlay labels identify the **native original page's** path IDs: page 11 labels are its own IDs, not transplanted page 12 IDs. Extraction and validation always reopened `guide.pdf`; no overlay, replay or crop PDF supplied a source path ID.

### Annotation recovery and seam

Replayed original intersecting monochrome commands in original drawing order into in-memory scratch pages and rendered PNGs while omitting the later guide annotation block. The west/central replay retained **7,132** paths; east/core **21,436**; western continuation **8,219**; roof/auditorium **2,536**. Page 12 replay stops before original annotation path **40344**, and page 11 before **18161**. These replays expose the areas beneath the cafe pictogram, restroom pictogram, red stair symbols, yellow **1** bubble and the yellow reset-zone callout dot/ring/leader. The original crops and recovered geometry were both inspected. **No additional structural round marker is annotation-covered**; all twenty records use `annotationOcclusion: 'none'`. No circle was inferred from another level.

Original page 12 **33955** is the nearest continuation-only column. Its actual curve bounds are **[-24.321944, 360.059091, -19.321910, 365.059120] pt**, wholly left of the page crop. Its native page 11 counterpart **15160** is fully visible. The farther-west **33992**, **34021**, **34041**, **34065** are also wholly off page 12 and visibly intact on page 11. **No verified column silhouette crosses the seam** in this spread. All five retain complete original page 12 vectors and original continuation counterparts, counted once each; positions are not clamped or moved.

## Source commands, centers and silhouette radii

`FOURTH_COLUMN_SOURCE_PATHS` preserves **28 original page 12 paths / 113 commands**: twenty structural fills / **81 cubics**, three gray furniture outlines / **12 cubics**, and five nonround fills / **20 line commands**. `FOURTH_COLUMN_CONTINUATION_SOURCE_PATHS` preserves the matching **28 original page 11 paths / 113 commands** in their own native coordinates. Together they retain **56 native paths / 226 commands and item IDs**. Both arrays retain every original source number and style; only derived record values use six decimals.

Every structural and selected nonround counterpart satisfies `page11PathIndex = page12PathIndex - 18795`, but every pair was also matched against original commands and exact styles. Furniture path offsets differ and are explicitly stored. Maximum native command-coordinate differences after the source-page x translation are **0.00103759765625 pt** for structural symbols, **0.0001220703125 pt** for furniture and **0.00006103515625 pt** for the selected nonround fills. The largest structural difference is **33817 / 15022**. These discrepancies exist between the original extracted arrays; neither native set was copied, rounded to the other, averaged or corrected. `page11Center` is independently derived from that page's commands/control box.

Following the Ground/Level 1/Level 2 trace conventions, `markerControlBoundsRadiusPt = (rect.width + rect.height) / 4`, including Bezier controls. `markerRadiusPt = (actualCurveWidth + actualCurveHeight) / 4` uses endpoints and **every derivative root in (0,1)** for each axis; `markerCurveBoundsPt` retains those actual extrema. Structural curve radii range **2.496190-2.501487 pt**; control-box radii range **2.784992-2.806000 pt**. Control bounds therefore describe a larger box than the visible silhouette. Furniture radii likewise use actual curve extrema and exclude stroke width.

The nineteen ordinary four-cubic markers use `control-bounds-midpoint` for the center, matching the earlier convention. Five-cubic **33817** uses `curve-bounds-midpoint`, because its asymmetric controls displace the control-box midpoint by approximately **0.035824 pt**. Its reproducible native center is **[210.330401, 352.275395] pt**. These are marker-center estimates, not surveyed shaft axes or circle fits.

## Verified round-symbol ledger

All positions below are native page 12 PDF pt. All twenty are **inside** the source exterior line. `r curve` is the actual silhouette radius and `r controls` is the separate control-box value. Ordinary source item IDs are **0-3**; **33817 / 15022** uses **0-4** on each original page.

| PDF12 path | PDF11 counterpart | Center x, y | r curve | r controls | Page12 visibility | Source context |
| --- | --- | --- | ---: | ---: | --- | --- |
| 33635 | 14840 | 554.058472, 396.315125 | 2.501480 | 2.806000 | visible | East reset zone north-east corner |
| 33643 | 14848 | 548.890686, 436.645096 | 2.496190 | 2.802498 | visible | East reset zone east facade, north-middle |
| 33651 | 14856 | 544.784424, 468.718994 | 2.500168 | 2.802490 | visible | East reset zone east facade, south-middle |
| 33655 | 14860 | 539.567810, 509.380493 | 2.499371 | 2.802490 | visible | East reset zone south-east corner |
| 33793 | 14998 | 262.776306, 399.977722 | 2.498174 | 2.802490 | visible | Central east room north corridor |
| 33799 | 15004 | 253.966904, 468.719086 | 2.499916 | 2.802254 | visible | Central east room south corridor |
| 33817 | 15022 | 210.330401, 352.275395 | 2.500665 | 2.784992 | visible | North facade beside cafe and roof access; five-cubic contour |
| 33820 | 15025 | 205.162010, 392.597595 | 2.496334 | 2.802494 | visible | Room 4105 north-east circulation beside central stair and lifts |
| 33824 | 15029 | 195.812111, 465.569092 | 2.498168 | 2.802494 | visible | Room 4105 south-east circulation beside central stair and lifts |
| 33841 | 15046 | 156.621208, 382.449203 | 2.501487 | 2.805996 | visible | Room 4105 north wall, west of central stair |
| 33851 | 15056 | 135.958000, 453.056686 | 2.501378 | 2.805752 | visible | Room 4105 south wall, west of central stair |
| 33865 | 15070 | 110.271603, 364.824097 | 2.500167 | 2.802496 | visible | Room 4105 north-west wall beside office corridor |
| 33875 | 15080 | 78.808201, 431.317398 | 2.497968 | 2.802000 | visible | Room 4105 south-west wall beside lab corridor |
| 33881 | 15086 | 67.252300, 340.157715 | 2.500163 | 2.802496 | visible | Room 4105 north-west corner |
| 33911 | 15116 | 25.758200, 400.893616 | 2.498175 | 2.802495 | visible | Room 4105 south-west corner |
| 33955 | 15160 | -21.825899, 362.563080 | 2.500016 | 2.802495 | outside-page | West corridor beside support core; wholly on continuation |
| 33992 | 15197 | -68.632702, 161.094406 | 2.501484 | 2.805998 | outside-page | West reset zone northern tip; on continuation |
| 34021 | 15226 | -96.489498, 190.706215 | 2.500022 | 2.802500 | outside-page | West reset zone diagonal facade, north-middle; on continuation |
| 34041 | 15246 | -122.847698, 218.715614 | 2.500163 | 2.802500 | outside-page | West reset zone diagonal facade, south-middle; on continuation |
| 34065 | 15270 | -151.897499, 249.360603 | 2.498069 | 2.802246 | outside-page | West reset zone facade corner; on continuation |

## Separate furniture candidates and nonround details

`FOURTH_COLUMN_UNCERTAIN_MARKS` contains the **three complete gray closed cubic-loop candidates** in the round-outline audit. Each is visibly a round table among four chair outlines; structural identity and the exact furniture product are unestablished. Their original unfilled stroke color is **[0.6000000238418579, 0.6000000238418579, 0.6000000238418579]**, width **0.0689999982714653 pt**, stroke opacity **1**, on both native pages. Each uses original items **0-3**. This set is not a complete furniture inventory: numerous other tables/chairs have split or mixed contours.

| PDF12 path | PDF11 counterpart | Native page12 center x, y | r curve | Context |
| --- | --- | --- | ---: | --- |
| 304 | 241 | 528.735687, 487.730606 | 3.650998 | East reset zone south lounge: round table surrounded by four chairs |
| 473 | 362 | 542.053802, 416.182800 | 3.651103 | East reset zone north lounge: round table surrounded by four chairs |
| 606 | 519 | -75.430801, 182.514809 | 3.447690 | West reset zone on continuation: round table surrounded by four chairs |

`FOURTH_COLUMN_NONROUND_DETAILS` contains **five selected four-line black quadrilaterals**, each with original items **0-3** and a verified continuation counterpart. They are excluded from `FOURTH_COLUMN_TRACE`. Their centers are control-box midpoints, not identified column axes; their native source commands/styles are retained in the two raw arrays. All five are inside the source facade. The three north-facade fills coincide closely with locations where Level 1 has round markers, while the two east interior wall/door-end fills are nearby with appreciable source-site displacement. The module labels these associations **`nearby-source-location-only`** and structural status **`not-established`**.

| PDF12 nonround path | PDF11 counterpart | Native page12 bounds midpoint x, y | Nearby original Level1 PDF8 circle | Native Level1 center x, y | Limit |
| --- | --- | --- | --- | --- | --- |
| 33675 | 14880 | 494.175797, 430.013504 | 92539 | 493.685501, 431.287994 | East interior wall/door-end quadrilateral, north of reset zone; scratch source-site displacement 1.096 pt; equivalence unestablished |
| 33677 | 14882 | 489.278992, 467.872101 | 92542 | 488.859299, 468.975784 | East interior wall/door-end quadrilateral, south of reset zone; scratch source-site displacement 1.385 pt; equivalence unestablished |
| 33836 | 15041 | 168.080696, 343.390991 | 92851 | 181.165298, 348.559204 | North facade office partition-end quadrilateral beside cafe; scratch source-site displacement 0.054 pt; equivalence unestablished |
| 33855 | 15060 | 127.675594, 328.068314 | 92868 | 142.353603, 333.799034 | North facade office partition-end quadrilateral, central diagonal bay; scratch source-site displacement 0.013 pt; equivalence unestablished |
| 33871 | 15076 | 90.205002, 306.578690 | 92881 | 106.284628, 313.224884 | North facade office partition-end quadrilateral, western diagonal bay; scratch source-site displacement 0.113 pt; equivalence unestablished |

This selected nonround set does not assert a complete inventory of rectangular structural details. Also excluded: the mixed cubic/line wall-end **33903 / 15108**; eleven small curtain-wall/mullion contours **33883, 33890, 33895, 33905, 33915, 33922, 33933, 33940, 33948, 33965, 33972** and their page 11 counterparts; and rounded wall/fitout components **33988 / 15193** and **33989 / 15194**. The last two belong to a thick continuation wall assembly, with the second contour embedded in a larger fill; they are not two extra round columns. The tiny embedded loop **33859 / 15064** is discussed above. Their original source crops, larger surroundings and labeled exclusion details were inspected.

Guide graphics are also excluded: page 11 yellow reset-zone callout center **18165** and ring **18166**, with leader **18164**; page 12 yellow **1** bubble **40352**; red pictograms **40344-40348**, including the head circles in **40344**; and page 11 stair pictogram **18161**. No small black auditorium symbols matching the unresolved Ground set are present here.

## Potential common-CAD source correspondences

`FOURTH_COLUMN_POTENTIAL_COMMON_CAD_CORRESPONDENCES` retains **40 paired native centers**: all twenty Level 4 circles paired with corresponding round source markers on **Level 1 original page 8** and **Level 2 original page 10**. Both earlier original pages were reopened; centers were recomputed using each recorded derivation and checked against the existing source arrays. The pairs agree in repeated black styles, contour families, sequence and source context across the east reset zone, central circulation, Room 4105/west corridor and western continuation. Labeled source overlays for the earlier levels were inspected. Original cyclic cubic command ordering is not rewritten.

Scratch uniform source-scale/translation comparisons give maximum center residuals of approximately **0.001379 pt** to Level 1 and **0.001242 pt** to Level 2 (RMS **0.000751 pt** and **0.000865 pt**, respectively). This supports a potential shared drawing underlay. It does not establish authoritative CAD point IDs, structural equivalence, survey alignment, physical accuracy or an application registration. The module supplies only native page IDs, path IDs, center derivations and paired native centers; it exports **no fit coefficients or application transforms**. The five nonround details are excluded from this accepted round-pair list.

| Level4 PDF12 path | Native Level4 center x, y | Level1 PDF8 path | Native Level1 center x, y | Level2 PDF10 path | Native Level2 center x, y |
| --- | --- | --- | --- | --- | --- |
| 33635 | 554.058472, 396.315125 | 92510 | 552.173431, 399.387070 | 38706 | 549.316406, 397.381104 |
| 33643 | 548.890686, 436.645096 | 92516 | 547.208221, 438.148682 | 38715 | 544.362762, 436.043884 |
| 33651 | 544.784424, 468.718994 | 92523 | 543.261383, 468.975784 | 38725 | 540.425873, 466.793701 |
| 33655 | 539.567810, 509.380493 | 92526 | 538.246368, 508.056503 | 38728 | 535.423889, 505.775391 |
| 33793 | 262.776306, 399.977722 | 92749 | 272.214493, 402.906982 | 38887 | 270.063095, 400.892517 |
| 33799 | 253.966904, 468.719086 | 92768 | 263.746780, 468.975784 | 38890 | 261.616714, 466.793701 |
| 33817 | 210.330401, 352.275395 | 92828 | 221.806190, 357.057822 | 38904 | 219.782297, 355.158785 |
| 33820 | 205.162010, 392.597595 | 92832 | 216.839401, 395.813599 | 38908 | 214.827797, 393.817078 |
| 33824 | 195.812111, 465.569092 | 92836 | 207.852097, 465.948792 | 38911 | 205.863098, 463.773712 |
| 33841 | 156.621208, 382.449203 | 92855 | 170.184509, 386.060211 | 38927 | 168.290695, 384.087616 |
| 33851 | 135.958000, 453.056686 | 92865 | 150.324905, 453.921219 | 38939 | 148.480705, 451.778015 |
| 33865 | 110.271603, 364.824097 | 92875 | 125.636101, 369.119370 | 38949 | 123.856102, 367.189819 |
| 33875 | 78.808201, 431.317398 | 92887 | 95.396198, 433.028488 | 38962 | 93.691406, 430.937012 |
| 33881 | 67.252300, 340.157715 | 92892 | 84.289097, 345.412598 | 38971 | 82.612198, 343.542694 |
| 33911 | 25.758200, 400.893616 | 92936 | 44.407898, 403.787277 | 38997 | 42.831600, 401.770508 |
| 33955 | -21.825899, 362.563080 | 93005 | -1.326400, 366.946289 | 39041 | -2.786300, 365.022003 |
| 33992 | -68.632702, 161.094406 | 93057 | -46.314499, 173.307983 | 39078 | -47.660702, 171.873299 |
| 34021 | -96.489498, 190.706215 | 93081 | -73.087605, 201.768517 | 39105 | -74.366600, 200.261314 |
| 34041 | -122.847698, 218.715614 | 93105 | -98.422405, 228.689301 | 39128 | -99.636597, 227.114006 |
| 34065 | -151.897499, 249.360603 | 93132 | -126.343208, 258.143181 | 39150 | -127.487297, 256.494598 |

## Scratch artifacts and reproducibility

Every scratch script, image and metadata file from this pass is under `/tmp/iribe-reference/` with the **`fourth-columns-`** prefix. The source guide is read only; in-memory overlays and source replays are rendered to PNGs without saving modified PDFs. No reference image is copied into the application.

- Complete original renders: `fourth-columns-page-11.png`, `fourth-columns-page-12.png`; complete labeled renders: `fourth-columns-overlay-page-11.png`, `fourth-columns-overlay-page-12.png`.
- Original source crops and labeled detail overlays for `west-central`, `east-wing`, `continuation`, `continuation-seam`, `seam-left`, `seam-right`, `auditorium-roof`, `wall-end`, `continuation-wall`, `nonround-east`, `nonround-north-facade`, `tiny-detail`, `south-facade-details` and `continuation-wall-detail`.
- Annotation-free replays: `fourth-columns-west-central-unannotated.png`, `fourth-columns-east-core-unannotated.png`, `fourth-columns-west-continuation-unannotated.png`, `fourth-columns-roof-unannotated.png`; source cutoffs, native crops and counts in `fourth-columns-replay-manifest.json`.
- Fresh original arrays: `fourth-columns-drawings-11.json`, `fourth-columns-drawings-12.json`; broad black/stroke/other-fill candidate ledgers, `fourth-columns-selected.json`, `fourth-columns-page-correspondence.json`, `fourth-columns-unrestricted-audit.json`.
- Native cross-level centers and scratch comparison results: `fourth-columns-pairs.json`, `fourth-columns-reference-exports.json`, plus `fourth-columns-pairs-level-{1,2}-{west-central,east-wing}.png` labeled original-source crops.
- Scripts: `fourth-columns-analyze.py`, `fourth-columns-review.py`, `fourth-columns-extra-review.py`, `fourth-columns-reference-exports.mjs`, `fourth-columns-pairs.py`, `fourth-columns-generate.py`, `fourth-columns-export.mjs`, `fourth-columns-validate.py`, `fourth-columns-write-note.py`.
- Final source-data exports and checks: `fourth-columns-data.json`, `fourth-columns-module.mjs`, `fourth-columns-module-exports.json`, `fourth-columns-validated-native-pairs.json`, `fourth-columns-validation.json`.

## Validation and scope limits

Validation against **freshly reopened original pages** passed for **all 56 paths / 226 commands and original item IDs**, exact JavaScript-parsed numeric equality of coordinates/control boxes and every retained style, **56 explicitly closed contours**, unique native `(pageIndex, pathIndex)` ownership and exclusive marker IDs, native original continuation commands/styles and independently derived continuation centers. The five off-page columns and absence of seam-crossing silhouettes were explicitly checked. All twenty verified markers are inside the source facade on the visual review; outside-building count is zero.

Actual cubic bounds were checked using an independent power-basis derivative solution and Horner evaluation; maximum disagreement with the generator's Bernstein calculation is **2.2737367544323206e-13 pt**. **18,786 independently evaluated cubic samples** (101 per cubic on both native pages) lie inside those exact extrema bounds. Every exported center/radius was recomputed from original commands/control boxes. Fresh scans cover all 59 curved black subpaths on each original page without a size cutoff and reproduce the twenty large symbols plus the explicitly excluded embedded detail. All **40 potential cross-level paired centers** and the five nearby Level 1 centers in the nonround table were recomputed on original pages 8/10. The source PDF SHA remained unchanged.

The TypeScript AST audit reports **zero imports, calls, constructed objects or functions**. The module contains readonly types and literal source arrays only. Python's round-trip decimal spellings are retained in the two raw native arrays; the scoped `no-loss-of-precision` exceptions are supported by exact numeric equality after JavaScript parsing. The following standalone checks passed:

```sh
./node_modules/.bin/tsc --noEmit --strict --target ES2022 --module ESNext --moduleResolution bundler --skipLibCheck --noUnusedLocals --noUnusedParameters --exactOptionalPropertyTypes --noUncheckedIndexedAccess src/components/interior/iribe/fourth-column-trace.ts
./node_modules/.bin/eslint src/components/interior/iribe/fourth-column-trace.ts
```

Whitespace/source-number checks passed for the two task-owned outputs. The only repository files written are **`src/components/interior/iribe/fourth-column-trace.ts`** and **`docs/research/iribe/fourth-columns-2026-10-03.md`**. Application models, layouts, references, registrations, existing tests and other reconstruction files were not edited. No npm build, generated inventory command, commit or push was run. The parent's Level 2 columns/facade integration is outside this pass.

This reconstruction establishes historical round diagram symbols and their visible source-facade relation. It supplies no surveyed dimensions, column heights/materials, load-bearing schedule, present-day verification, physical structural equivalence or alignment. Furniture and nonround details remain unestablished as structure. Application registration and integration belong to the parent; these native source centers should remain fixed during that work.
