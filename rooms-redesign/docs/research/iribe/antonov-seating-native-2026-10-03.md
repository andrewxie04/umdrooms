# Antonov native seating evidence - 2026-10-03

Checked source-only handoff: **298 student chair symbols, 1 separate presenter chair, 30 shared student desks, 1 presenter desk, 10 rows in 3 banks, and 4 tier-boundary sets**. Historical guide student count 298 and the parent task's official occupancy 300 are separate fields; this extraction does not independently establish the occupancy claim or add missing chairs. Counting the presenter gives 299 drawn chair symbols, not an occupancy revision.

The complete exact ledger and lean semantic exports are in [antonov-seating-native-trace.ts](</Users/andrewxie/Documents/School/UMD Map /BACKUPS/mapbox-web copy/rooms-redesign/src/components/interior/iribe/antonov-seating-native-trace.ts>). Only this new source file and this new research note were authored in the repository. Supporting scripts, evaluated data and renders are under `/tmp/iribe-antonov-seating-native-2026-10-03`. No runtime, shared registration, shell, doors, exterior stair or architectural section was edited.

## Original source and identity

- Original local PDF: `/tmp/iribe-reference/guide.pdf`.
- Public provenance: [UMD CS Day program guide](https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf). The locally supplied original is the coordinate evidence; no network copy or browser was used.
- SHA-256: `c1fe539a56ba3b97b7b1dcb2d4563792892294a59caeaa476f67ec810fcf7474`.
- Original zero-based page index **8**, printed **Level 1**, **576 x 576 PDF pt**.
- Coordinates are unchanged: origin top-left, +X right, +Y down. North/south bank labels describe page directions.
- Extraction: PyMuPDF **1.28.2**, original **97,843** records from the full `Page.get_drawings()` list. `pathIndex` is that original index; `itemIndex` is the unmodified command index. `seqno` is retained separately.
- The original was reopened for verification and fresh render generation; it was never saved or changed.
- Old rounded Antonov endpoints, fitted `auditorium.ts` axes/pitch, inverse registration, photograph dimensions and translated chair templates were not coordinate inputs. Gannon scripts were read for workflow only.

## Chair centers, directions and grouping

Each student symbol has one actual straight front and one dominant curved rear. The selected center is the mean of their evaluated physical symbol midpoints, **not a back-segment center proxy**. For a native line, evaluate its midpoint at t=0.5. For a cubic, evaluate the Bezier at t=0.5, including both controls: `B(0.5) = (P0 + 3P1 + 3P2 + P3) / 8`. Then `centerPt = (frontMidpoint + backMidpoint) / 2` and `facingPdf = normalize(frontMidpoint - backMidpoint)`. Each symbol is evaluated independently; direction variations from original float/control-point imperfections are retained.

Every chair export has an individual source-derived center, facing vector, bank, row, shared desk ID, front/back midpoint refs and full native supporting path refs. Student chair IDs use their original front path index. The presenter uses the outer front cubic **5733** and outer back cubic **5734**, owns **5733-5774**, and faces toward desk **5721-5732**. Its small native angular offset is retained.

Endpoint proximity <=0.003 PDF pt was used only to identify ownership components. It never snapped or rounded a coordinate. Independent front and back scans each recovered 298 student symbols; a disconnected fragment or a paint stroke never creates another chair.

Observed component exceptions are resolved:

- **273** student chairs form ordinary 18-path connected components.
- **24** student chairs are in 20-path components because two identical shared-desk paint fragments touch a chair. The repeated matching pair remains owned by the shared desk; the chair owns its actual 18 paths.
- **1** student chair, front **7638**, has connected **7626-7638** and disconnected **7718-7722**. The latter five strokes belong to its shifted upper rear/arm detail. All 18 actual paths remain; no bridge or correction was inserted.
- Every student chair owns 18 paths / 20 native commands. The separate presenter owns 42 paths. Total chair support is **5,406 paths**.

Fan angle is measured from page-left using `atan2(facingPdf.y, -facingPdf.x)`, without world registration:

| Bank | Actual student count | Individual facing angle range |
| --- | ---: | ---: |
| north | 81 | 24.987864295 to 25.045679738 degrees |
| center | 137 | -0.010084124 to 0.006343239 degrees |
| south | 80 | -25.041335306 to -24.992541749 degrees |

The side banks are therefore approximately +25 / -25 degrees relative to the center bank, about a 50-degree total fan. These are derived drawing angles, not a surveyed installation.

## Shared desks and native edges

There is one physical shared desk ID per row/bank, **30** student desks total, plus the separate presenter desk. Each table points to its complete original painted outline and one real continuous edge away from the students. `continuousEdgePt` contains that original edge's two unchanged native endpoints, so it is usable by the parent's lean compilation without inventing bank templates. The fragmented chair-side outline remains in the exact support ledger.

The independent scan found 30 distinct long native continuous-edge geometries, each painted twice. Repeated paint is evidence, not another desk. Supporting table paths total **1,715**, of which **12** belong to the presenter desk. Paths never have two physical owners.

Actual row chair counts and continuous table edge `pathIndex:itemIndex` handoff (all listed item indices are 0):

| Front-to-rear row | North / center / south chairs | North edge | Center edge | South edge |
| ---: | --- | --- | --- | --- |
| 0 | 5 / 14 / 5 | 7059:0 | 2059:0 | 3752:0 |
| 1 | 5 / 11 / 4 | 9028:0 | 1828:0 | 3716:0 |
| 2 | 8 / 14 / 8 | 725:0 | 1489:0 | 3865:0 |
| 3 | 9 / 14 / 9 | 1075:0 | 1141:0 | 4222:0 |
| 4 | 9 / 14 / 9 | 2702:0 | 400:0 | 4494:0 |
| 5 | 9 / 14 / 9 | 2901:0 | 52:0 | 4693:0 |
| 6 | 9 / 14 / 9 | 3100:0 | 6418:0 | 4892:0 |
| 7 | 9 / 14 / 9 | 3299:0 | 6902:0 | 5091:0 |
| 8 | 9 / 14 / 9 | 3498:0 | 7427:0 | 5290:0 |
| 9 | 9 / 14 / 9 | 3697:0 | 8964:0 | 5506:0 |

The visible front-row asymmetries are source evidence: row 1 has 5 / 11 / 4 chairs, and row 2 has 8 / 14 / 8. No row was padded to a capacity target.

Chair-to-desk assignment requires the real desk edge to lie ahead along the chair's facing vector, then chooses the nearest such edge within its bank. Nearest unsigned edge distance alone assigns some narrow front rows to the desk behind them. Verified center-to-front-desk continuous-edge distances span **3.5351523934290574 to 3.749299161979727 PDF pt**; these are drawing relationships, not metric pitches.

Special rear outlines are retained:

- Center desk row 9 includes partial bottom line **8913**, `(371.61810302734375, 204.61459350585938)` to `(374.61309814453125, 204.61459350585938)`, original 0.06700000166893005 pt stroke.
- The same desk also includes overlapping longer line **8966**, ending at `(375.14910888671875, 204.61459350585938)`, with original **0.07199999690055847 pt** stroke. Visual replay exposed this different-width path; it is retained once, with its own unchanged paint.
- Bottom return cubics **7639 / 7654** sit at y=204.5736083984375, with the source offset from the longer horizontal line preserved. Rear south desk row 9 also contains native interrupted/shifted frame pieces. Supporting paths remain whole.
- `closureInterpretation` is null for every desk. The export provides native fragments and paint, not an inferred closed footprint. A consumer may later choose a closed physical desktop model, explicitly as an interpretation.

## Tier and aisle cross-section handoff

**Four** discontinuous boundary sets align to desk rows **2, 4, 6, 8**. Each combines the three native continuous shared desk edges with native north/south aisle details and outer end returns. The entire tier selection is **94 original paths, 87015-87108**, assigned once by boundary ID. No tier polygon is closed or extrapolated.

Each bank-gap detail contains three parallel longitudinal strokes delimiting two plan bands. They are native plan cross-section references, not vertical architectural sections. Eight aisle cross-section sets exist, two for each boundary. Native end reaches are unequal and some joints have slight offsets. Central-desk continuous-edge X and the first aisle stroke X match exactly in this guide.

| Boundary row | North aisle parallel-stroke refs | South aisle parallel-stroke refs | Shared north / center / south desk edges |
| ---: | --- | --- | --- |
| 2 | 87026:0, 87059:0, 87103:0 | 87030:0, 87063:0, 87098:0 | 725:0, 1489:0, 3865:0 |
| 4 | 87022:0, 87044:0, 87073:0 | 87024:0, 87048:0, 87070:0 | 2702:0, 400:0, 4494:0 |
| 6 | 87036:0, 87052:0, 87038:0 | 87040:0, 87054:0, 87033:0 | 3100:0, 6418:0, 4892:0 |
| 8 | 87016:0, 87056:0, 87087:0 | 87019:0, 87058:0, 87084:0 | 3498:0, 7427:0, 5290:0 |

The exact `northEnd`, `northAisle`, `southAisle` and `southEnd` ref groups are exported in `ANTONOV_SEATING_NATIVE_TIER_BOUNDARIES`. The short native fragments **87018 / 87051** are tier-end return evidence and are retained without extension; this task contains no surrounding shell stroke selection.

Rear aisle context is the original open dashed path **97821**, both original cubics and its terminal short line. Native paint is black, 0.10000000149011612 pt, dash `[ 2.667 2.667 ] 0`, `closePath=false`. Its native bounds are `(359.7572021484375, 132.16970825195312, 387.1961975097656, 257.2677001953125)`. It is an unlabelled dashed plan reference behind the rear seating; wall/barrier semantics are not established. Keep the open geometry and native paint. The source identity is handed off for deduplication if the parent also references it.

Aisle topology describes the two bank gaps, presentation space and rear circulation adjacency. It supplies no navigation polygon, door placement, closed enclosure or verified accessible route. Shell/door/stair geometry belongs to the other source task.

## Exact research ledger versus consumer interpretation

The support tuple is `[pathIndex, seqno, boundsPt, styleIndex, ownerId, commands]`. Commands are unchanged original line/cubic arrays in native item order. Every selected original path is stored once and retains its whole commands, bounds, paint, caps, joins, dash pattern, close-path flag and opacity. Four unique paint styles are stored by reference. The per-chair/per-table/tier lists are relationships to that unique ledger; they do not duplicate source selections.

Lean consumer exports are:

- `ANTONOV_SEATING_NATIVE_CHAIRS`: actual individual centers/facing, source refs and physical owner relationships.
- `ANTONOV_SEATING_NATIVE_TABLES`: one desk identity, real continuous edge endpoints/ref, full outline refs and chair membership.
- `ANTONOV_SEATING_NATIVE_ROWS`: native row/bank membership and counts.
- `ANTONOV_SEATING_NATIVE_TIER_BOUNDARIES` and `ANTONOV_SEATING_NATIVE_AISLE_TOPOLOGY`: interrupted tier evidence and plan adjacency.
- `ANTONOV_SEATING_NATIVE_PROVENANCE`: original page/hash, derivation, counts and explicit null estimates.

**Parent integration requirement:** compile the needed lean records into its runtime source module and exclude `ANTONOV_SEATING_NATIVE_PATHS` / `ANTONOV_SEATING_NATIVE_STYLES` and the full research ledger from the browser. The source file is about 1.9 MB; do not import the whole research module as browser furniture data. Parent registration can use its shared `firstGuideNativePoint` / `FIRST_GUIDE_METRIC`; this task applies no transform, clipping, pitch adjustment or metric conversion.

The following remain unknown / consumer estimates: physical scale, chair/desk dimensions in meters, floor/tier heights, rise and run, elevation datum, section slopes, tier slab closure, barrier height, circulation clear widths and accessibility. All elevation/metric fields supplied here are null; no value was guessed. Full architectural section and lower/upper auditorium registration are outside this bounded source extraction.

The parent's currently retained **0-5.5 m** section and interpolated rendering/walk steps are explicitly consumer estimates pending a measured section. Ten furniture row ordinals do not establish ten verified row rises. The native four boundary sets and their two-band aisle details do not determine those elevations or an intervening stair profile. Desk envelopes derived by the parent are separate interpretations; original source commands remain unchanged.

## Verification of actually evaluated TypeScript

The check did not validate builder JSON as a substitute for the deliverable. `evaluate.mjs` strictly type-checks the assigned TypeScript file (0 diagnostics), transpiles it, actually imports the resulting ES module, and serializes those evaluated exports. `verify-replay.py` reads only those evaluated exports, freshly reopens the original PDF, and uses its own reference, Bezier, count and relationship calculations.

| Check | Result |
| --- | --- |
| SHA and page dimensions | Exact match, original page 8, 576 x 576 pt |
| Full native path / command equality | **7,216 paths / 7,814 commands**, exact; max native coordinate difference 0 |
| Original style fields | **86,592** field comparisons, exact; 4 styles |
| All semantic item references | **762** valid original references |
| Individual center / facing evaluation | **299** chairs, max derived differences 0 |
| Independent original student front / back scan | **298 / 298**, exact exported identity sets |
| Independent shared continuous desk edge scan | **30**, two original paints per geometry |
| Independent full furniture scan, every native pen width | **7,121 paths**, every path assigned to exactly one chair or desk |
| Chair / desk / tier ownership | Disjoint; no duplicate physical instance per painted path |
| Facing versus actual shared desk edge | Max absolute normalized dot 0.0007991548526787845 |
| Tier selection and cross-sections | **94 paths**, 4 boundary sets, 8 aisle cross-section sets |
| Native rear dashed path | **97821**, original open commands and dash paint preserved |

Fresh original, exact selected-source replay and diagnostic overlay images were inspected for the full room, both fanned banks, center bank, presenter, aisle tier detail and rear source imperfections. The overlay uses red center/facing arrows, green desk strokes and blue tier/dashed reference strokes. Replay intentionally excludes shell/door/stair architecture. Visual inspection caught the additional 8966 pen-width variant; the corrected replay retains it and matches the original rear desk detail. No native gap was repaired to make the replay look cleaner.

Reproducible supporting files:

- `/tmp/iribe-antonov-seating-native-2026-10-03/extract-original.py`: fresh original source snapshot/render.
- `/tmp/iribe-antonov-seating-native-2026-10-03/group.py` and `/tmp/iribe-antonov-seating-native-2026-10-03/derive.py`: independent Antonov grouping and actual symbol/desk derivation.
- `/tmp/iribe-antonov-seating-native-2026-10-03/build-trace.py`: authored exact ledger and lean exports.
- `/tmp/iribe-antonov-seating-native-2026-10-03/evaluate.mjs`, `evaluated.mjs`, `evaluated-exports.json`: actual TypeScript evaluation.
- `/tmp/iribe-antonov-seating-native-2026-10-03/verify-replay.py`, `verification.json`, `verification-run.log`: fresh-PDF checks and source replay.
- `/tmp/iribe-antonov-seating-native-2026-10-03/original-*.png`, `replay-*.png`, `overlay-*.png`: source/replay/relationship inspection artifacts.

No unresolved chair or desk grouping issue remains. Remaining uncertainties concern native drawing imperfections and physical/section interpretation; both are explicitly retained rather than fitted or silently resolved.
