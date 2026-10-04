# Lobby finishes and photographed daylight

Reviewed 2026-10-03 in response to the user's request to focus further on the lobby and replace the unrealistic sky. This is a focused improvement; the full-building goal remains incomplete.

## References inspected visually

- [UMD Computer Science lobby photograph](https://www.cs.umd.edu/sites/default/files/images/floorplans/lobby_photo.jpg): warm gray polished concrete with fine light joints; rounded yellow modular upholstery with a lower body and separate seat cushions; blue/teal lounge buckets and green accents; white round tables; pale smooth paneled ceiling with paired slots, vertical tube pendants and small downlights; reddish brick enclosure; gray metal corridor soffit.
- [HDR's Iribe portfolio](https://www.hdrinc.com/portfolio/brendan-iribe-center-computer-science-and-engineering): amber vertical slats on the curved lift enclosure, pale perforated stair guards, gray metal undersides, white columns, a separate exposed black atrium ceiling and suspended luminous strips.
- The published UMD/HDR Ground plan remains the authority for the five traced sofa outlines, sixteen chair centers/orientations and twelve pairs of round table outlines. They retain the shared Ground registration; the photographs do not establish present-day movable furniture placement.

Building reference photographs were inspected without being redistributed as application textures. Local research copies are `/tmp/iribe-reference/lobby-official.jpg` and `hdr-lobby-stair-elevator.jpg`.

## Changes

- Split each source-contoured sofa into a rounded upholstered lower body and a separate soft cushion, using a warmer yellow cushion and darker golden base. The existing plan outlines and walking barriers remain in place. Upholstery has the existing mipmapped fine weave; no repeated per-frame geometry is introduced.
- Refined blue and teal upholstery colors while retaining the photo-informed green accents. Individual chair color assignments remain estimates.
- Tuned the polished Ground concrete toward warm gray and reduced the large mottle contrast. Fine saw-cut joints, sparse aggregate and variable roughness remain procedural approximations.
- Tuned the Ground/Level 1 timber cladding toward the architect photo's amber finish. Slat positions and enclosure geometry remain unchanged.
- Lightened the circulation soffit to satin gray panels rather than the nearly black rendered finish, retaining the separate pale lounge ceiling and genuinely black exposed atrium zone.
- Retuned warm broad downward light and upward floor-bounce fill so the ceiling and furniture remain readable. These are approximations of indirect and fixture illumination, not calibrated light measurements.

## Sky and lighting asset

[Poly Haven Kloofendal 48d Partly Cloudy Pure Sky](https://polyhaven.com/a/kloofendal_48d_partly_cloudy_puresky), original by Greg Zaal and sky edit by Jarod Guest, is [CC0](https://polyhaven.com/license). The unchanged 1024×512 HDR file is local to `public/interior/iribe/`; its original MD5 and download URL are recorded in `ASSETS.md`. Both the local and built file match the original digest and size of 1,435,119 bytes.

This is an illustrative photographed sky, not a UMD location image or current-weather simulation. It adds cloud detail and supplies a matching prefiltered ambient/reflection environment. The background preserves the original radiance. Only the lighting copy caps peak solar radiance to avoid duplicating energy from the scene's directional sun. The sun azimuth and background/environment rotations agree; their alignment to the building and chosen light outputs are estimates.

The asset is requested only when entering Iribe. One PMREM is generated at startup, transient texture/generator resources are released, and the background/PMREM are disposed when leaving. Abort handling prevents a discarded mount retaining the sky. If loading fails, the existing procedural sky and studio environment remain available. Cached shadows, batched geometry and on-demand draws remain in use. No measured frame-rate improvement is claimed.

## Verification

- TypeScript: `npx tsc -b` passed.
- Lint: `npm run lint` passed.
- Production: `npx vite build` passed. Existing bundle-size and Browserslist warnings remain.
- Whitespace: `git diff --check` passed.
- Focused circulation regression: **160 passed, 268 unrelated cases skipped**, 428 total. It includes Ground lobby seating/entrance routes and atrium, Level 1 west/north rooms and garden, central lift landings, Level 2 source columns/glazing/north-office chair approaches, and continuous west stairs. Subsequent material-only refinements do not change geometry or walking support.
- Used the running site's Enter building flow, returned to Campus map, and re-entered fresh scenes. Selected Lobby lounge, walked forward using the visible movement control, turned toward the windows and inspected the cushions, chairs, floor, ceiling, timber and cloud sky.
- The browser error log showed no runtime errors during this review. One earlier development warning reported multiple Three.js instances after hot updates; `npm ls three` resolves one installed version, 0.185.1. This is not a physical touch or comprehensive device benchmark.
- Final screenshots: `/tmp/iribe-reference/lobby-final-core-daylight-2026-10-03.jpg` and `/tmp/iribe-reference/lobby-final-window-daylight-2026-10-03.jpg`.

## Accuracy limits

Exact ceiling elevations, reflected ceiling layout, fixture output, furniture product dimensions, current movable furniture arrangement, metric column dimensions and the unresolved atrium section/upper gap remain unverified. The photo-informed finishes improve resemblance; they do not establish survey-grade geometry or full-building completion. Remaining floor/room gaps are retained in `reconstruction-progress.md` and the in-app reference ledger.
