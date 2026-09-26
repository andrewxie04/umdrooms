// UMD Facilities photo: long roofed wings, a six-column flat entablature on
// the south lawn front, roof dormers and a white cupola over the main block.
import type { LandmarkModule } from '../types';
import { box, brickShell, color, cupola, fractionBox, hip, portico, stripWindows, type Parts } from './historic-central-parts';

export const landmark: LandmarkModule = {
  id: 'way/23585339',
  spec: { name: 'H. J. Patterson Hall', color: 0x9e604d, accent: 0xe9e8df, height: 18, roof: 'hipped' },
  maxHeight: 27,
  build(ctx) {
    const parts: Parts = []; const stone = color(0xe9e8df), slate = color(0x555a5e);
    brickShell(ctx, parts, 13.5, color(0x9e604d), stone, color(0x888d8c));
    // In the Facilities facade photograph the central south block rises
    // distinctly above the lower flanking roofs. Keep the long northward
    // wings below that block and the mapped recess behind it open.
    fractionBox(ctx, parts, [0.27, 0.73, 0.035, 0.30], 13.5, 17.55,
      color(0x9e604d));
    hip(ctx, parts, [0.03, 0.26, 0.03, 0.44], 13.65, 1.65, slate);
    hip(ctx, parts, [0.74, 0.95, 0.05, 0.99], 13.65, 1.65, slate);
    hip(ctx, parts, [0.28, 0.72, 0.04, 0.30], 17.55, 2.1, slate);
    portico(ctx, parts, { side: 'south', width: 20, depth: 4.2,
      columns: 6, columnHeight: 10.7 }, stone, color(0x414a50));
    const b = ctx.helpers.bboxOf(ctx.pts);
    const centerNorth = b.minY + (b.maxY - b.minY) * 0.20;
    cupola(ctx, parts, ctx.cx, centerNorth, 20.15, stone, slate);
    // Pale stone belt and a continuous cornice set off the central facade.
    fractionBox(ctx, parts, [0.27, 0.73, 0.025, 0.04], 10.7, 11.05, stone);
    fractionBox(ctx, parts, [0.27, 0.73, 0.025, 0.04], 17.25, 17.62, stone);
    // Small white dormer faces punctuate the photographed slate roof.
    for (const f of [0.34, 0.43, 0.57, 0.66]) {
      const x = b.minX + (b.maxX - b.minX) * f;
      const n = b.minY + (b.maxY - b.minY) * 0.21;
      box(ctx, parts, x - 0.9, x + 0.9, n - 0.2, n + 0.2,
        18.55, 20.05, stone);
      box(ctx, parts, x - 0.48, x + 0.48, n - 0.27, n - 0.19,
        18.83, 19.65, color(0x4c5c63));
      box(ctx, parts, x - 1, x + 1, n - 0.3, n + 0.45,
        20.05, 20.25, slate);
    }
    const glazing = color(0x52636d);
    stripWindows(ctx, parts, 'south', [0.05, 0.27], [1.8, 5.8, 9.8], 4, stone, glazing);
    stripWindows(ctx, parts, 'south', [0.73, 0.95], [1.8, 5.8, 9.8], 4, stone, glazing);
    // Narrow upper bays flank the six-column porch in the taller block.
    stripWindows(ctx, parts, 'south', [0.29, 0.38], [2.0, 6.2, 10.4, 14.2], 2, stone, glazing);
    stripWindows(ctx, parts, 'south', [0.62, 0.71], [2.0, 6.2, 10.4, 14.2], 2, stone, glazing);
    return parts;
  },
};
