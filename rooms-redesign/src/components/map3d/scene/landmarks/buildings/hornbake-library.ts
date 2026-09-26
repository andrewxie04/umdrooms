// Hornbake Library: broad flat-roofed brick wings and a monumental six-column
// west entrance. The pale entablature and short balustrade are visible in the
// UMD Facilities photograph; the roof blocks follow the local aerial.
import type { LandmarkModule } from '../types';
import { box, brickShell, color, facadePointAt, fractionBox, portico, stripWindows, type Parts } from './historic-central-parts';

export const landmark: LandmarkModule = {
  id: 'way/23580263',
  spec: { name: 'Hornbake Library', color: 0xa36250, accent: 0xece9df,
    height: 16, roof: 'parapet' },
  maxHeight: 18.2,
  build(ctx) {
    const parts: Parts = []; const stone = color(0xece9df);
    brickShell(ctx, parts, 15.3, color(0xa36250), stone, color(0x888c8c));
    fractionBox(ctx, parts, [0.08, 0.93, 0.34, 0.67], 15.52, 16.5, color(0x858a8b));
    fractionBox(ctx, parts, [0.12, 0.88, 0.05, 0.30], 15.52, 15.9, color(0x777d80));
    fractionBox(ctx, parts, [0.12, 0.88, 0.70, 0.95], 15.52, 15.9, color(0x777d80));
    portico(ctx, parts, { side: 'west', width: 28, depth: 6.0,
      columns: 6, baseY: 0.6, columnHeight: 11.8 }, stone, color(0x465159));
    const b = ctx.helpers.bboxOf(ctx.pts);
    const entranceNorth = (b.minY + b.maxY) / 2;
    // The official facade image shows a deep, shadowed glass entrance behind
    // the colonnade, colorful exhibit banners, and a broad pale name band.
    // These separate surfaces make the six-column entrance legible at the
    // normal building-selection distance rather than only from ground level.
    box(ctx, parts, b.minX - 0.30, b.minX - 0.17,
      entranceNorth - 6.0, entranceNorth + 6.0, 0.78, 4.75, color(0x364a51));
    for (const offset of [-4, 0, 4]) {
      box(ctx, parts, b.minX - 0.39, b.minX - 0.24,
        entranceNorth + offset - 0.07, entranceNorth + offset + 0.07,
        0.80, 4.76, stone);
    }
    const banners = [color(0x9b3c38), color(0xc49642), color(0x42546b)];
    for (let i = 0; i < banners.length; i++) {
      const north = entranceNorth + (i - 1) * 5.0;
      box(ctx, parts, b.minX - 0.43, b.minX - 0.30,
        north - 1.06, north + 1.06, 6.38, 10.76, banners[i]);
      box(ctx, parts, b.minX - 0.48, b.minX - 0.28,
        north - 1.12, north + 1.12, 10.68, 10.84, stone);
    }
    box(ctx, parts, b.minX - 5.82, b.minX - 5.58,
      entranceNorth - 13.7, entranceNorth + 13.7, 12.37, 12.95, stone);
    for (let step = 0; step < 3; step++) {
      box(ctx, parts, b.minX - 6.2 - step * 0.55, b.minX - 5.2,
        entranceNorth - 12.4, entranceNorth + 12.4,
        0, 0.57 - step * 0.16, stone);
    }
    // Stone story bands and a small open balustrade above the portico.
    for (const y of [4.7, 10.4]) {
      box(ctx, parts, b.minX - 0.22, b.minX + 0.28,
        b.minY + 2, b.maxY - 2, y, y + 0.32, stone);
    }
    const railX = b.minX - 4.9;
    const railNorth0 = ctx.cy - 12.7;
    box(ctx, parts, railX - 0.24, railX + 0.24,
      railNorth0, railNorth0 + 25.4, 14.25, 14.65, stone);
    for (let i = 0; i < 11; i++) {
      const n = railNorth0 + i * 2.54;
      box(ctx, parts, railX - 0.32, railX + 0.32,
        n - 0.31, n + 0.31, 13.35, 14.25, stone);
    }
    stripWindows(ctx, parts, 'west', [0.03, 0.28], [1.7, 6.0, 10.4], 3,
      stone, color(0x52646d));
    stripWindows(ctx, parts, 'west', [0.72, 0.97], [1.7, 6.0, 10.4], 3,
      stone, color(0x52646d));
    // UMD identifies two entrances and a separate South Wing. The repeated
    // four-level bays make the library read as a broad academic block rather
    // than a single solid brick extrusion.
    stripWindows(ctx, parts, 'east', [0.08, 0.92], [1.7, 5.6, 9.5], 11,
      stone, color(0x52646d));
    stripWindows(ctx, parts, 'north', [0.16, 0.83], [1.7, 5.6, 9.5], 5,
      stone, color(0x52646d));
    stripWindows(ctx, parts, 'south', [0.16, 0.83], [1.7, 5.6, 9.5], 5,
      stone, color(0x52646d));
    // The south-wing entrance is a smaller inset doorway to the right of
    // the prominent north/library colonnade.
    const southEntrance = facadePointAt(ctx, 'west', b.minY + 6.05)!;
    box(ctx, parts, southEntrance.x - 0.21, southEntrance.x + 0.12,
      b.minY + 4.0, b.minY + 8.1, 0.65, 4.15, stone);
    box(ctx, parts, southEntrance.x - 0.29, southEntrance.x - 0.14,
      b.minY + 4.45, b.minY + 7.65, 0.8, 3.8, color(0x3c4a51));
    return parts;
  },
};
