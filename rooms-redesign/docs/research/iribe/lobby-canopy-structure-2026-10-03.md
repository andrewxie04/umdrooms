# Lobby canopy structure and continuous plaza

Reviewed 2026-10-03. This pass adds the exterior structure visible through the lobby's canopy entrance. The full-building objective remains incomplete. Source plan positions, photograph-informed forms and estimated three-dimensional dimensions remain distinct.

Subsequent seating pass: the three native C-shaped furnishing outlines are now modeled. See [canopy bench evidence and verification](lobby-canopy-benches-2026-10-03.md). The outstanding-bench statements below describe this earlier structure pass.

## References inspected

- [UMD / HDR event guide](https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf), original Ground page index 6. Local PDF SHA256 `c1fe539a56ba3b97b7b1dcb2d4563792892294a59caeaa476f67ec810fcf7474`; 56,651 original drawing records under PyMuPDF 1.28.2. Coordinates are original top-left PDF points, +Y down.
- [HDR cantilever photograph](https://www.hdrinc.com/sites/default/files/styles/carousel_image/public/2021-03/university-maryland-brendan-iribe-science-engineering-cantilever.jpg?itok=3f367H6_), opened from the architect's project page and visually inspected in the browser. It shows inclined silver supports, a bronze-toned panelled underside, shallow outer trim and small recessed lights. The plan independently establishes six support markers in two rows.
- Previously available `/tmp/iribe-reference/cantilever_photo.jpg` and `amphitheater_photo.png` were visually inspected for the inclined tube form, horizontal roof connection, rectangular soffit panels, brick paving and relation to the lower entrance court. Their local availability alone is not a newly established attribution; the direct HDR photograph above supports this pass's material/form interpretation.
- Fresh original Ground crops `[335,380,550,510]` at 5× and `[325,350,576,555]` at 3× were inspected, alongside a fresh Level 1 crop of the latter region. This distinguished the Ground dashed overhead projection from paving and the upper occupied floor. Scratch images are `canopy-structure-source.png` and `canopy-structure-page-{6,8}.png` under `/tmp/iribe-reference/`.

## Native projection and paving evidence

`canopy-structure-source.ts` retains ten complete original paths and all 22 commands, paint sequence IDs, stroke width/color and dash strings. Exact evaluated coordinates use integer fractions without rounding. It retains the full western continuation of compound path 52665 rather than clipping its source command array.

| Native identity | Evidence used |
| --- | --- |
| 52672 | Short upper-west overhead cap; outer endpoint `[378.8121032714844,398.3125]` |
| 52671 | Long dashed upper edge, `[559.4749755859375,421.7420959472656]` to `[381.51397705078125,398.6630859375]` |
| 52670 | Short upper-east cap; corner `[563.536376953125,422.268798828125]` |
| 52669 | Independent short east cap; upper corner `[563.5363159179688,422.2694091796875]` remains distinct |
| 52668 | Long dashed east edge, `[551.1829223632812,519.400390625]` to `[563.1949462890625,424.9433898925781]` |
| 52667 / 52664 | Lower-east caps; corner `[550.6734008789062,523.4049072265625]` |
| 52665 | Dashed lower projection, including the long horizontal segment and native western curves |
| 14797 | Lower paving stroke, `[412.106201171875,505.54620361328125]` to `[552.2642211914062,505.54620361328125]` |
| 14804 | Separate lower paving stroke, `[397.2264099121094,505.54620361328125]` to `[346.2064208984375,505.54620361328125]` |

The solid modeled overhead envelope connects original outer cap endpoints across their dashed breaks. This is an interpretation of the projected linework, not an opaque source fill. Its west closure extends the native canopy-door facade to the lower projected edge. The lower paving endpoints remain explicit vertices; estimated western closures meet the same extended facade. The top/east paving limit, continuous fill across planting interruptions and level grade are estimates. This is a finite exploration plaza, not a complete landscape trace or claim of all current paving extents.

All coordinates use the existing `groundGuidePlan` unchanged. Under that estimated scale, the modeled paving polygon has area 446.749223483 m² and the underside polygon has area 534.790670286 m². These are computational model areas, not verified building measurements. Both polygons are valid under independent Shapely checks. The tiny differing native upper-east corner endpoints are not snapped together.

## Support form and finishes

The existing original Ground column ledger establishes markers 52301, 52302, 52304, 52305, 52327 and 52330 outside the glazing, in two rows of three. They remain at their unchanged registered plan centers. Interpreting these diagram centers as base centers is itself an estimate: an undimensioned floor plan does not establish the cut height of a sloping support. Marker-derived model radii are approximately 0.4885–0.4890 m, not surveyed physical radii.

The two rows splay apart by an estimated **1.4 m** at an estimated **6.28 m** underside above the main Ground model datum. Bases share the existing estimated lower-court datum of **−1.8 m**, giving an 8.08 m modeled vertical rise. The angle, row-wise assignment, exact attachment points and dimensions require a section or equivalent independent evidence. The selected splay keeps every upper elliptical cut within the source-based overhead surface; it is not a measured angle derived from the photograph.

The geometry uses a circular inclined tube with horizontal end cuts, producing the correct elliptical intersections with level paving and roof. Side normals follow the actual inclined axis. Positions, normals and UVs are compatible with the existing merged geometry batches. Twelve height bands of sixteen circumscribed ellipse segments provide conservative collision around the changing axis, rather than a vertical blocker at the plan center. The band extent includes its axis displacement and covers the complete rendered tube section.

Two static materials provide brushed silver and a bronze-colored underside. Panel spacing (2.4 × 1.2 m), recessed fixture placement, rim depth and finish values are photo-informed estimates. Seams are clipped to the overhead polygon; fixtures are omitted near support attachments. No new texture, dynamic light, controller or animation loop was added. Geometry remains in shell material batches and survives room-detail culling. This is a construction/resource description, not a measured frame-rate claim.

## Continuous entrance support and verification

The previous 4 m entrance landing is replaced by the finite modeled plaza. Its existing brick UVs and lower-court height remain shared between rendering and walking support. Initial native endpoint closures left a roughly 70 mm unsupported gap at the door facade. The western closure now meets the source door baseline, preserving the original paving endpoints as separate vertices and restoring continuous support. No source door, hinge, column center or radius was moved to force a route.

Independent validation compared the actual evaluated TypeScript source exports with the original PDF: **10 paths / 22 commands**, exact coordinates, sequence identities, widths, colors and dash strings; maximum coordinate error zero. The scratch report is `/tmp/iribe-reference/canopy-structure-source-validation.json`, with evaluated data in `canopy-structure-evaluated.json`. All six base centers lie inside the paving polygon.

The final narrow canopy/geometry selection passed **17 tests**, with 452 unrelated cases skipped. The broader lobby/circulation selection passed **103 tests**, with 366 cases skipped (469 total). The nine new structure cases cover the continuous entrance/plaza aisle in both directions, all-floor standing headroom in local floor coordinates, rendered support along the aisle and beside each base, rendered and blocking inclination at walking height for all six supports, complete upper ellipse/soffit attachment, and shell visibility after detail culling. Existing checks cover all three entrance pairs, glass/leaf collision, lower-court/lobby/atrium connectivity, the finite outer edge, source lobby columns and seating, stairs, lifts, room shortcuts and geometry merging. This is selected verification, not an all-building completion claim.

Fresh actual browser use entered Iribe from the campus site, selected the canopy approach, crossed the middle pair, walked roughly 17 m along the central plaza aisle past two support pairs, turned around, and returned through the same doorway to the lower interior court without another shortcut. The final warning/error log was empty. The other pairs and all six collisions have automated checks; they were not individually exercised through physical touch in this browser pass.

Final saved captures under `/tmp/iribe-reference/`:

- `canopy-structure-plaza-final-2026-10-03.jpg`: view toward the lobby from the plaza.
- `canopy-structure-return-final-2026-10-03.jpg`: continuous return to the lower interior court.
- `canopy-structure-entrance-final-2026-10-03.jpg`: entrance-facing preview of the inclined supports, underside and photographic daylight sky.

TypeScript, ESLint, production Vite build and `git diff --check` pass. The final build transforms 3,019 modules in 4.90 s; the lazy interior chunk is 762.95 kB, 275.84 kB gzip. Existing large-chunk and stale Browserslist warnings remain. No measured performance improvement is claimed, and no commit or push was made.

## Outstanding evidence and full scope

The exact support angles/attachments, real lower-court and soffit elevations, physical radii, panel layout and complete paving/planting boundaries need a dimensioned section or suitable independent references. Three curved furnishing outlines on the Ground sheet appear consistent with the photographed outdoor benches but are not modeled by this pass. The upper cantilever facade and adjoining fitted floor envelopes still require source correction. The full-building requirement audit remains active and incomplete.

In parallel, `fourth-guide-layout.ts` now supplies a reviewed twenty-column Level 4 registration. Its read-only audit found two current facade conflicts, documented in `fourth-guide-registration-2026-10-03.md`. The helper is not yet integrated into the scene; keeping its original source centers and correcting the facade is the next structural task.
