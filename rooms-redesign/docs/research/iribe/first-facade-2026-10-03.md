# Level 1 west facade correction, 2026-10-03

## Evidence and raw trace

The official [UMD / HDR guide](https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf) shows a west tip and changing-angle café curtain wall that differed from the fitted `MAIN_FOOTPRINT`. Two verified Level 1 column centers fell outside that fitted floor: original page 8 paths **92881** and **93057**. Their source positions were retained during this correction.

`first-facade-trace.ts` preserves **54 original interior-facing glazing-pane baseline commands**, plus **one south corner-interface command**. Original zero-based pages **7/8**, drawing indices, item indices and untransformed PDF coordinates are recorded. Page 7 continuation coordinates translate by x −576 into page 8; points retain six decimal places. PDF SHA-256 remains `c1fe539a56ba3b97b7b1dcb2d4563792892294a59caeaa476f67ec810fcf7474`.

The window baselines are the thin gray paired lines along the outer wall, with short black mullion details. They are distinct from the nearby furniture and internal glazing. Original page 7 includes the full west tip and one pane crossing the spread seam (**57691**); page 8 includes the café curve through **85821**. The south corner-interface is original page 7 **57866**. Native path arrays and source overlays were visually reviewed without altering the PDF or distributing reference images in the application.

## Model integration

`first-facade-layout.ts` translates the continuation, joins adjacent pane baselines across their drawn mullion gaps, then applies the existing four-column `firstGuidePlan` registration. Adjacent baseline intersections within two PDF points are used; almost parallel lines use the midpoint between pane terminations. Those small joins are an interpretation of the glazing/mullion assembly. The café line keeps each changing pane angle; no independently fitted circular arc or per-column correction is added.

`FIRST_FOOTPRINT` replaces the west tip/café portion of the Level 1 envelope. Both previously deferred columns are rendered at their original registered centers, with diagram-silhouette radii. All **25** source-inside markers are now instantiated. The floor, slab underside, curtain wall and walking boundary use the same corrected footprint.

Level 1 west perimeter office vertices and room 1134 window-side vertices project to this envelope. North perimeter room vertices, Sandbox exterior vertices and the Family Garden doorway/terrace registration also use the revised Level 1 envelope. Room-door positions and interior fitout remain separately fitted; no verified source column was shifted to clear them. Other floors retain their existing envelopes.

## Limits

This is a **partial facade correction**, not a complete measured Level 1 shell. The south connection to the retained fitted shell remains an estimated short join. The north straight continuation now starts at the traced café endpoint and connects to the existing fitted north corner; its full length is not traced here. The remaining south/east facade and room registrations, metric scale, elevations, glass thickness, mullion dimensions and present-day finishes remain estimated. The source pane baseline describes the historical plan, not verified survey coordinates.

## Verification

- Reopened the original PDF and compared all **55 commands / 220 coordinates**. Maximum six-decimal rounding error: **0.000000496094 PDF pt**. No source-coordinate offsets were introduced.
- Checked the source center of every instantiated Level 1 column and **32 silhouette samples per column** against the corrected floor.
- Cast rays onto all four cardinal faces of both restored columns and checked their **16 collision sides**, confirming modeled cylinders rather than detached/fitted wall fragments.
- Checked rendered glass alignment and actual walking collision at four café pane locations.
- The final focused selection passed **116 tests**, with **307 skipped / 423 total**. Coverage includes Ground lobby seating/entrance journeys, both atrium flights and landing, lift cabs/landings, all Level 1 north/west room routes, west fitout, Sandbox equipment, garden and conference seating. This is not a complete building audit.
- Fresh browser entry reconstructed the scene. Selected manual checks included the upper atrium view, movement toward the west facade from the west office corridor, room 1134 and return to the Ground lounge. The entire west lounge route was not manually walked. Screenshot: `/tmp/iribe-reference/first-facade-corner-final-2026-10-03.jpg`.
- TypeScript project check, full ESLint, production `vite build` and `git diff --check` passed. The production build retains the existing chunk-size/Browserslist notices; it does not establish a frame-rate improvement. Final browser error-log query returned an empty list.

Source analysis, original-coordinate validation, pane overlays and scripts remain under `/tmp/iribe-reference/first-facade-*`. No inventories, commits or push were generated by this correction.
