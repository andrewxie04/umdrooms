# Iribe Level 1 west offices: furniture fitout, 2026-10-03

Scope: `rooms-redesign/src/components/interior/iribe/first-west-offices.ts` only. The sixteen room outlines, current door locations and `firstWestPlan` registration come from the existing `layout.ts`. Integration, references and tests remain parent-owned. No room numbers, occupant names, furniture brands or personal belongings are inferred.

## Source and coordinate convention

Primary source: [UMD Computer Science / HDR, Computer Science Day event guide, Level 1 spread](https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf). Inspected the official PDF and the local `/tmp/iribe-reference/guide.pdf`, including a complete visual rendering of zero-based page index **8**. Index 8 is the eastern half of this spread; index **7** contains its western continuation. Both pages are necessary for the sixteen offices. The existing `/tmp/iribe-reference/canonical-page-8.png` contains only the eastern half and cannot supply the complete west-office inventory by itself.

All coordinates below are **source crop pixels**, with +X right and +Y down, matching the inputs already used by `firstWestPlan`. The crop begins at PDF point `(433,165)` on page index 7 and is rendered at 4 pixels per PDF point. The two 576-by-576-point pages are joined without a gutter. The page seam is source X = **572**:

- For X < 572: page index 7, PDF point `(433 + X/4, 165 + Y/4)`.
- For X >= 572: page index 8, PDF point `((X - 572)/4, 165 + Y/4)`.
- Example: the curved front starts at `(723.71,469.21)`, or PDF point `(37.9275,282.3025)` on page index 8.

Inspection used original page renders, a stitched crop and enlarged crops. A separate inspection copy increased line contrast; it did not reveal hidden furniture or supply new evidence. Furniture outlines were checked against the PDF's vector paths as well as the raster. The model maps these coordinates through the existing affine registration; this is an undimensioned design drawing, not a measured furniture survey or confirmation of present-day installation.

## Inventory

The IDs are existing descriptive layout IDs. “Desk chair” describes a chair drawn on the working side of a surface, not an occupant or a manufacturer's chair category. Visitor chairs are included only at the drawn desk fronts or small meeting surfaces.

| Existing room ID suffix | Drawn forms | Desk chairs | Visitor chairs | Status |
| --- | --- | ---: | ---: | --- |
| `inner-office-1` | Desk with side return; small separate rectangular surface | 1 | 2 | Added |
| `inner-office-2` | Desk with side return; small separate rectangular surface | 1 | 2 | Added |
| `upper-office-1` | Desk with left return; small separate rectangular surface | 1 | 2 | Added |
| `upper-office-2` | Desk with right return; small separate rectangular surface | 1 | 2 | Added |
| `upper-office-3` | Existing three-part U-shaped fit | 1 | 2 | Preserved |
| `upper-office-4` | Existing three-part U-shaped fit | 1 | 2 | Preserved |
| `upper-office-5` | Existing three-part U-shaped fit | 1 | 2 | Preserved |
| `upper-office-6` | Existing three-part U-shaped fit | 1 | 2 | Preserved |
| `upper-office-7` | Freestanding surface with curved front | 1 | 0 | Added |
| `upper-office-8` | Existing three-part U-shaped fit | 1 | 2 | Preserved |
| `upper-office-9` | Long rectangular surface with two working-side chairs; small separate rectangular surface; near-round meeting surface | 2 | 2 | Added |
| `lower-office-1` | Desk with return; narrow rectangular surface along partition; near-round meeting surface | 1 | 2 | Added |
| `lower-office-2` | Three connected rectangular desk/return surfaces | 1 | 2 | Added |
| `lower-office-3` | Two straight rectangular desks; near-round meeting surface | 2 | 2 | Added |
| `lower-office-4` | Two straight rectangular desks; near-round meeting surface | 2 | 2 | Added |
| `lower-office-5` | Two straight rectangular desks; near-round meeting surface | 2 | 2 | Added |

Total: **16 office fits, 20 desk chairs and 30 visitor chairs**. All eleven previously generic office fits have legible furniture evidence. The curved office receives no visitor chairs or meeting table. The source does not establish whether the small separate rectangles are desks, low storage, cabinets or another furniture product; they are represented only by plain horizontal surfaces, without invented drawer fronts or contents.

## Trace coordinates before fitting

Each D list is a surface outline in boundary order. The chair centers were read from the enlarged plan to approximately +/-3 crop pixels. Most D vertices below come from vector endpoints, rounded to 0.01 pixel; the apparent numeric precision does not imply comparable placement or metric accuracy. The small rectangle in inner office 2 uses the visible edge `(311.21,280.98)-(324.39,294.00)` and the parallel edges read from the crop, with lower confidence. Round centers are approximate centers of the drawn curved outlines.

### Inner office 1

- D1: `(394.09,247.53), (407.56,260.36), (376.78,292.71), (363.31,279.88)`.
- D2: `(397.40,271.23), (407.62,260.41), (426.56,278.29), (416.34,289.12)`.
- D3: `(366.54,222.78), (379.72,235.80), (373.62,241.98), (360.43,228.96)`.
- Desk chair: `(397,294)`; visitor chairs: `(364,269), (379,253)`.

### Inner office 2

- D1: `(343.16,298.59), (356.23,310.95), (325.54,343.39), (312.47,331.03)`.
- D2: `(355.80,311.40), (374.72,329.30), (364.50,340.11), (345.57,322.21)`.
- D3: `(311.21,280.98), (324.39,294.00), (318.28,300.18), (305.10,287.16)`.
- Desk chair: `(344,345)`; visitor chairs: `(309,321), (324,307)`.

### Upper office 1

- D1: `(421.08,97.36), (453.55,128.02), (441.20,141.10), (408.73,110.44)`.
- D2: `(441.65,75.58), (452.47,85.80), (432.03,107.45), (421.21,97.23)`.
- D3: `(398.89,121.32), (405.20,127.28), (389.93,143.46), (383.61,137.50)`.
- Desk chair: `(447,112)`; visitor chairs: `(407,132), (422,146)`.

### Upper office 2

- D1: `(486.05,174.30), (517.85,205.65), (505.22,218.46), (473.42,187.11)`.
- D2: `(525.10,176.22), (535.69,186.67), (517.41,205.22), (506.80,194.77)`.
- D3: `(497.47,213.86), (503.79,219.82), (488.51,236.00), (482.20,230.04)`.
- Desk chair: `(500,182)`; visitor chairs: `(467,201), (481,215)`.

### Upper office 7: curved workstation

- Straight rear edge: `(765.23,482.85)-(736.66,456.23)`.
- Curved front cubic: start `(723.71,469.21)`, first control `(730.43,482.73)`, second control `(739.24,490.93)`, end `(753.20,496.67)`.
- Short end edges close the surface from the rear endpoints to the curved front endpoints.
- Desk chair: `(757,465)`. No other chair symbol is present in this office.
- The cubic is sampled at sixteen intervals for the extruded top and its collision boundary. The outline retains the bowed front rather than substituting a box or adding a wall-mounted return.

### Upper office 9

- D1: `(859.09,503.32), (869.91,513.54), (812.00,574.88), (801.17,564.66)`.
- D2: `(880.57,489.39), (886.89,495.35), (871.61,511.53), (865.31,505.57)`.
- Desk chairs: `(861,535), (833,565)`.
- Meeting surface center: `(881.93,565.74)`; visitor chairs: `(900,558), (873,588)`.

### Lower office 1

- D1: `(152.98,443.42), (174.81,482.37), (159.13,491.17), (137.29,452.21)`.
- D2: `(151.85,478.18), (159.13,491.17), (129.91,507.55), (122.63,494.56)`.
- D3: `(219.01,447.55), (223.27,455.12), (174.82,482.37), (170.56,474.80)`.
- Desk chair: `(136,473)`.
- Meeting surface center: `(191.60,444.00)`; visitor chairs: `(177,453), (207,436)`.

### Lower office 2

- D1: `(192.08,479.56), (213.88,518.54), (198.18,527.32), (176.38,488.34)`.
- D2: `(176.38,488.35), (183.65,501.34), (154.42,517.69), (147.15,504.69)`.
- D3: `(147.15,504.69), (168.95,543.67), (155.96,550.94), (134.16,511.96)`.
- Desk chair: `(168,520)`; visitor chairs: `(196,493), (207,511)`.

### Lower office 3

- D1: `(296.49,576.61), (303.76,589.60), (266.98,610.22), (259.70,597.24)`.
- D2: `(240.29,608.12), (247.57,621.11), (210.79,641.73), (203.50,628.75)`.
- Desk chairs: `(273,581), (218,612)`.
- Meeting surface center: `(228.68,570.48)`; visitor chairs: `(210,573), (240,555)`.

### Lower office 4

- D1: `(306.70,594.84), (313.99,607.82), (277.20,628.44), (269.92,615.46)`.
- D2: `(250.51,626.34), (257.78,639.32), (221.00,659.95), (213.72,646.97)`.
- Desk chairs: `(302,632), (247,663)`.
- Meeting surface center: `(284.07,668.73)`; visitor chairs: `(270,686), (304,668)`.

### Lower office 5

- D1: `(384.52,706.44), (391.80,719.43), (355.01,740.05), (347.73,727.07)`.
- D2: `(328.32,737.95), (335.61,750.94), (298.82,771.56), (291.54,758.58)`.
- Desk chairs: `(361,711), (306,742)`.
- Meeting surface center: `(316.72,700.32)`; visitor chairs: `(298,703), (329,685)`.
- Furniture beyond the partition toward the adjacent shared room is excluded from this office.

### Preserved upper offices 3, 4, 5, 6 and 8

These retain their existing `U_DESK_IDS` geometry, chair coordinates, rotations, standing approaches, support panels and light placement. The inspected source room ranges are:

| Office | Bounding source range containing its furniture symbols |
| --- | --- |
| Upper 3 | X 490-608, Y 173-291 |
| Upper 4 | X 546-662, Y 222-340 |
| Upper 5 | X 598-710, Y 271-396 |
| Upper 6 | X 652-774, Y 328-446 |
| Upper 8 | X 741-879, Y 424-563 |

These are search bounds, not furniture extents. Their existing three rectangular tops remain the earlier metric interpretation of the drawn workstation arrangement, rather than a new vertex trace in this change.

## Fitting and uncertainty

The raw trace is retained in `SOURCE_FITS`. Fitting changes are applied after reading it:

- New rectangular and curved desk surfaces are scaled to 96% about their own centers, then translated only as necessary to stand at least 0.16 m off the current room boundary. This resolves differences caused by the existing facade projection. It does not crop or replace a surface's form.
- New chair centers are kept at least 0.34 m inside room walls. Translations preserve the source chair count. Initial facing directions are retained except for the explicitly repositioned first visitor in lower office 1.
- Upper 1: the first visitor chair receives crop offset `(+8,-2)` and the second `(+16,+7)`. This opens the approach between them in the registered room. The resulting row is an estimated placement, not an exact reproduction of source spacing.
- Upper 2: all surfaces and all three chairs receive crop offset `(+10,-10)`, toward the exterior side, because its current door is at `(475,224.273)` and cuts through the access area of the unadjusted trace.
- Upper 9: the long desk's last two vertices receive `(+12,-12)`, shortening its corridor end. Its second desk chair receives `(+7,-7)`. This avoids the current door at approximately `(812.64,576.80)`.
- Lower 1: the first two vertices of the narrow partition surface receive `(-14,+8)`, shortening its door end. The round surface and second visitor chair receive `(-14,0)`. The first visitor is instead placed at crop-equivalent `(168,427)`, facing the adjusted meeting surface, to avoid the pocket between the desk return and meeting group. This chair placement and orientation are estimates; its presence is supported by the source symbol. These changes keep the entry, desk-chair and visitor approaches reachable.
- Lower 3: D1 and its desk chair receive `(-13,+7)` to clear the current entrance.

Crop offsets convert through `firstWestPlan`, not a nominal pixel scale. Registration varies slightly with direction: one crop pixel is about 0.04 m in the current frame. These offsets, wall insets and the earlier U-shaped fits require reevaluation if the parent changes the room or door registration.

All new tops use the existing neutral white palette and the same estimated 0.75 m center height / 0.065 m thickness as the preserved desks. Metal cylindrical supports and black chairs reuse existing primitives. Support type and placement, casters, surface finish, chair construction, ceiling height and linear lights are estimates; the guide's plan does not establish them. The near-round meeting surfaces use estimated 0.43 m radii with two chairs each. No computer, monitor, nameplate, shelving contents, drawers or extra visitor seats are supplied without evidence.

Standing approaches are 0.65 m beside or behind the corresponding seat, chosen from clear directions inside the room. Furniture top boundaries have floor-to-0.79 m collision barriers. The existing chair builder supplies chair barriers. Successful navigation checks establish modeled routes for the current walking radius; they do not certify dimensional compliance or an actual door swing.

## Verification

Validation uses the existing parent-owned circulation tests and a read-only geometry audit. No test files are added or edited by this task.

- `tsc -p tsconfig.app.json --noEmit --incremental false`: passed before the final lower-office visitor adjustment.
- ESLint on `first-west-offices.ts`: passed before that final adjustment. Whitespace scan of both owned files: clean at that point.
- Existing west-office containment/approach tests plus the corridor connection: 32 cases passed in the penultimate complete targeted run; the remaining lower-office-1 visitor approach failed and was repaired.
- Final rerun of `reaches the desk and seating approaches in 1-west-lower-office-1`: passed, including the desk-chair approach and both visitor approaches. This last edit affects only that office's first visitor position and facing direction. The complete targeted selection was not rerun after this fix; the parent owns final integration verification.
- Geometry audit confirmed that all sixteen fits' top outlines, chair centers and standing approaches were inside their current room polygons before the last visitor adjustment. The final room test also checks containment for the adjusted chair and approaches.

## Explicit evidence gaps

No remaining legible desk outline or chair count in these sixteen offices is intentionally left generic. The small separate rectangular symbols' functional type remains unresolved, especially the inferred parallel edges in inner office 2. Exact dimensions, current installation, desk support construction, storage/cabinet identification, chair mechanisms, finishes and room numbers remain unsupported. The source's near-round symbols are represented by estimated circular surfaces; their precise manufactured contour is unresolved. Added objects and their clearance adjustments are reviewable in the office module; no broader integration or source-reference changes are included.

## Parent integration verification

After the final visitor adjustment, the complete west-office containment/approach selection, corridor connection and shortcut-clearance check passed: **34 cases**. The inspected module timestamp was 07:12:09; that complete check started at 07:13:28. The note has been moved into the application research directory, and the running source record now describes all sixteen fits and their uncertainty.

## Navigation continuation — 2026-10-04

The broader review found visitor furniture disconnecting the office 1 approach and a generic U desk blocking office 4. Office 4 now uses the source front/return/rear outlines from guide page index 8 paths 23180–23186 and 24945–24947. The consumer retains its existing 0.96 footprint contraction and fitted-wall inset; it is not an exact as-built footprint. Small visitor-seat clearance adjustments are explicitly estimated. The 34 selected west-office cases pass, and all six approaches in the two affected rooms were walked out and back in the geometry harness. No clearance settings were relaxed.
