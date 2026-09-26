// UMD Facilities photo: four pale columns beneath a straight entablature,
// facing Morrill Quad. Its bent brick wings wrap the mapped partial court.
import type { LandmarkModule } from '../types';
import { brickShell, color, hip, portico, stripWindows, type Parts } from './historic-central-parts';

export const landmark: LandmarkModule = {
  id: 'way/24942053',
  spec: { name: 'Taliaferro Hall', color: 0xa15a49, accent: 0xebe8dd, height: 11.8, roof: 'hipped' },
  maxHeight: 14.9,
  build(ctx) {
    const parts: Parts = []; const stone = color(0xebe8dd), slate = color(0x595e61);
    brickShell(ctx, parts, 10.5, color(0xa15a49), stone, color(0x777a79));
    hip(ctx, parts, [0.02, 0.25, 0.10, 0.96], 10.7, 2.1, slate);
    hip(ctx, parts, [0.36, 0.98, 0.12, 0.56], 10.7, 1.9, slate);
    portico(ctx, parts, { side: 'south', width: 15, depth: 3.4,
      columns: 4, baseY: 0.6, columnHeight: 8.1,
      center: 0.51 }, stone, color(0x45535b));
    stripWindows(ctx, parts, 'south', [0.04, 0.29], [1.2, 4.5, 7.8], 3, stone, color(0x50616b));
    stripWindows(ctx, parts, 'south', [0.72, 0.96], [1.2, 4.5, 7.8], 3, stone, color(0x50616b));
    return parts;
  },
};
