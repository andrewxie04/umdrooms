# Lobby courtyard entrance

Reviewed 2026-10-03 in response to the request to focus further on lobby accuracy. The previous pass refined the photographed lobby material palette and added an illustrative photographed sky; see `lobby-daylight-2026-10-03.md`.

## Source and visual comparison

Original UMD/HDR architectural guide:
https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf

SHA256: `c1fe539a56ba3b97b7b1dcb2d4563792892294a59caeaa476f67ec810fcf7474`.
Original Ground page index 6, 576 × 576 PDF points, top-left origin and positive Y down. Path numbers refer to the original page's PyMuPDF drawing list. The courtyard crop and native path overlays were inspected visually. Coordinates in `lobby-courtyard-trace.ts` preserve the source float values as exact binary fractions.

The old model treated the vestibule as a continuous glazed notch. The plan shows two pairs of doors on the courtyard side and two pairs on the lobby side, eight leaves altogether, solid side walls, and two round columns just inside the neighboring glass facade.

| Feature | Original paths | Treatment |
| --- | --- | --- |
| Outer leaf lines | 48914, 48915, 48889, 48890 | Exact hinge and drawn open endpoints |
| Outer swing cubics | 48916, 48949, 48891, 48892 | Retained as source evidence |
| Inner leaf lines | 48911, 48910, 49030, 49029 | Exact hinge and drawn open endpoints |
| Inner swing cubics | 48913, 48912, 49032, 49031 | Retained as source evidence |
| Inner side faces | 55066, 55096 | Establish the vestibule's axis and landing direction |
| Opaque side wall/jamb fills | 52278, 52449, 52424, 52422 | Full 99-edge plan silhouettes extruded into static volumes |
| Adjacent glass panes | 54646, 54644; 54651–54654 | Exact pane baselines and end mullions |
| Right facade corner | 54645 | Exact short corner segment |

All 29 retained source path records use the common seven-column Ground guide registration. No column was moved to accommodate the entrance. The final actual module exports were compared directly with the original fill and line coordinates; they matched exactly.

## Modeling and corrected defect

The initial implementation joined the fitted facade to the deep ends of the long inner side strokes. Those strokes continue past the actual glass junctions. This clipped parts of columns `column-pdf6-52419` and `column-pdf6-52452`, despite the door-route checks passing.

The corrected floor outline follows the source exterior opaque faces and adjacent interior glass baselines. Both source column circles now fit entirely inside the lobby. A rendered-floor check samples 64 points just outside each column's footprint; it catches the original defect without shrinking or shifting the columns.

The two glazed rows have two openings each, fixed center panes and framed transoms. All eight leaves remain open at the source diagram's drawn endpoints. Frame rails and push bars are simple estimated geometry. The door row glass, source adjoining panes and metal frames merge into the existing static shell batches. The cladding and small paved landing add two static material batches; no new animation or rendering loop is introduced.

The source only establishes plan geometry. The 6.3 m chamber height, 2.4 m door height, 3.4 m horizontal frame rail, metal profiles, hardware, cladding color/material, physical scale and held-open operation are estimates. The 4 m level exterior landing is a finite walkthrough support area, not a traced limit of the whole courtyard. Its rectangular paving texture and zero threshold elevation are provisional. Remaining facade sections retain their earlier registration and interpretation.

## Verification

- Both door-pair routes pass the actual movement/collision model to the exterior landing and back, with rendered floor support and standing headroom sampled along the routes.
- Source leaves and solid sides are visible in the rendered geometry and stop walking through their surfaces.
- The shortcut connects to the lounge and atrium stair through the actual movement model.
- Movement stops at the finite landing edge; it cannot walk onto unsupported exterior terrain.
- Both adjoining columns retain complete interior footings and rendered floor support.
- Broader lobby, atrium, lift, room-shortcut and west-stair selection: **61 passed, 374 skipped, 435 total**. This is a focused selection, not a full-building verification.
- TypeScript, ESLint, Vite production build and `git diff --check` passed. Build warnings about existing chunk sizes and Browserslist age are unchanged limitations, not measured performance results.
- Browser: fresh Enter building, Courtyard entrance shortcut, walked through one door route onto the landing, turned back, and returned to the lounge. The second route is covered by the movement and geometry checks. No captured runtime errors or warnings during that browser review.
- Sky asset remained visible with natural cloud detail; the sky is illustrative daylight, not a photograph of UMD or a weather simulation.

Browser evidence:

- `/tmp/iribe-reference/lobby-courtyard-return-final-2026-10-03.jpg`
- `/tmp/iribe-reference/lobby-courtyard-entrance-final-2026-10-03.jpg`

## Remaining entrance work

The independent east-canopy source review recovered three outward-swinging pairs, including the pair obscured by the yellow callout. Its exact trace and validation are in `lobby-canopy-door-trace.ts` and `lobby-canopy-doors-2026-10-03.md`; it remains source-only. The other entrance models, canopy structure, measured vestibule elevations, current door hardware and finishes still require integration or better evidence. The full-building goal remains incomplete.
