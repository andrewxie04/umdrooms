# South entrance stair — Ground source review (2026-10-03)

## Evidence

Primary source: [UMD/HDR event guide](https://www.cs.umd.edu/sites/default/files/images/cs50/cs_day_program_book_v2.pdf), original PDF page index 6 (Ground spread). SHA256 `c1fe539a56ba3b97b7b1dcb2d4563792892294a59caeaa476f67ec810fcf7474`. PyMuPDF 1.28.2 returns 56,651 original drawing records. IDs below are the original zero-based drawing IDs, not crop/replay IDs. Coordinates are native PDF points with top-left origin.

The stair is inside the enclosure to the right of the two-row south vestibule. Ground doors were integrated in the preceding pass. This is different from the schematic north enclosed stair and the source-traced west stair.

The red staircase annotation is original path 56631. An independent vector replay omitted only that identified annotation to inspect the stair lines underneath; the underlying lines were neither inpainted nor guessed. Temporary source images: `/tmp/iribe-reference/south-stair-ground-source.png`, `south-stair-ground-unobscured.png` and `south-stair-ground-context.png`.

## Native geometry

`ground-south-stair-trace.ts` retains 122 original single-line paths: 50294–50384, 50666–50672 and 52040–52063. This includes tread outlines, the five-piece stair-plan cut, rail boundaries and the hooked rail return. Each record retains original path ID, both endpoints, stroke width and color as exact evaluated floating-point values. Fractions in TypeScript avoid loss of precision without changing values.

Fourteen primary nosing sections delimit thirteen visible tread bands. They run from x=292.195709 to x=314.731110, with cross-sections approximately y=488.968597–498.424591. Fragmented lines are joined only at their native outer extrema across cut and rail interruptions; parallel offset outlines are not counted as extra steps. Their varying native bounds are retained. Path 50356 is a separate return-flight line at x=313.154999, y=500–509.769989. The Ground sheet does not independently draw its entire return-flight sequence.

The right turning landing is bounded by lines 50378 (north), 50373 (east) and 50370 (south). Rail hook paths 50380–50384 and 52040–52063 are separate from the walking footprint. The diagonal lines above the enclosure wall at y≈469–483 belong to the adjoining lobby/amphitheater context; they are not copied into this stair.

## Verification and limits

Evaluated TypeScript exports were compared directly against the original PDF. All 122 records and 488 endpoint coordinates match exactly (maximum error zero), including color and stroke width. All fourteen joined sections equal the extrema of their referenced native fragments. The same Ground column registration places these vectors in the model; its metric scale is an estimate.

The undimensioned guide establishes plan geometry, not elevations, finishes, current hardware or an exact floor-to-floor section. In particular, the existing estimated 6.5 m Ground-to-Level-1 rise must not be described as measured. With only two thirteen-band flights it would imply approximately 250 mm per band, so elevation/flight allocation required further reconciliation rather than an unsupported claim of accuracy. The subsequent Level 1 review supports a provisional three-flight interpretation, now modeled and walked in both directions; see [integration and verification](lobby-south-stair-integration-2026-10-03.md). This Ground source review by itself does not establish a verified vertical section.
