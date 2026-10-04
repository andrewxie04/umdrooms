# Antonov seating trace — 2026-10-03

## Sources and observations

- [HDR / UMD building guide](https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf), PDF page index 8, Level 1 spread: ten rows in each of three banks, side banks fanned by 25 degrees, a wider transverse aisle between row indices 5 and 6, and continuous central desks. Coordinates retain the original 576-point page origin. The chair trace was visually compared with enlarged plan crops.
- [UMD Iribe learning spaces](https://iribe.umd.edu/innovation) states 298 seats. The guide independently contains 298 drawn chair symbols: 81 in the north bank, 137 in the center and 80 in the south bank.
- [UMD meeting/event page](https://www.cs.umd.edu/meeting-event-request) lists capacity 300 for IRB 0324. Its linked auditorium photograph does not expose all seating or provide dimensions. The model follows the guide's 298 drawn chairs; this does not establish the current operational capacity.
- [HDR interior photograph](https://www.hdrinc.com/portfolio/brendan-iribe-center-computer-science-and-engineering) shows continuous pale desks, dark mesh chairs, fanned seating, angular timber ceiling and rear brick/window bays directly inside the room.

## Trace method

The vector guide's chair symbols include a 1.392-point chair-back segment. Matching segments were deduplicated by endpoints rounded to 0.003 point, restricted to the auditorium seating region, and checked against the drawing. One wall segment outside the chair bank was excluded. Projecting onto the center bank or the ±25-degree side-bank axes groups the symbols into rows. The source coordinates are stored in `src/components/interior/iribe/antonov-seating-trace.ts`.

Row totals from front to rear are **24, 20, 30, 32, 32, 32, 32, 32, 32, 32**. The center bank's second row has eleven drawn chairs; the other center rows have fourteen. The drawing does not label the omitted chair positions, so they are not identified as wheelchair spaces or assigned an invented function. The central desk remains continuous.

## Model registration and limits

The undimensioned guide is fitted to the existing auditorium enclosure with an estimated 2.45 ground-plan-unit scale per source point. Chair centers are offset from the traced chair-back lines. Center-bank row intervals retain the larger source gaps, with a minimum estimated 1.54 m pitch to prevent desks intersecting chair backs. Side-bank row planes meet the center-bank tier boundaries at the two longitudinal aisles so that their rendered steps and collision support agree.

The drawn chair counts, widths along each bank and fan angle are evidence-based. Absolute positions, enclosure registration, row pitch, chair dimensions, desk dimensions, the 0.55 m tier rise and ceiling/fixture heights are estimates. This is a recreation of the published drawing, not a surveyed or certified as-built model. The front curved stair, south foyer, garden doorway connection and their elevations remain incomplete.

## Verification

Thirteen focused geometry and navigation checks passed after preserving cumulative source row intervals. They cover bank counts and fan angle, all chair positions inside the room, standing clearance, both longitudinal aisles in both directions, middle and rear cross-aisles in both directions, desktop/chair-back separation and rendered seating support. The same floor planes drive the visible tiers and walking support. A ground-floor rear-aisle shortcut is provided for browser inspection.

The updated geometry was reloaded through Enter building in the running website. The rear shortcut was checked, and on-screen walking controls were used to descend the south aisle to the front, turn using mouse drag and ascend to the rear windows. The source disclosure opens and shows the capacity difference and remaining estimates. This browser check does not replace physical touch testing or verify the unfinished foyer route.

Photographs were inspected as references; they are not redistributed as textures.
