# East canopy lobby door trace - 2026-10-03

Primary authority: the UMD-hosted [Brendan Iribe Center event guide](https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf), copyright 2023 HDR. This trace covers the east cantilever/canopy entrance on original zero-based PDF **page index 6**, the seventh page, labeled Ground Level. The local source is `/tmp/iribe-reference/guide.pdf`; its SHA-256 is **`c1fe539a56ba3b97b7b1dcb2d4563792892294a59caeaa476f67ec810fcf7474`**, verified before and after extraction.

The only authored application files are `src/components/interior/iribe/lobby-canopy-door-trace.ts` and this note. The module exports the typed `LOBBY_CANOPY_DOOR_SOURCE_LEDGER`, individual pair/jamb records, source paths and original paint styles. There are no application geometry, layout, registration or test changes. The courtyard vestibule is outside this trace; the parent is handling it. Existing dirty files were preserved, and no commit or push was made.

## Coordinate and identity contract

The source page is **576 x 576 PDF pt**, rotation 0, origin **top-left**, +X right and +Y down. The requested vicinity was `[347, 393, 389, 466]`; visual inspection extended to `[340, 385, 398, 474]` for adjacent stair, glazing and jamb context. The six door leaves themselves have hinge/leaf geometry from approximately `(359.200, 425.807)` through `(375.767, 463.063)`. Position IDs such as `page-upper` refer to page Y order and do not assert compass bearings.

All exported coordinates retain the original PyMuPDF floating-point values. The decimal precision represents PDF extraction, not physical building accuracy. Numbers in the tables below are rounded to six decimals for reading; the TypeScript source is the full-precision authority for this trace. No raster scale, crop origin, fitted facade line, local doorway transform, rounded midpoint or application offset is applied.

`pathIndex` is the original zero-based index in `guide[6].get_drawings()` under **PyMuPDF 1.28.2**. The original page returns **56,651** drawing records. `itemIndex` identifies the zero-based item within that original record. `seqno` is separately retained because paint sequence numbers differ from drawing indices: for example original jamb path **54600** has paint sequence **54602**. Replay drawings have their own indices and must never be used as source identities.

Subsequent integration should map every source point, including all four points of each cubic, through the existing **`groundGuidePlan(pdfX, pdfY)`** in `ground-guide-layout.ts`. The shared source frame matches `ground-guide-registration-2026-10-03.md`. Native threshold strokes, leaf origins and jamb edges are independently retained; their small discrepancies are not corrected by this module. The flanking glazing is context for the door jambs, rather than a new facade layout.

## Actual source findings

There are **three pairs / six leaves**, each represented by a single straight open-leaf edge and an original cubic swing stroke. All six swing toward the exterior canopy side of the slanted facade. The native symbols show opposite handed leaves meeting near the middle of each pair. The upper pair is partly covered by the yellow callout, and both complete leaf/swing records remain in the PDF behind it. Its recovery is original vector evidence, not a completion inferred from the other two pairs.

The recovered count is **3 threshold baselines + 6 open-leaf edges + 6 swing cubics**, bounded by **4 jamb locations**. The two middle jambs are shared between adjacent pairs, so this is three adjacent pairs along one facade run. Upstream glazing around Y393-415 is not another door pair. The guide's prose about four building entrances describes building access generally, rather than the count of leaves at this particular entrance.

### Native threshold/facade baselines

Each threshold record is the faint native baseline through the opening. This line establishes source plan placement; it is not a detailed manufactured sill, a surveyed clear opening or a closed-door leaf outline. Its endpoints differ slightly from the independently drawn hinge points.

| Pair | Original path / item | Native baseline from (x, y), pt | Native baseline to (x, y), pt | Symbol hinge-to-hinge span, pt |
| --- | --- | --- | --- | ---: |
| `page-upper` | **13433 / 0**, line | (369.893707, 425.575897) | (366.349701, 437.114899) | 12.049917 |
| `page-middle` | **13434 / 0**, line | (366.199005, 437.570801) | (362.707001, 449.162811) | 12.056430 |
| `page-lower` | **13435 / 0**, line | (362.554504, 449.617188) | (359.062500, 461.209198) | 12.055195 |

The original baseline lengths are respectively **12.070979, 12.106560 and 12.106560 pt**. These and the hinge spans are diagram lengths only. The threshold-baseline source style is gray RGB `0.6000000238418579` on each channel, width `0.06800000369548798` pt.

### Hinges, open edges and swing endpoints

All leaf edges and cubics below are **item 0** of their named original paths. `hinge` is the exact FROM point of the native open-leaf line, interpreted as the plan hinge location. `openTip` is its exact TO point. `closedTip` is the opposite endpoint of the original swing cubic from its open tip. No independent hinge hardware symbol or full closed-leaf contour is established.

| Pair / leaf | Open edge path | Swing path / closed endpoint | Hinge (x, y), pt | Open tip (x, y), pt | Closed tip (x, y), pt |
| --- | ---: | --- | --- | --- | --- |
| Upper / page-upper leaf | **48827** | **48825**, FROM | (370.002289, 425.807404) | (375.767303, 427.561401) | (368.247589, 431.572021) |
| Upper / page-lower leaf | **48828** | **48826**, TO | (366.493988, 437.335297) | (372.259003, 439.090302) | (368.247528, 431.571991) |
| Middle / page-upper leaf | **48881** | **48834**, FROM | (366.356506, 437.787903) | (372.122498, 439.542908) | (364.601807, 443.554993) |
| Middle / page-lower leaf | **48880** | **48882**, TO | (362.846893, 449.322205) | (368.612885, 451.077209) | (364.601807, 443.554993) |
| Lower / page-upper leaf | **48877** | **48879**, FROM | (362.709290, 449.773499) | (368.475281, 451.528503) | (360.954712, 455.540588) |
| Lower / page-lower leaf | **48876** | **48878**, TO | (359.199707, 461.306519) | (364.965698, 463.062531) | (360.954620, 455.540497) |

The complete cubic control points are retained in `LOBBY_CANOPY_DOOR_SOURCE_PATHS`. For example the covered upper leaf's original **48825 / 0** is:

```text
c [368.2475891113281, 431.572021484375]
  [372.3235778808594, 432.81201171875]
  [374.527587890625, 431.63702392578125]
  [375.7666015625, 427.56103515625]
```

The six open-leaf symbol lengths range from **6.025936 to 6.027457 pt**. Endpoint vectors imply approximately **89.993074-90.010075 degrees** of opening. These are measurements of the drawing, not door specifications. Cubics remain their source curves; they are not replaced by ideal quarter circles.

The largest leaf-line/open-curve endpoint discrepancy is **0.0007916944440352079 pt**. The paired closed endpoints differ by **0.00006823937919616058 pt**, **0 pt** and **0.00012947511862546645 pt**. The gaps between opposing hinges on the two shared jambs are **0.473026 pt** and **0.471806 pt**. These distinct source points remain separate. All door symbols use gray RGB `0.3019913136959076` on each channel, width `0.10199999809265137` pt.

### Native jambs and adjoining glazing

The black jamb fills and their independently stroked perimeter edges are both retained. The fill polygons have small irregularities and are not reduced to fitted rectangles. The tiny triangular fill **52354** is part of jamb-1, not another jamb or door.

| Jamb in increasing page Y | Original fill paths / all item indices | Page-upper face / page-lower face | Canopy face / lobby face | Fill bounds (x0, y0, x1, y1), pt |
| --- | --- | --- | --- | --- |
| `jamb-0`, before upper pair | **52350**, items 0-7 | **54600 / 0**, **54602 / 0** | **54601 / 0**, **54603 / 0** | (368.869598, 425.010925, 370.183594, 425.823914) |
| `jamb-1`, upper/middle shared | **52353**, items 0-6; **52354**, items 0-2 | **54596 / 0**, **54598 / 0** | **54597 / 0**, **54599 / 0** | Main: (365.223511, 436.989929, 366.524506, 437.788910); patch: (366.360596, 437.789093, 366.389587, 437.803101) |
| `jamb-2`, middle/lower shared | **52357**, items 0-5 | **54594 / 0**, **54592 / 0** | **54593 / 0**, **54595 / 0** | (361.579193, 448.981903, 362.880219, 449.782898) |
| `jamb-3`, after lower pair | **52360**, items 0-7 | **54590 / 0**, **54588 / 0** | **54589 / 0**, **54591 / 0** | (357.933197, 460.962402, 359.234192, 461.775391) |

The fill records have native `closePath: false` but fill painting implicitly closes their subpaths. The raw flag and original commands are preserved. The 16 jamb edge strokes are black, width `0.06800000369548798` pt; their bounds need not equal the slightly irregular fill polygons. Faces describe page-side or canopy/lobby-side interpretation of these particular strokes, rather than measured frame profiles.

Adjacent glazing context retains **13432 / 0** and **13436 / 0** as the preceding/following pale baselines, plus **49166-49169 / item 0** and **49280-49283 / item 0** as the four edge strokes of each adjoining glazing panel. No canopy footprint, structural columns, staircase or courtyard vestibule geometry is exported.

## Visual recovery and reproducible checks

Original page and detailed source rasters were inspected, including an independent Poppler render of page 7 using `pdftoppm -f 7 -l 7 -r 144 -png -singlefile`. Scratch files all use `/tmp/iribe-reference/lobby-canopy-*`:

- `lobby-canopy-source-full.png`, `lobby-canopy-source-detail.png`, and `lobby-canopy-poppler-page.png`: original page renderings with the yellow callout intact.
- `lobby-canopy-region-drawings.json`: original-page extraction in the expanded region, 286 intersecting drawing records, retaining original identities.
- `lobby-canopy-vector-replay.png` and `lobby-canopy-doors-replay.png`: 283 original grayscale paths replayed on a **new in-memory 576 x 576 page**, with original coordinates, order and styles. Only colored paths **56645**, **56646**, **56647** are omitted from that region. The source PDF is never modified or saved.
- `lobby-canopy-replay-manifest.json`: original path IDs of the region replay. The occluding leader is original path **56645 / items 0-1** (sequence 56673); the center fill is **56646 / items 0-3** (sequence 56674), bounds `[368.9327087402344, 428.9222717285156, 373.4327087402344, 433.42327880859375]`; the outer ring is **56647 / items 0-3** (sequence 56675), bounds `[367.5597229003906, 427.54888916015625, 374.8056945800781, 434.7958984375]`.
- `lobby-canopy-ledger-replay.png`: independent replay of the **actual TypeScript exports**. In native rectangle `[355, 423, 378, 464]`, at 24 pixels/pt (**552 x 984 pixels**), it has **zero changed pixels** against the broader original vector replay. This demonstrates completeness in that inspected strip under the same renderer.
- `lobby-canopy-ledger-labeled.png`: visually inspected diagnostic replay, with red hinge points, blue original leaf lines, green original swing cubics and magenta native baselines. Labels identify all three pairs in page order. Diagnostic colors and labels are not source geometry.
- `lobby-canopy-strip-audit.json`, `lobby-canopy-measurements.json`, `lobby-canopy-module-exports.json`, `lobby-canopy-validation.json`: exhaustive original command inventory, diagram measurements, exported data and validation results. Scratch scripts `lobby-canopy-inspect.py`, `lobby-canopy-replay.py`, `lobby-canopy-analyze.py`, `lobby-canopy-export.mjs`, `lobby-canopy-validate.py` record the workflow.

Validation passed for **46 original paths / 73 original items**: every exported command, full-precision numeric coordinate, paint style and sequence number exactly matches the original PDF extraction. Every semantic path/item reference resolves, and hinge/open/closed endpoint records agree exactly with their referenced commands. An independent scan of original-page door-symbol strokes in the entrance strip found precisely the retained **6 lines + 6 cubics**. That scan used command coordinates rather than bounding-box intersection, so degenerate bounds could not cause an omission. The ledger includes **5 jamb fill paths, 16 jamb edge paths, 8 flanking glazing edge paths and 2 context baseline paths**, in addition to the 15 door/threshold paths.

The standalone module passed strict TypeScript validation (`tsc --noEmit --strict --target ES2022 --module ESNext --moduleResolution bundler --skipLibCheck`) and ESLint. The final source hash still matches the supplied authority. Focused whitespace checks passed. The workspace audit compared 435 existing files: six application files changed concurrently (`IribeInterior.tsx`, `circulation.test.ts`, `circulation.ts`, `layout.ts`, `model.ts`, `scene.ts`), and none disappeared. This task did not write those files or restore their earlier contents; its only authored checkout outputs are the two requested paths. No whole-application build or test suite was needed for this independent source-data extraction.

## Evidence limits

The plan establishes door symbol locations, the three-pair arrangement, drawn leaf and swing strokes, native threshold baselines, jamb silhouettes and adjacent glazing strokes. Outward swing and hinge interpretation follow those symbols and their relation to the exterior canopy. It does **not** establish as-built or current configuration, surveyed clear widths, physical leaf thickness, frame section or member depth, sill construction, elevation, door height, hardware, opening automation, material, glass makeup, canopy height or other vertical dimensions. Actual pivots are interpreted from leaf-edge origins rather than separately dimensioned hardware.

Any 3D leaf, frame or sill thickness, height, material, physical width conversion or operational state must remain an explicit modeling estimate unless another authority supplies it. Source fidelity and a subpixel replay match do not establish real-world dimensional accuracy. The module marks `physicalDimensionsEstablished: false` and `closedLeafEdgeIsDrawn: false`; the original single open edge and the swing endpoints are the proven shape evidence.
