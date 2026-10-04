# South lobby vestibule and north corner integration

Reviewed 2026-10-03. This continues the lobby accuracy work; **the full-building goal remains incomplete**.

## Authority and modeled scope

Original UMD-hosted HDR guide, Ground page index 6:
https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf

The unchanged supplied PDF has SHA-256 `c1fe539a56ba3b97b7b1dcb2d4563792892294a59caeaa476f67ec810fcf7474`. Original coordinates are PDF pt, top-left origin, +Y down, 576 × 576 page. South/north in this source review describe page position, not a new surveyed bearing or official entrance name. All points use the existing estimated `groundGuidePlan` registration.

The reviewed south ledger now supplies four paired openings in two parallel rows, eight held-open paired leaves, two separate adjoining stair leaves, the opaque vestibule/stair enclosure and eleven adjacent glass panels. Source hinge and open-tip positions are unchanged. The source's continuous pale facade runs help define the floor boundary; they are not independently drawn sills for each doorway. The old fitted facade crossed the vestibule and has been replaced locally. The original eight paired jambs remain distinct.

The upper single stair leaf retains its original four-line contour in the source ledger. Its rendered glass currently uses the primary native edge with an estimated thickness/profile, as do the other leaves; the contour is not evidence of a measured physical thickness. The stair enclosure's two doors and Ground approaches are modeled, but **its stair flights, upper connection and complete interior remain unfinished**. No floor-changing shortcut substitutes for those missing flights.

Wall/ceiling height 6.3 m, door height 2.4 m, frames, transom rails, push bars, colors and glass construction remain estimates. Pale concrete is an unverified enclosure finish. The 4 m level exterior brick landing is finite exploration geometry, not a surveyed plaza perimeter/grade; it shares the Ground datum. Approximately 220 × 110 mm running-bond pavers use the existing canopy/masonry texture. The historical plan does not establish current hardware, movable furniture or the present configuration.

## Wall paint and derived geometry

The authoritative source retains 33 opaque fill paths and 34 separate closed contours. Compound path 52373 retains its two native subpaths; one includes a small self-crossing return detail. Extruding each input as a simple polygon would not consistently reproduce its nonzero PDF fill rule. Separately extruding overlapping patches would also create coincident faces.

The saved generator `scripts/build-south-wall-union.py` in this research directory nodes the original segments, selects cells by the original **nonzero winding** rule and unions the painted regions. It does not snap coordinates, buffer/repair the contour, substitute rectangles or change the raw ledger. The resulting 18 union polygons and 24 internal rings form a compact static render mask. Derived intersections are labeled as such; raw original paths remain the authority.

Summed painted area is 949.3306447356008 pt². The union is 949.2679406781789 pt², removing 0.06270405742191087 pt² of overlapping paint. Evaluated runtime exports exactly reproduce the computed mask (symmetric-difference area 0). Every resulting boundary vertex is on a native fill segment within 5.40e-14 pt. At 24 pixels/pt, independent original-paint/runtime-union replays are 3552 × 1032: **6,957 antialias pixels differ and one thresholded pixel differs**. This is not pixel identity; removing repeated black edge painting changes antialias coverage. Neither raster rendering nor the source establishes surveyed dimensions.

At the right wall/pane junction, independently rounded source endpoints made a tiny self-crossing floor triangle. The floor now joins native wall segment 52373:63→62 and pane 49325:0 at their analytic intersection `[333.134680740213, 505.440399169905]` pt rather than moving either original segment. Other short connections between separate strokes and joins into the remaining fitted shell are estimates. The complete Ground footprint and sunken-court slab are valid simple polygons. The source union's outside-floor difference is approximately 1.03e-9 pt² after inverse registration, a floating-point comparison residue.

Reproduction requires PyMuPDF 1.28.2 and Shapely 2.1.2. It checks the original PDF hash/page identity before using native path indices:

```sh
python docs/research/iribe/scripts/build-south-wall-union.py /path/to/guide.pdf --output /tmp/lobby-south-solids.ts
```

Regenerating directly from the original PDF produced a byte-identical `lobby-south-solids.ts`. The Python/GEOS tools are offline preparation dependencies; they are not imported by the application. Geometry uses existing white, glass, metal and masonry batches, with no additional material, texture or animation loop. No measured performance claim follows from this implementation or passing builds.

## North corner correction

An independently reviewed local trace establishes the short return and three sloping panes beside `column-pdf6-52303`; see `ground-north-corner-2026-10-03.md`. Parent review inspected the labeled original/export replay. Its source audit compared 54 paths / 107 commands / 444 coordinates with the original PDF, with zero numerical source error.

The old fitted corner cut eleven of sixty-four column-circle samples. The shell now uses the native inner faces 54640:0 reversed, 54207:0, 54201:0 and 54197:0, reversing traversal for the Ground ring. A derived same-face miter closes the corner; extending the return about 6 cm to wall 52198:22 closes the wall attachment. Tiny source pane-break gaps are retained. Four panes and the attachment glazing are rendered with estimated heights/profiles; near-coincident native pane ends share one estimated mullion. The full adjoining auditorium/vestibule wall and downstream facade still have fitted parts.

The column's original registered center/radius are unchanged. All 24 source-inside Ground circular silhouettes now fit the floor, including a 15 mm margin in the sampling check. The corrected corner's complete 64-sample column footing has actual rendered floor support. This does not establish physical column dimensions or finish/elevation fidelity throughout the building.

## Verification and browser use

- Both paired lanes: walk from lobby through both rows onto the landing and back, with 21 rendered-floor and standing-headroom samples per lane.
- Both single stair doorways: supported entry/return and standing headroom at the modeled Ground approaches.
- All ten held-open leaves and eleven neighboring panes are rendered and blocking; four broad source wall locations have horizontal render and collision coverage.
- Both vestibule approaches connect to the furnished lounge and atrium stair through the movement model; the shortcut is clear and the finite landing stops outward walking.
- Native north glazing has rendered/collision coverage; all 24 Ground column circles fit, and the corrected north column has complete rendered footing support.
- Broader selection including courtyard/canopy entrances, lobby seating, atrium/amphitheater stairs, lift landings, room shortcut arrivals and west stairs: **84 passed, 368 skipped, 452 total**. This is focused coverage, not proof of the entire building.
- TypeScript, ESLint, Vite production build and whitespace gates passed. Existing large-chunk/Browserslist-age warnings remain. Interior chunk is 741.71 kB / 270.37 kB gzip; comprehensive device/frame-rate measurements remain incomplete.

In a freshly entered interior at `http://127.0.0.1:5173/`, normal 999 × 983 viewport, selected **South entrance**. Walked out through the first paired lane and both rows, turned and moved across the finite exterior landing, then re-entered through the second lane and both rows into the main lobby. No further shortcut was used during this route. The photographic cloud sky was visible through the entrance. The two single stair doors and distant north corner were tested geometrically but were not independently walked in this browser pass; physical touch remains unverified. No warning/error messages were captured during final browser review.

Actual saved screenshots:

- Approach and daylight: `/tmp/iribe-reference/lobby-south-approach-final-2026-10-03.jpg`.
- Both vestibule lanes from the exterior landing: `/tmp/iribe-reference/lobby-south-exterior-final-2026-10-03.jpg`.
- Main-lobby arrival after returning through the second lane: `/tmp/iribe-reference/lobby-south-return-final-2026-10-03.jpg`.

Scratch validation evidence: `lobby-south-union.json`, `lobby-south-runtime-exports.json`, `lobby-south-runtime-validation.json`, `lobby-south-union-authority.png`, `lobby-south-union-runtime.png` and `lobby-south-modeled-overlay.png`, all under `/tmp/iribe-reference/`. Other full-building gaps remain in `reconstruction-progress.md`.
