// Merrill College photo and curtain-wall description:
// https://merrill.umd.edu/schedule-a-visit . The L opens to the southeast.
import * as THREE from 'three';
import type { LandmarkModule } from '../types';
import { facadeBoxOnEdge, mappedEdge } from './_shared/mapped-facade';

export const landmark: LandmarkModule = {
  id: 'way/25202315',
  spec: { name: 'Knight Hall', color: 0x97685b, height: 15.6, roof: 'parapet', nightGlow: 0.2 },
  maxHeight: 18.8,
  build(ctx) {
    const { pts, baseHeight, spec, helpers } = ctx;
    const b = helpers.bboxOf(pts);
    const brick = helpers.withGlow(spec.color, spec.nightGlow);
    const pale = new THREE.Color(0xd4d0c8);
    const roof = new THREE.Color(0xc5c7c4);
    const glass = helpers.withGlow(0x4f6c76, 0.35);
    const parts = [helpers.withColor(helpers.extrudeFootprint(pts, baseHeight), brick)];
    // Continuous pale coping follows the true L outline. The recessed roof
    // reads as a distinct surface at oblique camera angles.
    parts.push(helpers.withColor(helpers.extrudeFootprint(pts, 0.42).translate(0, baseHeight, 0), pale));
    parts.push(helpers.withColor(helpers.extrudeFootprint(helpers.scaleAbout(pts, (b.minX + b.maxX) / 2, (b.minY + b.maxY) / 2, 0.97), 0.13).translate(0, baseHeight + 0.4, 0), roof));
    // The L's courtyard walls are the mapped 0.435→0.953 south edge and
    // 0.435 east edge. Bbox bands previously hovered 6m off the first wall
    // and disappeared inside the second bar.
    const south = mappedEdge(pts, b, [0.435, 0.635], [0.953, 0.636]);
    const east = mappedEdge(pts, b, [0.435, 0.635], [0.437, 0.038]);
    for (const edge of [south, east]) {
      facadeBoxOnEdge(parts, ctx, edge, 0.045, 0.955, 3.0, 12.8, 0.14, 0.07, glass);
      for (const y of [7.8, 12.7]) {
        facadeBoxOnEdge(parts, ctx, edge, 0.042, 0.958, y, y + 0.25, 0.17, 0.09, pale);
      }
      for (let i = 1; i < 7; i++) {
        const f = 0.045 + 0.91 * i / 7;
        facadeBoxOnEdge(parts, ctx, edge, f - 0.003, f + 0.003, 3.0, 12.9, 0.18, 0.1, pale);
      }
    }
    return parts;
  },
};
