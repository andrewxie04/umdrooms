// Reckord's vast drill hall has one long, low roof plane. The bright
// classical east portico is far taller than the campus-data height tag.
import type { LandmarkModule } from '../types';
import { box, brickShell, color, hip, portico, stripWindows, type Parts } from './historic-central-parts';

export const landmark: LandmarkModule = {
  id: 'way/143466875',
  spec: { name: 'Reckord Armory', color: 0x975346, accent: 0xf3f0e7, height: 13, roof: 'parapet' },
  maxHeight: 17.5,
  build(ctx) {
    const parts: Parts = []; const stone = color(0xf3f0e7);
    brickShell(ctx, parts, 11.1, color(0x975346), stone, color(0x969899));
    hip(ctx, parts, [0.08, 0.91, 0.06, 0.94], 11.35, 2.1, color(0x737a7c));
    portico(ctx, parts, { side: 'east', width: 31, depth: 5.5,
      columns: 8, baseY: 0.75, columnHeight: 10.9, pediment: 3.2 }, stone, color(0x414e56));
    stripWindows(ctx, parts, 'north', [0.12, 0.88], [2.0, 6.5], 10, stone, color(0x4c5659));
    stripWindows(ctx, parts, 'south', [0.12, 0.88], [2.0, 6.5], 10, stone, color(0x4c5659));
    // The broad drill-hall walls sit beneath a light stone cornice. At the
    // east, the portico is framed by two brick side bays rather than floating
    // as a separate temple face.
    const b = ctx.helpers.bboxOf(ctx.pts);
    for (const north of [b.minY + 1.25, b.maxY - 1.25]) {
      box(ctx, parts, b.maxX - 0.3, b.maxX + 0.15,
        north - 0.8, north + 0.8, 0.7, 10.7, stone);
    }
    box(ctx, parts, b.maxX - 0.3, b.maxX + 0.21,
      b.minY + 0.6, b.maxY - 0.6, 10.65, 11.12, stone);
    return parts;
  },
};
