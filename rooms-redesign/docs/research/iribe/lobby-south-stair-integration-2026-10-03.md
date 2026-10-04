# Lobby south stair: provisional connected reconstruction

Research and integration date: 2026-10-03. The full-building objective remains incomplete. This pass extends the south vestibule work with an enclosed Ground-to-Level-1 walking connection. Native plan geometry is evidence; the vertical stack is an interpretation.

## Source and correspondence

Primary source: [UMD Computer Science / HDR event guide](https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf), original PDF page indices 6 (Ground) and 8 (Level 1). SHA256 `c1fe539a56ba3b97b7b1dcb2d4563792892294a59caeaa476f67ec810fcf7474`. Original zero-based path identities and top-left PDF coordinates are retained in the two ledgers. See [Ground review](lobby-south-stair-2026-10-03.md) and [independent Level 1 review](first-south-stair-2026-10-03.md) for complete extraction evidence and limitations.

Ground has fourteen primary cross-sections delimiting thirteen visible intervals, a cut across the north run and an access at the west. Level 1 has thirteen primary row families on each run (twelve intervals each), a cut across the south run, an uncut north run and an access at the east. Paired outlines and the short extra terminal outline are not counted as extra steps. Icon paths 56631 and 97828 were omitted only from independent architectural replays to expose underlying source vectors; no raster inpainting was used.

The alternating cut/access pattern supports a plausible three-flight switchback: Ground north west-to-east, Level 1 south east-to-west, Level 1 north west-to-east. No dimensioned section or explicit architectural direction arrow in the used sources confirms that stack. Native row positions use the existing Ground/Level 1 guide registrations unchanged; these registrations and the metric scale are estimates.

## Runtime construction

- `lobby-south-stair-layout.ts` uses 13 + 12 + 12 native inter-row intervals. The existing estimated 6.5 m floor rise is allocated uniformly over 37 nominal intervals: heights 0, 2.2837837838, 4.3918918919 and 6.5 m. The approximately 0.175676 m interval rise is an application allocation, not a verified riser schedule. Unidentified terminal bands remain unresolved.
- Two turning decks follow native apron/rail boundaries where present, with explicitly estimated closures between the registered run ends. Their areas are approximately 5.843679 and 7.088440 m². An estimated 19.016346 m² slab mask and a 0.096922 m² top join provide the modeled floor connection. The source central outlined strip is not claimed to be a verified shaft void.
- The Level 1 enclosing walls preserve eight native opaque fills: 92691, 92692, 92693, 92700, 92766, 92772, 92775 and 92777. Independent closed subpaths and rectangle orientations are evaluated under their native nonzero fill rule before union. The result has two polygons and seven holes. Source paint area sums to 564.7254602590 pt²; union area is 564.6989837527 pt² because of original overlap. No fitted replacement rectangles, snapped contours or buffered repairs are introduced.
- The Level 1 door uses original outer leaf 85248 and closed-tip endpoint from swing curve 85252. The distinct inner/outer leaf endpoints are preserved. Its leaf height, header, hardware and open display pose remain estimates. Ground doorways remain those from the preceding south-vestibule pass.
- `lobby-south-stair.ts` builds horizontal tread tops, full front risers, continuous sloping soffits and side/end faces. The risers cover the full nominal interval rise; an initial 0.16 m box implementation left visible narrow gaps and was replaced after browser review. Custom faces retain position, normal and UV attributes so existing merged material batches remain compatible. Rails, post dimensions and concrete finish are estimates using existing materials.
- Shared support follows the same registered run/deck footprints, with continuous ramp heights for navigation. Height-dependent side barriers prevent leaving the flights. Both floors' shell batches retain the stair when Ground room details are culled. The interface adds a South stair shortcut on Ground and Level 1 and projected runs on the minimap.

## Reproduction and source checks

`scripts/build-south-stair-source.py` reopens the hash-verified original PDF with PyMuPDF 1.28.2 and writes compact runtime evidence. The complete 464-path Level 1 research ledger is not imported into runtime. Regeneration to a scratch file was byte-identical to `lobby-south-stair-source.ts`.

Evaluated exports were independently compared against original PDF records:

- Ground: 122 paths, 488 endpoint coordinates, native stroke/color fields and all fourteen joined section extrema match exactly; maximum coordinate error zero.
- Level 1 raw ledger: 464 paths, 840 commands and seven paint styles match exactly. Its independent 1420 × 720 architectural replay has zero changed RGB channels.
- Compact runtime Level 1 evidence: all 26 row sections, three door endpoints and ten apron edges match the independently selected original source extrema/endpoints; maximum coordinate error zero.
- Independently rasterized original Level 1 wall paint versus the runtime union: 1704 × 816 at 24×, 5,752 pixels differ at antialias edges and zero pixels differ after thresholding. This is paint-region agreement, not an identical antialias replay.
- Both turning decks, the slab mask and the top join are valid simple polygons under Shapely checks. Validity does not establish physical accuracy of their estimated closures.

Scratch audits: `/tmp/iribe-reference/south-stair-source-validation.json`, `south-stair-first-original-walls.png` and `south-stair-first-union-walls.png`; independent Level 1 raw audit under `/tmp/iribe-first-south-stair/`.

## Navigation, rendering and build verification

The broader selected circulation pass completed **91 tests**, with 368 unrelated tests skipped (459 total at that stage). It covered the south stair, the three researched entrances, lobby/atrium and lounge paths, source columns, lifts, room shortcut placement, west enclosed stair and amphitheater. After adding the closed-riser regression and completing the surface fix, the final south-stair/geometry selection completed **10 tests**, with 450 unrelated tests skipped (460 total). This is selected verification, not a claim that the full suite or all-building routes were checked.

The eight new south-stair tests check all three flights and both turns in both directions, the Ground lobby doorway through the Level 1 outer approach and back, rendered support/headroom across three lanes of all 37 bands, closed front risers, sideways height continuity, side-guard rendering/collision, Level 1 doorway support/headroom/leaf visibility and shell visibility after Ground detail culling. The two existing selected geometry checks also pass without dropping a material batch. A draft custom quad without UVs caused a merge failure during development; matching UV attributes corrected it and the final geometry checks pass.

Fresh actual browser use ascended from Ground through both turns, all three flights and out of the Level 1 door before the final surface-only riser correction. A fresh scene after that correction descended from Level 1 through both turns and all three flights to Ground. The displayed floor changed naturally during the middle flight; no shortcut was used during either stair journey. The final captured warning/error log was empty. This does not verify physical touch input or every area of the building.

Final gates pass: `npx tsc -b`, `npm run lint`, `npx vite build` and `git diff --check`. Vite transformed 3,016 modules in 5.00 s. The lazy interior chunk is 753.88 kB, 273.41 kB gzip. Existing large-chunk and stale Browserslist warnings remain; no measured frame-rate improvement is asserted. No new texture or animation loop was added for this stair.

Final browser captures: `/tmp/iribe-reference/south-stair-final-ground-2026-10-03.jpg` and `/tmp/iribe-reference/lobby-final-review-2026-10-03.jpg`. The lobby capture also reviews the previously installed photographic daylight sky and material pass; that asset was not changed in this stair pass.

## Remaining accuracy work

Confirm the stair's vertical section, total flight/terminal-band count, real floor rise and landing elevations from independent evidence. Review enclosure/rail/door finishes against clear photographs. The complete adjoining auditorium/vestibule wall, remaining fitted Ground facade areas, other entrances and the rest of the full-building requirement audit remain unfinished. The route is modeled and tested; its vertical stack must continue to be described as provisional.
