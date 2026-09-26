// UMD doorway photo: https://cbmg.umd.edu/about/contact ; Facilities:
// https://facilities.umd.edu/node/414 . Pale classical doorway on brick.
import * as THREE from 'three';
import type { LandmarkModule } from '../types';
import { addFootprint, fractionBox } from './_shared/science-parts';
import { color, stripWindows } from './historic-central-parts';

export const landmark: LandmarkModule = {
  id: 'way/24942368',
  spec: { name: 'Microbiology Building', color: 0xa46652, height: 13.3, roof: 'parapet', accent: 0xc9bea8 },
  maxHeight: 17,
  build(ctx) {
    const p: THREE.BufferGeometry[] = [];
    addFootprint(p, ctx, ctx.pts, 13.3, 0xa46652);
    // Its older main block has a continuous pale cornice; west entry is stepped.
    fractionBox(p, ctx, 0.19, 0.96, 0.03, 0.96, 13.3, 13.7, 0xc9bea8);
    fractionBox(p, ctx, 0.03, 0.20, 0.39, 0.58, 0, 7.1, 0xb2725c);
    fractionBox(p, ctx, 0.00, 0.23, 0.37, 0.61, 7.0, 7.45, 0xd3c4ac);
    // The departmental entrance photo shows a pale doorway with pilasters.
    fractionBox(p, ctx, -0.01, 0.025, 0.405, 0.43, 0, 6.9, 0xd4cabb);
    fractionBox(p, ctx, -0.01, 0.025, 0.55, 0.575, 0, 6.9, 0xd4cabb);
    stripWindows(ctx, p, 'south', [0.22, 0.95], [2.3, 5.7, 9.1], 7,
      color(0xd2c5b0), color(0x697b7e));
    stripWindows(ctx, p, 'north', [0.22, 0.95], [2.3, 5.7, 9.1], 7,
      color(0xd2c5b0), color(0x697b7e));
    fractionBox(p, ctx, 0.25, 0.94, 0.06, 0.94, 13.7, 14.0, 0x596163);
    fractionBox(p, ctx, 0.36, 0.53, 0.22, 0.42, 14.0, 16.1, 0x939a99);
    return p;
  },
};
