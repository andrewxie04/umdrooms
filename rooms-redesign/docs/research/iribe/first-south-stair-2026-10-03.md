# Level 1 south vestibule-adjacent stair: original vector evidence

Research date: 2026-10-03. Source-only trace; no runtime integration.

Subsequent parent integration: the raw ledger remains source-only evidence, while a compact independently checked subset supports a provisional connected south stair. See [runtime construction, interpretation and checks](lobby-south-stair-integration-2026-10-03.md). The section, heights, terminal bands and complete ascent sequence are still unverified.

## Finding and scope

The stair enclosure corresponding spatially to the supplied Ground south stair is at approximately **x255.6-321.3, y481.2-511.4 on Level 1 original PDF page index 8**. It contains two parallel, horizontally progressing tread-row families, a narrow central outlined strip and untreaded aprons at both page ends. The **only identified stair access door is on the page-upper right**, rather than at either supplied Ground hinge location. Source correspondence establishes the enclosure and two drawn runs; it does not establish a Ground-to-Level-1 stair route or its heights.

`src/components/interior/iribe/first-south-stair-trace.ts` is a bounded native source ledger. It preserves 464 complete original paths, 840 original commands, seven paint styles, original paint sequence numbers and original zero-based path/item identities. Flight rows, central strip, candidate landing boundaries, access door, cut evidence and direction/icon evidence have separate exports. No native path is clipped, simplified or reindexed. No missing tread, landing closure, shaft void, elevation or connectivity is synthesized.

The parent separately owns `ground-south-stair-trace.ts` and Ground integration. Ground observations below are supplied context or a read-only reference to that ledger, not a second Ground trace. Only the new Level 1 ledger and this note are written in the repository; scratch work is under `/tmp/iribe-first-south-stair/`.

## Source and coordinates

- [UMD Computer Science / HDR building guide](https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf), inspected local original `/tmp/iribe-reference/guide.pdf`.
- Verified SHA256: `c1fe539a56ba3b97b7b1dcb2d4563792892294a59caeaa476f67ec810fcf7474`.
- Level 1 original page index **8**, the ninth PDF page, 576 x 576 PDF points; **97,843 original `Page.get_drawings()` records**. PyMuPDF **1.28.2**, supplied interpreter `/tmp/iribe-reference/venv/bin/python`.
- Coordinates are native PDF points, top-left origin, +X right, +Y down. The ledger retains unchanged evaluated source floats, including cubic control points, rectangle orientation, null paint fields and independent subpath starts. Coordinates in the tables below are rounded to six decimals for reading; the ledger is the exact numeric authority.
- Inspected context: `[248, 462, 332, 521]`. Retained native path bounds: **`[255.59938049316406, 481.2108154296875, 321.25677490234375, 511.4082946777344]`**. Bounds describe path coordinates, not stroke-expanded extents or a closed shaft footprint.
- Existing `first-guide-layout.ts` four-anchor `firstGuideGround` / `firstGuidePlan`, with shared `groundGuidePlan`, are used unchanged. Algebraically inverting that existing function is used only to locate supplied Ground hinges in scratch research; no transform is fitted or added to the ledger.

## Enclosure, central strip and landing candidates

| Evidence | Native Level 1 extent / original IDs | What it establishes |
| --- | --- | --- |
| Opaque enclosing wall fills | Bounds `[255.59938049316406, 481.28289794921875, 321.2550048828125, 511.40289306640625]`; paths **92691, 92692, 92693, 92700, 92766, 92772, 92775, 92777** | Native black wall polygons, holes/subpaths and door gap. Not a closed stair shaft or floor-void polygon. |
| Enclosure edge strokes | 44 complete selected black wall paths; `FIRST_SOUTH_STAIR_ENCLOSURE.wallStrokePathIndices` | Separate native outlines, including independently rounded joins. Fills and strokes need their source paint order. |
| Page-upper run, primary long fragments | `[279.0378112792969, 486.69140625, 299.505615234375, 495.2394104003906]` | 13 primary row families and their separately stored paired outlines. |
| Page-lower run, primary long fragments | `[277.64190673828125, 497.4488830566406, 298.1098937988281, 505.9967041015625]` | 13 primary row families, including source fragments intersecting the cut evidence. |
| Central outlined strip | `[276.84759521484375, 495.2398986816406, 300.3006286621094, 497.4495849609375]`; paths **91764-91823** | Thin, repeated closed/open outlines between runs. A divider/guard/opening candidate; its interior is not established as a shaft void, floor or landing. |
| Page-left untreaded apron | Top references **87499, 87500, 87506**; outer side **87505**; inner/corner references **87502, 87501, 87496, 87486**; bottom outlines **91830, 91832, 91841, 91842** | Landing candidate beside both runs. Native contours are open and do not produce a verified closed landing polygon. |
| Page-right untreaded apron beside door | Top **87478, 87539, 87540**; central end **87534, 87541, 87542**; outer side **87536**; bottom **87544, 91903, 91904, 91908, 91909** | Access/landing candidate between the drawn runs and east wall/door. Elevation and flight-to-landing topology are unverified. |

The opaque fill pair 92777/92693 contains multiple native subpaths, including wall recess contours. Retain their `even_odd` rule and full commands; joining every command end to the next start would create false walls. Separate fills 92700/92766 and wall inset fills are also retained. The page-lower horizontal rail/apron linework is evidence, not a heavy south shaft wall. Adjacent facade mullions/glazing and independently traced column symbols are outside this stair ledger. The neighboring office door paths 85306-85310 are not assigned as stair access.

## Ordered tread evidence

Rows are ordered by **increasing page X**, not asserted ascent. Every row below retains its primary fragments, paired fragments and short rail/end fragments in the ledger. The primary/paired selection is a bookkeeping convention for the repeated outlines, not an assertion about which manufactured edge is a nosing.

### Page-upper run

All primary long rows are native vertical lines from y486.69140625 to y495.2394104003906. Short source continuations into the side outlines reach y486.26568603515625 and y495.568603515625. The two parallel x families are about 0.155 pt apart and must not be counted as separate steps.

| Row | Primary X, PDF pt | Primary original path | Paired X, PDF pt | Paired original path |
| --- | --- | --- | --- | --- |
| 0 | 279.037811 | 87473 | 279.192810 | 87422 |
| 1 | 280.743408 | 87221 | 280.898499 | 87425 |
| 2 | 282.449188 | 87224 | 282.604309 | 87428 |
| 3 | 284.154999 | 87227 | 284.310089 | 87431 |
| 4 | 285.860687 | 87230 | 286.015686 | 87434 |
| 5 | 287.566498 | 87233 | 287.721497 | 87437 |
| 6 | 289.271088 | 87236 | 289.427185 | 87440 |
| 7 | 290.976898 | 87239 | 291.131897 | 87443 |
| 8 | 292.682495 | 87242 | 292.837708 | 87446 |
| 9 | 294.388306 | 87245 | 294.543396 | 87449 |
| 10 | 296.094086 | 87248 | 296.249207 | 87452 |
| 11 | 297.799805 | 87251 | 297.954987 | 87455 |
| 12 | 299.505615 | 87476 | 299.660614 | 87458 |

### Page-lower run / return-flight candidate

Primary long fragments occupy y497.4488830566406-y505.9967041015625; source short fragments continue into neighboring rail outlines. Rows 5-7 are split into independently stored original items where they meet the zigzag evidence. Their original tiny endpoint differences remain unchanged. No interpolated or snapped continuous section is stored.

| Row | Primary X, PDF pt | Primary original paths | Paired X, PDF pt | Paired original paths |
| --- | --- | --- | --- | --- |
| 0 | 277.641907 | 87467 | 277.487000 | 87397 |
| 1 | 279.347595 | 87199 | 279.192810 | 87394 |
| 2 | 281.053406 | 87196 | 280.898499 | 87267 |
| 3 | 282.759186 | 87193 | 282.604309 | 87264 |
| 4 | 284.465088 | 87177 | 284.310089 | 87261 |
| 5 | 286.170807 | 87219, 87161 | 286.015686 | 87420, 87258 |
| 6 | 287.876587 | 87217, 87160, 87215, 87158 | 287.721497 | 87418, 87257, 87416, 87255 |
| 7 | 289.582397 | 87214, 87156 | 289.427185 | 87415, 87253 |
| 8 | 291.288086 | 87211 | 291.131897 | 87412 |
| 9 | 292.992493 | 87208 | 292.837708 | 87409 |
| 10 | 294.698395 | 87205 | 294.543396 | 87406 |
| 11 | 296.404114 | 87202 | 296.249207 | 87403 |
| 12 | 298.109894 | 87470 | 297.954987 | 87400 |

Each run has **13 visible row families and 12 intervals between those rows**. This is not a verified complete riser/band count: terminal boundaries, floor cuts and flight ends are not fully labeled. Upper primary row pitch is 1.704590-1.705811 pt; lower pitch is 1.704407-1.705902 pt. These source spacings are diagram measurements, not dimensions in metres.

The extra page-lower end outline **87109** is at x298.18798828125, only **0.078094482421875 pt** from the last primary row x298.1098937988281. Its short continuations **87479, 87480, 87543, 87545** remain separate end-outline evidence. This does not justify a fourteenth regularly spaced tread row. Neither the paired outlines nor this end outline is promoted to another step.

## Cut, arrows and guide icon

- The zigzag cut is preserved separately as **87462, 87463, 87464**; approach/continuation segments **91812, 87461, 91760, 87460, 87465, 91826, 91847** are independently retained. Main zigzag native vertices run approximately `(287.580902,501.293396) -> (288.665894,501.557404)`, then `(288.666809,501.557800) -> (287.085815,502.294800)`, then `(287.086090,502.294708) -> (288.170105,502.558716)`. Joins are not snapped.
- No explicit architectural arrowhead or UP/DN text was identified in the bounded source/replay. The zigzag is cut evidence, not a direction arrow. The two runs are not labeled above/below Level 1 merely by their page position or this cut.
- The red stair guide pictogram is original path **97828**, `fs`, **44 commands**. It is preserved with its exact native stroke/fill as separately classified annotation evidence and omitted from architectural replay. Its shape establishes neither tread count nor ascent direction.

## Actual Level 1 door/access evidence

There is one stair door on the page-upper right. It opens toward increasing page Y into the enclosure/apron.

| Door evidence | Native Level 1 PDF point / original ID |
| --- | --- |
| Interpreted hinge (outer open-leaf edge origin) | **`[311.910888671875, 482.3162841796875]`**, path **85248**, item 0 |
| Outer leaf open tip | `[311.910888671875, 488.8282775878906]`, same item |
| Inner leaf contour | **85249, 85250, 85251**, item 0 each; four complete native strokes with 85248 |
| Swing cubic | **85252**, item 0: FROM `[305.4186096191406, 481.74859619140625]`, control1 `[305.00262451171875, 486.5126037597656]`, control2 `[306.859619140625, 488.6265869140625]`, TO `[311.63861083984375, 488.82659912109375]` |
| Closed-tip endpoint | Cubic FROM, retained exactly; not snapped to a jamb or inferred threshold |
| Jamb edges | **93387-93394**, item 0 each |
| Open jamb interval at y482.3162841796875 | Left interior face x305.3977966308594 (93394), right interior face x311.910888671875 (93388/93389); drawing interval about 6.513092 pt |

The swing cubic joins the **inner** open-leaf contour. Its endpoint is 0.001718766 pt from the inner contour tip, whereas the outer tip is 0.272283005 pt away. Both source endpoints are retained; this separation must not be mistaken for an extraction or registration error. Door opening width, swing and leaf contour are source drawing evidence; physical clear width, leaf height and current hardware are not established.

## Correspondence to supplied Ground context

Applying the existing `firstGuideGround` to the Level 1 door gives **Ground PDF `[326.07659156797956, 484.9544610231721]`**. Applying `firstGuidePlan` gives approximately `[5.506420746, -17.268067345]` in the existing estimated model frame. That result is an estimated diagram registration, not a surveyed door location.

| Supplied Ground hinge | Existing registration inverse, Level 1 PDF pt | Level 1 source observation |
| --- | --- | --- |
| `[278.6326,486.5998]` | `[265.228378977,483.935158205]` | Falls in the continuous page-upper black wall/fill assembly, notably 92766/92777. No stair door symbol at that location. |
| `[275.5479,515.3589]` | `[262.193154372,512.232666226]` | At/beyond the page-lower facade line area. No corresponding Level 1 door symbol in the inspected context. |

The Ground input hinges were supplied rounded to four decimals; their inverse coordinates are research locators, not new exact source points. The Level 1 stair access must not be copied from those Ground hinges.

The registered Level 1 primary row envelopes are:

| Level 1 evidence | Envelope in existing Ground PDF frame, pt |
| --- | --- |
| Page-upper primary row fragments | `[292.667295,489.400965,313.468980,498.088430]` |
| Page-lower primary row fragments | `[291.248634,500.333930,312.050505,509.021198]` |
| Central outlined strip | `[290.441363,498.088900,314.276964,500.334659]` |

The parent reports Ground's fourteen primary sections / thirteen visible bands across approximately x292.1957-314.7311, y488.9686-498.4246, plus projected return line **50356** at x313.155, y500-509.77 and right-turn landing rails **50378/50373/50370**. Level 1's page-upper run occupies Ground's primary-run region; its page-lower run occupies the projected-return region. This supports **spatial correspondence of the two runs in the same enclosure**. The registered row phase/extents differ, and the Level 1 door is at the opposite end from the Ground approach. These facts do not prove that the shown page-lower run is the missing Ground-to-Level-1 upper flight, that the two levels use identical terminal landings, or which strokes represent a flight above/below the Level 1 plan cut. No source connection, direction or height is assigned.

### Parent's three-flight switchback interpretation

The observed source pattern is **Ground north run cut, Ground door at the west; Level 1 south run cut, Level 1 north run uncut, Level 1 door at the east**. The parent inspected the original vector replay and proposes a plausible Ground-to-Level-1 sequence: **Ground north west-to-east -> Level 1 south east-to-west -> Level 1 north west-to-east**. The alternating cut locations, parallel runs, apron/turn evidence and changed access end are consistent with that three-flight switchback hypothesis. Those directions describe the proposed ascent; none is established by an architectural arrow or labeled vertical section.

Using Ground's supplied thirteen bands and the twelve inter-row intervals directly visible on each Level 1 run gives a nominal **37** intervals across that hypothesis. Allowing one unverified terminal band on each Level 1 run gives **39**. These are hypothesis counts, not a verified 37-39-riser construction schedule. The existing estimated 6.5 m rise divided by 37-39 gives approximately **0.175676-0.166667 m** per interval. This arithmetic is compatible with the parent's proposed stack and avoids treating the two visible Level 1 runs alone as the entire floor rise; it does not prove the stack, riser heights, terminal bands, intermediate elevations or ascent. The source ledger retains only the native two-dimensional records, with elevations and ascent directions null. A stair section or equivalent independent evidence is still required before calling this a verified connection.

## Measured versus estimated / unresolved evidence

Native commands, paint styles, original IDs, row spacings, symbol endpoints and their diagram extents are directly extracted/measured. Feature labels such as "landing candidate," "central divider/opening" and "return-flight candidate" are interpretations of those vectors. Registration into Ground/model coordinates uses the pre-existing estimated drawing registration and model scale. None is a physical survey.

The parent's existing **6.5 m** Ground-to-Level-1 rise is an application estimate outside this trace. Allocating that rise to a hypothetical two flights of thirteen bands gives **6.5 / 26 = 0.25 m per band**, a red flag identified by the parent. Level 1 provides 13 row families per run, not independent evidence for two complete thirteen-band flights or twenty-six actual risers. The three-flight alternative above is explicitly an interpretation supported by the plan pattern and arithmetic, not proof from a vertical section. No extra source step or flight, landing elevation or adjusted rise is added to the ledger. A dimensioned/labeled vertical stair section or equivalent independent evidence is needed to establish actual floor rise, total flight count, terminal bands and connectivity.

The central strip is not exported as a shaft void; aprons are not closed into walkable polygons; cut/arrow/icon evidence remains separate; no current egress route, clearance, construction dimension or surveyed elevation is asserted.

## Validation and visual review

Validation consumes the **evaluated TypeScript exports**, bundled with the repository's esbuild into scratch `.mjs`, rather than comparing only generator JSON. The original PDF is reopened by its verified hash and original page index, then every exported record is compared with `get_drawings()` at its original index.

- **464 paths / 840 items / seven paint styles:** zero numeric, item identity, paint sequence, path bounds or paint-field mismatches. Complete native paths, original rectangle commands and independent subpaths are preserved.
- **371 feature item references** resolve to retained native records (355 distinct items). Both ordered runs have thirteen primary and thirteen paired row families; native cut fragments occur at lower rows 5-7. No synthetic row is added.
- Independent source inventory finds **all 398 native gray detail paths** wholly in `[261,485,314,508]`; the ledger contains exactly that set. It includes horizontal/vertical lines whose rectangles have zero area. **414 of the 464 selected paths have zero-area bounds**. Use inclusive min/max overlap (or inflate a selection rectangle by 0.001 pt only for inventory); plain `Rect.intersects` would skip these paths. Native coordinates are never inflated.
- Architectural authority replay from independently indexed original paths versus replay from evaluated exports: **1420 x 720 pixels at 20x**, **zero changed RGB channels**. Only icon 97828 is omitted from those two replays; its raw native record remains in the ledger.
- Inspected the original Level 1 full page, original stair crop, architectural replay and final colored evidence overlay. The overlay shows 0-12 row labels on each run, the intact zigzag cut, central strip, aprons and right access door. Colored overlay strokes are scratch review only.
- Focused TypeScript `--noEmit --strict --skipLibCheck --target ES2022 --module ESNext --moduleResolution bundler` check of the new ledger and ESLint of that file pass. No runtime/model/test file is edited, no application build is run, and no commit/push is made.

Scratch evidence, not repository deliverables:

| Scratch file | Purpose |
| --- | --- |
| `/tmp/iribe-first-south-stair/page-8.png` | Original full-page view |
| `/tmp/iribe-first-south-stair/source-context.png`, `source-stair.png` | Original unmodified source crops |
| `/tmp/iribe-first-south-stair/architectural-replay.png` | Native regional replay with colored icon omitted |
| `/tmp/iribe-first-south-stair/native-selected-replay.png`, `evaluated-ledger-replay.png` | Independently selected authority versus evaluated ledger |
| `/tmp/iribe-first-south-stair/evidence-overlay.png` | Final reviewed row/cut/door overlay |
| `/tmp/iribe-first-south-stair/evaluated-exports.json`, `validation.json` | Evaluated record audit and replay equality report |
| `/tmp/iribe-first-south-stair/measurements.json`, `registration-check.json` | Diagram measurements and unchanged-registration correspondence |
| `/tmp/iribe-first-south-stair/build-ledger.py`, `write-ledger.mjs`, `evaluate.mjs`, `validate-evaluated.py`, `measure.mjs` | Scratch extraction, authoring, evaluation and validation tools |
