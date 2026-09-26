// UMD Facilities photo: three brick storeys, a south four-column pediment,
// three openings below its raised porch and dormers in the slate roof.
import type { LandmarkModule } from '../types';
import { box, brickShell, color, hip, portico, stripWindows, type Parts } from './historic-central-parts';

export const landmark: LandmarkModule = {
  id: 'way/23578622',
  spec: { name: 'Jimenez Hall', color: 0xa7604c, accent: 0xf0e8d8, height: 15, roof: 'hipped' },
  maxHeight: 17.6,
  build(ctx) {
    const parts: Parts = []; const stone = color(0xf0e8d8), slate = color(0x606368);
    brickShell(ctx, parts, 13.6, color(0xa7604c), stone, color(0x828384));
    hip(ctx, parts, [0.05, 0.95, 0.14, 0.35], 13.8, 2.2, slate);
    hip(ctx, parts, [0.05, 0.95, 0.67, 0.96], 13.8, 2.2, slate);
    portico(ctx, parts, { side: 'south', width: 16, depth: 4,
      columns: 4, baseY: 0.9, columnHeight: 9.6, pediment: 2.0 }, stone, color(0x44525a));
    const b = ctx.helpers.bboxOf(ctx.pts);
    const n = b.minY - 0.2;
    for (const f of [0.43, 0.50, 0.57]) {
      const x = b.minX + (b.maxX - b.minX) * f;
      box(ctx, parts, x - 1.15, x + 1.15, n - 0.1, n, 0.3, 3.2, color(0x39464c));
      box(ctx, parts, x - 1.35, x + 1.35, n - 0.2, n + 0.1, 3.15, 3.5, stone);
    }
    stripWindows(ctx, parts, 'south', [0.04, 0.24], [1.2, 5.3, 9.5], 2, stone, color(0x52636b));
    stripWindows(ctx, parts, 'south', [0.76, 0.96], [1.2, 5.3, 9.5], 2, stone, color(0x52636b));
    return parts;
  },
};
