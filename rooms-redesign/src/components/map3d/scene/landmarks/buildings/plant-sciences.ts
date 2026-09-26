// UMD Facilities: https://facilities.umd.edu/node/291 ; department overview:
// https://psla.umd.edu/resources/facilities . Brick teaching/research range.
import * as THREE from 'three';
import type { LandmarkModule } from '../types';
import { addCylinder, addFootprint, fractionBox } from './_shared/science-parts';
import { color, stripWindows } from './historic-central-parts';

export const landmark: LandmarkModule = {
  id: 'way/24305537',
  spec: { name: 'Plant Sciences Building', color: 0xa36551, height: 16.2, roof: 'parapet', accent: 0x8ca8aa, nightGlow: 0.12 },
  maxHeight: 21,
  build(ctx) {
    const p: THREE.BufferGeometry[] = [];
    addFootprint(p, ctx, ctx.pts, 16.2, 0xa36551);
    // Two low, nearly parallel red-brick lab bars flank a lighter inner spine.
    fractionBox(p, ctx, 0.21, 0.74, 0.25, 0.43, 16.2, 17.0, 0x9b5d4b);
    fractionBox(p, ctx, 0.21, 0.74, 0.76, 0.92, 16.2, 17.0, 0x9b5d4b);
    fractionBox(p, ctx, 0.79, 0.96, 0.05, 0.94, 16.2, 18.0, 0xa2604c);
    stripWindows(ctx, p, 'north', [0.24, 0.75], [2.7, 6.5, 10.3], 9,
      color(0xcac2b4), color(0x698892));
    stripWindows(ctx, p, 'south', [0.24, 0.75], [2.7, 6.5, 10.3], 9,
      color(0xcac2b4), color(0x698892));
    const b = ctx.helpers.bboxOf(ctx.pts);
    // The rounded west end is mapped; the white entry columns appear in UMD imagery.
    for (const f of [0.48, 0.56, 0.64, 0.72]) {
      addCylinder(p, ctx, b.minX - 0.8, b.minY + (b.maxY - b.minY) * f,
        0.38, 0, 7.9, 0xd8d4c8, 10);
    }
    fractionBox(p, ctx, -0.018, 0.05, 0.45, 0.75, 7.85, 8.35, 0xd8d4c8);
    fractionBox(p, ctx, 0.31, 0.52, 0.36, 0.58, 16.2, 18.2, 0x858d8b);
    fractionBox(p, ctx, 0.80, 0.91, 0.37, 0.62, 18.0, 20.0, 0x858d8b);
    return p;
  },
};
