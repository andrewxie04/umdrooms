// CHM: older brick wings surround an open court; the replacement Wing 1 is
// distinguished by its tall glazed collaboration facade and brick piers.
// References: https://today.umd.edu/new-chemistry-building-dedicated
// https://science.umd.edu/newsletters/chem-biochem/2025-06.html
import * as THREE from 'three';
import type { LandmarkModule } from '../types';
import { addBox, fractionBox } from './_shared/science-parts';

export const landmark: LandmarkModule = {
  id: 'relation/2063641',
  spec: { name: 'Chemistry Building', color: 0xa86450, height: 15.8, roof: 'parapet', accent: 0x7694a2, nightGlow: 0.15 },
  maxHeight: 21,
  build(ctx) {
    const { pts, helpers } = ctx;
    const p: THREE.BufferGeometry[] = [];
    const b = helpers.bboxOf(pts);
    const x = (f: number) => b.minX + (b.maxX - b.minX) * f;
    const n = (f: number) => b.minY + (b.maxY - b.minY) * f;
    // Preserve the exact mapped courtyard, including its irregular outline.
    const main = ctx.holes.length
      ? helpers.extrudeWithHoles(pts, ctx.holes, 15.8)
      : helpers.extrudeFootprint(pts, 15.8);
    p.push(helpers.withColor(main, helpers.withGlow(0xa86450, ctx.spec.nightGlow)));
    // New north/west laboratory wing: darker brick piers and tall glazing.
    fractionBox(p, ctx, 0.04, 0.19, 0.30, 0.55, 15.8, 19.2, 0x9d5e4b);
    fractionBox(p, ctx, 0.02, 0.17, 0.74, 0.96, 15.8, 19.2, 0x9d5e4b);
    // The new wing's multistory glass wall reads quite differently from the
    // solid older wings, especially from the west campus approach.
    addBox(p, ctx, x(0.006), x(0.021), n(0.32), n(0.94),
      0.7, 15.3, 0x7197a5);
    for (const f of [0.33, 0.45, 0.57, 0.69, 0.81, 0.93]) {
      addBox(p, ctx, x(0.003), x(0.025), n(f), n(f + 0.009),
        0.7, 15.5, 0x9b5d4c);
    }
    for (const level of [4.0, 7.8, 11.6]) {
      addBox(p, ctx, x(0.002), x(0.026), n(0.32), n(0.94),
        level, level + 0.28, 0xb5b9b4);
    }
    for (const level of [4.4, 8.2, 12.0]) {
      addBox(p, ctx, x(0.01), x(0.035), n(0.75), n(0.95), level, level + 1.8, 0x7292a0);
      addBox(p, ctx, x(0.04), x(0.17), n(0.27), n(0.29), level, level + 1.8, 0x7292a0);
    }
    // Distinct flat roofs on the older east/south wings; service cores remain set back.
    fractionBox(p, ctx, 0.27, 0.82, 0.05, 0.24, 15.8, 16.1, 0x596163);
    fractionBox(p, ctx, 0.79, 0.93, 0.28, 0.81, 15.8, 16.2, 0x5e6667);
    fractionBox(p, ctx, 0.30, 0.45, 0.08, 0.19, 16.1, 18.1, 0xa49b8c);
    fractionBox(p, ctx, 0.82, 0.90, 0.49, 0.64, 16.2, 18.3, 0x9e9d96);
    fractionBox(p, ctx, 0.05, 0.15, 0.81, 0.91, 19.2, 20.0, 0x8b9393);
    return p;
  },
};
