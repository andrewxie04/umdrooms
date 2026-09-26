// UMD Facilities photo: long three-storey brick hall with six tall entrance
// columns, a pediment and regularly spaced pale-trimmed window bays.
import type { LandmarkModule } from '../types';
import { brickShell, color, hip, portico, stripWindows, type Parts } from './historic-central-parts';

export const landmark: LandmarkModule = {
  id: 'way/23579209',
  spec: { name: 'Skinner Building', color: 0xa05c49, accent: 0xebe6db, height: 12.6, roof: 'hipped' },
  maxHeight: 15.1,
  build(ctx) {
    const parts: Parts = []; const stone = color(0xebe6db);
    brickShell(ctx, parts, 10.8, color(0xa05c49), stone, color(0x747979));
    hip(ctx, parts, [0.04, 0.95, 0.24, 0.90], 11.0, 2.4, color(0x575c60));
    hip(ctx, parts, [0.41, 0.64, 0.03, 0.23], 11.0, 1.7, color(0x575c60));
    portico(ctx, parts, { side: 'south', width: 20, depth: 3.8,
      columns: 6, baseY: 0.5, columnHeight: 8.7, pediment: 2.0 }, stone, color(0x45535a));
    stripWindows(ctx, parts, 'south', [0.03, 0.30], [1.2, 4.6, 7.9], 4, stone, color(0x50616b));
    stripWindows(ctx, parts, 'south', [0.70, 0.97], [1.2, 4.6, 7.9], 4, stone, color(0x50616b));
    return parts;
  },
};
