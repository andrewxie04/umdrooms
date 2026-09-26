// UMD Facilities photo: six columns, a triangular pediment and a broad raised
// stair on the north (Mall) front; the irregular brick wings follow the map.
import type { LandmarkModule } from '../types';
import { box, brickShell, color, hip, portico, stripWindows, type Parts } from './historic-central-parts';

export const landmark: LandmarkModule = {
  id: 'way/23544871',
  spec: { name: 'Francis Scott Key Hall', color: 0x985543, accent: 0xe9e5d9, height: 12.2, roof: 'hipped' },
  maxHeight: 15,
  build(ctx) {
    const parts: Parts = []; const stone = color(0xe9e5d9);
    brickShell(ctx, parts, 10.9, color(0x985543), stone, color(0x666a6c));
    hip(ctx, parts, [0.03, 0.36, 0.43, 0.80], 11.1, 2.1, color(0x53575a));
    hip(ctx, parts, [0.65, 0.89, 0.08, 0.83], 11.1, 2.0, color(0x53575a));
    hip(ctx, parts, [0.39, 0.62, 0.45, 0.91], 11.1, 2.5, color(0x55595b));
    portico(ctx, parts, { side: 'north', width: 19, depth: 4.2,
      columns: 6, baseY: 2.0, columnHeight: 7.5, pediment: 2.1 }, stone, color(0x4b5558));
    const b = ctx.helpers.bboxOf(ctx.pts), n = b.maxY;
    for (let i = 0; i < 4; i++) {
      box(ctx, parts, ctx.cx - 11, ctx.cx + 11, n + 3.6 + i * 0.8,
        n + 4.4 + i * 0.8, 0, 1.75 - i * 0.37, stone);
    }
    stripWindows(ctx, parts, 'north', [0.03, 0.28], [1.5, 5.1, 8.3], 3, stone, color(0x4c5960));
    stripWindows(ctx, parts, 'north', [0.73, 0.96], [1.5, 5.1, 8.3], 3, stone, color(0x4c5960));
    return parts;
  },
};
