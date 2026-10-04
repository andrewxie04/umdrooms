# South lobby vestibule door trace - 2026-10-03

Primary authority: the UMD-hosted [Brendan Iribe Center event guide](https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf), copyright 2023 HDR. Source: `/tmp/iribe-reference/guide.pdf`, SHA-256 **`c1fe539a56ba3b97b7b1dcb2d4563792892294a59caeaa476f67ec810fcf7474`**, verified before extraction and after export validation. This is original zero-based **page index 6**, the seventh PDF page, labeled Ground Level.

The only authored checkout files are `src/components/interior/iribe/lobby-south-door-trace.ts` and this note. The module follows the canopy trace's source-data contract and exports `LOBBY_SOUTH_DOOR_SOURCE_LEDGER`, the original paths/styles, four paired-door records, eight paired jambs, two adjoining stair-door records, eleven complete adjacent panel edge sets, and all retained opaque fills. Application geometry and registration are outside this extraction. No commit, push, whole-application build, or generated application data was produced. Existing dirty work remains in place.

## Coordinate and identity contract

The source frame is **576 x 576 PDF pt**, rotation 0, origin **top-left**, +X right, +Y down. The requested vicinity `[247, 470, 341, 529]` includes the right-hand paired openings and adjoining stair enclosure but cuts off the matching left-hand pairs. Inspection expanded to **`[203, 462, 354, 529]`** to establish the complete vestibule and adjacent glass. Pair IDs use page Y row and page X position; they do not infer surveyed compass bearings.

`pathIndex` means the original zero-based array position in `guide[6].get_drawings()` under **PyMuPDF 1.28.2**, which returns **56,651 drawings**. `itemIndex` is the original zero-based item within that path. `seqno` is the separate original paint sequence number; for example path **54362** has sequence **54364**, and annotation drawing **56631** has sequence **56636**. Replay identities are never source identities. Original bounds and every native paint field are retained as well as every command.

All exported numeric values equal the original extraction exactly. ESLint flagged **253 decimal literal occurrences** under `no-loss-of-precision`; those occurrences are represented as the original float's exact numerator divided by its power-of-two denominator. The actual evaluated TypeScript exports, rather than generator inputs, were compared against the original extraction. Table coordinates below are rounded to six decimals only for readability; the module is the full-precision authority for this trace.

There is no crop translation, raster-derived coordinate, snapping, ideal arc substitution, fitted wall rectangle, inferred closed-leaf line, or invented physical width. A consumer should apply existing **`groundGuidePlan(pdfX, pdfY)`** to every source point, including all cubic controls. This task does not import, invoke, or alter that registration.

## Proven topology and door records

The vestibule has **two parallel rows**, each with **two double-door pairs**: **four pairs / eight leaves total**. The upper row bounds the lobby/vestibule interface; the lower row bounds the vestibule/exterior interface. Those room-side descriptions are interpretations of the original plan context. Both rows' open-leaf symbols project toward increasing page Y. Six narrow framed panels flank and separate the paired openings: three per row. The panels between pairs terminate at separate jambs; the left and right pairs do not share a jamb. There are **eight distinct paired-door jamb locations**.

Every paired leaf has exactly **one native open-edge line and one native cubic swing stroke**. `hinge` is interpreted from the exact FROM point of that line, `openTip` is its TO point, and `closedTip` is the indicated endpoint of the cubic. Neither independently dimensioned pivot hardware nor a complete closed-leaf contour is established. Small independently rounded differences are retained.

All leaf records below are **item 0** of the named original paths:

| Pair / leaf | Open line path | Cubic path / closed endpoint | Hinge (x, y), PDF pt | Open tip (x, y), PDF pt | Closed tip (x, y), PDF pt |
| --- | ---: | --- | --- | --- | --- |
| `page-upper-left` / left | **48818** | **48820 / TO** | (227.185898, 485.466919) | (227.185898, 490.907928) | (232.626892, 485.466278) |
| `page-upper-left` / right | **48819** | **48821 / FROM** | (238.067795, 485.466919) | (238.067795, 490.907928) | (232.626099, 485.466919) |
| `page-upper-right` / left | **48829** | **48831 / TO** | (249.874695, 485.466919) | (249.874695, 490.907928) | (255.316696, 485.466278) |
| `page-upper-right` / right | **48830** | **48832 / FROM** | (260.756714, 485.466919) | (260.756714, 490.907928) | (255.316498, 485.466919) |
| `page-lower-left` / left | **48873** | **48871 / TO** | (227.176498, 505.243195) | (227.176498, 510.684204) | (232.617493, 505.242493) |
| `page-lower-left` / right | **48872** | **48870 / FROM** | (238.057098, 505.243195) | (238.057098, 510.684204) | (232.616898, 505.243195) |
| `page-lower-right` / left | **48865** | **48863 / TO** | (249.885406, 505.243195) | (249.885406, 510.684204) | (255.326401, 505.242493) |
| `page-lower-right` / right | **48864** | **48862 / FROM** | (260.767303, 505.243195) | (260.767303, 510.684204) | (255.325699, 505.243195) |

The maximum paired line/cubic open-end discrepancy is **0.000793457031250 pt**. The four pairs' closed cubic endpoints differ by **0.001019944761174, 0.000670866331085, 0.000920220110066, 0.000992642576129 pt**, in the table's pair order. None is averaged, merged, or corrected. These are PDF diagram discrepancies, not physical clearances.

### Native baselines and threshold limits

There is **no independent threshold/baseline stroke across either upper-row paired opening** in the retained native structural inventory. Their `nativeFacadeBaseline` is explicitly `null`; drawing an upper-row sill would add geometry to the evidence.

The lower pairs share the single continuous pale facade baseline **13443 / 0**, from `[269.67620849609375, 505.597900390625]` to `[226.80419921875, 505.597900390625]`. It continues behind multiple facade elements and is retained whole in both semantic references to that same source item. It is not split into invented pair thresholds. The lower stair doorway likewise has context baseline **13441 / 0**, from `[331.5270080566406, 516.0244750976562]` to `[268.3600158691406, 516.0244750976562]`; this is an entire wall/facade run, not a measured sill. Pale context paths **13440-13448** are all retained.

### Eight paired jambs

Each jamb retains its native black fill polygon and all four independently drawn perimeter strokes. Every edge path below is **item 0**; every fill retains **all** of its original items.

| Pair / jamb side | Original fill path / items | Original four perimeter edge paths |
| --- | --- | --- |
| `page-upper-left-left-jamb` | **52431 / 0-4** | **54370-54373** |
| `page-upper-left-right-jamb` | **52427 / 0-4** | **54366-54369** |
| `page-upper-right-left-jamb` | **52421 / 0-4** | **54362-54365** |
| `page-upper-right-right-jamb` | **52417 / 0-4** | **54358-54361** |
| `page-lower-left-left-jamb` | **52432 / 0-5** | **54347-54350** |
| `page-lower-left-right-jamb` | **52426 / 0-5** | **54343-54346** |
| `page-lower-right-left-jamb` | **52420 / 0-5** | **54339-54342** |
| `page-lower-right-right-jamb` | **52416 / 0-5** | **54335-54338** |

The jambs' native stroke and fill silhouettes differ slightly. Leaf origins also do not necessarily fall exactly on the independently drawn jamb boundary. Those distinctions are source evidence and are retained without alignment adjustments.

### Adjoining stair doors

Two single-door symbols belong to the adjoining stair enclosure. They are exported separately from the four vestibule pairs and are not added to the paired-opening count.

| Door | Primary open edge | Complete open contour | Swing cubic / closed endpoint | Hinge (x, y), PDF pt | Primary open tip (x, y), PDF pt | Closed cubic tip (x, y), PDF pt |
| --- | --- | --- | --- | --- | --- | --- |
| `stair-page-upper` | **48810 / 0** | **48810-48813 / item 0 each** | **48814 / TO** | (278.632599, 486.599792) | (277.710602, 493.152802) | (285.231506, 486.020996) |
| `stair-page-lower` | **48874 / 0** | **48874 / item 0 each** | **48875 / TO** | (275.547913, 515.358887) | (275.547913, 521.976868) | (282.167908, 515.359009) |

The upper stair door's original contour is **four independent lines 48810-48813**, not the single-edge paired-leaf convention. Its cubic **48814 / 0** is also different: gray RGB `0.3019913136959076`, stroke width **`0.0949999988079071` pt**, whereas the paired strokes and four contour lines use **`0.10199999809265137` pt**. The complete upper stair cubic is:

```text
c [277.9855041503906, 493.19000244140625]
  [283.3684997558594, 493.7200012207031]
  [285.7015075683594, 491.4110107421875]
  [285.23150634765625, 486.02099609375]
```

It joins the other side of the drawn open contour, near the FROM point of **48812 / 0** `[277.9855041503906, 493.19140625]`. The difference there is **0.00140380859375 pt**. Its separation from the primary edge's tip is **0.2774080165091509 pt**; that is a native drawn contour distinction, not a replacement physical leaf thickness. `curveOpenTip` stays separate from `openTip`. The upper stair curve is not idealized to a circle or a perpendicular closed position.

The lower stair door retains line **48874 / 0** and cubic **48875 / 0**. Upper stair jamb edges are **53975-53982 / item 0 each**. Lower stair jamb edges are **54060-54063** and **54132-54135 / item 0 each**; lower jamb fills **52405** and **52410** are retained among the opaque fills. No separately specified hinge hardware, sill section, or leaf dimension follows from these symbols.

### Walls, opaque patches, and adjacent glazing

All **33 opaque black fill paths / 34 explicitly closed native contours** remain in the module. The largest compound wall path, **52373**, has **71 original line items** in **two separate closed subpaths**, items **0-10** and **11-70**. A consumer must preserve the native discontinuity between items 10 and 11. Other principal enclosure fills are **52407** (26 items), **52437** (32 items), and **52443** (34 items). The smaller overlapping fragments and patches remain as independent original paths; none is consolidated into a simplified footprint.

The native fill style has `closePath: false`, `even_odd: false`, black fill, and `fill_opacity: 1`. This flag does not imply an open painted polygon: the retained endpoint sequences close each native contour, and fill painting itself closes a subpath. The original flag and all closing endpoint items survive unchanged.

Eleven complete adjacent narrow panel outlines are retained: the six vestibule panels plus five adjoining facade/return panels. Their treatment as glazing follows their conventional narrow framed plan symbols; no glazing product or section is specified. Each named edge path below retains **item 0**, including independently rounded corner joins:

| Panel context | Four original edge paths |
| --- | --- |
| `page-upper-left` | **49302-49305** |
| `page-upper-between-pairs` | **49298-49301** |
| `page-upper-right` | **49278-49279, 49296-49297** |
| `page-lower-left` | **49194-49197** |
| `page-lower-between-pairs` | **49414-49417** |
| `page-lower-right` | **49410-49413** |
| `stair-page-right-near` | **49325-49328** |
| `stair-page-right-far` | **49292-49295** |
| `stair-page-right-return` | **49329-49332** |
| `vestibule-page-left-upper-return` | **49268-49271** |
| `vestibule-page-left-exterior` | **49441-49444** |

These panels contribute **44 edge strokes**. Other narrow wall details remain in the raw ledger with their original gray style rather than being assigned an unsupported material or function. The opaque outside corner jamb **52363** and its four strokes **54156-54159** complete the immediately adjoining slanted return panel. Nearby column symbols, paving joints, stair treads/rails, and remote facade segments appear in context replay but are not exported as this door/wall/glazing trace.

## Exact raw path inventory

The module retains **304 original paths / 617 original items**, comprising **607 lines and 10 cubics**. All selected paths are retained in full, with original bounds, sequence, style, and original item numbering. Range notation below includes every original path index between its endpoints; gaps are explicitly separated. Full item identities and full coordinates are in `LOBBY_SOUTH_DOOR_SOURCE_PATHS`.

| Native style group | Path count | Original path indices |
| --- | ---: | --- |
| `facade-baseline` | 9 | 13440-13448 |
| `door-symbol` | 22 | 48810-48813, 48818-48821, 48829-48832, 48862-48865, 48870-48875 |
| `stair-upper-swing` | 1 | 48814 |
| `glazing-detail` | 80 | 49194-49197, 49268-49271, 49278-49279, 49292-49305, 49325-49332, 49410-49417, 49441-49444, 52738-52741, 53079-53082, 53321-53348 |
| `opaque-fill` | 33 | 52363, 52366, 52373, 52375-52376, 52379-52380, 52405, 52407-52414, 52416-52417, 52420-52421, 52426-52427, 52431-52432, 52437, 52441-52447, 52450 |
| `frame-detail` | 83 | 53975-53982, 54060-54063, 54132-54135, 54156-54159, 54333-54378, 54383, 54430-54433, 54690-54693, 54779-54786 |
| `wall-edge` | 76 | 55122-55125, 55134-55136, 55226-55227, 55312-55314, 55565-55603, 55617-55619, 55806-55811, 55815-55820, 56036, 56146-56147, 56298-56304 |

All source gray glazing/detail strokes have RGB `0.3019913136959076` and width `0.06800000369548798` pt. Black frame detail strokes use that same native width; black wall edge strokes use `0.33899998664855957` pt. Pale facade baseline strokes have RGB `0.6000000238418579` and width `0.06800000369548798` pt. These widths are original PDF paint values and are not building member dimensions. Original caps, joins, dashes, opacity, fill rule, and closure flag are also compared exactly.

## Annotation recovery, replay, and validation

The red stair icon is original drawing **56631**, sequence **56636**, **items 0-43**, native bounds `[295.7200012207031, 493.28961181640625, 317.7200012207031, 511.5986022949219]`. It is a filled/stroked colored page drawing, not a `/Annots` object; this page has no PDF annotation objects. It overlaps stair detail, and does not obscure the eight paired leaf/swing symbols or the two stair-door symbols. Its underlying detail was recovered only by replaying native source vectors while omitting that identified colored drawing. No image inpainting, line extrapolation, or invented replacement geometry was used.

All scratch outputs and scripts use **`/tmp/iribe-reference/lobby-south-*`**. The PDF was read only and never re-saved. Source review included original full-page and crop PNGs and an independent Poppler rendering of original page 7 (`pdftoppm -f 7 -l 7 -r 144 -png -singlefile`). Poppler emitted two `Invalid Font Weight` warnings; the drawing rendered and was visually inspected.

Reproducible evidence:

- `lobby-south-inspect.py`, `lobby-south-analyze.py`, and `lobby-south-select.py`: original extraction, expanded context inventory, native structural selection, and replay. `lobby-south-region-drawings.json` retains original records in the expanded inspection bounds; `lobby-south-selected-paths.json` retains the complete selected source records. `lobby-south-replay-manifest.json` preserves original region and selected identities.
- `lobby-south-source-full.png`, `lobby-south-source-detail.png`, `lobby-south-vestibule-context.png`, and `lobby-south-poppler-page.png`: original unmodified visual evidence. `lobby-south-vector-replay.png` recovers underlying vectors with only original colored drawing 56631 omitted from the selected context.
- `lobby-south-export.mjs`, `lobby-south-module.mjs`, and `lobby-south-module-exports.json`: evaluation of the actual final TypeScript module. `lobby-south-fraction-conversions.json` records each exact rational conversion required by ESLint.
- `lobby-south-validate.py`, `lobby-south-validation.json`, and `lobby-south-measurements.json`: exact original-vs-export checks for every coordinate, cubic control, bound, sequence, paint style, and path/item reference; hinge/open/closed endpoint checks; full native command-point completeness scans; opaque contour/subpath audit.
- `lobby-south-authority-structure-replay.png` and `lobby-south-ledger-replay.png`: independently selected original structure and actual exported structure replayed at original coordinates on fresh in-memory **576 x 576 pages**. In native rectangle **`[203, 474, 351, 523]`**, at **24 pixels/pt**, both **3552 x 1176** images have **zero changed pixels**. The entire selected structure is visible in this comparison rectangle.
- `lobby-south-authority-context-replay.png` and `lobby-south-ledger-context-replay.png`: **1,119 original context paths** replayed in original paint order, with the exports substituted into their original paint slots for the second image. At **12 pixels/pt**, inspection rectangle `[203, 462, 354, 529]` produces **1812 x 804** images with **zero changed pixels**. Unexported context remains original source evidence in this check.
- `lobby-south-ledger-labeled.png`: visually inspected final-export diagnostic with blue original paired leaf lines, green original paired swing cubics, red interpreted hinge origins, and magenta original stair swings. Diagnostic colors/labels are not source data.

The independent structural completeness scan includes **281 original dark structural paths** whose **every command point** lies inside `[210, 480, 347, 523]`, plus complete adjacent panel edge sets, outside jamb 52363/54156-54159, and pale facade context 13440-13448. The equality check requires exactly the union of those original sets. Using command points rather than rectangle intersection avoids dropping vertical or horizontal leaf lines with degenerate bounds. A separate original-page door-symbol scan finds exactly the retained **eight paired lines + eight paired cubics** in `[226, 484, 262, 512]`. Thus the replay/completeness claim concerns the documented structure and panel scope; it does not claim that paving, columns, and staircase detail were exported.

The final standalone module passed strict TypeScript checking (`tsc --noEmit --strict --target ES2022 --module ESNext --moduleResolution bundler --skipLibCheck`) and focused ESLint. The final evaluated export still matches the original PDF hash and exact native values. Pixel equality is a check under the same replay renderer; it is not a proof of surveyed building dimensions or equivalence between PDF render engines.

The workspace hash audit (`lobby-south-workspace-audit.json`) compared **441 existing files** and found **no removed files**. Eight existing application files changed concurrently, and the parent added `lobby-canopy-layout.ts` and `lobby-canopy.ts`. This task did not write those paths or restore earlier contents. Its only authored checkout outputs are the trace module and this note; all scratch files use the required south-task prefix.

## Evidence gaps and integration limits

The source proves the plan-symbol topology, native drawn leaf lines/contour, cubic swings and closed endpoints, distinct jamb silhouettes, opaque wall polygons, and adjoining narrow panel outlines. Hinge locations, room-side interpretation, and treatment of narrow panels as glazing follow those plan symbols and context. They are not separately dimensioned hardware or product specifications.

The guide does not establish an as-built/current configuration, surveyed clear opening, physical leaf width/thickness, frame member depth/profile, sill construction, glass makeup, material/finish, door height, wall height, elevations, opening automation, operational state, or other vertical dimensions. The source drawing's stroke widths are not physical wall or leaf widths. The upper row has no independent native threshold line; the lower row and lower stair door have continuous facade context lines instead of separately drawn sills. Any 3D geometry beyond the retained evidence needs an explicit later modeling choice or another authority. The ledger marks `physicalDimensionsEstablished: false` and `pairedClosedLeafEdgeIsDrawn: false`.
