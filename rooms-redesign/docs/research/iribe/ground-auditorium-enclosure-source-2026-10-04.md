# Ground auditorium lounge-facing enclosure — 2026-10-04

## Bounded source assignment

Original HDR/UMD guide `/tmp/iribe-reference/guide.pdf`, zero-based page **6**, original 576 × 576 PDF points, top-left origin / Y downward. SHA-256 `c1fe539a56ba3b97b7b1dcb2d4563792892294a59caeaa476f67ec810fcf7474`. Full unannotated Ground source and original south/west/east crops were visually inspected before selection. PyMuPDF drawing indices below are zero-based; native paint sequence numbers are retained separately.

The inner curved black band encloses the auditorium and adjoining support spaces. The separate outer band borders the outdoor stair treads and has lounge-side seating beside it. **The outer band is stair parapet context, not the full-height building enclosure.** The small furnished Gannon room is farther behind the curved band; its existing geometry supplies no trace endpoints here.

| Native paths | Ownership / consumer selection |
| --- | --- |
| 52177, 52270, 52283, 52381, 52673, 52359 | South/lobby curved building masonry. 52673 is late black architectural band paint, not a label or door symbol. |
| 52164, 52178, 52284 | Adjacent southwest building-band paint and its original outer rail; bounded continuation of the same curve. |
| 52355 | East end of curved band's native pier/link. |
| 52188, items 146–200 | South/east support-block strip and oblique return. Complete raw 52188 is retained, but its Gannon/context commands are excluded from this consumer. |
| 52344, 52348 | Native support-step-side piers attached to that return. |
| 52336, 52652; 52199 context | Outdoor stair parapet. Raw evidence only, excluded from enclosure solids. |
| 52653, 52676 | Dashed projected upper-volume context, excluded from solids and wall faces. |

No marker, furniture symbol, yellow numbered label, label white-out, stair flight, or whole western shell was converted to a wall. Only the named architectural paint selections supply the solid.

## Parent consumer interface

`ground-auditorium-enclosure-layout.ts` exports **`GROUND_AUDITORIUM_ENCLOSURE_SOLIDS`**, typed as `readonly {outer: Polygon; holes: Polygon[]}[]` in **WORLD** coordinates through the unchanged `groundGuidePlan`. It is one valid solid with **645 total boundary vertices and 16 retained native paint voids**, area **26.240648 m²** at the estimated metric scale. These paint voids are not all established physical portals; source seams and step-side paint details are retained without snapping, buffering or filling them. Largest void area is approximately 0.0691 m².

Use this mask directly for the parent-owned Ground renderer. Do not extrude the excluded outer parapet or close a convex hull around this curved band. `GROUND_AUDITORIUM_ENCLOSURE_SECTION` records the parent's provisional **Y0–6.3 m** section. That height and a brick finish are photo-informed/model estimates; the plan establishes opaque horizontal topology, not a measured vertical section or finish specification.

The raw source module retains **48 complete original paths, 619 unchanged commands, 6 styles**, including bounded door/parapet/dashed context. Compact native mask/runs are independent exports, so a runtime import of the mask does not require the raw ledger. Styles retain colors, stroke width, caps/joins, dashes, closure/fill rule, opacities and layer. No original endpoint, cubic control or rectangle orientation was rewritten.

The mask is a derived union of the named native fills, using nonzero/odd winding on noded cells. The 52188 bounded strip uses a consumer cap along its native horizontal room-face datum; the proposed cap initially added **0.207002 pt²** outside the compound fill. Intersecting the strip with the **complete unchanged native 52188 fill** removes that area. Final outboard area against its native paint is zero. This is explicit consumer clipping, not an invented source wall.

`GROUND_AUDITORIUM_ENCLOSURE_FACES` additionally supplies independent **open** outward/inward runs, source path/item ownership per segment, plan normals and separately reported endpoint gaps. Normals point toward the named side: outward toward stair/lobby, inward toward auditorium/support rooms. Raw travel is preserved and reversed only by the consumer. No gap is silently bridged into a wall. The largest within-run source seam is **0.001001051 pt**; separate runs retain their native endpoints.

## Open door interfaces

`GROUND_AUDITORIUM_ENCLOSURE_DOORS` preserves registered hinge, drawn open tip and swing-derived closed tip. These door symbols are outside the Gannon footprint and are not new Gannon entrances.

| Interface | Original leaf/swing evidence | Assignment |
| --- | --- | --- |
| West stair-access upper pair | leaves 49046–49048, 49050, 49028, 49038–49040; swings 49041/49027 | Lobby to outdoor stair. |
| West stair-access lower pair | leaves 49009, 49019–49021, 49023–49026; swings 49008/49022 | Lobby to outdoor stair. |
| East stair-side single | leaves 48884–48887; swing 48888 | Support block to stair-side circulation; elevation/access unassigned. |
| East support north single | leaves 49015–49018; swing 49014 | Support block toward east corridor; room identity/elevation unassigned. |

The selected building mask does not bridge these openings. All six individual door-span midpoints lie outside its masonry. The two east midpoints have **0.48547 / 0.48289 m** distance from this mask; the west door spans are 3.10–3.37 m away because they interrupt the separate outer stair boundary. Do not cut those west doors into the continuous inner curved building band. Door-symbol pose, width and swing do not establish current hardware or door head height.

## Source and registration checks

Reopening the original PDF and comparing evaluated TS exports verifies all **619 commands and 6 styles exactly**: maximum native coordinate error **0 PDF pt**. Both native and registered union masks are valid. Adaptive de Casteljau sampling bounds each cubic's chord error by **0.002 PDF pt**; dense 1,001-point checks of the consumed face cubics observed at most **0.001492672 pt / 0.000229347 m**. Source/world round-trip error is **7.72e-12 m**. Existing Ground registration residuals are **0.0449363 px RMS / 0.0687193 px maximum** in wayfinding pixels; estimated scale is **0.153648403 m/PDF pt**. No new fit or survey claim is introduced. TypeScript, targeted ESLint and diff checks pass.

The parent's missing-wall ray hit `[-29.77,-18.72]` maps to native **`[354.452604947,256.927016994]`**, inside this building mask. From the supplied lobby arrival/focus, the derived mask's predicted first horizontal intersection is **`[-28.792457949,-18.143793659]`**, approximately **18.417424 m** from arrival. This is a plan intersection prediction; renderer/sightline/browser/navigation checks belong to parent integration.

## Final replay review

An unannotated replay of all 48 retained original paths was generated from the evaluated commands/styles in original paint sequence and reviewed beside a freshly rendered original crop. A separate unannotated union-mask replay was reviewed in the identical native crop **`[250,220,405,300]`**, at 8×. The building curve and support return match the underlying original architectural paint; the lower stair parapet remains separate and is absent from the enclosure mask. Door interfaces stay open. The source-label, stair-tread and furniture context belongs to the original full drawing rather than the bounded replay. All 16 native mask holes are preserved.

Replay artifacts: `/tmp/iribe-reference/ground-auditorium-enclosure-native-replay.svg`, `ground-auditorium-enclosure-native-replay.png`, `ground-auditorium-enclosure-mask-replay.svg`, `ground-auditorium-enclosure-mask-replay.png`, and `ground-auditorium-enclosure-replay-original.png`. This completes the bounded source/replay handoff; the parent-owned Ground renderer and sightline/navigation/browser checks are separate integration work.

Artifacts: `/tmp/iribe-reference/ground-auditorium-enclosure-source-audit.json`, `ground-auditorium-enclosure-evaluated.json`, and `ground-auditorium-enclosure-verification.json`; original renders are `ground-auditorium-enclosure-{south,west,east}-original.png`. Only the two new enclosure modules and this new review were authored. No existing renderer, model, layout, furniture, shaft or test file was edited; no collision radius or clearance changed. No build, commit, push or full-goal completion was performed.
