# Gannon Ground source ledger - 2026-10-03

The bounded source task is complete. `src/components/interior/iribe/gannon-ground-trace.ts` is a data-only ledger for Ground registration and subsequent model work. It identifies the small furnished Gannon enclosure, its two east public door pairs, the west/front single door with a paint conflict, the southeast open stepped transition, and the adjoining east corridor / north exterior vestibule. Runtime registration, walls, furnishings, navigation, collision, elevations and the full Iribe recreation remain incomplete.

Only this note and the new trace module were authored in the repository. Existing `layout.ts`, `auditorium.ts` and `ground-guide-layout.ts` were read. Their fitted Gannon polygon and auditorium coordinates supplied no trace endpoints. No inverse transform of that polygon was used, no other repository file was edited, and no commit or push was made.

## Source identity and visual assignment

- [Original HDR / UMD guide](https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf): `/tmp/iribe-reference/guide.pdf`, SHA256 `c1fe539a56ba3b97b7b1dcb2d4563792892294a59caeaa476f67ec810fcf7474`. The traced page is **zero-based index 6**, the **seventh PDF page**, 576 x 576 PDF points. Index 5 is its west continuation. Both were rendered and inspected, including the Ground label and the west page's legend. The legend calls item 5 Antonov Auditorium; it does not label the small furnished room as Gannon.
- [UMD Meeting & Event Request](https://www.cs.umd.edu/meeting-event-request) explicitly lists IRB 0318 as Gannon Auditorium Classroom with 100 seats, and IRB 0324 as Antonov with 300. The separate [IRB 0318 room drawing](https://www.cs.umd.edu/sites/default/files/images/floorplans/irb_0318_floorplan.png), downloaded from the page and visually inspected, reads **IRB 0318**, **Occupancy (100)** and **LARGE TIERED COLLABORATIVE CLASSROOM / 0318**. Its six fanned desk rows, two adjoining rear door pairs, oblique front wall, front single door and small rear-corner steps match the small room on Ground index 6 after a quarter turn. The page's image `alt` text contains the typo IRB0138; the image title, printed number and associated room checkbox establish 0318.
- [UMD CS50 schedule](https://www.cs.umd.edu/cs50/schedule.html) identifies Gannon as Ground Floor in its location header and the Supporting Health Through Computing event. One other event detail inconsistently calls a Gannon Zoom session Antonov; that entry was not used for room assignment.
- [UMD Residential Facilities Learning Day](https://drf.umd.edu/about-us/learning-day/2026) links the [official Ground wayfinding image](https://drf.umd.edu/sites/default/files/2024-01/iribe_wayfinding_ground-01.png). A fresh HTTP fetch matches the existing `/tmp/iribe-reference/ground-wayfinding-01.png` byte for byte. The image was visually inspected: 0318 / Gannon occupies the eastern narrow portion; 0324 / Antonov is labeled to its west. The large red fills and shadows obscure and enlarge the architectural boundaries, so they support names and adjacency, not precise walls or portal endpoints. The older Iribe kiosk Ground PNG link redirects to the Iribe home page and supplied no additional plan.
- Original guide **index 8**, the Level 1 eastern auditorium sheet, was rendered and visually inspected as upper-volume context. It shows the larger, ten-row fanned seating enclosure extending substantially west of the small Ground room. This supports treating the larger auditorium envelope as Antonov context. Placement of Gannon beneath the eastern/back part of that volume is a plan-to-plan inference; this task does not establish a section, slab thickness or vertical datum.

| Inspected identity | SHA256 |
| --- | --- |
| Original guide PDF | `c1fe539a56ba3b97b7b1dcb2d4563792892294a59caeaa476f67ec810fcf7474` |
| Official IRB 0318 room PNG | `3d23cb7c9e9c72dba86d36c6487d9056d44a3eb757c1cd7d9118a7c7525e0ef7` |
| Official Ground wayfinding PNG | `c39e01ed216ca421f60d90596ba77fdeb01a6889e2a6c03b612a692f02d482d1` |

## Native ledger contract

Extraction uses **PyMuPDF 1.28.2 `guide[6].get_drawings()`**, whose original list contains **56,651 paths**. All path indices and item indices are zero based in that unfiltered list. The retained **708 paths / 1,861 commands / 12 styles** contain 1,180 lines, 672 cubics and nine rectangle commands. Each retained path is complete: original `seqno`, bounds, every item index and command, endpoints, cubic controls, rectangle orientation, color/fill, stroke width, closePath, fill rule, cap/join, dashes, stroke/fill opacity and layer are preserved. `null` means the extraction API supplied no value. The full module uses round-trip decimal representations of the original binary floats; the local precision lint exception is intentional.

Drawing index and paint sequence are different identities. The late `fs` overlay at path 52674 has its native fill/stroke behavior; later paths include sequence offsets. Do not replace `seqno` with the drawing index. Replay by source sequence and preserve white paint as well as black paint. Filled subpaths close according to PDF fill semantics even where `closePath` is false or null; separate subpaths must not be joined into one polygon.

Coordinates are unchanged original PDF points, top-left origin, +X right and +Y down. Directions below describe page positions. Inputs from a cropped raster require reversal of its offset and render scale. An eventual consumer should map **all endpoints and cubic controls** through the existing `groundGuidePlan`. That helper is an estimated column-based similarity into the existing Ground world frame, not surveyed dimensions. This module imports no runtime code and applies no registration.

A compound native path can contain Gannon walls, outer auditorium rails and neighboring partitions. Its `roles` describe retained evidence, not ownership of every item. Use the selected references in `GANNON_GROUND_ROOM_BOUNDARY_RUNS`; never convert all commands in path 52188 or 56077 into a Gannon room polygon. Small room-marker paint and corridor column context are retained for replay context, not as a replacement structural-column ledger. The selected replay does not contain every furniture, marker, site or outer auditorium paint operation.

## Inner wall and room enclosure

The small room's inner enclosure follows the oblique front wall near x=331, the north wall near y=89.65, its own northeast curve, the two east door pairs and short southeast glazing, and the south wall near y=211.63. The long separate straight partition at x=324.245 / 326.142 and the broad curved auditorium envelope are distinct source features. The fitted `layout.ts` Gannon polygon is too broad to substitute for this enclosure.

`GANNON_GROUND_ROOM_BOUNDARY_RUNS` provides fifteen clockwise runs. It preserves native discontinuities and references the room-side rail or paint edge rather than inferred wall centerlines. A sampled diagnostic enclosure with explicitly estimated junctions spans x=330.9115905761719..412.0942077636719 and y=89.64810180664062..213.02191162109375 PDF points. These bounds include frame returns and the step mouth. They are not dimensions or a claim of a single closed native polygon.

| Feature | Original identity and selection | Interpretation |
| --- | --- | --- |
| North inner wall | 56534.0; parallel fill 52188.60..63 | Inner architectural rail; the thin y=89.697/89.933 trim is separately retained. |
| Northeast small-room curve | 56538.0 reversed, then 56539.0 | Gannon's curve and oblique wall. Native paint includes 52189 and 52285; the latter fills the narrow sloping-wall strip visible in the original. |
| Tangent return | 56127.0 reversed | Short curve from the sloped wall into the room's back wall. |
| East wall above doors | 56077.101 partly selected, then 102..112 | Full 56077 has 113 cubics; its earlier broad auditorium curve is excluded from the room-side selection. |
| East frames and central opaque jamb | 54759.0, 52318.2 reversed; 52322.4 reversed | Native frame returns and opaque central paint; distinct from leaf hinges and nominal door span. |
| Lower opaque return | 52655.2, .1, .0 reversed | Later black paint defines the visible stepped return; earlier smaller jamb paint remains recorded. |
| Southeast room panes | 54077.0, 54074.0, 54070.0, 54066.0 | Four native inner rails, with all parallel frame lines/caps retained in paths 54064..54129. |
| Southeast opaque foot | 52654.5 and .4 reversed | Black foot beside the open steps. White mask 52325 is an additional, necessary paint operation. |
| Southeast step mouth and short rail | 50524.0; 51974.0 reversed | Native open cross-section and thin adjoining rail, not a solid closure. |
| South wall | 52188.92..82 reversed | Exact fill edge, including the tiny trim jog at 84..88; nearby parallel architectural strokes are retained. |
| Southwest, west and northwest room faces | 52188.81..64 reversed | Long inner face and oblique ends. The southwest stretch retains the unresolved west-door overpaint conflict. |

Representative exact native endpoints, in PDF points:

| Identity | From | To |
| --- | --- | --- |
| 56534.0 | `[336.7372131347656, 89.64810180664062]` | `[387.25421142578125, 89.64810180664062]` |
| 56538.0, original travel | `[401.1488037109375, 99.09759521484375]` | `[387.288818359375, 89.67859649658203]` |
| 56539.0 | `[401.1488037109375, 99.09759521484375]` | `[409.3048095703125, 118.58859252929688]` |
| 56127.0, original travel | `[410.7139892578125, 124.83349609375]` | `[409.2669982910156, 118.62449645996094]` |
| 50524.0 | `[402.4085998535156, 213.02191162109375]` | `[395.01458740234375, 211.71791076660156]` |

The cubic controls and exact styles are in the TS ledger; this table does not replace them.

## Entrances and public connection

The two east pairs are the complete clearly drawn leaf-and-swing entrances between the furnished Gannon room and the public east corridor. All four leaf outlines and four exact cubic swings are retained. Both pairs swing east into the corridor in the drawing. Drawn poses establish plan symbols, not current door operation, clearance, hardware or height.

| Opening export ID | Native leaf outlines / swing | Opaque/frame evidence and assignment |
| --- | --- | --- |
| `gannon-east-upper-pair` | North leaf 48964..48967, swing 48968; south leaf 48921 + 48960..48962, swing 48963 | Paint 52318, 52317, 52322 and later 52674; complete local frame lines. Gannon to public east corridor. |
| `gannon-east-lower-pair` | North leaf 48974..48977, swing 48978; south leaf 48969..48972, swing 48973 | Paint 52317, 52322, 52319 and later 52655; complete local frame lines. Gannon to public east corridor. |
| `gannon-front-west-single` | Three actually drawn leaf sides 49042..49044; swing 49045; six local frame paths | A Gannon front/side-alcove door, independently identifiable in the official 0318 image. Continuous wall fill 52188 and its rails conflict with an unobstructed opening. Public continuation is unresolved. |
| `gannon-southeast-open-steps` | Cross-sections 50527, 50537, 50534 and 50524 delimit three drawn bands; 52 local step/rail paths | Open transition beside Gannon's southeast back corner, bounded by black 52654 and white mask 52325. No leaf or swing across it. The observed connection is recorded; elevation and public access status remain unresolved. |
| `north-exterior-vestibule-inner-pair` | Leaves 48928 and 48948; swings 48926 and 48927 | Building entrance row: paint 52311, 52198, 52310, 52307. Corridor to vestibule; this is not a Gannon wall opening. |
| `north-exterior-vestibule-outer-pair` | Leaves 48901 and 48902; swings 48903 and 48904 | Building entrance row: paint 52311, 52198, 52309, 52306. Vestibule to exterior. |

Each east pair includes a `hingeSpan` whose points resolve directly to native leaf commands. The upper pair's drawn hinge endpoints are `[412.01220703125, 143.63571166992188]` and `[411.46038818359375, 154.968994140625]`; the lower pair's are `[411.4114074707031, 155.75491333007812]` and `[410.5816955566406, 167.07101440429688]`. These are leaf-derived spans, not measured clear widths. Painted wall mouths and frame returns extend beyond those hinge points; the ledger keeps these separate.

The front single door's leaf starts at `[331.9056091308594, 189.49859619140625]`, and its arc starts at `[332.97491455078125, 195.07000732421875]`. Visually, the dark sloping wall remains continuous beneath/behind the nominal mouth. The neighboring narrow compartment is bounded by native partitions. Neither the guide nor the official room crop establishes a complete route from it to the lobby. A consumer must resolve that paint/door conflict before creating a walkable west portal. No public, service or private route has been invented.

The southeast steps have matching side rails and four cross-sections. Their line style is lighter than the black room walls. The short south rail terminates at the step return; the black foot terminates the east pane line. Preserve the open transition and avoid inserting a guessed transverse wall or door. The original drawing alone cannot establish riser heights, landing level, guard construction or access controls.

`GANNON_GROUND_PUBLIC_CONNECTION` records the observed network: Gannon east door pairs -> public east corridor -> Ground lobby, and corridor -> north vestibule inner pair -> vestibule -> outer pair -> exterior. The corridor continues openly toward the lobby between the auditorium edge and the sloping east facade. Fourteen native inner facade baselines, from 49121 through 49129 via the listed descending pane sequence, carry that boundary into the lobby. They are context for adjacency, not a new complete building facade or circulation model. The southeast steps are a separate observed connection whose public access/elevation remains explicitly unresolved.

## Projected Antonov and unassigned neighbors

Retained path **52676** is a black **dashed cubic**, with dashes `[ 2.766 2.766 ] 0` and width `0.2709999978542328`. It runs from `[401.0787048339844, 250.31930541992188]` to `[419.0587158203125, 143.20130920410156]`, outside the actual Gannon glazing/door line. **52653** is the black dashed transverse line, dashes `[ 2.71 2.71 ] 0`, from `[385.385009765625, 224.13870239257812]` to `[410.239013671875, 223.9167022705078]`. **52677** is its separate short solid north termination. Original Ground visual review, the separate 0318 image and Level 1 upper-volume context support excluding these projected-volume graphics from the Ground Gannon wall perimeter and collision barriers. They do not justify a new service corridor.

The detached south swing **48786** with leaf **49010..49013** is drawn at the dashed transverse line. It has no Gannon label, is beyond the small room's south enclosure, and is retained as unassigned context. Its exact upper-volume/door ownership and elevation are unresolved. The neighboring support-block doors **48785 / 48791** and the south corner swing **49014** with leaf **49015..49018** are also unassigned. Ground wayfinding's restroom icon overlaps the south block, but it does not assign every individual small door or space. These symbols must not become extra Gannon public entrances or invented private circulation.

## Closure estimates, separate from native commands

There is no single closed native room path. `GANNON_GROUND_CLOSURE_ESTIMATES` contains **18** explicitly non-native junction proposals: fifteen between selected runs and three between the short southeast pane rails. It gives exact endpoint identities and measured source-coordinate gaps. Two proposals are virtual door thresholds; others are short junctions or step-return connections. A threshold used to close a floor footprint must remain open in wall/collision geometry.

The upper pair's virtual room-side threshold spans approximately **11.301002 PDF pt**; the lower spans **14.234391 PDF pt**. These are gaps between selected painted/frame edges, not surveyed or leaf-derived clear widths. Other nonzero run junctions range from 0.009609 to 1.425424 PDF pt; pane junctions are about 0.388 pt and contain retained native cap/mullion evidence. Review those caps before generating closure paint. The exact exported values take precedence over these rounded descriptions.

Three fractional selections are explicitly estimated while every original command remains unchanged:

| Native selection | Estimated original-travel parameter | Reason |
| --- | --- | --- |
| 56077.101 start | `t0 = 0.7094319430491403` | Y-matched handoff from short return 56127 to the overlapping long rear-wall rail; endpoint disagreement remains about 0.009609 pt. |
| 56534.0 start | `t0 = 0.00002369473139393053` | Intersect the two native NW straight rails. |
| 52188.64 stop in reversed travel | `t0 = 0.003265765765765766`, `t1 = 1` | Same NW intersection; prevents a tiny crossing when closing the diagnostic outline. |

The raw NW endpoints differ by **0.0016337596208891813 PDF pt**. Simply connecting them makes the sampled ring cross itself near `[336.738410121471, 89.64810180664062]`. The exported fractional intersection removes that diagnostic crossing without snapping or replacing either native command. The final sampled ring is valid under Shapely, but its short interpolated junctions and virtual thresholds remain consumer estimates. The west wall/door conflict is intentionally unresolved even in that diagnostic ring.

`reversed` changes travel only. `t0/t1` always refer to the original command's travel; sample from t1 down to t0 for a reversed selection. Use Bezier evaluation/subdivision for cubic fractions, not linear interpolation between cubic endpoints. Physical scale, all heights, finishes, furniture fit, operating states and current configuration remain estimates or unresolved.

## Independent export verification and visual replay

The verifier transpiled the saved TypeScript with the installed TypeScript compiler, imported the resulting JavaScript module, and serialized its actual evaluated exports. A separate Python verifier then reopened the hash-identified original PDF and compared those values to fresh `get_drawings()` output. It did not validate a builder JSON file or use a regex over TS numeric text.

| Independent check | Final result |
| --- | --- |
| Complete native paths, `seqno`, bounds and commands | 708 paths / 1,861 commands exactly equal |
| Paint/style fields across retained paths | 8,496 comparisons exactly equal, including white mask 52325 and late `fs` paint |
| Maximum endpoint/control/rectangle coordinate discrepancy | **0 PDF pt** |
| Semantic path/item references and selection fractions | 154 references resolved; fractions within [0,1] |
| Closure gap values recomputed from evaluated refs | All 18 matched |
| Diagnostic sampled enclosure after explicit NW fractional fix | Shapely valid; no closed native polygon claimed |
| Standalone strict TypeScript check / scoped ESLint | Passed |

Replay was generated **from the evaluated TS exports** in original PDF coordinates, preserving source order, all selected original commands and original paint styles. Separate overlays were painted over a freshly opened original page: teal room-side boundary, blue leaves/swings/step cross-sections and facade baselines, orange excluded projected-volume graphics. The replay and original crops were inspected visually at context scale and at enlarged east-door, front-door conflict, southeast-step and north-vestibule scales. The original page, west continuation, official room image and labeled wayfinding image were also inspected directly. No browser user tab was used.

Visual findings: the two east pairs and central opaque jamb align with the original; lower jamb overpaint 52655 remains visible; the west door arc is retained beside a continuous dark wall; southeast rails, white mask and three step bands match the original open transition; the four north vestibule leaves and four arcs align with their walls; the selected inner-room curve follows the small furnished room rather than the broad upper auditorium shell. One initially omitted native sloping-wall strip, 52285, was added after replay inspection exposed its absence; the final replay was regenerated and inspected. This is a selected-source replay, not a claim of pixel identity for the entire plan or for omitted furniture/site content.

Scratch proof is under `/tmp/iribe-gannon-2026-10-03/` and is not required by runtime. Files include `evaluate.mjs`, `evaluated.mjs`, `evaluated-exports.json`, `verify-replay.py`, `verification.json`, `original-p5.png`, `original-p6.png`, `original-level1-auditorium-context.png`, the original enlarged crops, and `replay-*` / `overlay-*` PNGs for context, east doors, front conflict, south transition and north vestibule. All source identities and semantic selections needed for reconstruction are retained in the two owned repository files; scratch outputs may be temporary.

| Final scratch proof | SHA256 |
| --- | --- |
| `verification.json` | `9a9b442106befc07ad244673a5f31c4f1ad7213876845b409cde0edbe8dba430` |
| `replay-context.png` | `ee59de456e21e1f727a3182e530dc683a34d9c786b534d63155dbf37e0ccab02` |
| `overlay-context.png` | `baa996f017ee4cca0fe13fa39f228d5fbe35b2e81ebf7d04b0c94551e3d8ee1e` |
| `replay-east-doors.png` | `785e265cae3c38169a4a09d2e7463c9223b9a8724aac28f29ced66c8ace611c2` |
| `overlay-front-conflict.png` | `a9d4230aea3a28328bef913b160fa6ab39b6e08e67e6be30b9bfc3e144fc7db5` |
| `replay-south-transition.png` | `35a3bf4e67ba2e08b79714db4a3a9d1daa9193b935caf2ba304fd08207194a90` |
| `replay-north-vestibule.png` | `5cb00f270b4936b7a72bdb1b5afbaec7bd968c10e14cc7a5053d96b3f65364f1` |

## Parent integration handoff and remaining limits

Consume `GANNON_GROUND_SOURCE_PATHS` / `SOURCE_STYLES` as immutable evidence; use `ROOM_BOUNDARY_RUNS` for source-side enclosure selection, `OPENINGS` for leaf/swing/jamb assignment, `PUBLIC_CONNECTION` for observed adjacency, and `CLOSURE_ESTIMATES` / `ASSIGNMENT_LIMITS` for integration decisions. Register once through the existing Ground guide helper. Shared native north vestibule / facade / column identities should be deduplicated against existing ledgers; their inclusion here authorizes no duplicate runtime geometry.

Ground integration can proceed with the two confirmed east door pairs and the observed corridor / lobby / exterior vestibule network. Keep the west/front portal gated on resolution of its continuous wall paint and destination; keep the southeast transition's access and elevation unresolved until the parent chooses a documented provisional interpretation or obtains a section. Native compound paths and dashed upper-volume symbols must not become Ground room polygons or barriers. Exact three-dimensional overlap with Antonov, stair/landing elevations, service-room assignment, measured wall thickness/door clearance, finishes and present-day operating conditions remain unresolved. The full Iribe interior recreation remains active and incomplete.
