# Ground northwest service wing — 2026-11-18

## Problem

A plan overlay (the guide's Ground spread mapped through `groundGuidePlan`, with the
model's collision walls drawn over it) showed that the whole northwest wing was open
floor: no restroom block, west core, corridor or west-facade rooms. The Ground
footprint's northwest tip also followed the landscape/site wall from the wayfinding
sheet (`groundSchematic` vertices 0–2), so a stippled planting wedge was modeled as floor.

## Source

HDR / UMD building guide, `cs_day_program_book_v2.pdf`
(sha256 `c1fe539a…7474`), Ground spread on original pages 6–7 (page indices 5 and 6).
Coordinates are page-index-6 PDF points; the left page is shifted by −576 pt.

## Method

`scripts/build-ground-west-wing.py` (PyMuPDF + Shapely) with
`scripts/ground-west-wing-context.json` (model footprint, rooms, columns and existing
walls in the same frame):

- Black fills (combined per drawing with even-odd XOR) and 0.339 pt black wall outlines
  (each widened by 0.5 pt) are unioned into wall solids.
- Clipped to the corrected Ground envelope; the modeled west stair shaft, café, high-bay
  labs, columns and walls already present are excluded.
- Door openings are the original gaps between wall runs.
- Output: `src/components/interior/iribe/ground-west-wing-source.ts` (14 solids,
  636 vertices). Runtime: `ground-west-wing.ts`.

The northwest exterior wall is the native line (2.28, 202.62) → (−77.66, 287.29); its
first point lies on the model's existing northeast facade edge. These two points replace
the three fitted tip vertices in `layout.ts`. The L-shaped wall and the wall along the
top of the sheet are site walls outside the building.

## Kept clear (deliberate deviations)

- The west stair's Ground flights and approach remain at their earlier fitted position
  (about 0.5 m from the drawn stair). Traced walls are clipped around them so the 492
  circulation cases, including the continuous G–5 west stair walk, still pass.
- The modeled café back wall, menu boards and counter zone.

## Estimates

6.3 m wall height, painted finish, a 3.2 m dropped ceiling over the enclosed wing, a
22 pt downlight grid and one broad area light. The source has no section, reflected
ceiling plan or finish schedule.

## Not done

Doors and hardware, restroom stalls and fixtures (thin 0.07 pt lines), room names and
furniture, and re-registration of the west stair to the drawn position.
