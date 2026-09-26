// UMD Facilities photo: brick cross plan, four pale north columns, triangular
// pediment, pale ground floor and a broad flight of entrance stairs.
import type { LandmarkModule } from '../types';
import { box, brickShell, color, hip, portico, stripWindows, type Parts } from './historic-central-parts';

export const landmark: LandmarkModule = {
  id: 'way/23502752',
  spec: { name: 'Woods Hall', color: 0xa05b48, accent: 0xede9dd, height: 11.8, roof: 'hipped' },
  maxHeight: 15.1,
  build(ctx) {
    const parts: Parts = []; const stone = color(0xede9dd), slate = color(0x555a5d);
    brickShell(ctx, parts, 10.5, color(0xa05b48), stone, color(0x777b79));
    hip(ctx, parts, [0.35, 0.63, 0.02, 0.97], 10.7, 2.2, slate);
    hip(ctx, parts, [0.03, 0.97, 0.57, 0.83], 10.72, 2.0, slate);
    portico(ctx, parts, { side: 'north', width: 16, depth: 4,
      columns: 4, baseY: 1.3, columnHeight: 7.8, pediment: 2.1 }, stone, color(0x455158));
    const b = ctx.helpers.bboxOf(ctx.pts), n = b.maxY;
    for (let i = 0; i < 3; i++) {
      box(ctx, parts, ctx.cx - 9.5, ctx.cx + 9.5, n + 3.5 + i * 0.8,
        n + 4.3 + i * 0.8, 0, 1.15 - i * 0.35, stone);
    }
    stripWindows(ctx, parts, 'north', [0.04, 0.25], [1.2, 4.7, 7.9], 2, stone, color(0x4e5d67));
    stripWindows(ctx, parts, 'north', [0.75, 0.96], [1.2, 4.7, 7.9], 2, stone, color(0x4e5d67));
    return parts;
  },
};
