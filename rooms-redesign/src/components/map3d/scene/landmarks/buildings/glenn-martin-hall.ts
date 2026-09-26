// UMD Facilities: https://facilities.umd.edu/node/332 ; UMD engineering
// photo: https://eng.umd.edu/freshmen-applicants/decide/information-sessions
import * as THREE from 'three';
import type { LandmarkModule } from '../types';
import { addBox, addCylinder, addFootprint, fractionBox } from './_shared/science-parts';
import { color, stripWindows } from './historic-central-parts';

export const landmark: LandmarkModule = {
  id: 'way/23546641',
  spec: { name: 'Glenn L. Martin Hall', color: 0xa7644e, height: 16.5, roof: 'parapet', accent: 0xc6baa5 },
  maxHeight: 21,
  build(ctx) {
    const p: THREE.BufferGeometry[] = [];
    addFootprint(p, ctx, ctx.pts, 16.5, 0xa7644e);
    // Long east-west academic bar and deeper center/east pavilions.
    fractionBox(p, ctx, 0.06, 0.96, 0.08, 0.48, 16.5, 17.2, 0x9c5a47);
    fractionBox(p, ctx, 0.28, 0.49, 0.47, 0.97, 16.5, 19.2, 0xa35e49);
    fractionBox(p, ctx, 0.71, 0.78, 0.50, 0.76, 16.5, 18.2, 0xa35e49);
    // Individual pale-framed bays replace a single implausible glass band.
    stripWindows(ctx, p, 'south', [0.05, 0.30], [2.0, 5.4, 8.8, 12.2], 6,
      color(0xc6baa5), color(0x5b7078));
    stripWindows(ctx, p, 'south', [0.51, 0.95], [2.0, 5.4, 8.8, 12.2], 10,
      color(0xc6baa5), color(0x5b7078));
    stripWindows(ctx, p, 'north', [0.05, 0.95], [2.0, 5.4, 8.8, 12.2], 18,
      color(0xc6baa5), color(0x5b7078));
    // Four-column central portico is the building's visible front landmark.
    const b = ctx.helpers.bboxOf(ctx.pts);
    const x = (f: number) => b.minX + (b.maxX - b.minX) * f;
    const south = b.minY + (b.maxY - b.minY) * 0.07;
    for (const f of [0.35, 0.39, 0.43, 0.47]) {
      addCylinder(p, ctx, x(f), south - 1.5, 0.42, 0, 8.1, 0xd5cebf, 10);
    }
    addBox(p, ctx, x(0.32), x(0.50), south - 2.1, south + 0.25, 8.05, 8.7, 0xd5cebf);
    // Laboratory roof plant is kept in small, discrete enclosures.
    fractionBox(p, ctx, 0.53, 0.64, 0.18, 0.38, 17.2, 19.0, 0x8e9290);
    fractionBox(p, ctx, 0.82, 0.91, 0.20, 0.39, 17.2, 18.6, 0x8e9290);
    fractionBox(p, ctx, 0.32, 0.45, 0.57, 0.81, 19.2, 20.0, 0x5f6668);
    return p;
  },
};
