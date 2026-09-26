// UMD Facilities photo: six-column south entrance, triangular pediment and
// small dormers across a slate roof. The mapped U-shaped plan stays open.
import type { LandmarkModule } from '../types';
import { box, brickShell, color, hip, portico, stripWindows, type Parts } from './historic-central-parts';

export const landmark: LandmarkModule = {
  id: 'way/23937007',
  spec: { name: 'Symons Hall', color: 0x9d5949, accent: 0xece8df, height: 17.5, roof: 'hipped' },
  maxHeight: 20.2,
  build(ctx) {
    const parts: Parts = []; const stone = color(0xece8df), slate = color(0x545a5d);
    brickShell(ctx, parts, 15.4, color(0x9d5949), stone, color(0x737879));
    hip(ctx, parts, [0.05, 0.92, 0.03, 0.20], 15.6, 2.2, slate);
    hip(ctx, parts, [0.63, 0.94, 0.22, 0.78], 15.6, 2.2, slate);
    hip(ctx, parts, [0.03, 0.89, 0.80, 0.97], 15.6, 2.2, slate);
    portico(ctx, parts, { side: 'south', width: 20, depth: 4,
      columns: 6, baseY: 0.6, columnHeight: 11.0, pediment: 2.1 }, stone, color(0x49565c));
    const b = ctx.helpers.bboxOf(ctx.pts);
    const n = b.minY + (b.maxY - b.minY) * 0.12;
    for (const f of [0.14, 0.29, 0.71, 0.86]) {
      const x = b.minX + (b.maxX - b.minX) * f;
      box(ctx, parts, x - 0.9, x + 0.9, n - 0.2, n + 0.15,
        17.15, 18.45, stone);
      box(ctx, parts, x - 0.48, x + 0.48, n - 0.27, n - 0.19,
        17.42, 18.16, color(0x4d5e68));
      box(ctx, parts, x - 1.0, x + 1.0, n - 0.25, n + 0.45,
        18.45, 18.65, slate);
    }
    stripWindows(ctx, parts, 'south', [0.04, 0.31], [1.4, 5.0, 8.6, 12.2], 4, stone, color(0x51636d));
    stripWindows(ctx, parts, 'south', [0.69, 0.96], [1.4, 5.0, 8.6, 12.2], 4, stone, color(0x51636d));
    return parts;
  },
};
