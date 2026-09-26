// MTH: 1954 brick Mathematics/Kirwan Hall with a north portico and dome.
// References: https://blog.umd.edu/math150/41-2/
// https://facilities.umd.edu/node/329
import * as THREE from 'three';
import type { LandmarkModule } from '../types';
import { addBox, addCylinder, addFootprint, fractionBox } from './_shared/science-parts';

export const landmark: LandmarkModule = {
  id: 'way/23546586',
  spec: { name: 'William E. Kirwan Hall', color: 0xa55f49, height: 14.2, roof: 'parapet', accent: 0xd7d0c1 },
  maxHeight: 26,
  build(ctx) {
    const p: THREE.BufferGeometry[] = [];
    addFootprint(p, ctx, ctx.pts, 14.2, 0xa55f49);
    // Courtyard-shaped mapped wings remain open, with lower connecting bars.
    fractionBox(p, ctx, 0.03, 0.46, 0.02, 0.14, 14.2, 15.1, 0x9b5746);
    fractionBox(p, ctx, 0.22, 0.82, 0.83, 0.98, 14.2, 15.1, 0x9b5746);
    fractionBox(p, ctx, 0.62, 0.80, 0.28, 0.79, 14.2, 15.1, 0x9b5746);
    const b = ctx.helpers.bboxOf(ctx.pts);
    const x = (f: number) => b.minX + (b.maxX - b.minX) * f;
    const n = (f: number) => b.minY + (b.maxY - b.minY) * f;
    // Main entrance at the north is marked by light columns and a drum/dome.
    for (const f of [0.41, 0.49, 0.57, 0.65]) {
      addCylinder(p, ctx, x(f), n(1.01), 0.46, 0.0, 12.5, 0xd7d0c1, 10);
    }
    fractionBox(p, ctx, 0.38, 0.68, 0.95, 1.025, 12.5, 13.1, 0xd7d0c1);
    // The pale triangular pediment is the entrance's strongest street-view cue.
    const pediment = new THREE.Shape();
    pediment.moveTo(x(0.37), 13.1);
    pediment.lineTo(x(0.69), 13.1);
    pediment.lineTo(x(0.53), 15.8);
    pediment.closePath();
    const g = new THREE.ExtrudeGeometry(pediment, { depth: 1.3, bevelEnabled: false });
    g.translate(0, 0, -n(1.025));
    p.push(ctx.helpers.withColor(g, ctx.helpers.withGlow(0xd9d4c8, ctx.spec.nightGlow)));
    addBox(p, ctx, x(0.49), x(0.57), n(0.977), n(0.982),
      0.3, 4.6, 0x4e5557);
    for (const level of [4.1, 7.8, 11.5]) {
      for (const f of [0.06, 0.14, 0.22, 0.77, 0.85, 0.93]) {
        addBox(p, ctx, x(f), x(f + 0.035), n(0.987), n(0.996),
          level, level + 1.55, 0xb7c7cb);
      }
    }
    addCylinder(p, ctx, x(0.66), n(0.88), 7.0, 14.1, 18.1, 0xaa624d);
    const dome = new THREE.SphereGeometry(7.1, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2);
    dome.translate(x(0.66), 18.1, -n(0.88));
    p.push(ctx.helpers.withColor(dome, new THREE.Color(0x8d9697)));
    return p;
  },
};
