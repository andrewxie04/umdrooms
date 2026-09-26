// UMD CSIC page and architectural views: https://www.cscamm.umd.edu/facilities/csic.htm
// The four-story classroom building connects north to A.V. Williams by bridge.
import * as THREE from 'three';
import type { LandmarkModule } from '../types';
import { addBox, addFootprint, fractionBox } from './_shared/science-parts';
import { color, stripWindows } from './historic-central-parts';

export const landmark: LandmarkModule = {
  id: 'way/23591142',
  spec: { name: 'Computer Science Instructional Center', color: 0x9d5c48, height: 15.2, roof: 'parapet', accent: 0x668390, nightGlow: 0.15 },
  maxHeight: 17,
  build(ctx) {
    const p: THREE.BufferGeometry[] = [];
    addFootprint(p, ctx, ctx.pts, 15.2, 0x9d5c48);
    // Punched brick bays flank the tall glazed entry in the UMD photo.
    stripWindows(ctx, p, 'south', [0.10, 0.87], [3.0, 6.6, 10.2], 7,
      color(0xc9c0b0), color(0x607d88));
    fractionBox(p, ctx, 0.20, 0.48, 0.20, 0.75, 15.2, 15.55, 0x5c6062);
    fractionBox(p, ctx, 0.54, 0.82, 0.29, 0.74, 15.2, 15.55, 0x5c6062);
    const b = ctx.helpers.bboxOf(ctx.pts);
    const x = (f: number) => b.minX + (b.maxX - b.minX) * f;
    const n = (f: number) => b.minY + (b.maxY - b.minY) * f;
    // The baked outlines leave ~15 m between CSIC's north edge and AVW's
    // south edge. Carry the bridge across that gap rather than ending in air.
    addBox(p, ctx, x(0.42), x(0.58), b.maxY - 0.7, b.maxY + 16.0, 7.4, 10.7, 0x7294a0);
    addBox(p, ctx, x(0.40), x(0.60), b.maxY - 0.7, b.maxY + 16.0, 10.7, 11.0, 0xb5bdba);
    addBox(p, ctx, x(0.43), x(0.57), n(0.10), n(0.36), 15.55, 16.5, 0x858a88);
    return p;
  },
};
