// UMD Facilities photo: flat brick blocks with a four-column west entrance
// and straight white entablature facing Regents Drive.
import * as THREE from 'three';
import type { LandmarkModule } from '../types';
import { addBox, addCylinder, addFootprint, fractionBox } from './_shared/science-parts';

export const landmark: LandmarkModule = {
  id: 'way/23937504',
  spec: { name: 'J.M. Patterson Building', color: 0xa4644e, height: 13.7, roof: 'parapet', accent: 0xc8baa5 },
  maxHeight: 18,
  build(ctx) {
    const p: THREE.BufferGeometry[] = [];
    addFootprint(p, ctx, ctx.pts, 13.7, 0xa4644e);
    // North and south volumes follow the stepped mapped outline.
    fractionBox(p, ctx, 0.27, 0.77, 0.60, 0.96, 13.7, 16.0, 0x9e5d48);
    fractionBox(p, ctx, 0.10, 0.58, 0.08, 0.43, 13.7, 14.5, 0xaa6c55);
    for (const level of [3.9, 7.3, 10.7]) {
      fractionBox(p, ctx, 0.15, 0.70, 0.0, 0.018, level, level + 1.2, 0x6f7c7e);
      fractionBox(p, ctx, 0.27, 0.76, 0.985, 1.005, level, level + 1.2, 0x6f7c7e);
    }
    // Flat roof and photographed four-column Regents Drive portico.
    fractionBox(p, ctx, 0.11, 0.58, 0.07, 0.43, 14.5, 14.8, 0x606668);
    fractionBox(p, ctx, 0.31, 0.73, 0.63, 0.93, 16.0, 16.3, 0x5f6667);
    const b = ctx.helpers.bboxOf(ctx.pts);
    const n = (f: number) => b.minY + (b.maxY - b.minY) * f;
    for (const f of [0.67, 0.75, 0.83, 0.91]) {
      addCylinder(p, ctx, b.minX - 1.2, n(f), 0.33, 0, 7.7, 0xd9d3c5, 10);
    }
    addBox(p, ctx, b.minX - 1.7, b.minX + 0.35, n(0.64), n(0.95), 7.65, 8.25, 0xd9d3c5);
    addBox(p, ctx, b.minX - 2.1, b.minX + 0.5, n(0.64), n(0.95), 0, 0.42, 0xd9d3c5);
    addBox(p, ctx, b.minX - 0.2, b.minX + 0.02, n(0.755), n(0.835), 0.45, 3.1, 0x46545a);
    fractionBox(p, ctx, 0.42, 0.56, 0.19, 0.35, 14.8, 17.2, 0x8e9593);
    return p;
  },
};
