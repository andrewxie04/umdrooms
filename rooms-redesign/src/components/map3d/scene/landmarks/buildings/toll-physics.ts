// PHY: 1953 brick Toll Physics complex, stepped wings and south portico.
// References: https://facilities.umd.edu/node/327
// https://physics.umd.edu/cuwip/about.html
import * as THREE from 'three';
import type { LandmarkModule } from '../types';
import { addBox, addCylinder, addFootprint, fractionBox } from './_shared/science-parts';

export const landmark: LandmarkModule = {
  id: 'way/23888747',
  spec: { name: 'John S. Toll Physics Building', color: 0xa36750, height: 15.4, roof: 'parapet', accent: 0xc4b8a4 },
  maxHeight: 21,
  build(ctx) {
    const p: THREE.BufferGeometry[] = [];
    addFootprint(p, ctx, ctx.pts, 15.4, 0xa36750);
    // The complex footprint creates east-facing open courts and different bar heights.
    fractionBox(p, ctx, 0.04, 0.72, 0.02, 0.13, 15.4, 17.0, 0xa05d4a);
    fractionBox(p, ctx, 0.07, 0.32, 0.52, 0.93, 15.4, 18.0, 0xa05d4a);
    fractionBox(p, ctx, 0.57, 0.90, 0.62, 0.77, 15.4, 16.3, 0x9c5b49);
    const b = ctx.helpers.bboxOf(ctx.pts);
    const x = (f: number) => b.minX + (b.maxX - b.minX) * f;
    const n = (f: number) => b.minY + (b.maxY - b.minY) * f;
    // Mapped north edge of the west wing, which slopes below the bbox top.
    const northWall = (east: number) => ctx.pts[2].y
      + (east - ctx.pts[2].x) * (ctx.pts[3].y - ctx.pts[2].y)
      / (ctx.pts[3].x - ctx.pts[2].x);
    // Individual pale-framed bays match the older masonry wings better than
    // continuous modern ribbon windows.
    for (const level of [4.0, 7.7, 11.4]) {
      for (const f of [0.05, 0.12, 0.19, 0.26, 0.62, 0.69]) {
        // The southern wall is nearly at the bounding-box edge here.
        addBox(p, ctx, x(f), x(f + 0.035), n(-0.003), n(0.004),
          level, level + 1.65, 0xb6c6c9);
      }
      for (const f of [0.10, 0.17, 0.24]) {
        const left = northWall(x(f));
        const right = northWall(x(f + 0.04));
        addBox(p, ctx, x(f), x(f + 0.04),
          Math.min(left, right) - 0.07, Math.max(left, right) + 0.07,
          level, level + 1.65, 0xb6c6c9);
      }
    }
    // The UMD facilities photograph shows a four-column south portico.
    for (const f of [0.37, 0.42, 0.47, 0.52]) {
      addCylinder(p, ctx, x(f), b.minY - 1.4, 0.42, 0, 12.0, 0xd7cebd, 10);
    }
    addBox(p, ctx, x(0.34), x(0.55), b.minY - 2.1, b.minY + 0.2, 12.0, 12.7, 0xd7cebd);
    const pediment = new THREE.Shape();
    pediment.moveTo(x(0.34), 12.7);
    pediment.lineTo(x(0.55), 12.7);
    pediment.lineTo(x(0.445), 15.1);
    pediment.closePath();
    const roof = new THREE.ExtrudeGeometry(pediment, { depth: 1.6, bevelEnabled: false });
    roof.translate(0, 0, -b.minY + 1.9);
    p.push(ctx.helpers.withColor(roof, ctx.helpers.withGlow(0xd7cebd, ctx.spec.nightGlow)));
    // Rounded east vestibule follows the curved bulge in the mapped outline.
    addCylinder(p, ctx, b.maxX - 4.0, b.minY + (b.maxY - b.minY) * 0.46, 3.8, 0, 8.7, 0x82999e);
    fractionBox(p, ctx, 0.10, 0.24, 0.58, 0.77, 18.0, 20.0, 0x8d9391);
    fractionBox(p, ctx, 0.45, 0.58, 0.04, 0.11, 17.0, 19.0, 0x8d9391);
    return p;
  },
};
