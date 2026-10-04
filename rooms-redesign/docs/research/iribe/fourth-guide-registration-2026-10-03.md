# Level 4 guide registration into the shared Ground frame

Reviewed 2026-10-03. `src/components/interior/iribe/fourth-guide-layout.ts` adds an **estimated, equal-weight, orientation-preserving similarity** from the twenty native Level 4 round-column centers into the original Ground guide frame. Each Level 4 identity is explicitly paired with an independently reviewed Level 2 identity. The existing Level 2 -> Level 1 -> Ground registrations supply the targets. All twenty centers, including five with negative source X, remain unchanged in their source arrays.

`fourthGuideGround(pdfx, pdfy)` returns original Ground page 6 PDF points. `fourthGuidePlan(pdfx, pdfy)` applies the existing `groundGuidePlan` to that result and returns the shared world X/Z coordinates. This pass supplies registration and evidence; it does not integrate columns into rendering, alter a facade, or change a floor footprint.

## Source and coordinate identity

- Primary source: [UMD / HDR Computer Science Day building guide](https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf), read from `/tmp/iribe-reference/guide.pdf`.
- PDF SHA-256: `c1fe539a56ba3b97b7b1dcb2d4563792892294a59caeaa476f67ec810fcf7474`; 16 original pages. The hash was checked before analysis and after verification.
- Level 4: original zero-based page **12**, visibly titled **Level 4**, with west continuation on page **11**, whose legend identifies **ROOM 4105**. Level 2: original page **10**, visibly titled **Level 2**, with west continuation on page **9**.
- Each page is **576 x 576 PDF points**, unrotated, top-left origin, +X right and +Y down. Inputs use the original page 12 frame. A native page 11 coordinate becomes a page 12 coordinate by subtracting **576 from X**; its Y is unchanged. Raster enlargement/crop coordinates must be converted back to native PDF coordinates before using either helper.
- Path IDs are original zero-based `get_drawings()` indices from the identified pages, extracted with `/tmp/iribe-reference/venv/bin/python` and PyMuPDF 1.28.2. Neither a cropped PDF nor a labeled scratch rendering supplies a source path ID.
- `fourth-column-trace.ts` preserves the native Level 4 geometry, marker silhouettes and center derivations. `second-column-trace.ts` supplies the independently reviewed native Level 2 centers. Source notes read include `fourth-columns-2026-10-03.md`, `second-columns-2026-10-03.md`, `second-structure-2026-10-03.md`, `first-columns-2026-10-03.md` and `ground-guide-registration-2026-10-03.md`.

## Visual correspondence review

Fresh complete original renders of pages 9, 10, 11 and 12 were inspected at 2x. Fresh source crops and labeled scratch renders were inspected at 4x for both levels in three regions: the central rooms/circulation, the east end, and the west continuation. The labels identify native original path IDs on the displayed page. The original PDF was only read.

Correspondences were reviewed against the architectural arrangement before evaluating the fit:

- **East end, four pairs:** the ordered north-east corner, two intermediate facade markers and south-east corner remain beside the same end lounge, office ends and curtain-wall direction. Level 2's gray exterior roof skirt is distinct from the inner glazing line.
- **Central-east classroom, two pairs:** the markers north and south of the large central-east room occupy the same positions beside the two corridors and the stair/restroom core. Room uses and furniture differ between levels.
- **North facade and central lifts, three pairs:** the five-cubic facade marker is beside the shared study/cafe area, followed by the north and south markers beside the central lift/communicating-stair assembly. The cafe pictogram on Level 4 and the Level 2 annotation leader do not replace a column center.
- **Room 4105 / Room 2107 and west corridor, six pairs:** the north and south room-wall markers, the next west wall markers and the two western room corners have the same order relative to doors, office partitions and the diagonal corridor. Room 4105's empty classroom representation and Level 2's furnished meeting area are not structural anchors.
- **West continuation, five pairs:** four markers follow the west reset-zone diagonal facade from its northern tip to its southwest corner; the fifth is southeast of the support/stair core. The original continuation pages show all five silhouettes fully, so off-page main-page centers are retained rather than clamped or substituted.

The list below accepts **diagram correspondences**, not independently surveyed physical shaft identities. All twenty source and target markers are black filled near-round symbols, have the recorded contour families, and have compatible facade/core/corridor context. Nineteen Level 4 markers use control-bounds midpoint centers. **33817 / 38904** both use the curve-bounds midpoint for their five-cubic silhouettes; using the asymmetric control box would change the source center. Three gray Level 4 furniture outlines and five nonround black details are excluded from the fit. No correspondence is selected solely by nearest distance, a fitted shell, a cab fit, or agreement with the resulting similarity.

### Accepted native identities and unchanged centers

All coordinates below are original native PDF points. Six decimals are the existing source-record precision, not physical measurement precision.

| Level 4 page 12 path | Level 4 center X, Y | Level 2 page 10 path | Level 2 center X, Y |
| --- | --- | --- | --- |
| 33635 | 554.058472, 396.315125 | 38706 | 549.316406, 397.381104 |
| 33643 | 548.890686, 436.645096 | 38715 | 544.362762, 436.043884 |
| 33651 | 544.784424, 468.718994 | 38725 | 540.425873, 466.793701 |
| 33655 | 539.567810, 509.380493 | 38728 | 535.423889, 505.775391 |
| 33793 | 262.776306, 399.977722 | 38887 | 270.063095, 400.892517 |
| 33799 | 253.966904, 468.719086 | 38890 | 261.616714, 466.793701 |
| 33817 | 210.330401, 352.275395 | 38904 | 219.782297, 355.158785 |
| 33820 | 205.162010, 392.597595 | 38908 | 214.827797, 393.817078 |
| 33824 | 195.812111, 465.569092 | 38911 | 205.863098, 463.773712 |
| 33841 | 156.621208, 382.449203 | 38927 | 168.290695, 384.087616 |
| 33851 | 135.958000, 453.056686 | 38939 | 148.480705, 451.778015 |
| 33865 | 110.271603, 364.824097 | 38949 | 123.856102, 367.189819 |
| 33875 | 78.808201, 431.317398 | 38962 | 93.691406, 430.937012 |
| 33881 | 67.252300, 340.157715 | 38971 | 82.612198, 343.542694 |
| 33911 | 25.758200, 400.893616 | 38997 | 42.831600, 401.770508 |
| 33955 | -21.825899, 362.563080 | 39041 | -2.786300, 365.022003 |
| 33992 | -68.632702, 161.094406 | 39078 | -47.660702, 171.873299 |
| 34021 | -96.489498, 190.706215 | 39105 | -74.366600, 200.261314 |
| 34041 | -122.847698, 218.715614 | 39128 | -99.636597, 227.114006 |
| 34065 | -151.897499, 249.360603 | 39150 | -127.487297, 256.494598 |

The continuation-native identities for these last five pairs are:

| Level 4 page 12 | Level 4 page 11 | Level 2 page 10 | Level 2 page 9 |
| --- | --- | --- | --- |
| 33955 | 15160 | 39041 | 18871 |
| 33992 | 15197 | 39078 | 18908 |
| 34021 | 15226 | 39105 | 18935 |
| 34041 | 15246 | 39128 | 18958 |
| 34065 | 15270 | 39150 | 18980 |

The module's explicit `FOURTH_GUIDE_COLUMN_PAIRS` stores these twenty page 12/page 10 identities. `FOURTH_GUIDE_REGISTRATION_ANCHORS` looks up the actual records by identity and references their original center arrays directly. It also exports both IDs, contexts and the derived Ground target. It does not copy corrected centers into either source trace. The prior potential-correspondence export remains unchanged.

## Equal-weight fit and evaluated numeric exports

For pair `i`, let `S_i` be its unchanged Level 4 center and let:

```text
G_i = firstGuideGround(...secondGuideFirst(Level2_i.x, Level2_i.y))
```

Fit directly to these Ground targets with weight **one for every pair**. With centered source `(x_i, y_i)` and centered Ground target `(u_i, v_i)`:

```text
D  = sum(x_i*x_i + y_i*y_i)
a  = sum(x_i*u_i + y_i*v_i) / D
b  = sum(x_i*v_i - y_i*u_i) / D
tx = mean(G.x) - a*mean(S.x) + b*mean(S.y)
ty = mean(G.y) - b*mean(S.x) - a*mean(S.y)

Ground.x = a*Level4.x - b*Level4.y + tx
Ground.y = b*Level4.x + a*Level4.y + ty
```

This is also the composition of a Level 4 -> Level 2 least-squares similarity with the existing similarities, apart from floating-point evaluation differences. No row is rejected or reweighted. Source anchors span **705.955971 by 348.286087 PDF points** and are not collinear.

The following are the **unrounded JavaScript evaluated values** exported by `FOURTH_GUIDE_REGISTRATION.coefficients` and `FOURTH_GUIDE_TO_GROUND` at this review:

```text
a  = 0.9768104441598303
b  = -0.0000011872523668166122
tx = 29.048698716745886
ty = 13.547373785720595

FOURTH_GUIDE_TO_GROUND =
[
  [0.9768104441598303,  0.0000011872523668166122, 29.048698716745886],
  [-0.0000011872523668166122, 0.9768104441598303, 13.547373785720595]
]

scale           = 0.9768104441605517 Ground PDF points / Level 4 PDF point
rotationRadians = -0.0000012154378302508853
rmsResidualPt   = 0.0008405304758428926
maxResidualPt   = 0.0011049473442699025
```

Rotation is approximately **-0.000069639458 degrees** in the downward-positive page frame. An independent numpy fit from the exported native centers and existing Ground targets reproduced all four coefficients exactly at their evaluated double precision; its largest per-component residual difference from the JavaScript evaluation was **5.684341886080802e-14 Ground PDF points**.

As a separate native-source diagnostic, the independent Level 4 -> Level 2 similarity has `a = 0.9587050003722768`, `b = -3.336495957531762e-7`, `tx = 18.1376005252628`, `ty = 17.430993402089086`, RMS **0.0008249510178438655 Level 2 PDF points** and maximum **0.0010844668486187773**. These residuals differ from the earlier uniform-scale/translation scratch comparison because this task explicitly fits an orientation-preserving similarity.

### Exact evaluated per-pair residuals

`delta` is **fitted Ground point minus registered Level 2 Ground target**. `errorPt` is its Euclidean norm. The table retains the evaluated round-trip decimal spellings; these digits describe computation, not survey precision. All rows are also exported in `FOURTH_GUIDE_REGISTRATION.residuals`.

| Level 4 path | Level 2 path | Ground delta X, pt | Ground delta Y, pt | Error, Ground pt |
| --- | --- | --- | --- | --- |
| 33635 | 38706 | -4.650213270451786e-5 | -0.0010223480888953418 | 0.001023405131516364 |
| 33643 | 38715 | -0.0007850120554167006 | 0.000777601894583313 | 0.0011049473442699025 |
| 33651 | 38725 | -0.0005753368189971297 | 0.0003606372474109776 | 0.0006790225913133544 |
| 33655 | 38728 | 0.0002434806656310684 | 0.0010679003146378818 | 0.0010953053987540805 |
| 33793 | 38887 | -0.0004100826083117681 | -0.0009874566314351796 | 0.0010692232435768946 |
| 33799 | 38890 | 0.00039095396675747907 | 0.0005493665815947679 | 0.0006742763862812703 |
| 33817 | 38904 | 0.00023254130596228606 | 0.00032698052854129855 | 0.0004012377412754096 |
| 33820 | 38908 | -0.00022477836819234653 | -0.0008921250893649812 | 0.0009200067879541378 |
| 33824 | 38911 | 0.0007211791512418131 | 0.0006445346466534829 | 0.0009672250404753756 |
| 33841 | 38927 | 0.000579137075106928 | -0.0007249883688587033 | 0.0009279051065404322 |
| 33851 | 38939 | 0.0006736142356373875 | 0.0006555095212661399 | 0.0009399196087559328 |
| 33865 | 38949 | -0.00045091412550846144 | -0.00017966962712989698 | 0.00048539130966268514 |
| 33875 | 38962 | 0.00015772677775771626 | 0.00010323120795874274 | 0.00018850575248106677 |
| 33881 | 38971 | 0.0006442560298154376 | -0.0008362516023225908 | 0.0010556432040896445 |
| 33911 | 38997 | 0.0006616877023120082 | -0.000824192798745571 | 0.0010569410508136214 |
| 33955 | 39041 | -0.0005879117029303771 | 3.610029432365991e-5 | 0.0005890190164101248 |
| 33992 | 39078 | -0.0001613123155834728 | -0.0002752358694237955 | 0.00031902421064297697 |
| 34021 | 39105 | -0.0007132819500554888 | 0.0007269939772243106 | 0.0010184750282630313 |
| 34041 | 39128 | -0.0004400122520706873 | 0.0007959448933831936 | 0.0009094718551308234 |
| 34065 | 39150 | 9.05674180700089e-5 | -0.0003025330337891319 | 0.0003157985018164649 |

The largest numerical residual is **33643 / 38715**, followed by **33655 / 38728** and **33793 / 38887**. Their reviewed contexts remain consistent, and their errors are approximately one thousandth of a diagram point. No correspondence was discarded as an outlier. The two footprint conflicts below are not fit outliers: their paired Ground residuals are only **0.000401238** and **0.000319024 pt**.

The composed `fourthGuidePlan` scale, evaluated from unit basis points, is approximately **0.15008536502631667 model units per Level 4 PDF point**. Actual source silhouette radii would therefore be approximately **0.3746415873-0.3754365895 model units**. This is illustrative marker scale, not a measured physical column radius. Helpers derive their fit from the exported anchors and call the current shared Ground transform; these evaluated values are a reproducible snapshot, not frozen independent world coefficients.

## Read-only current Level 4 footprint audit

At review, `layout.ts` returns its **14-vertex `MAIN_FOOTPRINT`** from `footprintForFloor('4')`. The module does not import that footprint as a registration target. The audit inspected its actual runtime export, then transformed the **81 original column cubics** and sampled **513 parameter values per cubic**, totaling **41,553 silhouette boundary samples**. Shapely checked centers and polygonized silhouettes against the footprint. A geometric overlay was visually inspected. This is a dense sampled silhouette audit; it is not an exact symbolic cubic containment proof, a collision audit, or a curtain-wall thickness audit.

**Nineteen centers are inside, but only eighteen complete silhouettes are accommodated.** One inside-center silhouette crosses the fitted edge; one marker and its entire silhouette lie outside. The other eighteen silhouettes have minimum sampled boundary clearance of at least **0.0624757253 model units**.

| Source marker | World center X, Z | Main-plan X, Y | Signed center clearance, model units | Maximum sampled silhouette overrun, model units | Result |
| --- | --- | --- | --- | --- | --- |
| 33817 | -12.8245280816, -1.6307005796 | 509.1231990398, 1080.8152872986 | +0.3382513430 | 0.0311723996 | Center inside; five-cubic silhouette crosses fitted edge |
| 33992 | -37.9626716429, 42.4639892637 | 213.3803336131, 1599.5763442784 | -1.5092640396 | 1.8936122092 | Center and full silhouette outside fitted west tip |

The original Level 4 source facade visibly accommodates both markers. **33817** is the cafe/roof-access north facade marker; **33992** is the northern tip of the west reset zone on original page 11, native path **15197**. The discrepancy is with the current fitted model envelope. Neither source center is shifted, dropped, averaged with its counterpart, or excluded from the registration. Any future Level 4 shell correction belongs to the parent integration task.

Audit snapshot SHA-256 for `layout.ts`: `fd92bc514aef88e0827766ca3aec303658d2b668346ea447a14cbdb6aeda9a10`. The footprint result applies to that inspected snapshot; concurrent Ground lobby/canopy changes and later source-based Level 4 facade work require a fresh footprint audit if they affect Level 4's envelope.

## Verification, provenance and limits

Passed verification:

- All **20 unique Level 4 / 20 unique Level 2 identities** cover their complete reviewed round-column traces, with **five continuation-only Level 4 centers** retained.
- All **40 native anchor centers** were independently recomputed from freshly reopened original pages 12/10, including both curve-midpoint derivations. All **10 continuation-native centers** were independently recomputed on pages 11/9.
- **50 retained main-page source paths / 202 commands** from the two existing trace modules were compared with freshly reopened original PDF arrays and agreed exactly after JavaScript export. This includes all forty round-anchor paths and additional retained source details; the source modules were not changed.
- The new anchor exports reference the unchanged source center arrays. Ground targets equal `firstGuideGround(secondGuideFirst(...))`; independently evaluated coefficients and every residual agree with numpy to floating-point evaluation precision.
- `fourthGuidePlan` equals `groundGuidePlan(fourthGuideGround(...))`. Unit axes have equal length, remain perpendicular and preserve handedness; three representative source-pair distances retain one common scale, including a pair spanning the east end and far-west continuation.
- Standalone strict TypeScript, file-scoped ESLint, Markdown numeric-table verification and whitespace checks passed. No application build or integration tests were required for this unintegrated helper.

Commands used for the owned TypeScript file:

```sh
./node_modules/.bin/tsc --noEmit --strict --target ES2022 --module ESNext --moduleResolution bundler --skipLibCheck --noUnusedLocals --noUnusedParameters src/components/interior/iribe/fourth-guide-layout.ts
./node_modules/.bin/eslint src/components/interior/iribe/fourth-guide-layout.ts
```

Read-only registration/source snapshots:

| File | SHA-256 |
| --- | --- |
| fourth-column-trace.ts | `d52905ee64da2d1ebc441a5bee00e1086b22b0fd11c34b9befc2d888297099e9` |
| second-column-trace.ts | `4d95db6c727c09fcbb50b8da00d97733822f8f85fabb1faf7faf055b417b4960` |
| second-guide-layout.ts | `eccd226c452ab98ecf58c495c8a5382c67845281da9815d60107ed7f490524b0` |
| first-guide-layout.ts | `252fbeeb5f28f02db1c046614c2ac1254d9a56d68176f4c3a910b83421966458` |
| ground-guide-layout.ts | `dc531b1356c5a61346cd842c307a74e2084df779b03ef9f700f568517cd45ba0` |
| plan-frame.ts | `1a7ff22268968f7bbd21a7cd2ae852343f07bfeaa0493d8b8b61c63b236758ad` |

Scratch artifacts are outside the checkout under `/tmp/iribe-reference/fourth-guide-registration-*`: `original-{9,10,11,12}.png`, `crop-L{2,4}-{central,east,west}.png`, `review-L{2,4}-{central,east,west}.png`, `export-inputs.mjs`, `inputs.json`, `analyze.py`, `analysis.json`, `verify.mjs`, `exports.json`, `footprint-audit.py`, `footprint-audit.json` and `footprint-audit.png`. The identity tables, fitting equations and evaluated residuals above support reproduction without those temporary outputs.

The very small residuals support registration of a common historical drawing underlay. They do not establish physical column alignment, metric scale, column heights/materials, current fitout or a structural schedule. The Ground destination still inherits the existing four-anchor Level 1 -> Ground registration, the seven-anchor Ground -> raster registration, and the estimated `groundPlan` world scale. Ground's raster uncertainty is approximately one target pixel, and its earlier anchors are concentrated near the lobby; the twenty-pair Level 4 fit does not independently calibrate Ground across the building. Source marker centers are bounds-derived estimates, with source coordinates rounded to six decimals. Native-page rendering differences, illustrative silhouettes and the independently fitted shells remain larger limits than the reported fit residuals.

Only **`src/components/interior/iribe/fourth-guide-layout.ts`** and **`docs/research/iribe/fourth-guide-registration-2026-10-03.md`** were authored in the repository. No existing source file, integration/facade, runtime caller, generated inventory, or parent Ground lobby/canopy work was edited. No commit or push was performed.
