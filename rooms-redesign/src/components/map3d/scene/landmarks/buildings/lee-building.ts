// Lee Building: the 1969 red-brick administrative hall has a long south front,
// a central four-column portico, broad steps and a low dark roof. The narrow
// entrance projection and both wings come from the mapped footprint.
import type { LandmarkModule } from '../types';
import { box, brickShell, color, hip, portico, stripWindows, type Parts } from './historic-central-parts';

export const landmark: LandmarkModule = {
  id: 'way/23891545',
  spec: { name: 'Lee Building', color: 0x985847, accent: 0xece8dd, height: 10.9, roof: 'parapet' },
  maxHeight: 13.25,
  build(ctx) {
    const parts: Parts = [];
    const brick = color(0x985847);
    const stone = color(0xece8dd);
    const slate = color(0x575d60);
    const glazing = color(0x46565a);
    const b = ctx.helpers.bboxOf(ctx.pts);
    const spanX = b.maxX - b.minX;
    const spanN = b.maxY - b.minY;
    const x = (f: number) => b.minX + spanX * f;
    const n = (f: number) => b.minY + spanN * f;

    brickShell(ctx, parts, 8.42, brick, stone, slate);
    // Two low, pitched wing roofs leave the center entrance visible. The
    // roof extents correspond to the long flanking masses in the aerial.
    hip(ctx, parts, [0.01, 0.40, 0.21, 0.93], 8.50, 2.0, slate);
    hip(ctx, parts, [0.60, 0.99, 0.21, 0.93], 8.50, 2.0, slate);
    hip(ctx, parts, [0.39, 0.61, 0.13, 0.94], 8.50, 2.0, slate);

    portico(ctx, parts, { side: 'south', center: 0.5, width: 15.2,
      depth: 4.1, columns: 4, baseY: 0.75, columnHeight: 7.15,
      pediment: 2.15 }, stone, glazing);
    for (let step = 0; step < 4; step++) {
      box(ctx, parts, x(0.5) - 8.25 - step * 0.25,
        x(0.5) + 8.25 + step * 0.25,
        b.minY - 3.7 - step * 0.57, b.minY - 2.4,
        0, 0.76 - step * 0.17, stone);
    }

    // Even two-story window rhythm to either side of the projected center.
    stripWindows(ctx, parts, 'south', [0.04, 0.37], [1.52, 4.8], 5, stone, glazing);
    stripWindows(ctx, parts, 'south', [0.63, 0.96], [1.52, 4.8], 5, stone, glazing);
    stripWindows(ctx, parts, 'north', [0.04, 0.96], [1.52, 4.8], 14, stone, glazing);
    stripWindows(ctx, parts, 'east', [0.12, 0.88], [1.52, 4.8], 3, stone, glazing);
    stripWindows(ctx, parts, 'west', [0.12, 0.88], [1.52, 4.8], 3, stone, glazing);
    for (const floor of [3.83, 7.28]) {
      box(ctx, parts, x(0.03), x(0.36), n(0.19) - 0.17, n(0.19) + 0.17,
        floor, floor + 0.22, stone);
      box(ctx, parts, x(0.64), x(0.97), n(0.19) - 0.17, n(0.19) + 0.17,
        floor, floor + 0.22, stone);
    }

    // The official front photo shows small roof windows above the regular
    // facade bays. Pale dormer frames interrupt the slate slope.
    for (const f of [0.12, 0.25, 0.75, 0.88]) {
      const u = x(f);
      box(ctx, parts, u - 0.79, u + 0.79,
        n(0.31) - 0.68, n(0.31) + 0.68,
        9.20, 10.95, stone);
      box(ctx, parts, u - 0.56, u + 0.56,
        n(0.31) - 0.77, n(0.31) - 0.65,
        9.43, 10.60, glazing);
      box(ctx, parts, u - 0.90, u + 0.90,
        n(0.31) - 0.78, n(0.31) + 0.78,
        10.94, 11.16, slate);
    }
    return parts;
  },
};
