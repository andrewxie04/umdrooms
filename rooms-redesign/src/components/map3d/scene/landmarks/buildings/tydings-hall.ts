// UMD Facilities photo: two brick wings frame a recessed four-column,
// flat-topped entrance. The northern court and broad roofs stay open/flat.
import type { LandmarkModule } from '../types';
import { brickShell, color, fractionBox, portico, stripWindows, type Parts } from './historic-central-parts';

export const landmark: LandmarkModule = {
  id: 'way/23546167',
  spec: { name: 'Tydings Hall', color: 0xa05c4b, accent: 0xece9de, height: 15.2, roof: 'parapet' },
  maxHeight: 16.7,
  build(ctx) {
    const parts: Parts = []; const stone = color(0xece9de);
    brickShell(ctx, parts, 14.8, color(0xa05c4b), stone, color(0x878b89));
    fractionBox(ctx, parts, [0.04, 0.29, 0.12, 0.93], 15.02, 15.45, color(0x7b8182));
    fractionBox(ctx, parts, [0.68, 0.96, 0.12, 0.97], 15.02, 15.45, color(0x7b8182));
    // The mapped footprint itself retains the northern courtyard opening.
    portico(ctx, parts, { side: 'north', width: 15, depth: 2.8,
      columns: 4, baseY: 0.8, columnHeight: 10.4 }, stone, color(0x47545c));
    stripWindows(ctx, parts, 'south', [0.04, 0.31], [1.4, 5.0, 8.6, 12.0], 3, stone, color(0x52636d));
    stripWindows(ctx, parts, 'south', [0.69, 0.96], [1.4, 5.0, 8.6, 12.0], 3, stone, color(0x52636d));
    return parts;
  },
};
