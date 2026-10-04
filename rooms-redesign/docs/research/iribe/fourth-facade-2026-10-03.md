# Level 4 original glazing source and closure limits

Subsequent runtime integration is recorded in `fourth-structure-integration-2026-10-03.md`. This note preserves the source-only extraction and validation stage.

Reviewed 2026-10-03. `src/components/interior/iribe/fourth-facade-trace.ts` supplies the complete ordered Level 4 glazing run as **196 native source spans: 195 lines and one short cubic represented by its native endpoint chord**. It also retains **66 supporting original paths / 123 commands** with complete command arrays and exact drawing styles. The loop covers the west tip, both changing-angle curves, both long facades and the east end. It is source data for the parent's later shell and column correction.

This pass authored only that new TypeScript file and this research note. It adds no runtime imports or integration, changes no existing layout, model, structure, registration or source ledger, and performs no commit or push.

## Original authority and native coordinates

- Original source: UMD/HDR's [Computer Science Day building guide](https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf), read locally from `/tmp/iribe-reference/guide.pdf`.
- SHA-256: `c1fe539a56ba3b97b7b1dcb2d4563792892294a59caeaa476f67ec810fcf7474`, verified before extraction and after original-source validation. Sixteen original PDF pages.
- Level 4 is original **zero-based page 12**, visibly titled **Level 4**. Its west continuation is original **zero-based page 11**, with the **ROOM 4105** legend. These are physical PDF page positions, not printed page numbers or cropped-page identities.
- Both pages are **576 x 576 PDF points**, rotation zero, top-left origin, +X right, +Y down. Original `get_drawings()` counts are **18,172 on page 11** and **40,353 on page 12**, using the requested `/tmp/iribe-reference/venv/bin/python`, PyMuPDF **1.28.2**.
- Every `page`, `pathIndex` and `itemIndex` identifies the unchanged original extraction. Every `points` tuple stays in original item order. `reversed` changes traversal only. **Page 11 remains in its own native coordinate frame**, including a pane endpoint beyond X=576 where the original pane crosses the page edge.
- Integer fractions preserve the exact native binary coordinate values when JavaScript evaluates them. No endpoint is rounded, projected, translated to another page, fitted, clamped or corrected in the source array. Readable coordinate tables in this note use decimal spellings; the exported fractions remain authoritative.
- **Only a replay or future consumer** subtracts 576 from the X of page 11 records. Y is unchanged. The existing `registeredClosedGlazingBaseline(source, 11, register)` helper performs that canonicalization. Its registration callback would consume the resulting page 12 frame. `fourth-guide-layout.ts` supplies the existing estimated shared registration; this source task neither evaluates a facade in the world frame nor refits that registration.

Read-only context included `second-facade-trace.ts`, `first-facade-layout.ts`, `fourth-guide-layout.ts`, `fourth-guide-registration-2026-10-03.md` and `second-structure-2026-10-03.md`. The Level 2 file established the record format and prior selection convention. **No transformed Level 2 endpoint supplied a Level 4 coordinate or identity.** Fresh original Level 4 renders and source style/command inspection determined the selection independently. The 196-span result was counted after selecting the run; a Level 2 count was not used as a target.

## Ordered selection and evidence

`FOURTH_FACADE_SOURCE` uses the existing glazing source shape: `page`, `pathIndex`, `itemIndex`, `reversed`, `points: [start, end]`, all readonly through `as const`. Every selected record uses original item index zero. The isolated strict TypeScript compatibility check assigns this export to `Parameters<typeof registeredClosedGlazingBaseline>[0]` successfully.

The following row ranges are **one-based positions in the exported array**; original source path/item IDs remain zero-based.

| Export rows | Native page | Run | Count |
| --- | --- | --- | ---: |
| 1-20 | 11 | West corner up to northern west tip | 20 |
| 21-30 | 11 | Diagonal offices to the page seam | 10 |
| 31-38 | 12 | Diagonal office facade | 8 |
| 39-54 | 12 | North-west curve beside cafe / roof approach | 16 |
| 55-90 | 12 | Long north facade | 36 |
| 91-109 | 12 | East reset-zone end | 19 |
| 110-157 | 12 | Long south facade | 48 |
| 158-166 | 12 | Black inner lower-curve strokes, crossing the seam | 9 |
| 167-171 | 11 | Black inner lower-curve strokes | 5 |
| 172 | 11 | Short gray cubic span 15334, traversed in reverse | 1 |
| 173-174 | 11 | Remaining black curve strokes | 2 |
| 175-196 | 11 | West diagonal return to the initial corner | 22 |
| Total | 11 / 12 | Complete ordered run | **196** |

There are **60 page 11 records / 136 page 12 records**, **179 gray line records / 16 black line records / one gray cubic span**. Changing pane angles come directly from native endpoints. No fitted circle, smoothed envelope or offset copy of another floor supplies the curve.

Most of the run uses the interior-facing stroke of the paired gray glazing detail. On the lower curve, the source has a continuous outboard cubic/skirt, partial gray fragments, and a separately drawn inner black run with gray caps. The trace follows the **black inner run across that entire lower curve** rather than switching repeatedly between the two source layers wherever an outboard gray fragment happens to be present. At its two ends, the black and gray runs are laterally displaced; those transitions are explicitly unresolved native closures below.

### Black strokes and gray caps

The sixteen retained black baselines are original page **12** paths:

```text
36637, 36667, 36639, 36644, 36662, 36672, 36649, 36657, 36654
```

and original page **11** paths:

```text
16618, 16628, 16621, 16634, 16631, 16625, 16637
```

They use `type: 's'`, RGB **(0,0,0)**, native width **0.0689999982714653 pt**. Their full native commands and styles are duplicated in `FOURTH_FACADE_DETAIL_SOURCE` for source review. This black run is independently observed on Level 4; Level 2's special black strokes 41992 / 42075 are not substituted.

The supporting gray cap/span paths are page **11** `15329,15330,15331,15332,15333,15334,15335` and page **12** `34149,34150,34151,34152,34153,34154,34155,34156`. The gray stroke uses native RGB **(0.3019913136959076, 0.3019913136959076, 0.3019913136959076)** and the same **0.0689999982714653 pt** width. Complete original cubic controls are retained. Caps can overlap line endpoints or even a short black bridge; blindly inserting every cap into the endpoint loop would trace some spans twice. The source array retains their gaps, except the longer continuous cubic span 15334 described next.

### The one cubic span

Original page **11**, path **15334**, item **0**, is a gray cubic from:

```text
P0 = (533.3076782226562, 450.8472900390625)
P1 = (533.9786987304688, 451.8252868652344)
P2 = (534.6626586914062, 452.7952880859375)
P3 = (535.357666015625, 453.75628662109375)
```

Its loop record retains **P0 and P3 exactly**, with `reversed: true` for travel from the main-page side toward the west return. The full original `c` command and style remain in the detail export. Omitting this source span would leave a roughly 3.56-point separation between black strokes 16631 and 16625. It is a **drawn continuous curved span**, not an invented straight source command or an assumed mullion gap.

The current line helper uses its endpoint chord. An independent analytic perpendicular-distance calculation, including the derivative roots, found maximum chord deviation **0.01102496919412292 PDF pt** at parameter approximately **0.49726060622187745**. Thus the exported endpoints are lossless, while a line-only replay of this one span is an explicit small geometric approximation. A future exact curved consumer can use the retained four controls. No long skirt cubic was reduced to a glazing chord.

### Excluded outboard fragments and skirts

The detail export retains excluded gray outboard curve fragments: page **11** `13889,13891,13893,13895`; page **12** `31341,31344,31346,31348,31351,31352`. These fragments lie outside the selected black inner run. They are evidence of the source's parallel layers, not extra panes in the ordered array.

It also retains the complete outboard outline and skirt evidence:

- Page **11**: `15310,15311,15315` continuous diagonal outlines; `15316,15320` long parallel cubics; `15318` outer twelve-cubic outline; `15178` gray filled curved skirt.
- Page **12**: `34143,34147` long parallel cubics; `34144` outer twelve-cubic outline; `34141,34136,34138,34139` long parallel/outer straight lines; `34133` skirt end cap; `33638` straight gray skirt fill; `33973` curved gray skirt fill.

The two skirt fills use native RGB **(0.9489890933036804, 0.9489890933036804, 0.9489890933036804)**. Their full original line/cubic arrays and fill styles are preserved. The straight skirt reaches approximately Y=521.96; it is visibly outside the south glazing at Y=514.0123291015625. These continuous exterior lines/fills are not floor-shell or glazing evidence to replace the pane run.

### Roof landing openings

Original page **12** paths **40023-40030** retain two pairs of roof stair landing door leaves and cubic swing symbols. They use the same gray RGB as the glazing, with width **0.10400000214576721 pt**. Fresh original and labeled source crops distinguish these symbols from the glazing beside the cafe. The ordered facade strokes through that region remain present; the roof symbols do **not** establish an aperture through this glazing run. A later roof/interior door reconstruction needs its own adjoining boundary and access review. This source file does not infer an exterior doorway, door width or traversable opening from those pictograms.

## Explicit closure limits

The source array is a complete ordered collection of drawn spans. The PDF does **not** encode it as one continuous closed path. Native endpoint gaps remain visible and unchanged; any joined floor polygon is a derived interpretation.

The existing helper's rule was replayed in isolation: use adjacent-line intersection only when the determinant exceeds `1e-5` in magnitude and both endpoint extensions are less than **2 PDF pt**; otherwise use the average of the two neighboring endpoints. For these evaluated exports it yields **55 intersection joins / 141 midpoint joins**. The largest extension actually accepted by that helper is **1.9308729788074628 pt**, on the nearly parallel page 12 pair **31768 -> 31764**. This threshold is the existing helper's computational convention, not a source dimension or proof of corner hardware.

The two largest gaps are **lateral source-layer transitions**, not ordinary tiny mullion gaps:

| Previous -> next native record | Previous travel end | Next travel start | Native gap, PDF pt | Existing helper closure |
| --- | --- | --- | ---: | --- |
| Page 12: 31907 -> 36637 | (75.03489685058594, 514.0123291015625) | (75.19879913330078, 512.9229736328125) | **1.101616673609595** | Midpoint |
| Page 11: 16637 -> 13897 | (526.4793701171875, 439.8642883300781) | (525.611328125, 440.5415954589844) | **1.1010185498292349** | Midpoint |

The midpoints are respectively **(75.11684799194336, 513.4676513671875)** in page 12 native coordinates and **(526.0453491210938, 440.20294189453125)** in page 11 native coordinates. Those midpoint locations are **derived joins**, not new source endpoints. Both source records are kept independently. The precise physical transition profile, glazing thickness and hardware remain unresolved; a continuous constant inset cannot be claimed from this drawing.

Other reviewed large gaps: west tip **14087 -> 13969: 1.0157353584229571 pt**; east upper corner **31676 -> 31388: 0.9572394558136104 pt**; east lower corner **31618 -> 31330: 0.9397798315114954 pt**; final west closure **13996 -> 14002: 0.6232700396667877 pt**. All are drawn corner relationships requiring interpreted joins.

The two page-seam transitions are **page 11 13933 -> page 12 31384: 0.16107445973652731 pt**, and **page 12 36654 -> page 11 16618: 0.4523622438123722 pt**, measured only after subtracting 576 from continuation X for the replay. Continuation pane 13933 crosses beyond its own page edge; main-page pane 36654 crosses into negative X. Neither is duplicated from the other page, clipped at the seam or rewritten into the neighboring native coordinate frame.

## Original-source validation and visual review

Validation reopened the original PDF and loaded **JavaScript-evaluated TypeScript exports**, rather than comparing the author's intermediate JSON to itself.

- **196 unique page/path/item IDs / 784 endpoint coordinate components**, exact equality against original command starts/ends. **Maximum endpoint error: 0 PDF pt**. The one cubic's two exported endpoints match its original first/final points exactly.
- **66 unique supporting path IDs / 123 complete native commands / 792 geometric coordinate components**, with every command/control point and all retained style fields exactly equal to the original extraction. These support paths include sixteen black baselines and the one cubic span already in the main array; across both exports there are **245 unique original paths / 302 unique original commands**.
- The independently implemented Python join replay equals the existing TypeScript helper's **196 vertices exactly** at evaluated precision. Its derived closed polygon is nonempty, simple and valid; source-canonical area is **123524.70941241819 PDF pt squared**. This is a geometry diagnostic for the interpreted line/chord loop, not a floor area measurement.
- A focused original-source clearance diagnostic checked the twenty round-marker paths already identified by the registration note, using their **81 original cubics / 41,553 sampled boundary points** in native page 12 coordinates. All sampled silhouettes are inside the derived source loop. Minimum sampled clearance is **2.0180149865900017 PDF pt**. Prior conflicting markers **33817** (cafe) and **33992** (west tip) have sampled clearances **2.2869662895680225** and **2.0180149865900017 pt** respectively. This sampling supports the next shell correction; it is neither an exact symbolic cubic-containment proof nor runtime collision validation. No source column is shifted, dropped or used to fit the facade.
- Standalone strict TypeScript, source-file ESLint, explicit helper-parameter compatibility and whitespace checks pass. No application build, browser integration or runtime test was performed for this source-only task.

Fresh complete original pages 11/12 and complete evaluated overlays were visually inspected. The independent blank-background replay was generated solely from evaluated source exports and the isolated helper vertices; it uses page 11 blue, page 12 green and inferred joins orange. Separate original/overlay magnifications inspected the west tip, both lateral transitions, short cubic span, cafe curve and east corners. Labeled supporting-source reviews inspected the black/gray lower curve and roof landing openings. The original PDF stayed unchanged on disk.

## Scratch proof and reproduction

All scratch scripts and proofs are outside the checkout, under:

```text
/tmp/iribe-reference/fourth-facade-2026-10-03/
```

Principal proofs:

| Scratch file | Purpose |
| --- | --- |
| `original-11.png`, `original-12.png` | Fresh complete original renders |
| `evaluated-exports.json`, `evaluated-source.mjs` | Actual evaluated source module exports |
| `original-validation.json` | Counts, exact endpoint/style/command checks, chord deviation, closures |
| `evaluated-overlay-11.png`, `evaluated-overlay-12.png` | Actual exported endpoints on original pages |
| `evaluated-replay.png` | Independent complete source replay with page and join colors |
| `detail-original-*.png`, `detail-overlay-*.png` | West tip, cafe, east corners, cubic span, both transitions |
| `evaluated-details-curve-west.png`, `evaluated-details-curve-main.png`, `evaluated-details-roof-access.png` | Native detail-path identity/style review |
| `helper-compatibility.ts`, `helper-compatibility.mjs`, `helper-closed-native.json` | Read-only helper type/runtime replay |
| `joins.json` | Every original adjacency and the derived closure |
| `column-clearance.json` | Focused native original-column silhouette diagnostic |

The scripts are `extract_original.py`, `facade_candidates.py`, `curve_review.py`, `select_loop.py`, `author_source.py`, `export_evaluated.mjs`, `validate_original.py`, `render_evaluated.py`, `column-clearance.py` and `write_note.py`. Extraction candidates and working selections are retained for review; original-source validation does not trust those selections as geometry authority. Author scripts are initial creation scripts with existence guards; they are not needed to verify the final files.

From the workspace, reproduce final validation without authoring a repository file:

```sh
node /tmp/iribe-reference/fourth-facade-2026-10-03/export_evaluated.mjs
/tmp/iribe-reference/venv/bin/python /tmp/iribe-reference/fourth-facade-2026-10-03/validate_original.py
/tmp/iribe-reference/venv/bin/python /tmp/iribe-reference/fourth-facade-2026-10-03/render_evaluated.py
/tmp/iribe-reference/venv/bin/python /tmp/iribe-reference/fourth-facade-2026-10-03/column-clearance.py
./node_modules/.bin/eslint src/components/interior/iribe/fourth-facade-trace.ts
./node_modules/.bin/tsc --noEmit --strict --target ES2022 --module ESNext --moduleResolution bundler --skipLibCheck --noUnusedLocals --noUnusedParameters src/components/interior/iribe/fourth-facade-trace.ts
./node_modules/.bin/tsc --noEmit --strict --target ES2022 --module ESNext --moduleResolution bundler --skipLibCheck /tmp/iribe-reference/fourth-facade-2026-10-03/helper-compatibility.ts
```

## Remaining source and integration work

The two **gray/black lateral transitions**, **exact curved treatment of 15334**, **corner/mullion closure profiles** and **roof landing access/aperture relationships** remain explicit regions for later review. The source preserves their evidence and bounds the endpoint/chord approximations; it does not invent their physical construction.

The parent's Level 4 shell/column integration, shared-frame checks, curtain-wall thickness, column instantiation, walking barriers and browser review remain subsequent work. This task supplies an unchanged original-source run suitable for that correction. Historical guide geometry and exact PDF float reproduction do not establish current fitout, physical metric scale, storey heights or surveyed structural axes.
