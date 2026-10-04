# Level 2 columns and complete glazing perimeter

Reviewed 2026-10-03. This pass integrates the independently checked source trace into the existing walkthrough. The full-building reconstruction remains incomplete.

## Authority and source coordinates

UMD/HDR's [published guide](https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf) identifies Level 2 on original zero-based page 10; its west continuation is original page 9. The original PDF SHA-256 is `c1fe539a56ba3b97b7b1dcb2d4563792892294a59caeaa476f67ec810fcf7474`. Coordinates are PDF points, top-left origin, +Y down. Native command identities refer to the original pages, not cropped/replayed drawings. Page 9 coordinates are canonicalized by subtracting 576 from X.

The twenty verified round markers, five continuation-only markers, original cubic extrema/radii, native commands and separate furniture outlines remain in `second-column-trace.ts`. All twenty source centers remain unchanged. No nonround source detail is promoted to a round column.

## Shared registration

`second-guide-layout.ts` uses all twenty visually paired Level 2/Level 1 round markers with equal weight in an orientation-preserving similarity. It then applies the existing Level 1/Ground registration. No feature-specific translations are applied.

The Level 2 to Level 1 transform is approximately:

```
x1 = 1.0025320363263717*x2 - 0.0000003542979604235565*y2 + 1.4673890898791886
y1 = 0.0000003542979604235565*x2 + 1.0025320363263717*y2 + 0.9998655056465395
```

The maximum native paired-center residual is 0.001194 Level 1 PDF points. This supports registration of a shared historical CAD underlay. It establishes neither survey axes nor measured physical dimensions. Radius scaling, heights, finishes and floor elevations remain model estimates.

## Complete source perimeter

A west-only correction still left a fitted north façade intersecting source column `column-pdf10-38728`. The correction now uses the **entire ordered loop of 195 native inner glazing baselines**, rather than the fitted north/east/south envelope. All source positions and pane directions come from Level 2 itself.

`second-facade-trace.ts` records each native page/path/item ID and endpoints to six decimal places. Two north-west curve baselines use black main strokes 41992 and 42075; the gray caps are separate source commands. Gray roof skirts, exterior parallel outlines and outer pane strokes were excluded. The short east curve bridge 36347 is retained explicitly. Pane 36403 crosses the page seam; adjacent continuation panes are read from original page 9 without duplicating that pane.

`registeredClosedGlazingBaseline` joins adjacent lines through drawn mullion/corner gaps, preserving the changing pane angles. For stable nearby intersections, both extensions must be less than two PDF points; otherwise the two neighboring endpoints are averaged. The largest original gap is 0.973405 points at the west tip. The north cap's two corner gaps are each less than 0.918 points. These connections are interpretations of drawn joints, not measured corner hardware. A complete native baseline loop does not imply a surveyed building envelope.

All 195 commands / 780 endpoint coordinates were checked against freshly reopened original pages. Maximum rounding error is 0.000000501 PDF points. Both complete source overlays were visually inspected. The original PDF was not overwritten and no reference image was copied into the application.

## Model and collision integration

- All twenty columns are instantiated at their common registered source centers, with radii derived from source silhouettes.
- Every sampled point on each silhouette lies inside the source-based Level 2 floor.
- The full glazing loop drives the rendered floor, slab, ceiling, curtain wall and exterior walking barriers.
- Twelve north-office window edges project to that perimeter. The north offices, Hatchery rooms and shared furniture now transform their original crop coordinates through the same Level 2 registration.
- No Level 1 columns or facade positions were changed by this Level 2 integration. The shared pane-join routine retains the prior Level 1 behavior.
- Level 4's independently verified twenty-column raw trace is retained for later integration. Levels 3–5 still use provisional model posts; no source-accurate structural claim is made for them.

## Focused verification

The four new focused checks pass: all twenty source positions/silhouettes, standing-height rendered cylinders and full-height sixteen-sided column collision, five west-facade samples, and seven north/east/south facade samples. Each glass sample includes an actual rendered ray hit and attempted walking through the facade.

The initial north-corner ray check correctly exposed the wall/column intersection. After correcting the perimeter, the twenty-column barrier count also exposed a test ambiguity: an adjacent room wall was tangent to the same radius. Column identification now checks both circular endpoints and the sixteen-sided apothem, retaining the strict sixteen-edge requirement rather than counting arbitrary nearby walls. The rendered first-hit checks still inspect all geometry, including glass and room walls.

The broader selection passed 160 checks (268 unrelated cases skipped), covering Ground lobby seating, entrances and atrium, Level 1 offices and garden, both central lift landings, Level 2 columns/glazing/north rooms, and continuous west-stair ascent/descent.

## North workspace and approach corrections

The north crop origin is original PDF coordinate (404,365) and its original enlargement is 8x. `hatcheryPlan(x,y)` now uses `secondGuidePlan(404+x/8,365+y/8)`, replacing its independent wayfinding fit. All north furniture, room partitions and the twenty structural centers therefore share the source registration. A two-pixel semantic common-area boundary was aligned with the existing shared office front; no architectural wall was shifted for that boundary.

The original plan crop was visually rechecked. The north row has meeting-chair counts 2,3,2 in three of six offices; the east row has counts 3,3,2,3,3 in five of six offices. Generic four-chair additions were removed. Two-seat orientation follows the drawn table axis; three chairs use a triangular arrangement oriented to avoid the working-side chair. Exact furniture forms, inset dimensions, supports and finishes remain estimates. A shared pure office layout now drives the rendered chair positions and route checks. Every actual office chair has a tested reachable approach, with walks back into the main circulation; inaccessible arbitrary window points are not substituted for furniture approaches.

The west stair approach point was moved 0.3 m into its already-open doorway approach after the newly aligned column exposed body overlap at the old point. The source column, shaft, flights and door were not moved. Standing approach clearance is tested on every modeled storey. Both ascent and descent passed the broader selection.

Browser review checked Level 2 north collaboration, the corrected standalone column and the surrounding offices. This does not establish measured dimensions or survey-grade alignment.

## Remaining limits

The source retains the historic drawing's layout, not current movable furniture. The Level 2 restrooms, classroom highlights, remaining interior room outlines and lift core still use independent earlier fits and need common-source review. Their existing route tests cannot prove exact architectural alignment. There is no dimensioned structural section, verified metric scale, floor height schedule or reflected ceiling plan. A full source perimeter does not resolve the other floors, all interior partitions, stair elevations, continuous lift shafts or the complete full-building goal.

## Scratch provenance

Scripts and metadata are retained outside the repository under `/tmp/iribe-reference/`: `second-registration-audit.py/json`, `second-facade-match.py`, `second-facade-matches.json`, `second-facade-full-candidates.py/json`, `second-facade-full-export.py`, `second-facade-full-selected.json`, `second-facade-full-validation.json`, and complete `second-facade-full-verified-9.png` / `-10.png` overlays. Native input arrays and source-only validation remain under the `second-columns-` prefix.
