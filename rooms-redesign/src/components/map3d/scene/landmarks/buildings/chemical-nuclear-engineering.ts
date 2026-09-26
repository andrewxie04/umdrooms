// UMD Facilities facade photo: https://facilities.umd.edu/node/334 . A low
// red-brick engineering range with pale framed windows and open setbacks.
import * as THREE from 'three';
import type { LandmarkModule } from '../types';
import { addFootprint, fractionBox } from './_shared/science-parts';

export const landmark: LandmarkModule = {
  id: 'way/23937510',
  spec: { name: 'Chemical and Nuclear Engineering Building', color: 0xa96850, height: 8.6, roof: 'parapet', accent: 0xc9bdab },
  maxHeight: 12,
  build(ctx) {
    const p: THREE.BufferGeometry[] = [];
    if (ctx.holes.length) {
      p.push(ctx.helpers.withColor(
        ctx.helpers.extrudeWithHoles(ctx.pts, ctx.holes, 8.6),
        ctx.helpers.withGlow(0xa96850, ctx.spec.nightGlow),
      ));
    } else {
      addFootprint(p, ctx, ctx.pts, 8.6, 0xa96850);
    }
    // Three staggered masonry bars follow the actual arms rather than filling their courts.
    fractionBox(p, ctx, 0.23, 0.96, 0.02, 0.10, 8.6, 9.3, 0xa25f4b);
    fractionBox(p, ctx, 0.18, 0.39, 0.42, 0.91, 8.6, 9.5, 0xa25f4b);
    fractionBox(p, ctx, 0.58, 0.96, 0.77, 0.97, 8.6, 9.3, 0xa25f4b);
    for (const level of [2.1, 5.2]) {
      for (let i = 0; i < 11; i++) {
        const f = 0.26 + i * 0.061;
        fractionBox(p, ctx, f, f + 0.034, 0.005, 0.023, level, level + 1.65, 0xc9bdab);
        fractionBox(p, ctx, f + 0.004, f + 0.030, 0.001, 0.026, level + 0.17, level + 1.48, 0x66757a);
      }
    }
    fractionBox(p, ctx, 0.25, 0.54, 0.13, 0.29, 8.6, 10.0, 0x777b79);
    return p;
  },
};
