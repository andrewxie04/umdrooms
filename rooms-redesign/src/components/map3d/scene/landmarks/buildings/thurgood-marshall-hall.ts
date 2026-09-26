// UMD Public Policy: https://dgi.umd.edu/news/architectural-excellence-takes-center-stage-thurgood-marshall-hall
// UMD green building tour: https://sustainability.umd.edu/green-building-tour
import * as THREE from 'three';
import type { LandmarkModule } from '../types';
import { facadeBoxOnEdge, mappedEdge } from './_shared/mapped-facade';

export const landmark: LandmarkModule = {
  id: 'way/958049551',
  spec: { name: 'Thurgood Marshall Hall', color: 0xa57f72, height: 19.2, roof: 'parapet', nightGlow: 0.35 },
  maxHeight: 23.5,
  build(ctx) {
    const { pts, baseHeight, spec, helpers } = ctx;
    const b = helpers.bboxOf(pts);
    const brick = helpers.withGlow(spec.color, spec.nightGlow);
    const white = new THREE.Color(0xe0e1da);
    const glass = helpers.withGlow(0x56717d, 0.5);
    const parts = [
      helpers.withColor(helpers.extrudeFootprint(pts, baseHeight), brick),
      helpers.withColor(helpers.extrudeFootprint(pts, 0.4).translate(0, baseHeight, 0), white),
      helpers.withColor(helpers.extrudeFootprint(helpers.scaleAbout(pts, (b.minX + b.maxX) / 2, (b.minY + b.maxY) / 2, 0.96), 0.12).translate(0, baseHeight + 0.4, 0), white),
    ];
    // Both long elevations are diagonal in the mapped plan. The old
    // axis-aligned bands missed those walls by over five metres at their ends.
    const longWalls = [
      mappedEdge(pts, b, [0.0, 0.31], [0.61, 0.529]),
      mappedEdge(pts, b, [0.062, 0.0], [0.675, 0.22]),
    ];
    for (const edge of longWalls) {
      facadeBoxOnEdge(parts, ctx, edge, 0.055, 0.945, 2.5, 15.8, 0.14, 0.075, glass);
      for (const h of [6.7, 11.2, 15.8]) {
        facadeBoxOnEdge(parts, ctx, edge, 0.052, 0.948, h, h + 0.2, 0.18, 0.10, white);
      }
      for (let i = 1; i < 11; i++) {
        const f = 0.055 + 0.89 * i / 11;
        facadeBoxOnEdge(parts, ctx, edge, f - 0.0025, f + 0.0025, 2.5, 15.9, 0.18, 0.10, white);
      }
    }
    // The north stem ends in a short, nearly east-west wall near the top of
    // the footprint; its former pane sat farther south and beyond the stem.
    const stemEnd = mappedEdge(pts, b, [0.571, 0.999], [0.648, 1.0]);
    facadeBoxOnEdge(parts, ctx, stemEnd, 0.08, 0.92, 2.5, 16, 0.14, 0.075, glass);

    // UMD's exterior photos show glazing and pale framing wrapping the side
    // elevations too. These surveyed segments were previously bare brick,
    // which made the hall read as a featureless slab from the chapel lawn.
    // Normalizing the map polygon can reverse its winding, so identify these
    // walls by approximate endpoints rather than raw vertex positions.
    const sideWalls = [
      [[0.572, 0.602], [0.571, 0.999]],
      [[0.775, 0.942], [0.776, 0.580]],
      [[0.734, 0.530], [1.000, 0.461]],
      [[1.000, 0.461], [0.954, 0.145]],
      [[0.954, 0.145], [0.675, 0.220]],
      [[0.062, 0.000], [0.000, 0.310]],
    ] as const;
    for (const [first, last] of sideWalls) {
      const edge = mappedEdge(pts, b, first, last);
      const bays = Math.max(3, Math.floor(edge.length / 4.4));
      const halfPane = Math.min(1.18 / edge.length, 0.42 / bays);
      for (const bottom of [3.45, 8.1, 12.75]) {
        facadeBoxOnEdge(parts, ctx, edge, 0.06, 0.94,
          bottom - 0.19, bottom, 0.16, 0.095, white);
        facadeBoxOnEdge(parts, ctx, edge, 0.06, 0.94,
          bottom + 2.75, bottom + 2.94, 0.16, 0.095, white);
        for (let bay = 0; bay < bays; bay++) {
          const center = (bay + 0.5) / bays;
          facadeBoxOnEdge(parts, ctx, edge, center - halfPane, center + halfPane,
            bottom, bottom + 2.75, 0.13, 0.085, glass);
        }
      }
      for (let bay = 1; bay < bays; bay++) {
        const center = bay / bays;
        facadeBoxOnEdge(parts, ctx, edge, center - 0.045 / edge.length,
          center + 0.045 / edge.length, 3.3, 15.7, 0.18, 0.11, white);
      }
    }
    return parts;
  },
};
