# Level 2 round columns: original guide trace, 2026-10-03

Created `src/components/interior/iribe/second-column-trace.ts` as pure source data: **20 verified black round structural symbols**, all **inside** the source exterior glass/wall line, with **zero outside** symbols found. Fifteen lie fully on original page 10; five lie wholly on page 9's continuation. No verified round contour crosses the page seam or is covered by guide annotations. Two gray furniture-associated round outlines are exported separately with structural status unestablished. The source is a historical illustrative plan, not a surveyed structural schedule.

## Original source and page verification

- Official [UMD / HDR Computer Science Day guide](https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf), the original source used by `ground-column-trace.ts` and `first-column-trace.ts`. Those modules and their research notes were read for conventions.
- Reopened local original: `/tmp/iribe-reference/guide.pdf`, **16 pages**, SHA-256 **`c1fe539a56ba3b97b7b1dcb2d4563792892294a59caeaa476f67ec810fcf7474`**. The hash was checked before extraction and again during final validation. Original bytes were preserved.
- Zero-based page **10** (eleventh PDF page) is explicitly labeled **Level 2**, both in extracted text and in the visible yellow lower-right title. Zero-based page **9** (tenth PDF page) is its western continuation; **page 9 has no explicit Level 2 text label**. Its room legend lists the Mokhtarzada Hatchery, Room 2207 and Room 2107, matching the numbered spaces on page 10. Matching original vector commands confirm the shared spread.
- Both pages are **576 x 576 pt**, unrotated. Native coordinates have top-left origin, +x right and +y down. The page 9-to-page 10 translation is **[-576, 0] pt**. Negative page 10 x values remain intact.
- PyMuPDF **1.28.2** `page.get_drawings()` returned **46,441** paths on original page 10 and **21,866** on original page 9. Every path index is the zero-based original array position, before overlays, replay or annotation removal. Retained `seqno` values equal their path indices.

## Complete inventory and visual review

Both complete pages were rendered and visually inspected at **3x**. Both complete labeled overlays were inspected, followed by **6x** labeled west/central, east-wing and western-continuation details, seam crops, auditorium roof, and the small nonround black-fill candidates. Green overlay labels identify the original **page 10** path ID even when viewed on page 9. Purple labels identify the separate furniture outlines. No reference images were copied into repository assets.

The original-array scan examined all **413 black filled paths** on page 10 and **400** on page 9. It splits connected subpaths and inspects mixed line/cubic contours, including off-page vectors and geometry painted before later annotations. On each page, a broad audit of contours with cubic segments, actual width/height **0.5-14 pt** and aspect ratio **0.5-2** produced **23 candidates**. Twenty are the repeated closed round structural silhouettes. The other three are a small wall-end contour and two overlapping rounded wall/fitout contours. No four-quarter-only filter was used: **38904** contains **five cubics** and remains included. The other nineteen symbols each contain four cubics. All twenty are single opaque black nonzero fills, with no compound/core duplicate to count separately.

A final audit **without any size cutoff** examined all closed cubic black subpaths with aspect ratio 0.5-2 on both reopened pages. It found the same twenty structural loops and two tiny circular subpaths embedded in compound facade/partition fills: **page 10 path 38920, subpath 1** (curve-bounds center **[179.892026, 344.213913] pt**, radius **0.160767 pt**) and **38942, subpath 0** (**[141.729272, 329.700611] pt**, radius **0.162854 pt**). Their page 9 parent-path counterparts are **18750** and **18772**. Subpath indices refer to the connected-contour splitter, not a second get_drawings array. Both were inspected in labeled **30x** original-source crops; they are internal contours in the black facade assemblies beside the nonround partition piers, with no independent large round structural silhouette. Their exact physical role is unestablished. They are documented as excluded details, not counted as additional columns or furniture.

The page 9 scan was performed independently and recovered exactly the same twenty round symbols, including all five western continuation markers. The entire source facade and auditorium roof were inspected. The roof drawing contains no additional round black structural marker. Square and rectangular wall piers are outside this round-marker inventory.

### Annotation recovery and seam handling

Original intersecting monochrome paths were replayed in source drawing order to PNGs, preserving line and cubic commands and their styles while omitting the later colored guide annotation block. The inspected west/central replay retained **10,827** paths, east/core **22,091**, and western continuation **8,543**. This exposes the areas under the three yellow numbered bubbles, yellow communicating-stair callout/leader, red stair pictograms and restroom pictogram. No additional round structural marker is hidden there. All structural records therefore use `annotationOcclusion: 'none'`; no symbol was inferred from another floor.

**39041** is the important seam case. Its page 10 actual curve bounds are **[-5.179533, 362.621398, -0.385690, 367.415231] pt**. Its entire silhouette is just left of the page crop; it is **not** a partially clipped circle. Its original full commands remain in page 10's vector array, and counterpart **18871** is visibly intact on page 9. The four farther-west markers **39078**, **39105**, **39128**, **39150** are also wholly off page 10 and visible on page 9. The trace retains all five once, without clamping or moving their centers. No verified round silhouette crosses the source crop edge in this spread.

## Provenance, centers and actual silhouette radii

`SECOND_COLUMN_SOURCE_PATHS` retains **22 original page 10 paths / 89 commands**: twenty structural fills / **81 cubics** and two excluded furniture outlines / **8 cubics**. `SECOND_COLUMN_CONTINUATION_SOURCE_PATHS` separately retains all **22 matched original page 9 paths / 89 commands** in their own native coordinates. Together these exports retain **44 paths / 178 commands**, with exact control bounds, sequence numbers and all returned rendering styles. Derived coordinates use six decimals; original command coordinates and style values are unrounded.

The twenty black counterpart paths satisfy `page9PathIndex = page10PathIndex - 20170`, but each correspondence was also verified command by command and against styles. Furniture counterpart offsets differ and are recorded explicitly. After page 9 x is translated by -576 pt, maximum command-coordinate discrepancy is **0.000946044921875 pt** for structural paths and **0.00006103515625 pt** for furniture. The largest structural differences occur at **38927 / 18757** and **38949 / 18779**. These are differences between the two reopened original arrays; they are not corrected, averaged or replaced with copied coordinates. Both native command sets are preserved. Each record also supplies `page9Center`, recomputed from its counterpart's own coordinates using the same center derivation.

`markerControlBoundsRadiusPt` is `(rect.width + rect.height) / 4` from the original `get_drawings().rect`, which includes Bezier control points. `markerRadiusPt` is `(curveWidth + curveHeight) / 4`, evaluated at endpoints and **every derivative root in (0,1)** for both axes. `markerCurveBoundsPt` records those actual extrema. Furniture curve bounds exclude stroke width.

Structural curve radii range **2.392946-2.398521 pt**; control-box radii range **2.670494-2.689999 pt**. The control-box radius is not the visible silhouette radius.

The nineteen ordinary four-cubic symbols use `control-bounds-midpoint`, following the prior trace convention. The five-cubic **38904** uses `curve-bounds-midpoint`; its asymmetric control box biases the midpoint by approximately **0.034318 pt**. Its source center is **[219.782297, 355.158785] pt**, recomputable from the retained curve commands. These center estimates describe illustration markers, not surveyed shaft axes or fitted circles.

## Verified round-symbol ledger

Coordinates and radii are PDF pt in the native page 10 frame. All twenty are **inside** the source facade. `r curve` is the actual silhouette radius; `r controls` is the separate control-box radius.

| PDF10 path | PDF9 counterpart | Center x, y | r curve | r controls | Page10 visibility | Source context |
| --- | --- | --- | ---: | ---: | --- | --- |
| 38706 | 18536 | 549.316406, 397.381104 | 2.398275 | 2.689743 | visible | East wing north-east corner |
| 38715 | 18545 | 544.362762, 436.043884 | 2.393220 | 2.686493 | visible | Hatchery east facade, north-middle |
| 38725 | 18555 | 540.425873, 466.793701 | 2.396909 | 2.686493 | visible | Hatchery east facade, south-middle |
| 38728 | 18558 | 535.423889, 505.775391 | 2.395988 | 2.686752 | visible | East wing south-east corner |
| 38887 | 18717 | 270.063095, 400.892517 | 2.394790 | 2.686501 | visible | Room 2207 north corridor |
| 38890 | 18720 | 261.616714, 466.793701 | 2.397018 | 2.686745 | visible | Room 2207 south corridor |
| 38904 | 18734 | 219.782297, 355.158785 | 2.397595 | 2.670494 | visible | North facade, beside communicating stair; five-cubic contour |
| 38908 | 18738 | 214.827797, 393.817078 | 2.392946 | 2.686497 | visible | Central core north-east circulation |
| 38911 | 18741 | 205.863098, 463.773712 | 2.395152 | 2.687004 | visible | Central core south-east circulation |
| 38927 | 18757 | 168.290695, 384.087616 | 2.398100 | 2.689995 | visible | Room 2107 north-east corner |
| 38939 | 18769 | 148.480705, 451.778015 | 2.398521 | 2.689999 | visible | Room 2107 south-east corner |
| 38949 | 18779 | 123.856102, 367.189819 | 2.396530 | 2.686245 | visible | Room 2107 north wall |
| 38962 | 18792 | 93.691406, 430.937012 | 2.395067 | 2.686497 | visible | Room 2107 south wall |
| 38971 | 18801 | 82.612198, 343.542694 | 2.396740 | 2.686745 | visible | West meeting area north-east corner |
| 38997 | 18827 | 42.831600, 401.770508 | 2.395042 | 2.686747 | visible | West meeting area south-east corner |
| 39041 | 18871 | -2.786300, 365.022003 | 2.396919 | 2.686497 | outside-page | West corridor, wholly on continuation near seam |
| 39078 | 18908 | -47.660702, 171.873299 | 2.398141 | 2.689751 | outside-page | West wing northern tip, on continuation |
| 39105 | 18935 | -74.366600, 200.261314 | 2.397030 | 2.686752 | outside-page | West wing diagonal facade, north-middle, on continuation |
| 39128 | 18958 | -99.636597, 227.114006 | 2.397030 | 2.686752 | outside-page | West wing diagonal facade, south-middle, on continuation |
| 39150 | 18980 | -127.487297, 256.494598 | 2.394794 | 2.686497 | outside-page | West wing facade corner, on continuation |

## Furniture-associated candidates and other exclusions

`SECOND_COLUMN_UNCERTAIN_MARKS` keeps the two complete closed gray cubic-loop outlines separate from the structural trace. Both are round tables surrounded by four chair outlines in east-wing lounge areas. Exact furniture products and structural identity are not established. Their original stroke color is **[0.6000000238418579, 0.6000000238418579, 0.6000000238418579]**, width **0.06599999964237213 pt**, opacity **1**, with no fill. These styles are retained individually on both native pages. The set records the complete closed cubic-loop candidates in the round-outline audit; it is not a complete inventory of furniture. Other table/chair contours are split across strokes or combine lines with curves.

| PDF10 path | PDF9 counterpart | Control-bounds center x, y | r curve | Context / uncertainty |
| --- | --- | --- | ---: | --- |
| 11305 | 9437 | 525.009277, 485.063507 | 3.500267 | East wing south lounge: round table surrounded by four chairs |
| 18498 | 14806 | 537.777252, 416.470383 | 3.500264 | East wing north lounge: round table surrounded by four chairs |

Excluded the yellow callout outline **46436** and filled center **46435**, yellow event bubbles **46438-46440**, red pictogram head circles embedded in **46422**, the source wall-end contour **38642**, and rounded wall/fitout fills **39050 / 39073** at the continuation facade. The last two are visibly part of a thick rectangular assembly, not two columns. Their larger compound surroundings and original source crops were inspected. No smaller unresolved black auditorium circles like the Ground uncertain set are present here.

## Potential Level 2-to-Level 1 common-CAD correspondences

`SECOND_COLUMN_POTENTIAL_FIRST_LEVEL_CORRESPONDENCES` records **20 paired native source centers/path IDs**, with explicit page indices and the center derivation on each level. Level 1 page **8** was reopened and its retained centers recomputed from original commands. The pairs agree in repeated black silhouette styles, contour patterns, sequence around the plan and source context across the east wing, central circulation, west meeting area and western continuation. Cubic paths can begin at different cyclic command positions; command order was not rewritten in either original export.

An independent scratch comparison of the paired centers supports a common drawing underlay, with a maximum center residual of approximately **0.001174 pt** and RMS **0.000704 pt** under a uniform source scale and translation. This is evidence of PDF drawing correspondence, not authoritative CAD metadata, a physical accuracy estimate or an application registration. The module exports the paired native centers only; it supplies no transform, fit coefficients or integration. No existing fit was changed.

| PDF10 path | Native Level 2 center x, y | PDF8 path | Native Level 1 center x, y |
| --- | --- | --- | --- |
| 38706 | 549.316406, 397.381104 | 92510 | 552.173431, 399.387070 |
| 38715 | 544.362762, 436.043884 | 92516 | 547.208221, 438.148682 |
| 38725 | 540.425873, 466.793701 | 92523 | 543.261383, 468.975784 |
| 38728 | 535.423889, 505.775391 | 92526 | 538.246368, 508.056503 |
| 38887 | 270.063095, 400.892517 | 92749 | 272.214493, 402.906982 |
| 38890 | 261.616714, 466.793701 | 92768 | 263.746780, 468.975784 |
| 38904 | 219.782297, 355.158785 | 92828 | 221.806190, 357.057822 |
| 38908 | 214.827797, 393.817078 | 92832 | 216.839401, 395.813599 |
| 38911 | 205.863098, 463.773712 | 92836 | 207.852097, 465.948792 |
| 38927 | 168.290695, 384.087616 | 92855 | 170.184509, 386.060211 |
| 38939 | 148.480705, 451.778015 | 92865 | 150.324905, 453.921219 |
| 38949 | 123.856102, 367.189819 | 92875 | 125.636101, 369.119370 |
| 38962 | 93.691406, 430.937012 | 92887 | 95.396198, 433.028488 |
| 38971 | 82.612198, 343.542694 | 92892 | 84.289097, 345.412598 |
| 38997 | 42.831600, 401.770508 | 92936 | 44.407898, 403.787277 |
| 39041 | -2.786300, 365.022003 | 93005 | -1.326400, 366.946289 |
| 39078 | -47.660702, 171.873299 | 93057 | -46.314499, 173.307983 |
| 39105 | -74.366600, 200.261314 | 93081 | -73.087605, 201.768517 |
| 39128 | -99.636597, 227.114006 | 93105 | -98.422405, 228.689301 |
| 39150 | -127.487297, 256.494598 | 93132 | -126.343208, 258.143181 |

The remaining five Level 1 round symbols have nearby **nonround Level 2 quadrilaterals**, which were inspected in labeled source overlays. They are excluded from the round trace and the accepted round-pair list. The following records retain candidate IDs and native source centers for later parent assessment. A quadrilateral's center here is its original control-bounds midpoint, not an identified column axis; similar location does not establish structural equivalence.

| PDF8 circle | Native Level 1 center x, y | PDF10 nonround candidate | Native candidate center x, y | Limit |
| --- | --- | --- | --- | --- |
| 92539 | 493.685501, 431.287994 | 38754 | 491.914200, 429.660507 | Nearby Hatchery wall/door quadrilateral; source-site displacement about 1.05 pt |
| 92542 | 488.859299, 468.975784 | 38759 | 487.212708, 466.002182 | Nearby Hatchery wall/door quadrilateral; source-site displacement about 1.31 pt |
| 92851 | 181.165298, 348.559204 | 38922 | 179.277504, 346.641708 | Facade/office partition quadrilateral; structural equivalence unestablished |
| 92868 | 142.353603, 333.799034 | 38944 | 140.541191, 331.952072 | Facade/office partition quadrilateral; structural equivalence unestablished |
| 92881 | 106.284628, 313.224884 | 38958 | 104.617397, 311.349609 | Facade/office partition quadrilateral; structural equivalence unestablished |

## Scratch inspection and validation artifacts

All temporary outputs are under `/tmp/iribe-reference/` with the **`second-columns-`** prefix. The source PDF was only read; in-memory overlays and monochrome replays were rendered to PNG without saving modified PDFs.

- Complete original renders: `second-columns-page-9.png`, `second-columns-page-10.png`.
- Complete labeled overlays: `second-columns-overlay-page-9.png`, `second-columns-overlay-page-10.png`; detail overlays for `west-central`, `east-wing`, `continuation`, `seam`, and the two nonround comparison areas.
- Original source crops: west/central, east wing, western continuation, auditorium roof, left/right seam, small fill, continuation wall.
- Annotation-free replays: `second-columns-west-central-unannotated.png`, `second-columns-east-core-unannotated.png`, `second-columns-west-continuation-unannotated.png`.
- Fresh original arrays: `second-columns-drawings-9.json`, `second-columns-drawings-10.json`; broad black/stroke/other-fill candidate ledgers, selection, direct page correspondence JSON and `second-columns-unrestricted-audit.json`.
- Scratch analysis, replay, generation, module export and validation scripts; `second-columns-data.json`, `second-columns-module-exports.json`, `second-columns-validation.json`.
- Independent paired-source audit: `second-columns-pairs-results.json`, `second-columns-pairs-validation.json`, plus the `second-columns-pairs-` scripts, original-page renders and intermediate JSON listed in its manifest. The subagent performed no repository writes.

## Validation and scope limits

Validation against freshly reopened originals passed for **all 44 native paths / 178 commands**, exact JavaScript-parsed numeric equality of original coordinates/control boxes/styles, **44 closed contours**, analytic extrema and **101 independent samples per cubic** inside the actual bounds on both pages, all center/radius derivations, the five continuation positions, unique marker IDs and exclusive native path ownership, matched styles and commands for every counterpart, independent round-marker scans and the unrestricted size audit on both original pages, and all twenty paired Level 1 centers recomputed from page 8. The nearest seam marker's negative bounds were explicitly checked. The original PDF SHA remained unchanged.

The TypeScript AST audit found **zero imports, call expressions, `new` expressions or functions**. The module contains readonly data/types only. Python round-trip decimal spellings are retained; `no-loss-of-precision` exceptions are scoped to the two raw native-source arrays and justified by exact JavaScript numeric equality. Standalone strict TypeScript, file-scoped ESLint and whitespace checks passed for the completed outputs.

The only task-owned repository outputs are **`src/components/interior/iribe/second-column-trace.ts`** and **`docs/research/iribe/second-columns-2026-10-03.md`**. No application registration, model/scene integration, Level 1 facade correction, existing fit, tests or other parent-owned dirty files were edited. No application build, generated inventory command, commit or push was run. Reference images remain outside the repository.

The trace establishes historical diagram symbols and their visible source-facade relation. It supplies no surveyed diameters, heights, materials, load-bearing schedule, present-day conditions or proven structural equivalence for the furniture outlines and nonround cross-level candidates. Future rendering/collision integration and source-to-model registration belong to the parent reconstruction; these native source centers should remain fixed during that work.

## Parent integration follow-up — 2026-10-03

The source-only trace above has now been integrated through a twenty-pair Level 2/Level 1 similarity, without changing native centers. The application uses all twenty round columns and a complete source glazing loop. North-office/Hatchery furniture is also registered through its original crop coordinates. The broader circulation selection passed 160 checks. See `second-structure-2026-10-03.md` for the complete integration audit, joining estimates, route corrections and remaining limits. The original raw trace is preserved; the separate nonround details are not promoted to round structural posts.
