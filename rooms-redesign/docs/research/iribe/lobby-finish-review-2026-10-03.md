# Lobby materials and lighting — 2026-10-03

## References

Visually compared the running lobby with the [UMD CS public lobby photograph](https://www.cs.umd.edu/sites/default/files/images/floorplans/lobby_photo.jpg) and the [HDR lobby stair photograph](https://www.hdrinc.com/sites/default/files/styles/carousel_image/public/2019-05/brendan-iribe-center-computer-science-engineering-stairs.jpg?itok=odGnMZt6), published on the architect's [project page](https://www.hdrinc.com/portfolio/brendan-iribe-center-computer-science-and-engineering).

The UMD view supports warm gray mottled concrete, gold modular seating, dark blue/teal chairs, a pale panel ceiling with pendant tubes, brick enclosures and a darker metal circulation soffit. HDR's view supports continuous vertical timber slats, revealed horizontal joints and irregular suspended luminous strips beneath the black upper atrium ceiling. Photographic exposure and white balance do not establish exact physical material colors.

## Changes

- Darkened the Ground concrete base and increased its soft mottling. Enlarged the repeating finish divisions while retaining fine saw-cut lines, sparse aggregate and variable polish. Upper-floor concrete remains at its prior finish settings.
- Tuned the lounge seats toward stronger gold, deep blue and teal. Existing woven upholstery, cushion seams and rounded chair shells are retained.
- Added fine brushed variation and recessed panel seams to the Ground metal soffit.
- Added subtle vertical timber grain to the Ground/Level 1 central core. Continued its slats over the lift door headers, where bare backing had been visible.
- Reduced the broad downward lounge fill and adjusted ceiling bounce. The global camera exposure and sunlight settings remain unchanged.
- Added irregular suspended linear fixtures and shallow dark service beams above the central stair. All strips are checked against the atrium outline and timber core before placement. Exact service routing, heights and fixture positions are estimates.

The added finish maps are small, mipmapped procedural textures. Fixtures and cladding share the existing material batches; the luminous strips add one material batch. No new shadow-casting light or full-screen effect was added. No measured frame-rate improvement is claimed.

## Verification

TypeScript and ESLint passed. The targeted geometry/circulation selection passed 8 cases covering atrium travel, entrance-to-mezzanine connection, upper stair opening, geometry merges, every room shortcut and cab headroom. The running browser was reopened with fresh scene geometry and inspected from the lounge, Ground entrance and Level 1 lift landing. The overhead strip was visibly rendered above the landing.

After the door-header cladding adjustment, all 26 central-lift landing cases passed. The final TypeScript, ESLint, production Vite build and whitespace checks passed. Existing bundle-size and stale Browserslist warnings remain. Browser console error logs were empty. Final lounge proof: `/tmp/iribe-reference/lobby-finish-final-2026-10-03.jpg`.

Exact finishes, lighting output and geometry registration remain estimates; this is a lobby refinement, not a claim that the complete interior is finished.
