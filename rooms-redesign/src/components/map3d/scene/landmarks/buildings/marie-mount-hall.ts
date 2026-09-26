// UMD Facilities photo: raised four-column north entrance, triangular
// pediment with a semicircular window, brick wings and dormers on slate roof.
import type { LandmarkModule } from '../types';
import { box, brickShell, color, fractionBox, hip, portico, stripWindows, type Parts } from './historic-central-parts';

export const landmark: LandmarkModule = {
  id: 'way/23544831',
  spec: { name: 'Marie Mount Hall', color: 0xa05d49, accent: 0xece8dd, height: 14, roof: 'hipped' },
  maxHeight: 16.5,
  build(ctx) {
    const parts: Parts = []; const stone = color(0xece8dd), slate = color(0x595d60);
    brickShell(ctx, parts, 12.8, color(0xa05d49), stone, color(0x8c8e8c));
    hip(ctx, parts, [0.05, 0.79, 0.78, 0.92], 13.0, 2.4, slate);
    fractionBox(ctx, parts, [0.32, 0.66, 0.18, 0.55], 13.04, 13.7, color(0x999a97));
    portico(ctx, parts, { side: 'north', width: 18, depth: 3.7,
      columns: 4, baseY: 1.5, columnHeight: 9.3, pediment: 2.2 }, stone, color(0x43515a));
    const b = ctx.helpers.bboxOf(ctx.pts);
    const x = (f: number) => b.minX + (b.maxX - b.minX) * f;
    const n = b.minY + (b.maxY - b.minY) * 0.85;
    for (const f of [0.15, 0.28, 0.70]) {
      box(ctx, parts, x(f) - 0.9, x(f) + 0.9, n - 0.18, n + 0.14,
        14.0, 15.2, stone);
      box(ctx, parts, x(f) - 0.5, x(f) + 0.5, n + 0.14, n + 0.21,
        14.25, 14.95, color(0x50616a));
      box(ctx, parts, x(f) - 1.0, x(f) + 1.0, n - 0.25, n + 0.45,
        15.2, 15.4, slate);
    }
    for (let i = 0; i < 3; i++) {
      box(ctx, parts, ctx.cx - 10, ctx.cx + 10, b.maxY + 3.0 + i * 0.8,
        b.maxY + 3.8 + i * 0.8, 0, 1.35 - i * 0.4, stone);
    }
    stripWindows(ctx, parts, 'north', [0.08, 0.32], [1.3, 5.2, 9.2], 3, stone, color(0x4f6169));
    stripWindows(ctx, parts, 'north', [0.68, 0.92], [1.3, 5.2, 9.2], 3, stone, color(0x4f6169));
    return parts;
  },
};
