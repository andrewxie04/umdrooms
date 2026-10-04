# Ground architectural guide registration - 2026-10-03

`groundGuidePlan(pdfx, pdfy)` in `src/components/interior/iribe/ground-guide-layout.ts` registers original Ground guide coordinates into the existing Ground world frame through `groundPlan`. It uses one similarity fitted to seven common structural column centers. Every furniture point receives that same transform, preserving relative positions, angles, proportions, and handedness. Registration and model scale are estimates from published diagrams, not surveyed measurements.

## Sources and coordinates

- Primary architectural source: [UMD / HDR building guide](https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf), local `/tmp/iribe-reference/guide.pdf`. Original PDF page index **6**, the seventh PDF page, is **576 by 576 points**. Index 5 is its left continuation and was visually inspected for context.
- Inspected canonical rendering: `/tmp/iribe-reference/canonical-page-6.png`, **1152 by 1152 pixels**. Divide its pixel coordinates by two before calling the helper. Input uses the original index-6 page origin, positive X to the right and positive Y downward. Cropped or enlarged trace coordinates need their crop offset and scale reversed first.
- Registration target: `/tmp/iribe-reference/ground-wayfinding-01.png`, **1920 by 1080 pixels**, the existing Ground wayfinding frame. The existing reference ledger attributes this plan to [UMD Residential Facilities](https://drf.umd.edu/about-us/learning-day/2026). Its underlying architectural columns, stair walls, and facade were inspected, including a contrast-enhanced temporary rendering. Large colored room highlights and opaque icons were excluded from the fit.
- Existing destination transform: `layout.ts` exports `groundPlan` and the traced `GROUND_FOOTPRINT`. The helper calls that transform directly and does not alter the shell or any existing feature.

SHA-256 identifiers for the inspected files:

| File | SHA-256 |
| --- | --- |
| guide.pdf | `c1fe539a56ba3b97b7b1dcb2d4563792892294a59caeaa476f67ec810fcf7474` |
| canonical-page-6.png | `8c3bf2610df91890da75108386ab69d52ea982123328929fb8b323b52c5a00fd` |
| ground-wayfinding-01.png | `c39e01ed216ca421f60d90596ba77fdeb01a6889e2a6c03b612a692f02d482d1` |

## Matched anchors

These are centers of round structural column markers, matched by their arrangement beside the lift/stair and two east entrance stairs. Guide centers are the midpoints of the filled black paths' bounding rectangles returned by PyMuPDF `guide[6].get_drawings()`. Drawing indices below are zero based and refer to the identified source PDF. Six decimals retain vector coordinates; they do not imply measured building precision.

Wayfinding centers were first identified visually. Their faint circular outlines were then centered against the original raster, using bilinear red-channel darkness sampled at 72 evenly spaced angles around a circle. Search was restricted to a 3-pixel neighborhood of each visually identified marker with circle radii approximately 4.7-6.1 pixels, then refined at 0.02-pixel intervals. Pixel sample indices were converted to image boundary coordinates by adding 0.5. Fit anchors use the resulting centers rounded to 0.01 pixel. The different marker radii reflect different column symbols; radius is not a scale anchor.

| Anchor / common feature | Drawing index | Guide PDF (x, y) | Wayfinding (x, y) | Fitted minus target (dx, dy), px | Error, px |
| --- | ---: | --- | --- | --- | ---: |
| Lobby north-west column | 52455 | (193.198807, 349.015518) | (1050.36, 638.94) | (-0.0565, +0.0005) | 0.0565 |
| Lobby north-east column | 52428 | (234.502098, 357.647522) | (1139.72, 657.60) | (+0.0119, +0.0371) | 0.0390 |
| Column east of atrium stair | 52429 | (229.454300, 397.041107) | (1128.80, 742.94) | (-0.0039, -0.0088) | 0.0096 |
| Column south-west of east stair | 52402 | (285.732697, 404.250122) | (1250.62, 758.56) | (+0.0288, -0.0108) | 0.0308 |
| Column south-east of east stair | 52368 | (341.969986, 411.459595) | (1372.38, 774.12) | (+0.0324, +0.0481) | 0.0580 |
| Entrance west column | 52406 | (277.126694, 471.395813) | (1232.00, 904.00) | (+0.0043, -0.0686) | 0.0687 |
| Entrance east column | 52372 | (334.312500, 471.396698) | (1355.84, 903.94) | (-0.0171, +0.0025) | 0.0173 |

The anchors span approximately 322 by 265 target pixels and are not collinear. Their relation to the architectural underlay was verified visually before fitting; no guessed core center, cab fit, or auditorium registration was used as an anchor.

## Fit and matrices

For centered guide points `(x, y)` and centered target points `(u, v)`, equal-weight least squares gives:

```text
D = sum(x*x + y*y)
a = sum(x*u + y*v) / D
b = sum(x*v - y*u) / D
tx = mean(u_original) - a*mean(x_original) + b*mean(y_original)
ty = mean(v_original) - b*mean(x_original) - a*mean(y_original)
```

The helper derives these coefficients from its exported anchors. The approximate matrix taking `[pdfx, pdfy, 1]` to wayfinding pixels is:

```text
[ 2.165196960  -0.000160397   632.046059162 ]
[ 0.000160397   2.165196960  -116.777814790 ]
```

Scale is **2.165196966 target pixels per PDF point**; rotation in the downward-positive image frame is **+0.004244 degrees**. Anchor RMS residual is **0.04494 pixels** and maximum is **0.06872 pixels**. A general affine comparison gives RMS 0.02604 pixels and maximum 0.03677 pixels; its improvement is below raster digitization uncertainty, so the similarity was retained to preserve furniture geometry without shear.

Composed with the inspected `groundPlan`, the approximate direct world matrix is:

```text
[ -0.012687537   0.153123670  -64.614477199 ]  -> world X
[ -0.153123670  -0.012687537   38.814854580 ]  -> world Z
```

Thus guide +X maps mostly to world -Z and guide +Y maps mostly to world +X. The composed scale is approximately **0.153648403 model units per PDF point**. These coefficients are rounded for reporting; the implementation computes the fit from the stored anchors and calls the current `groundPlan` rather than freezing this direct world matrix.

## Independent outline checks and visual review

Black architectural wall paths were transformed and overlaid on the original wayfinding raster. Visual review showed consistent registration at the west lab partitions and curved facade, cafe/front partitions, north auditorium exterior and entrance notch, lift enclosure, east entrance stair, and lower entrance stair. The guide's interior auditorium walls do not coincide with all enlarged room highlights; highlights were not treated as precise architectural boundaries.

Two corresponding exterior features were also compared with the existing coarse `GROUND_FOOTPRINT` vertices, without including them in the column fit:

| Feature | Guide point / vector origin | Registered wayfinding point | Existing footprint vertex | Difference, px |
| --- | --- | --- | --- | ---: |
| North entrance exterior wall end | (246.3661, 84.3757), drawing 52264, end of item 8 | (1165.464, 65.952) | (1167, 62) | 4.240 |
| Lower entrance stair exterior south-east corner | (331.8071, 515.8441), drawing 52373, end of item 62 | (1350.391, 1000.179) | (1350, 998) | 2.214 |

These compare guide wall faces with a manually traced thick schematic perimeter, so a few pixels of difference are expected. They demonstrate the existing shell's approximation more meaningfully than the small column residuals. The lower entrance check also confirms the parent's suggested lower curtain-wall region: for example, guide `(271,505)` maps to approximately `(1218.733,976.690)` in wayfinding coordinates.

The very small anchor residuals describe agreement between drawing representations with a shared architectural underlay. They do not establish physical building accuracy. Treat approximately one target pixel (about 0.071 model units) as a practical raster digitization uncertainty and allow several pixels at the coarse shell. The anchors are concentrated near the lobby; farther geometry is supported by visual wall alignment, not separately measured residuals throughout the building.

Temporary analysis files, outside the checkout, include `/tmp/iribe-reference/fit-ground-guide-registration.py`, `ground-guide-fit-registration.json`, and `ground-guide-overlay-registration.png`. The anchor table and least-squares equations above are sufficient to reproduce the helper even if these temporary files are removed.

## Local lift registration conflict identified before integration

`atriumLiftSource` is a deliberately fitted local cab registration. Its source outward normal `(0.99186,0.12734)` is projected onto its local +X and was placed along world +X before the integration below by `atriumPoint`. It is not a valid global Ground registration.

Applying the global fit to that same source normal gives normalized world direction approximately **(+0.045002, -0.998987)**, **2.579 degrees from world -Z**. This supports the parent's proposed quarter turn `atriumPoint(localx,localz) = [ATRIUM_CENTER.x + localz, ATRIUM_CENTER.z - localx]` as an orientation correction. It does not establish that the existing core placement, cab axes, stair geometry, or dimensions become fully source registered after that change.

The source cab reference `(222.394,432.6)` globally maps to wayfinding **(1113.503,819.922)** and world **(-1.194810,-0.727559)**. At the inspected `ATRIUM_CENTER = (0.425,1.7)`, the proposed rotated local cab reference `atriumPoint(1.85,0)` would be **(0.425,-0.150)**, about **1.720 model units** from that global source position. The existing cab fit uses 0.13 model units per PDF point, while this global fit uses approximately 0.15365, about 18.19% larger. Position, scale, and the remaining 2.58-degree direction difference need to be reviewed explicitly if the parent wants the core fully registered.

Neither this helper nor furniture coordinates compensate for that conflict. It imports no cab/stair transform and does not use `antonovDiagram`, which fits a different Level 1 page. The parent's core correction and any shell/core collision adjustment remain separate integration work.

## Verification and scope

Only the new registration helper and this new research note are authored. No existing floor shell, feature, rendering code, or test is changed. No commit, push, or agent spawn is performed.

Focused verification passed: the helper's strict TypeScript check; recomputed anchor residuals from the exported data; expected global cab normal; equal axis lengths, perpendicular axes, and preserved handedness; and relative distances for three representative furniture-point pairs. The helper was bundled in memory with esbuild for those numeric checks. No application build or generated-file script was run. Rendered furniture integration is performed by the parent.

## Parent integration and route verification

The parent subsequently changed `atriumPoint` to compose the original local fit back into source PDF coordinates and then apply `groundGuidePlan`. This implements the full global position, scale and orientation correction, rather than just a quarter turn. `lift-layout.ts` derives the cab axes from that transform; the atrium stair width uses the transformed unit scale. The opening, core and stair rendering follow the same frame. The stair path, opening contour, metric heights and landing remain fitted estimates, not a fresh trace of every source riser.

All 26 central-lift landing/cab/headroom cases passed after this correction. Atrium ascent/descent passed. Entrance approaches were updated to walk through the open bottom of the first flight rather than its side guard; both entrance-to-atrium journeys passed in both directions. A new ray check sampled three points per atrium flight/landing against the positioned building and found no overhead intersection within standing clearance. This checks the rendered path; it does not establish source fidelity of the stair dimensions. Existing Ground structural column positions have not yet been replaced with the guide markers.

A subsequent focused check passed the Level 1 path from each of the two lift landing shortcuts outward across the apron onto the mezzanine floor and back. The running browser also confirmed Ground-to-Level-1 travel and exiting the first cab. This extends route verification without claiming a complete upper-floor circulation audit.

## Structural continuation

The subsequent structural pass replaced all twenty-four source-inside Ground round-column centers using the complete trace in `ground-column-trace.ts`. Their radii follow source marker silhouettes rather than measured construction diameters. The sunken-court columns extend down to the existing estimated floor; an older photo-fitted duplicate was removed. Six exterior canopy markers are retained without being instantiated.

The lower atrium flight now maps its actual twenty cross-sections through this common frame. Those cross-sections delimit nineteen tread bands and preserve the angled, widening lower footprint. The walking support projects perpendicular to the cross-sections, preventing lateral movement from changing standing height. The curve, connector, upper flight, opening and elevations remain fitted, and need the further source review recorded in `atrium-stair-review-2026-10-03.md`. Thirty-seven focused checks passed after integration; browser review confirmed the lower column bases and lounge approach.
