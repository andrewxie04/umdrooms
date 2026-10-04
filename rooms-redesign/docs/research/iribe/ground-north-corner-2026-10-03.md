# Ground north corner source correction - 2026-10-03

Delivered `src/components/interior/iribe/ground-north-corner-trace.ts`, a data-only trace of the original corner beside **column-pdf6-52303**, with this note. This task wrote only those two repository files. Existing app/model and source evidence files were left untouched; shell and column integration belong to the parent task. No commit, push, inventory generation or application build was run.

The original plan establishes a **short glazed return from the right vestibule wall into the sloping east facade**. The column is inside this corner. The current fitted corner maps to **[458.606980, 127.796344] PDF pt**, inward from the native rails. Evaluation of the current TypeScript exports reproduces **11/64 outside circular silhouette samples** and **11/64 outside original cubic contour samples**. The original contour is fully inside the two native inner glazing faces, established analytically as well as by sampling. This evidence supports correcting the local shell; the column source data supplies no reason to move the column.

## Source, frame and bounds

- Original [UMD / HDR guide](https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf), inspected from the supplied local `/tmp/iribe-reference/guide.pdf`.
- Verified SHA-256: `c1fe539a56ba3b97b7b1dcb2d4563792892294a59caeaa476f67ec810fcf7474`.
- Original zero-based **page 6**, seventh PDF page, Ground Level; **576 x 576 pt**, top-left origin, +x right, +y down. No crop or raster coordinates are exported. Labels such as north/east describe page position here, not surveyed bearings.
- Extraction: `/tmp/iribe-reference/venv/bin/python`, **PyMuPDF 1.28.2**, `guide[6].get_drawings()`, **56,651 original paths**. All IDs are original zero-based path/item IDs, never replay drawing indices. `seqno` is retained separately: many local strokes have `seqno = pathIndex + 2`.
- Visually inspected context: **[350, 60, 505, 300] pt**; item audit **[410, 95, 490, 210] pt**, 1,705 intersecting original path candidates. Local focus: **[444, 114, 462, 159] pt**.
- Exact retained architectural control bounds: **[444.740997, 114.553589, 461.264893, 158.012009] pt**. Including the two explicitly excluded pale site lines, retained bounds are **[442.832214, 114.553589, 461.264893, 185.911987] pt**. These are bounds of complete original selected paths; no path is clipped to the focus rectangle.
- Read as evidence: `ground-column-trace.ts` and `ground-guide-layout.ts`, plus the existing `plan-frame.ts` and fitted `GROUND_FOOTPRINT` for comparison. Both requested evidence modules retain their initial SHA-256 hashes.

## Native geometry and interpretation

The large black right vestibule wall is **52198**, a single filled contour with **51 native line items**. Its page-right return interface uses items **20-23**: an upper edge, a short recess step, the recess edge and a short return step. The glazing terminates just to its right. Separate recess strokes **52879/52883** and wall-outline strokes **55190-55197** confirm that this is a local wall interface. The module retains the entire wall fill, including details away from the pane attachment; it does not replace the filled contour with a bounding rectangle.

The short return has four gray pane-contour strokes **49138-49141** and ten black rail/cap strokes **54634-54643**. The corner's first sloping pane has four gray contour strokes **49124-49127** and six black rail/cap strokes **54202-54207**. The next two panes establish continuation toward increasing page y. Their native endpoint discrepancies are retained rather than forced to equal coordinates.

| Region / role | Original PDF6 paths | Original items retained |
| --- | --- | --- |
| Short return pane | 49138-49141; 54634-54643 | Item 0 of each |
| First sloping pane at corner | 49124-49127; 54202-54207 | Item 0 of each |
| Sloping continuation 1 | 49120-49123; 54198-54201 | Item 0 of each |
| Sloping continuation 2 | 49116-49119; 54194-54197 | Item 0 of each |
| Vestibule wall fill | 52198 | All items 0-50 |
| Vestibule recess strokes | 52879, 52883 | Item 0 of each |
| Adjacent wall outline | 55190-55197 | Item 0 of each |
| Existing column context | 52303 | All cubic items 0-3 |
| Pale site context, excluded from shell | 13420, 13421 | Item 0 of each |

The two pale 0.6-gray site lines **13420/13421** lie above/outside the black architectural glazing and belong to the site-outline family. They are exported explicitly as excluded context so a future integration cannot silently select them as pane baselines. The black paired rails and their 0.301991-gray pane contours establish the enclosure at this corner. The neighboring pale circular site symbols and landscape outlines were inspected for context and excluded.

Column **52303** remains the original four-cubic black fill. The existing trace's rounded control-bounds center is **[455.487289, 130.842194] pt**, and its approximate visible marker radius is **2.440168 pt**. This module retains the exact native column path as context and refers consumers to `GROUND_COLUMN_TRACE` for center/radius interpretation. Its center maps through the existing registration to **[-50.358452, -32.591096]** in the model's [x,z] frame.

## Recommended native chain for parent integration

For an interior-facing shell edge, use `GROUND_NORTH_CORNER_INNER_CHAIN`:

**54640:0 reversed -> 54207:0 native -> 54201:0 native -> 54197:0 native.**

This travels from the right vestibule wall toward the local tip, then down the sloping facade through two adjacent panes. Opposite polygon winding requires reversing both reference order and traversal flags. Resolve each reference into `GROUND_NORTH_CORNER_SOURCE_PATHS`, then map the native endpoints using **`groundGuidePlan`** from `ground-guide-layout.ts`. Map cubic controls the same way if replaying the contextual column. The trace module has no imports, mapping function or instantiated model geometry.

PDF and mapped endpoint values in this note are rounded to six decimals for readability; the module retains exact extraction floats. Mapped [x,z] positions are outputs of the current estimated registration, not new independent fits.

| Original path:item | Travel | PDF start [x,y] pt | PDF end [x,y] pt | Mapped start [x,z] | Mapped end [x,z] |
| --- | --- | --- | --- | --- | --- |
| 54640:0 | reversed | [449.058594, 126.053391] | [460.674591, 127.542389] | [-51.010167, -31.545952] | [-50.929544, -33.343528] |
| 54207:0 | native | [460.604492, 127.433899] | [458.170502, 135.428894] | [-50.945267, -33.331418] | [-49.690163, -33.060153] |
| 54201:0 | native | [458.170807, 135.428986] | [454.760803, 146.632980] | [-49.690153, -33.060201] | [-47.931292, -32.680200] |
| 54197:0 | native | [454.761993, 146.633789] | [451.351990, 157.833786] | [-47.931183, -32.680392] | [-46.172934, -32.300340] |

For an exterior-facing shell convention, keep the complete parallel `GROUND_NORTH_CORNER_OUTER_CHAIN`:

**54643:0 reversed -> 54204:0 native -> 54198:0 native -> 54194:0 native.**

Both chains contain the source column on their interior side. Choose the chain matching the parent's shell convention; retain the other face as glazing context. Mixing return and sloping rails from different faces creates an inconsistent corner.

| Original path:item | Travel | PDF start [x,y] pt | PDF end [x,y] pt | Mapped start [x,z] | Mapped end [x,z] |
| --- | --- | --- | --- | --- | --- |
| 54643:0 | reversed | [449.135803, 125.447998] | [461.010803, 126.970001] | [-51.103846, -31.550094] | [-51.021456, -33.387748] |
| 54204:0 | native | [461.264893, 127.361786] | [458.754883, 135.606781] | [-50.964689, -33.431626] | [-49.670339, -33.151893] |
| 54198:0 | native | [458.755798, 135.606995] | [455.344788, 146.810989] | [-49.670318, -33.152035] | [-47.911444, -32.771880] |
| 54194:0 | native | [455.345490, 146.811005] | [451.937500, 158.012009] | [-47.911450, -32.771988] | [-46.153072, -32.392257] |

## Joins: source establishes endpoints; closure is derived

There is **no single native vertex shared by the return and sloping rails**. The source establishes separate pane faces/caps, and the visually read enclosure relationship. The following joins are recommendations for closing a shell in a consumer, not extra source commands:

| Join | Native endpoint gap, pt | Derived line intersection, PDF pt | Derived mapped [x,z] |
| --- | ---: | --- | --- |
| Inner return 54640 -> corner pane 54207 | 0.129166290 | [460.575337, 127.529666] | [-50.930233, -33.328168] |
| Inner pane 54207 -> 54201 | 0.000318613 | No corner fit needed; retain pane break | Native endpoint pairs above |
| Inner pane 54201 -> 54197 | 0.001438945 | No corner fit needed; retain pane break | Native endpoint pairs above |
| Outer return 54643 -> corner pane 54204 | 0.466965338 | [461.370142, 127.016057] | [-51.018963, -33.443356] |
| Outer pane 54204 -> 54198 | 0.000940120 | No corner fit needed; retain pane break | Native endpoint pairs above |
| Outer pane 54198 -> 54194 | 0.000702070 | No corner fit needed; retain pane break | Native endpoint pairs above |

A short explicit endpoint bridge preserves the pane caps and corner geometry most directly. If the parent requires a miter vertex, use the same-face line intersection above, clearly as **derived shell geometry**. The inner intersection trims about **0.100066/0.100107 pt** from the two rail tips; the outer intersection extends them about **0.362278/0.361394 pt**. These operations must not overwrite exported native endpoints or be described as original PDF vertices.

The **pane-to-wall attachment also has a native gap**. Extending the inner return line to original wall fill **52198:22** gives **[448.683233, 126.005275] pt**, mapped **[-51.012772, -31.487865]**, an extension of **0.378431604 pt** from its native wall-side pane endpoint. For the outer chain, extending to **52198:20** gives **[448.826972, 125.408416] pt**, mapped **[-51.105989, -31.502302]**, an extension of **0.311357915 pt**. Those intersection points fall within the retained native wall segments. They are reproducible attachment estimates; no exact drawn connector occupies those extensions.

The fitted tip is **1.986339 pt** from the derived inner miter, approximately **0.305198 model units** under the current registration. This accounts for a material local enclosure error. Correct the tip and adjacent return/sloping runs together, then close the wall attachment and pane breaks explicitly. The selected downstream endpoint ends at the third sloping pane around y=158; any splice beyond it into the remaining fitted shell is outside this bounded trace and remains an integration estimate. Recheck that splice and shell winding in the parent. This note does not establish a complete source facade or a globally corrected polygon.

## Visual replay and evaluated-export validation

The following scratch artifacts were produced and inspected, all under the requested prefix:

- `/tmp/iribe-reference/ground-north-corner-original-context.png` and `ground-north-corner-original-detail.png`: original page crops, inspected visually before selecting paths.
- `/tmp/iribe-reference/ground-north-corner-labeled-replay.png`: original plan beside replay of the **actual evaluated TS exports**, with labels for wall 52198, return 54640, panes 54207/54201/54197 and column 52303. Native inner rails are green; the current fitted tip is a pink X. Architectural replay follows original paint order and fields; the exported pale site context is omitted from this architectural panel. The replay aligns with the original wall fill, pane contour, caps and column silhouette.
- `/tmp/iribe-reference/ground-north-corner-corner-overlay.png`: closer original crop with native inner faces, blue derived miter and pink fitted tip. Its local [447.5,124.5,462,138] pt crop makes the native endpoint gap and inset fitted tip visible.
- `/tmp/iribe-reference/ground-north-corner-module-exports.json`, `ground-north-corner-existing-exports.json` and `ground-north-corner-validation.json`: evaluated new source data, evaluated existing geometry/registration and numerical audit.

Validation bundled/evaluated the saved TypeScript using the local **esbuild** library into a scratch ESM file, then serialized its real exports. `/tmp/iribe-reference/ground-north-corner-validate.py` reopened the hashed original PDF and compared **54 paths, 107 commands and 444 coordinate values** with **exact numeric equality, maximum error 0 pt**. It also checked every retained original bound, item index/order, paint sequence, six paint-style records and the column path against the existing evaluated column evidence. Native coordinates are not merely compared to an intermediate extraction JSON. A local `no-loss-of-precision` lint exception permits exact source float decimal spellings; JavaScript numeric equality is independently verified.

The evaluated exports mapped through `groundGuidePlan` were checked against an independently applied affine matrix derived from the evaluated registration. **444 mapped coordinate values** agreed within **7.98e-12 model units**. The current map scale is about **0.153648403 model units/PDF pt**. The registration is estimated from illustrative plan correspondences, as documented in `ground-guide-layout.ts`.

Current fitted-shell sampling used the actual evaluated `GROUND_FOOTPRINT`, `groundGuidePlan` and `pointInPolygon`. Circular samples use the existing radius at 64 equally spaced angles. Native contour samples use 16 t-values per original cubic (t=0,1/16,...,15/16), giving 64 distinct samples around the four-piece loop. Both reproduce **11 outside**. Relative to the recommended two inner source faces, both sets have **0/64 outside**. Analytic cubic extrema against each inner line establish minimum full-contour clearances of **1.541141770 pt** from the return and **1.542150332 pt** from the sloping face. The approximate circular model marker has analytic clearances **1.492395018/1.462564342 pt**. These are local face containment results, not a claim that the unmodified application clipping defect has been fixed.

Standalone strict TypeScript (`tsc --noEmit --strict --target ES2022 --module ESNext --moduleResolution bundler --skipLibCheck` on the new module), file-scoped ESLint and whitespace validation passed. The two original evidence modules were hash-checked unchanged. No application build or shell/column integration was performed.

## Evidence limits

The source establishes original drawn commands, paint fields, diagram positions, the adjacent pane sequence and the depicted inside relationship of column 52303. Full native paths and unrounded coordinates are retained. Source identity is independent of any raster labels or replay path count.

The shell edge convention, closure bridges, miters, wall attachment, splice into the remaining shell, physical facade/column thickness, wall and glazing heights, material construction and model scale remain consumer choices or estimates. The original marker is a stylized cubic silhouette, and its center/radius are diagram measurements. The historical event-guide plan is not a dimensioned construction survey and does not establish present-day enclosure conditions. Only this local corner and its two immediate downstream joins were audited.
