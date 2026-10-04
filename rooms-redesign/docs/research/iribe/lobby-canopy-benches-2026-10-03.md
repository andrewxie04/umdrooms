# Lobby canopy: curved timber seating

Reviewed 2026-10-03. This pass adds the three curved outdoor benches visible through the lobby entrance. The full-building objective remains incomplete. Native plan positions and shapes are distinct from estimated materials, hardware and physical dimensions.

## References and trace

- [UMD / HDR event guide](https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf), original Ground page index 6, 576 × 576 pt, top-left origin with +Y down. Local PDF SHA256 `c1fe539a56ba3b97b7b1dcb2d4563792892294a59caeaa476f67ec810fcf7474`; PyMuPDF 1.28.2 returns 56,651 original drawing records.
- The original page crop `[325,350,576,555]` and fresh individual crops were visually inspected. The faint C contours are segmented gray line paths, not cubic curves or the black structural-column symbols. Original source records include zero-width/height bounding boxes; a bounds-intersection query alone missed these lines. Item endpoints identify the complete contours.
- [HDR's cantilever photograph](https://www.hdrinc.com/sites/default/files/styles/carousel_image/public/2021-03/university-maryland-brendan-iribe-science-engineering-cantilever.jpg?itok=3f367H6_), previously opened from the architect's project page and visually inspected, shows timber curved seating and metal supports beneath the canopy. The previously available `/tmp/iribe-reference/cantilever_photo.jpg` was inspected again for radial slats, seat depth and the narrow metal legs. Its local existence does not independently establish new attribution. Matching the plan furnishing outlines to this photographed bench form is an interpretation, not proof of their current configuration.

`canopy-bench-source.ts` retains **163 complete native line commands**, with path IDs, exact original endpoints and shared stroke width/color/dashes. Exact binary coordinates are written as integer fractions. Path index equals paint sequence number for every retained record.

| Outline, in source-page directions | Inner chain | First end cap | Outer chain | Second end cap | Total paths |
| --- | --- | --- | --- | --- | --- |
| North | 13265–13291 | 13326 | 13292–13321 | 13327 | 59 |
| South-west | 13165–13189 | 13323 | 13190–13217 | 13322 | 55 |
| South-east | 13218–13239 | 13324 | 13240–13264 | 13325 | 49 |

The complete chains were independently replayed over the original page and visually inspected. Scratch overlay: `/tmp/iribe-reference/canopy-bench-original-replay.png`. This includes both inner/outer edges and the original caps; no opening was closed or bench relocated to fit a route.

## Registered geometry and estimates

All positions use the unchanged `groundGuidePlan`. It is an estimated diagram registration, not a surveyed scale. Native independent path endpoints have tiny discrepancies: maximum join gap **0.002224645626050732 pt**, roughly 0.34 mm under this model scale. Raw endpoints remain intact in the source ledger. Triangulated outlines join each pair at its midpoint to avoid self-intersections caused by retaining out-and-back microsegments; each displacement is at most half the gap. Source shapes are not replaced by generic circular meshes.

A least-squares inner-circle center only orients radial slats and hardware. The occupied polygon still follows the native chains. Each wooden slat is clipped against that polygon, with a narrow real gap. Collinear clipping spikes are removed before triangulation. The final **439 slats** are simple valid polygons within the occupied outlines.

| Outline | Model occupied area, m² | Slats |
| --- | ---: | ---: |
| North | 4.298194430886217 | 170 |
| South-west | 3.6277502691069046 | 146 |
| South-east | 2.9569659488356286 | 123 |

These areas are computational model values, not physical measurements. **0.46 m** seat height, **55 mm** wood thickness, approximately **65 mm** outer slat pitch, gap fraction, two supporting rails, twelve narrow legs per bench, feet, metal finish and timber weathering are photograph-informed estimates. Benches are backless in this interpretation; no unverified backrest was added. Bases share the existing provisional lower-court datum of **−1.8 m**.

Collision follows the complete occupied seat arc and both caps from paving to seat height. The centers and openings remain clear. The small slat gaps are conservatively treated as occupied seat rather than holes through which a person can walk. Rendering remains in existing shell geometry batches, with two added static materials, a reused wood texture and no new texture, dynamic lights or animation loop. This describes implementation resources; it is not an FPS measurement.

## Verification

Independent comparison of the evaluated TypeScript exports against the original PDF validated all **163** path identities/sequence numbers, line command counts, endpoints and stroke width/color/dashes. **Maximum coordinate error: zero.** Independent Shapely checks found all three occupied outlines and all 439 slats valid. Total slat area outside each occupied polygon was below `4e-15` model m², numerical noise. Report: `/tmp/iribe-reference/canopy-bench-source-validation.json`; evaluated runtime/source data: `canopy-benches-evaluated.json` in the same directory.

The focused selection passed **24 tests**, with 452 unrelated cases skipped (476 total). Seven new cases cover walk-in/return and standing clearance through every opening, rendered seat height and walking collision for each bench, and shell visibility after room-detail culling. Existing selected checks cover all three entrance pairs, lobby/atrium connectivity, plaza support/headroom, each inclined support, full upper attachment, finite boundary and geometry merging.

Two former test routes crossed the newly occupied seating. Their source positions were preserved. The plaza route now turns through native `[416,455]` and follows the clear aisle along native Y=455; the finite-edge check uses the same aisle. One column collision check uses its opposite clear side because the source south-west bench borders the former approach. These changes test actual remaining clearance rather than moving furnishings or ignoring their collision.

Fresh browser use entered Iribe from the campus site, selected the canopy entrance and crossed the middle pair. It walked the plaza aisle past the first seats, approached the north bench, encountered the seat cap, aligned with its opening and stepped into the clear center. The return left that opening, followed the aisle, and crossed the middle door into the lower lobby court without another shortcut. The natural photographed sky was visible outside. Automated opening checks cover all three benches; this browser pass physically exercised one. This was browser pointer control, not a physical touch test.

TypeScript, ESLint, Vite production build and `git diff --check` passed. Vite transformed 3,022 modules; the interior chunk was 781.94 kB / 281.43 kB gzip. The existing chunk-size and stale Browserslist warnings remain. No runtime-performance benchmark or full-building completion is claimed.

The final warning/error log was empty. Saved actual-site captures include `/tmp/iribe-reference/canopy-bench-center-2026-10-03.jpg` (inside the open seat arc) and `/tmp/iribe-reference/gannon-ground-floor-2026-10-03.jpg` (the subsequent auditorium check).

A user question about a missing second ground-floor auditorium prompted an original-plan/code/browser check. [UMD’s CS50 schedule](https://www.cs.umd.edu/cs50/schedule.html) lists Antonov and Gannon on Ground; [UMD’s room request page](https://www.cs.umd.edu/meeting-event-request) identifies 0324 Antonov and 0318 Gannon. Both already have runtime rooms and auditorium geometry. The Gannon shortcut was exercised in a fresh scene and showed its seats, shared desks and stepped floor. Its furniture/finishes and full entrance connections still need source correction; showing the existing model does not establish fidelity. No third auditorium was added on this evidence.

The exact current seating/hardware, measured seat and canopy elevations, complete paving/planting geometry and upper cantilever facade still need evidence. The source-backed lobby/entrance work continues under the full requirement audit.
