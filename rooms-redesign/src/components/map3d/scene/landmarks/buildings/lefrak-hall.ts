// UMD Facilities photo: broad low brick wings, six pale columns and a
// triangular pediment around the main courtyard entrance. Roof is flat.
import type { LandmarkModule } from '../types';
import { brickShell, color, fractionBox, portico, stripWindows, type Parts } from './historic-central-parts';

export const landmark: LandmarkModule = {
  id: 'way/314901003',
  spec: { name: 'LeFrak Hall', color: 0x965746, accent: 0xe4ded2, height: 11.5, roof: 'parapet' },
  maxHeight: 13.4,
  build(ctx) {
    const parts: Parts = []; const stone = color(0xe4ded2);
    brickShell(ctx, parts, 10.9, color(0x965746), stone, color(0x888a87));
    // The central roof plane is visibly higher than the broad flanking planes.
    fractionBox(ctx, parts, [0.41, 0.60, 0.09, 0.92], 11.1, 11.9, color(0x777b7c));
    portico(ctx, parts, { side: 'south', width: 22, depth: 3.8,
      columns: 6, columnHeight: 8.8, pediment: 2.0 }, stone, color(0x47505a));
    stripWindows(ctx, parts, 'south', [0.04, 0.36], [1.3, 5.1, 8.2], 4, stone, color(0x50616b));
    stripWindows(ctx, parts, 'south', [0.64, 0.96], [1.3, 5.1, 8.2], 4, stone, color(0x50616b));
    return parts;
  },
};
