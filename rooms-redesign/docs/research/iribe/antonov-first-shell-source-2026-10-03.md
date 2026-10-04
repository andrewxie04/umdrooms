# Antonov upper shell and outdoor stair: original source ledger

Requested ledger date: 2026-10-03. Final independent checks: 2026-10-04.

## Source and scope

Original [UMD/HDR program guide](https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf), local `/tmp/iribe-reference/guide.pdf`, SHA256 `c1fe539a56ba3b97b7b1dcb2d4563792892294a59caeaa476f67ec810fcf7474`. Extraction is from freshly reopened **original guide page index 8**, the Level 1 main plan, using PyMuPDF 1.28.2 `Page.get_drawings()`. The page has 97,843 drawing records. Coordinates are PDF points in the original 576 × 576 frame, origin top left, +X right, +Y down. No metric conversion, fitted transform, or elevation is applied. The complete upper enclosure lies on index 8; index 7 was inspected for context but was not needed for selected records.

[UMD room identity](https://www.cs.umd.edu/meeting-event-request) identifies **Antonov 0324** (300 seats) and **Gannon 0318** (100 seats). This ledger traces Antonov's full upper seating enclosure shown on Level 1; it is distinct from Ground Gannon 0318. The guide's event room locator calls Antonov Ground. Those labels do not establish wall heights, stair elevations, or a doorway's physical storey connection.

Owned deliverables are this document and `src/components/interior/iribe/antonov-first-shell-trace.ts`. Architectural shell, glazing graphics, pier/parapet faces, door symbols and outdoor sections are included. Furniture and tier/aisle tracing belong to the other worker. Runtime registration and collision repair belong to the parent.

## Immutable export contract

All 19 `ANTONOV_FIRST_SHELL_*` exports are readonly literals and recursively frozen at runtime. `SOURCE_PATHS` contains complete commands for every selected raw path, including unselected portions of selected compound paths. Native page/path/item IDs, drawing `seqno`, bounds, paint style, line properties, opacity, layer, fill rule and close flag are retained. `SOURCE_STYLES` deduplicates unchanged native styles. Raw records retain source order; consumers must preserve that order for overlapping fills and late masks.

`ROOM_FACE_RUNS`, `OUTER_FACE_RUNS`, `STAIR_ENCLOSURE_RUNS`, `NORTHEAST_RECESS_RUNS` and the opening/section ledgers are separate semantic references into the raw records. They are not substitute raw paths. Source `t0`/`t1` intervals apply in the original command direction **before** `reverse`. Neither gap closures nor trims mutate raw commands. A cubic remains a cubic, including degenerate controls. Compound fill holes, disconnected subpaths and implicit closures must not be flattened into one endpoint polygon.

| Evidence | Count |
|---|---:|
| Complete native paths | 874 |
| Native commands | 4655 |
| Native paint styles | 9 |
| Masonry paths | 205 |
| Door symbol paths | 40 |
| Glazing outline/frame paths | 288 |
| Outdoor detail paths | 219 |
| Primary room face runs | 24 |
| Outer face families | 12 |
| Stair parapet/masonry face runs | 12 |
| Opening ledgers | 7 |
| Glazing bands | 3 |
| Primary unapplied closure candidates | 15 |
| Separate northeast recess runs | 7 |
| Separate recess closure candidates | 5 |
| Computed native intersections | 2 |

Commands comprise 2,043 lines, 2,599 cubics and 13 native rectangle commands. Path group membership can overlap; counts are not additive. Outdoor sections are 15 lower, 16 middle and 16 upper; terminal landing edges are included, so 47 is not an asserted physical tread or riser count.

## Intended ordered primary seating-room face loop

`PRIMARY_SEATING_ROOM_BOUNDARY` gives the intended order: west → northwest facets → north → northeast primary partition/jambs → east curved bands and pier ends → southeast curved mass → south tip/facet → southwest → west. Start and end are `[255.5872039794922, 201.8217010498047]`.

This is a **loop candidate assembled from native runs**, not a literal closed path in the PDF. Its 15 closure candidates remain `applied: false`. Door aperture closures are mathematical boundary candidates, not masonry to fill. The 7 northeast secondary recess runs, the south white recessed corridor and all outdoor stairs are excluded from this primary loop.

Notation: `path:item`, with inclusive command ranges; `R` reverses each selected command and lists them in traversal order, `F` keeps original direction. Every referenced command is on page index 8.

| Order | Run ID | Native selection | Traversal start → end, original PDF pt |
|---:|---|---|---|
| 1 | `west-room-facet` | `92784:15 R` | `[255.5872039794922, 201.8217010498047]` → `[255.5872039794922, 148.96670532226562]` |
| 2 | `northwest-low-facet` | `92784:14 R` | `[255.5872039794922, 148.96670532226562]` → `[259.7062072753906, 138.7397003173828]` |
| 3 | `northwest-throat` | `92782:10 R` | `[259.7069091796875, 138.74050903320312]` → `[259.8529052734375, 138.38050842285156]` |
| 4 | `northwest-mid-facet` | `92761:0 R` | `[259.8533020019531, 138.3806915283203]` → `[266.0932922363281, 122.88668823242188]` |
| 5 | `northwest-upper-facet` | `92757:16..6 R` | `[266.2130126953125, 122.60661315917969]` → `[277.8420104980469, 103.76660919189453]` |
| 6 | `northwest-shoulder` | `92732:16..12 R` | `[277.8414001464844, 103.76631164550781]` → `[325.85540771484375, 93.40531158447266]` |
| 7 | `north-room-facet` | `92669:38..34 R` | `[325.85540771484375, 93.40589141845703]` → `[376.8834228515625, 107.35289001464844]` |
| 8 | `northeast-partition-return` | `92669:33..22 R` | `[376.8834228515625, 107.35289001464844]` → `[382.66839599609375, 132.56689453125]` |
| 9 | `northeast-partition-jamb` | `92611:0 R` | `[383.41632080078125, 134.92718505859375]` → `[385.0963134765625, 140.26019287109375]` |
| 10 | `northeast-partition-end` | `92611:7..5 R` | `[385.0963134765625, 140.26019287109375]` → `[388.0963134765625, 138.83319091796875]` |
| 11 | `northeast-outer-jamb` | `97723:0 F; 97723:0 t1=0.9442469927109576` | `[394.2958984375, 138.83499145507812]` → `[395.1730902925145, 138.83499145507812]` |
| 12 | `northeast-outer-jamb-return` | `97593:109..112 F; 97593:109 t0=0.5009198120943896` | `[395.1730902925145, 138.83499145507812]` → `[395.03900146484375, 143.71070861816406]` |
| 13 | `northeast-to-east-return` | `97560:16..0 R` | `[395.0377197265625, 143.7108154296875]` → `[393.0537109375, 174.85281372070312]` |
| 14 | `east-north-pier-cross` | `97715:0 F` | `[393.0537109375, 174.85281372070312]` → `[392.8446960449219, 177.09181213378906]` |
| 15 | `east-north-pier-room-end` | `97757:0 F` | `[392.843994140625, 177.09109497070312]` → `[392.6009826660156, 179.6761016845703]` |
| 16 | `east-middle-room-band` | `97561:17..1 R; 97561:17 t1=0.46823762903706256, 97561:1 t0=0.6984892956443585` | `[392.5681408368124, 179.6761016845703]` → `[388.6446800621063, 208.51937866210935]` |
| 17 | `east-middle-pier-room-end` | `97749:0 R` | `[388.64508056640625, 208.51937866210938]` → `[388.1980895996094, 211.07638549804688]` |
| 18 | `east-middle-pier-inner-band` | `92608:0 R` | `[388.20330810546875, 211.0756072998047]` → `[387.3633117675781, 215.84860229492188]` |
| 19 | `east-south-room-band` | `97562:21..0 R` | `[387.36700439453125, 215.85049438476562]` → `[378.677001953125, 251.03250122070312]` |
| 20 | `southeast-room-curve` | `97605:0..28 F; 97605:28 t1=0.20416281078714815` | `[378.677001953125, 251.03250122070312]` → `[352.9618505942944, 279.56647444300745]` |
| 21 | `southeast-late-mask-room-face` | `97822:0 R; 97822:0 t1=0.8557654915452056` | `[352.9618505942944, 279.56647444300745]` → `[360.97601318359375, 256.322998046875]` |
| 22 | `south-tip-return` | `92647:4..2 R` | `[360.97698974609375, 256.3163757324219]` → `[350.4949951171875, 257.3833923339844]` |
| 23 | `south-room-facet` | `92784:32..25 R` | `[350.4952087402344, 257.3826904296875]` → `[281.2012023925781, 251.04969787597656]` |
| 24 | `southwest-room-facet` | `92784:24..16 R` | `[281.2012023925781, 251.04969787597656]` → `[255.5872039794922, 201.8217010498047]` |

The east-middle band is trimmed to the native pier-end Y coordinates, rather than tracing its overlap behind the pier. Its remaining XY differences stay in the closure ledger. The northeast exterior jamb line and following cubic return are trimmed at their computed native intersection; neither is rounded or extended.

### Primary closure candidates

IDs below are exported verbatim; endpoints and original source references are in `CLOSURE_CANDIDATES`. All remain unapplied.

| Candidate ID | Classification | Gap, PDF pt |
|---|---|---:|
| `northwest-low-facet--northwest-throat` | native-float-seam | 0.0010708365514845429 |
| `northwest-throat--northwest-mid-facet` | native-float-seam | 0.0004369452228783067 |
| `northwest-mid-facet--northwest-upper-facet` | unresolved-source-gap | 0.3045899455842988 |
| `northwest-upper-facet--northwest-shoulder` | native-float-seam | 0.00067901611328125 |
| `northwest-shoulder--north-room-facet` | native-float-seam | 0.000579833984375 |
| `northeast-partition-return--northeast-partition-jamb` | partition-door-symbol-gap | 2.475956963869823 |
| `northeast-partition-end--northeast-outer-jamb` | confirmed-northeast-door-aperture | 6.199585222401278 |
| `northeast-outer-jamb-return--northeast-to-east-return` | native-float-seam | 0.0012861810615775462 |
| `east-north-pier-cross--east-north-pier-room-end` | native-float-seam | 0.0010034901762364125 |
| `east-north-pier-room-end--east-middle-room-band` | native-float-seam | 0.03284182920327794 |
| `east-middle-room-band--east-middle-pier-room-end` | native-float-seam | 0.00040050429993243597 |
| `east-middle-pier-room-end--east-middle-pier-inner-band` | native-float-seam | 0.005276210373788646 |
| `east-middle-pier-inner-band--east-south-room-band` | native-float-seam | 0.00414915627468611 |
| `southeast-late-mask-room-face--south-tip-return` | native-float-seam | 0.006693931806679428 |
| `south-tip-return--south-room-facet` | native-float-seam | 0.0007336923388776433 |

### Separate northeast recess / room strip

The following seven runs form a secondary face chain between the north return and the other side of the northeast partition. They must not replace the primary northeast partition-return run or enlarge the primary seating room. No independent room identity, elevation, operating clearance or literal closed secondary polygon is established.

| Order | Secondary run | Native selection |
|---:|---|---|
| 1 | `recess-north-return` | `92669:18..12 R` |
| 2 | `recess-outer-room-strip` | `92600:39..13 R` |
| 3 | `recess-door-outer-jamb-top` | `97722:0 F` |
| 4 | `recess-door-outer-jamb-end` | `97721:0 F` |
| 5 | `recess-door-inner-jamb` | `92611:4..3 R` |
| 6 | `recess-partition-east-jamb` | `92611:2 R` |
| 7 | `recess-partition-east-face` | `92669:20..19 R` |

| Secondary closure candidate ID | Classification | Gap, PDF pt |
|---|---|---:|
| `secondary-recess-north-return--recess-outer-room-strip` | native-float-seam | 0.03915524202177379 |
| `secondary-recess-outer-room-strip--recess-door-outer-jamb-top` | native-float-seam | 0.0064151005259272765 |
| `secondary-recess-door-outer-jamb-top--recess-door-outer-jamb-end` | native-float-seam | 0.000701904296875 |
| `secondary-recess-door-outer-jamb-end--recess-door-inner-jamb` | secondary-door-or-partition-gap | 6.199585045231591 |
| `secondary-recess-partition-east-jamb--recess-partition-east-face` | secondary-door-or-partition-gap | 2.4877485673739956 |

## Southeast compound mass: source branch resolved

The apparent diagonal beside the south white corridor is **not** a source line from the south facet endpoint near `[350.5,257.4]` to the lower curved band. The late black compound fill is path **97822**, seqno 97822, style 5, bounds `[338.9670104980469,256.322998046875,360.97601318359375,285.156982421875]`. Its complete native command sequence is:

```json
[["c",[360.97601318359375,256.322998046875],[360.97601318359375,256.322998046875],[355.6090087890625,278.0329895019531],[350.9020080566406,282.4339904785156]],["c",[350.9020080566406,282.4339904785156],[347.99200439453125,285.156982421875],[343.0340270996094,284.60198974609375],[343.0340270996094,284.60198974609375]],["l",[343.0340270996094,284.60198974609375],[338.9670104980469,262.5019836425781]],["l",[338.9670104980469,262.5019836425781],[360.97601318359375,256.322998046875]]]
```

Command **97822:0** is the seating-facing cubic. Command **97822:2** is the distinct straight corridor-side face `[343.0340270996094,284.60198974609375]` → `[338.9670104980469,262.5019836425781]`. Command 1 completes the lower rounded tip; command 3 returns along the top of the mass. Those latter portions remain raw evidence but are not all on the selected primary room face.

The primary southeast traversal uses **97605:0..28 F** with command 28 trimmed at `t1=0.20416281078714815`, followed by **97822:0 R**, trimmed in source direction at `t1=0.8557654915452056`. Their computed intersection is `[352.96185059429445,279.5664744430075]`; the other curve evaluation differs by only `8.038873388460929e-14` PDF pt. This point is a computed intersection of unchanged original cubics, not a native recorded vertex. Follow with **92647:4..2 R**, then **92784:32..25 R** and **92784:24..16 R**. South-tip endpoint `[350.4949951171875,257.3833923339844]` meets the original south facet through a separately listed float seam.

This replaces the earlier 27.465379 pt `southeast-compound-mask-unresolved` jump with native branches and documented small seams. **The plan branch is resolved; the mass's vertical assignment as wall, parapet, projected volume or floor remains unknown.** The white recessed corridor and its transverse doors stay outside the primary seating loop.

The second computed intersection is **97723:0**, `t=0.9442469927109576`, with **97593:109**, `t=0.5009198120943896`, at `[395.1730902925145,138.83499145507812]`, residual 0. Both computed intersection records are exported with their exact source references.

## Native outer and stair enclosure face families

These are architectural face families, not one ordered closed outer polygon. Complete compound raw fills carry the enclosure and paint topology. Do not concatenate all outer or parapet runs into one polygon or treat overlapping masks as extra walls.

| Family | Run | Source selection |
|---|---|---|
| outer: outer-shell-face | `north-shell-outer-crown` | `92720:0..8 F` |
| outer: outer-shell-face | `northeast-shell-outer-return` | `92583:2..9 F` |
| outer: outer-shell-end | `northeast-shell-terminal` | `92583:10..19 F` |
| outer: outer-shell-face | `east-shell-north-band-outer` | `97573:0..16 F` |
| outer: outer-shell-face | `east-shell-middle-band-outer` | `97572:0..19 F` |
| outer: outer-shell-face | `east-shell-south-band-outer` | `97570:0..13 F` |
| outer: outer-shell-face | `southeast-shell-outer-curve` | `97608:41..0 R` |
| outer: later-outer-face | `south-shell-late-outer-mask` | `93139:4..6 F` |
| outer: later-inner-face | `south-shell-late-inner-mask` | `93139:0..3 F` |
| outer: shell-exterior-face | `front-south-exterior-curve` | `92784:47..57 F` |
| outer: shell-exterior-face | `front-west-outer-face` | `97414:0 R` |
| outer: shell-exterior-face | `front-west-north-curve` | `92801:0..25 F` |
| stair enclosure: parapet-terminal | `parapet-north-terminal` | `97252:0 F` |
| stair enclosure: parapet-outer-face | `parapet-upper-outside` | `97226:0..5 F` |
| stair enclosure: parapet-inner-face | `parapet-upper-stair-face` | `97563:0..33 F` |
| stair enclosure: parapet-inner-face | `parapet-middle-stair-face` | `97602:22..0 R` |
| stair enclosure: parapet-inner-face | `parapet-lower-stair-face` | `97603:47..0 R` |
| stair enclosure: parapet-inner-face | `parapet-apron-stair-face` | `97604:0..7 F` |
| stair enclosure: later-parapet-inner-face | `parapet-late-mask-inner` | `93138:5..2 R` |
| stair enclosure: parapet-terminal | `parapet-late-mask-terminal` | `93138:1 R` |
| stair enclosure: later-parapet-outer-face | `parapet-late-mask-outer` | `93138:0 R` |
| stair enclosure: earlier-parapet-outer-face | `parapet-lower-original-outer` | `92827:13..44 F` |
| stair enclosure: masonry-inner-face | `front-west-stair-masonry-inner` | `97415:0 F` |
| stair enclosure: masonry-inner-face | `front-west-lower-stair-masonry` | `97455:0 F` |

## Doors and glazing

Only the northeast exterior door has both visible leaf/swing evidence and a clear seating-room jamb aperture. Other classifications are intentionally distinct. Ends below are native jamb endpoints where available; symbol spans are explicitly labeled in the TypeScript ledger.

| Opening ID | Native endpoints, PDF pt | Evidence / limitation |
|---|---|---|
| `northeast-exterior-door` | `[388.0963134765625, 138.83319091796875]` → `[394.2958984375, 138.83499145507812]` | visible-leaf-swing-and-clear-jamb-gap;  outward-from-upper-enclosure; elevation-and-route-unresolved |
| `northeast-partition-door` | `[382.66839599609375, 132.56689453125]` → `[383.41632080078125, 134.92718505859375]` | interrupted-partition-with-short-line; door-continuation-unknown;  northeast-recess; no inferred operating-clearance |
| `outdoor-lower-landing-leaf` | `[232.18499755859375, 213.01119995117188]` → `[237.49400329589844, 213.01158142089844]` | visible-outdoor-leaf-and-swing; room-continuation-unknown; door-symbol-span; opposite-jamb-unknown outdoor-landing; continuous-inner-facet-precludes-assigned-room-door |
| `outdoor-middle-landing-gate-pair` | `[229.8686065673828, 167.59991455078125]` → `[242.8896942138672, 167.9281005859375]` | visible-transverse-paired-leaves-and-swings;  outdoor-flight-continuation; no-room-or-height-assignment |
| `south-inner-door-pair-overpaint` | `[315.1741027832031, 258.5801086425781]` → `[326.3385009765625, 258.5801086425781]` | door-symbol-with-continuous-opaque-room-face;  south-recess; aperture-not-confirmed |
| `south-recess-transverse-door-pair` | `[312.0163879394531, 270.9465026855469]` → `[311.81201171875, 282.1087951660156]` | visible-leaves-and-swings-in-open-recess;  recess-between-south-shell-bands; garden-corridor-continuation-unresolved |
| `southwest-door-symbol-overpaint` | `[276.0987854003906, 246.6885986328125]` → `[272.3761901855469, 242.52911376953125]` | door-symbol-over-continuous-inner-room-facet;  unassigned; no-runtime-cut |

The lower landing leaf has only one identified structural jamb, `92793:3`; its exported endpoint span is a symbol span, not a confirmed full room aperture. The middle landing pair is a visible outdoor gate. Neither symbol establishes an indoor route. South-inner and southwest symbols overlap continuous native room-face masonry; do not cut openings without additional evidence. The south transverse pair belongs to the white recess.

Three eastern glazing bands retain all native outlines plus black frames/mullions, 96 paths per band:

| Band | Adjacent original opaque path | Vertical aperture known |
|---|---|---|
| `east-north-glazing` | `[92591]` | false |
| `east-middle-glazing` | `[92601]` | false |
| `east-south-glazing` | `[92617]` | false |

The glazing graphics sit outside continuous curved opaque inner bands. The guide alone does not establish sill, glazing height, parapet height or full-height transparency. These upper source records do not authorize removal of genuine Ground courtyard glass.

## Outdoor crosssections and landings

`OUTDOOR_FLIGHTS` is ordered lower-page end → upper-page end within each flight. Each section retains the original fragment references, outer-side endpoint, masonry-side endpoint and any **unapplied** gaps between fragments. Full raw commands retain both edges and nearby architectural detail. The selected section orientation is for handoff, not a change to raw direction.

| Flight | Native section path order (each item 0; brackets = separate fragments of one section) |
|---|---|
| lower (15) | `92440, 87638, 87639, 87640, 87641, 87642, 87643, 87644, 87645, 87646, 87647, 87648, 87649, 87650, [86780,86791]` |
| middle (16) | `86764, 86716, [86713,86714], [86709,86711,86707,86710], [86705,86706], 86702, 86699, 86696, 86693, 86690, 86687, 86684, 86681, 86678, 86756, 86776` |
| upper (16) | `86855, 86822, 86820, 86818, 86816, 86814, 86812, 86810, 86808, 86806, 86804, 86802, 86800, 86798, 86796, 86856` |

| Critical section | Outer side, PDF pt | Masonry side, PDF pt |
|---|---|---|
| lower first, `92440:0 F` | `[247.83389282226562, 260.2266845703125]` | `[263.06988525390625, 249.606689453125]` |
| lower terminal, `86780:0 F, 86791:0 F` | `[233.8784942626953, 228.97950744628906]` | `[255.0137939453125, 221.8782958984375]` |
| middle first, `86764:0 F` | `[228.69309997558594, 202.97451782226562]` | `[245.2230987548828, 201.5775146484375]` |
| middle terminal, `86776:0 F` | `[228.46189880371094, 175.7220001220703]` | `[242.93389892578125, 175.68099975585938]` |
| upper first, `86855:0 F` | `[228.95179748535156, 160.03050231933594]` | `[243.84280395507812, 160.75149536132812]` |
| upper terminal, `86856:0 F` | `[231.6864013671875, 133.07980346679688]` | `[246.12939453125, 134.96380615234375]` |

Lower terminal fragments `86780:0` and `86791:0` have a real recorded break: `[242.89349365234375,225.95050048828125]` → `[245.40280151367188,225.1072998046875]`, gap `2.6471897052791844` pt; it is not bridged. The prior approximate lower endpoint pair `[232.950,229.900]` → `[243.820,225.850]` has no matching native command.

Landing groups:

| Landing | Native detail paths | Native section refs | Extent / elevation |
|---|---|---|
| `lower-to-middle` | `86789,86791,86792,86793,86794,85371,85372,85373,85374,92042,92044` | `86780:0 F, 86791:0 F, 86794:0 F, 86764:0 F` | elevation unknown |
| `middle-to-upper` | `85421,85422,85423,85424,85425,85431,85432,85433,85434,85435` | `86776:0 F, 86855:0 F` | elevation unknown |
| `upper-continuation` | `92810,92812,92821` | `86856:0 F` | extent unknown; elevation unknown |

The old fitted apron `[250.3,263.7]` → `[266.1,252]` and old top crosssection `[233.4,125.2]` → `[248,128.4]` have no native match. No apron rectangle or final continuation is synthesized here. No slope, metric tread depth, rise count, grade or landing height is inferred.

## Registration and unresolved assignments

Parent evidence `/tmp/iribe-reference/antonov-source-registration-probe.json` reports that applying shared original `firstGuidePlan` clears authentic Ground courtyard glazing but collides with the old fitted `ANTONOV_PLAN` at first apron and middle flight. Parent also reports Ground path54646 `[256.0085,267.1868]` → `[243.8176,276.1253]`. These are cross-storey runtime context, not upper-shell raw records in this ledger.

Register raw endpoints and controls once in the shared original Level 1 frame when replacing the old fitted upper shell. This source file imports no runtime geometry and applies neither `antonovDiagram` nor `firstGuidePlan` itself. Keep Ground glass; the parent owns coupled runtime validation.

Unresolved source issues remain explicit:

- Northwest gap `northwest-mid-facet--northwest-upper-facet` is 0.3045899455842988 pt and has no selected literal connector.
- Northeast partition interruption is 2.475956963869823 pt with a short source line, not a confirmed leaf/swing continuation. Secondary chain's related interruption is separately 2.4877485673739956 pt.
- All 15 primary and 5 secondary closure candidates remain unapplied, including the confirmed northeast exterior aperture and source float seams.
- Southeast late mask geometry is resolved in plan, but its vertical and functional assignment is unknown.
- Eastern glazing's vertical relation to the opaque curved band is unknown.
- Outdoor landing doorway's continuation, upper stair destination/extent and all stair elevations are unknown.
- South-inner and southwest door symbols over continuous masonry are conflicts, not confirmed apertures. South white recess connectivity is unassigned.

## Independent final verification

Verification consumed the **actual evaluated TypeScript exports** after transpilation, not only the Python builder's data. All 19 exports and nested arrays/objects are frozen. A separate verification process freshly reopened the original PDF and checked the SHA, every selected raw record, every control point/endpoint, complete commands, native bounds/order/IDs and every paint property. Result: **874/874 paths, 4,655/4,655 commands and 9/9 styles matched exactly**. It resolved and checked **672 semantic source references and all 20 closure candidates**, including the selected native fractions and computed intersections.

Fresh original renders, source-only native replays from evaluated exports, and semantic overlays were inspected for context, east, south, lower landing, north gate and northwest crops. Compound paths are replayed with native fill rule, rectangle direction, close flags, style and source drawing order. The final southeast overlay follows the selected cubic intersection and leaves the white south recess outside the room; the northeast recess is drawn separately. The original contextual `/tmp/iribe-reference/antonov-outdoor-p8-original.png` was not used as extraction input.

A diagnostic-only sampled candidate loop (33 samples per selected native command, documented candidate joins; no polygon exported) is valid in Shapely. All **47 native outdoor section centers are outside that candidate** in original source coordinates. This verifies the intended source separation; it does not establish runtime clearance, elevations or permission to apply all closures. Adjacent computed intersection duplicates below 1e-10 pt were removed only from that numerical diagnostic; source exports are unchanged.

Scoped strict TypeScript check passed, and scoped ESLint returned zero errors and warnings. The evidence block disables only `no-loss-of-precision` because literal source floats are preserved exactly and independently compared after actual TS evaluation. ESLint's large-file Babel formatting notice is informational.

Scratch evidence directory: `/tmp/iribe-antonov-shell-2026-10-03/`. Key files: `verification.json`, `evaluated-exports.json`, `southeast-intersection.json`, `primary-candidate-diagnostic.json`, `eslint.json`, `original-{crop}.png`, `replay-{crop}.png`, `overlay-{crop}.png`, `evaluate.mjs`, `verify.py`. Runtime and immutable raw records do not depend on these scratch files. No existing repository file, runtime module, browser state, commit or push was changed by this worker.
