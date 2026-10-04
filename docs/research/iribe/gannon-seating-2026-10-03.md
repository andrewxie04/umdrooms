# Gannon seating and tier source pass - 2026-10-03

The bounded furniture/tier trace is complete in `rooms-redesign/src/components/interior/iribe/gannon-seating-trace.ts`. Original guide page index 6 contains **97 student chair symbols, one presenter chair, 18 shared student desks and one presenter desk**. Student desks form six rows across three banks. Three aligned sets of drawn tier boundary details, six aisle-crossing rectangles and the southeast step cross-sections are retained. No tier elevation datum is supplied.

The two new files authored for this pass are the trace above and this repository-root `docs/research/iribe/gannon-seating-2026-10-03.md`. The existing ground trace and its note supplied room/boundary context only. No fitted `gannonSeats`, `groundPlan` or inverse wayfinding coordinates supplied furniture data. Runtime geometry, controls and existing files were not edited; no user browser, commit, push or goal tools were used.

## Primary source and room assignment

- [Original HDR / UMD guide](https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf): local `/tmp/iribe-reference/guide.pdf`, SHA256 `c1fe539a56ba3b97b7b1dcb2d4563792892294a59caeaa476f67ec810fcf7474`. Page **zero-based index 6**, seventh PDF page, **576 x 576 PDF points**, top-left origin, +X right, +Y down. Extraction: PyMuPDF 1.28.2 `Page.get_drawings()`, **56,651 original paths**. Drawing indices and item indices refer to this complete, unfiltered list. Paint `seqno` is separately retained.
- [Official UMD IRB 0318 room drawing](https://www.cs.umd.edu/sites/default/files/images/floorplans/irb_0318_floorplan.png): supplied local `/tmp/iribe-gannon-2026-10-03/official-irb-0318.png`, verified SHA256 `3d23cb7c9e9c72dba86d36c6487d9056d44a3eb757c1cd7d9118a7c7525e0ef7`. Visually inspected: **IRB 0318**, **Occupancy (100)** and **LARGE TIERED COLLABORATIVE CLASSROOM / 0318**. Its six fanned desk rows, curved corner, oblique front ends, adjoining rear door pairs and rear-corner steps identify the small furnished enclosure in the guide after a quarter turn.
- Existing source-only context: `rooms-redesign/src/components/interior/iribe/gannon-ground-trace.ts`, `rooms-redesign/docs/research/iribe/gannon-ground-source-2026-10-03.md`, and `/tmp/iribe-gannon-2026-10-03/overlay-context.png`. These were read/inspected without edits. The nominal source enclosure is x=330..412, y=89..213; complete nearby step commands can extend slightly beyond these bounds.

The official occupancy of 100 is metadata, not a target for the trace. The official drawing shows eight chairs at the rear center desk and four separate presentation-area chairs. The guide shows five at that rear center desk and no corresponding four standalone chairs. The presenter chair is present in both. This pass preserves the guide's actual symbols and does not reconcile the two drawings by adding seats. Present-day configuration and the reason for the drawing differences are unresolved.

## Compact consumer contract

| Export | Use |
| --- | --- |
| `GANNON_SEATING_CHAIRS` | 98 records with stable source-derived ID, role, bank, row, shared desk ID, derived native `centerPt`, native unit `facingPdf`, midpoint derivation refs and all supporting path IDs. Filter `role === 'student'` for the 97 student symbols. |
| `GANNON_SEATING_TABLES` | 19 physical desk groups. Each has one actual continuous outline edge reference, the complete fragmented native desk outline including repeated paint, and the associated chair IDs. Create one shared desk per record. |
| `GANNON_SEATING_ROWS` | Six front-to-rear row assignments, three desk IDs per row and the actual student count. Row order describes the plan, not height. |
| `GANNON_SEATING_TIER_BOUNDARIES` | Three sets of explicit source references across the north end, north aisle, shared desk edges, south aisle and south end. These are interrupted native strokes, not closed platform polygons. |
| `GANNON_SEATING_SOUTHEAST_STEPS` | Four native cross-sections, three parallel cross-section details, both side rail groups and the three drawn plan bands. Shares the parent ground opening ID. |
| `GANNON_SEATING_AISLE_TOPOLOGY` | Observed front, two bank aisles and rear circulation adjacency; native aisle-detail refs and parent opening IDs. No navigation polygon or verified accessible route. |
| `GANNON_SEATING_NATIVE_PATHS` / `NATIVE_STYLES` | Full immutable geometric support, isolated at the end of the module. Small consumer records reference these by original drawing identity. |
| `GANNON_SEATING_PROVENANCE` | Source hashes, coordinate contract, derivation, counts and unresolved elevation datum. |

A native path uses the compact tuple `[pathIndex, seqno, boundsPt, styleIndex, commands]`. `commands[itemIndex]` retains the **original item index** because every selected path is retained in full. A command is `['l', from, to]` or `['c', from, control1, control2, to]`. Coordinates, controls and bounds retain exact round-trip decimal representations of the source binary floats. Two exact styles retain type, color/fill, width, closePath, fill rule, cap/join, dashes, opacity and layer. No source coordinates were rounded, snapped, fitted or regenerated from a chair template.

Build a lookup keyed by tuple element 0 when native support is needed. Replay complete paths in `(seqno, pathIndex)` order using their original styles. Duplicate PDF strokes are evidence of paint, not extra desks/chairs. The supporting ledger is about 657 KiB; consumer chair/table records are separate exports and do not embed repeated chair command geometry.

An eventual consumer registers native points through the parent's Ground guide transform once. For facing, map `centerPt` and `centerPt + facingPdf`, subtract the mapped points, then normalize in the consumer's plan axes. Map cubic controls as well as endpoints when consuming desk/tier geometry. PDF directions use +Y down and must not be copied directly into a world yaw without that registration. Physical chair models, heights and elevations remain explicit consumer estimates.

## Chair derivation and actual rows

Every student chair is an independently connected source symbol with **18 native paths / 20 commands**. A tolerance of 0.003 PDF pt was used only to identify endpoint-connected ownership; the exported coordinates are unchanged. The 97 front edges are approximately 1.413..1.415 PDF pt long. Each symbol has one distinct long bowed back cubic, approximately 2.516 pt between endpoints. These identify front and back without a fitted seat grid.

For each chair, evaluate its `frontMidpointRef` and `backMidpointRef` at the exported native parameter t=0.5. Let these points be F and B:

```text
centerPt = (F + B) / 2
facingPdf = (F - B) / length(F - B)
```

For a cubic, evaluate the Bezier at t=0.5; averaging cubic endpoints would lose its outward bow. `centerPt` is a **derived 2D symbol placement**, not an original command vertex or a measured physical chair center. The facing vectors preserve individual source variation. Center-bank student chairs face page-left; north-bank chairs face page-left/down, and south-bank chairs page-left/up. The side-bank fan angle is approximately **22.71 degrees** from page-left, derived from the actual drawing. The presenter chair faces page-right toward the students.

Representative identities:

| Symbol | Native front/back derivation | Full support |
| --- | --- | --- |
| Student `gannon-chair-40341` | straight front 40341.0; bowed back 40318.0 | 18 complete original paths, individually listed in its record |
| Angled student `gannon-chair-40449` | straight front 40449.0; its own back ref and complete symbol retained | 18 complete original paths; no translated exemplar |
| Presenter `gannon-presenter-chair-42895` | front cubic 42895.0; outer back cubic 42894.0 | 42854..42895, including two detached interior detail lines |
| Presenter desk | continuous edge 42898.0 | 42896..42907, including duplicated native outline paint |

Banks are named by original page position. Row 0 is closest to the presentation area on page-left, and row 5 is at the rear on page-right. Within each bank/row, records are ordered by native Y for convenience; the ID preserves the individual source identity.

| Row | North bank | Center bank | South bank | Student total |
| --- | ---: | ---: | ---: | ---: |
| 0 | 3 | 8 | 3 | 14 |
| 1 | 4 | 8 | 4 | 16 |
| 2 | 5 | 8 | 5 | 18 |
| 3 | 5 | 8 | 5 | 18 |
| 4 | 5 | 8 | 5 | 18 |
| 5 | 4 | 5 | 4 | 13 |
| Total | 26 | 45 | 26 | **97** |

The presenter is separate from these totals. All 2,578 selected furniture paths belong to exactly one chair or shared desk group: 1,746 student chair paths, 42 presenter chair paths, 778 student desk paths and 12 presenter desk paths. Desk frames commonly contain two native copies of seven connected frame pieces, plus separately painted fragmented chair-side edges. The retained gaps and round corners matter; the desk records do not silently replace these outlines with exact rectangles.

## Tier boundary evidence and aisle topology

The original plan has two open gaps between the three desk banks, crossed by three short rectangle details in each gap. Continuous desk edges align with those details at rows **0, 2 and 4**. The grouping into three boundary sets is a plan interpretation supported by these alignments and the matching end returns; it is not documentation of three riser heights, a tier count or a level datum.

| Boundary set | Shared desk continuous edges: north / center / south | Native aisle and end evidence |
| --- | --- | --- |
| Front, row 0 | 45950.0 / 46299.0 / 45809.0 | North aisle rectangle 50579..50582; south 50583..50586. Front north end returns 50233..50238; south 49806..49812. |
| Middle, row 2 | 40650.0 / 42838.0 / 45349.0 | North 50570..50573 + 50587; south 50574..50577 + 50588. North outer return 50388..50397 + 50603..50604 and cap strokes 52121..52128; south outer return/caps explicitly listed in the export. |
| Rear, row 4 | 41043.0 / 40777.0 / 45617.0 | North 50569 + 50589..50592; south 50578 + 50593..50596. North outer return 50239..50249 + 50597..50598 with cap strokes 52115..52120; south outer return/caps explicitly listed in the export. |

The center-bank boundary edges are near x=351.4648, 368.4844 and 385.5042. The north aisle detail spans y approximately 128.0744..134.3776; middle/rear left edges continue to the center desk edge near y=136.1234. The south details lie approximately y=173.8466..180.1498, with left edges continuing back to the center desk near y=172.0999. These are source plan positions, not measured clear widths. The north/south end returns and small endpoint discrepancies remain unchanged. Each aligned desk edge is referenced by its existing native identity; a consumer should avoid duplicating it as a separate furniture edge or continuous solid wall.

`AISLE_TOPOLOGY` records the visible connections from the open front presentation space through each bank gap to rear circulation. Rear circulation borders the two east door pairs. The parent ground framework owns those doors and the room boundary. This pass supplies no wall/door framework or collision polygon. Short rectangle outlines crossing an aisle should remain recognizable step/tier details whose 3D construction and accessibility are unresolved.

The southeast open step group retains section strokes **50527.0, 50537.0, 50534.0 and 50524.0** in native order, delimiting three bands. Parallel details **50540.0, 50546.0 and 50543.0**, local pieces 50523..50547 and rails 51979..51993 are retained in full. These are the same source identities as the parent `gannon-southeast-open-steps`; deduplicate them during integration. The short adjoining wall return, black foot and white mask belong to the parent boundary ledger. The selected furniture/step replay omits that wall paint, so rail ends can appear less clipped than in the complete original. No rise, travel direction, landing level, public access status or invented datum is assigned.

## Runtime handoff: native edge endpoints

Use `CHAIRS` directly for the replacement placements and `TABLES` for the 18 shared student desks. These are the evaluated source desk-edge endpoints below; the retained full outlines include all other sides, tiny gaps and native corner cubics. Source travel is preserved and need not be clockwise. Row order is front/page-left to rear/page-right; all three banks share that order. Parent door traversal work can use these furniture groups without any new room boundary or elevation assumption.

| Row | Bank | Continuous edge identity | Native from -> to, PDF pt |
| --- | --- | --- | --- |
| 0 | north | 45950.0 | `[345.52301025390625, 113.87539672851562]` -> `[351.23699951171875, 127.5313949584961]` |
| 0 | center | 46299.0 | `[351.4648132324219, 136.12429809570312]` -> `[351.4648132324219, 172.1002960205078]` |
| 0 | south | 45809.0 | `[345.52301025390625, 194.34869384765625]` -> `[351.23699951171875, 180.69268798828125]` |
| 1 | north | 40413.0 | `[352.50360107421875, 110.95419311523438]` -> `[359.5325927734375, 127.7481918334961]` |
| 1 | center | 46083.0 | `[359.0356140136719, 136.12429809570312]` -> `[359.0356140136719, 172.1002960205078]` |
| 1 | south | 45241.0 | `[352.50360107421875, 197.26998901367188]` -> `[359.5325927734375, 180.47598266601562]` |
| 2 | north | 40650.0 | `[359.3042907714844, 106.13790893554688]` -> `[368.2862854003906, 127.60191345214844]` |
| 2 | center | 42838.0 | `[368.4844055175781, 136.12429809570312]` -> `[368.4844055175781, 172.1002960205078]` |
| 2 | south | 45349.0 | `[359.3042907714844, 202.085693359375]` -> `[368.2862854003906, 180.62168884277344]` |
| 3 | north | 40821.0 | `[367.50250244140625, 106.13259887695312]` -> `[376.4844970703125, 127.59660339355469]` |
| 3 | center | 41169.0 | `[376.0553894042969, 136.12429809570312]` -> `[376.0553894042969, 172.1002960205078]` |
| 3 | south | 45482.0 | `[367.52899169921875, 202.01031494140625]` -> `[376.510986328125, 180.5463104248047]` |
| 4 | north | 41043.0 | `[376.32391357421875, 106.13650512695312]` -> `[385.305908203125, 127.60050964355469]` |
| 4 | center | 40777.0 | `[385.50421142578125, 136.12429809570312]` -> `[385.50421142578125, 172.1002960205078]` |
| 4 | south | 45617.0 | `[376.2922058105469, 202.16119384765625]` -> `[385.2742004394531, 180.6971893310547]` |
| 5 | north | 42275.0 | `[384.5209045410156, 106.13650512695312]` -> `[393.5028991699219, 127.60050964355469]` |
| 5 | center | 40237.0 | `[393.0723876953125, 136.14691162109375]` -> `[393.0723876953125, 172.07791137695312]` |
| 5 | south | 45750.0 | `[384.5209045410156, 202.08770751953125]` -> `[393.5028991699219, 180.6237030029297]` |

The tier interface consists of the front/middle/rear sets aligned with rows 0/2/4. Each set has `northEnd`, `northAisle`, `sharedDeskEdges`, `southAisle`, `southEnd` item refs and `elevationM: null`. The topology export connects both bank aisles to front presentation and rear circulation; rear circulation references the already integrated `gannon-east-upper-pair`, `gannon-east-lower-pair` and `gannon-southeast-open-steps`. These IDs are handoff links, not duplicated opening geometry.

| Southeast section | Native from -> to, PDF pt |
| --- | --- |
| 50527.0 | `[403.3125915527344, 207.9005126953125]` -> `[395.9176025390625, 206.5965118408203]` |
| 50537.0 | `[402.9909973144531, 209.723388671875]` -> `[395.59600830078125, 208.4193878173828]` |
| 50534.0 | `[402.689208984375, 211.43060302734375]` -> `[395.2951965332031, 210.12660217285156]` |
| 50524.0 | `[402.4085998535156, 213.02191162109375]` -> `[395.01458740234375, 211.71791076660156]` |

All four section endpoints above are exact source values. The drawn three bands supply no height or elevation datum.

## Independent evaluated-export validation

The saved TS was transpiled with the installed TypeScript compiler, imported as JavaScript and serialized from its **actual evaluated exports**. A separate verifier reopened the hash-identified original PDF and used fresh `get_drawings()` values. It did not consume the builder's extracted JSON or validate numeric text with a regex.

| Check | Result |
| --- | --- |
| Native path identities, paint sequence, full bounds and every command | **2,727 paths / 2,921 commands exactly equal** |
| Line/cubic command counts | 1,746 lines / 1,175 cubics |
| Native style comparisons | **32,724 fields exactly equal**, two styles |
| Maximum native coordinate/control/bounds difference | **0 PDF pt** |
| Chair midpoint/Bezier derivations and unit directions | All **98** independently recomputed; maximum center/vector discrepancy **0** |
| Semantic item references | **352** resolved to original path/item identities |
| Fresh original student-symbol scan | **97**, exactly the exported student front-edge identities |
| Furniture ownership and chair/table/row relationships | Disjoint ownership; all 2,578 furniture paths assigned once; every chair assigned to its actual shared desk |
| Source-facing direction against shared desk edge | Perpendicular within source drawing precision; north/center/south signs and presenter reversal checked |
| Strict standalone TypeScript | Passed |
| Scoped ESLint | Passed; Babel reported only its formatting deoptimization for a source file over 500 KiB |
| Source file integrity | Original PDF remained unchanged |

Replay was generated solely from the evaluated native TS exports and their exact paint styles. Fresh original crops, replay crops and colored overlays were visually inspected at room, north tier, south tier, presenter and southeast step scales. The original native student/detail crop and official 0318 drawing were also inspected. In overlays, red centers/arrows show the derived chair placements, teal shows shared desk strokes and blue shows selected tier/step strokes. All 98 arrows fall on their own chair symbols; the presenter arrow reverses correctly. The fanned desk lengths, six short aisle rectangles, displaced outer end returns and rear center desk's five chairs match the original guide.

The replay is a selected furniture/tier drawing; room walls, columns, boards, doors and adjacent architectural paint remain visible only in the original underlay. It is not a pixel replica of the entire room. Original/replay differences at the southeast opaque foot reflect the explicitly omitted parent wall paint.

Reproducible scratch evidence is under `/tmp/iribe-gannon-seating-2026-10-03/`: `evaluate.mjs`, `evaluated-exports.json`, `verify-replay.py`, `verification.json`, and `original-*`, `replay-*`, `overlay-*` PNGs. Scratch files are optional evidence; all native commands and semantic selections needed by the parent are retained in the trace module.

## Concrete remaining limits

The original PDF establishes plan-symbol locations, directions, shared desk outlines and drawn tier/step details. Exact physical chair/table shapes, seat/desk heights, construction, materials, surveyed scale, riser heights, level differences and the occupied room's current configuration are unresolved. The recorded 97 student symbols do not assert current capacity; occupancy 100 is kept separately. Ground registration is a later consumer operation. Tier elevations and navigation/accessibility need additional documented evidence or explicit parent estimates. The three boundary sets cannot by themselves define closed tier slabs. This pass makes no new claims about the complete Ground room enclosure or neighboring Antonov volume.
