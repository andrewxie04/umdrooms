import type { LandmarkBuildContext, LandmarkModule } from '../types';
import { box, brickShell, color, hip, portico, stripWindows, type Parts } from './historic-central-parts';

function addSomersetHall(ctx: LandmarkBuildContext): Parts {
  const parts: Parts = [];
  const brick = color(0x90513e);
  const limestone = color(0xe8e4d9);
  const slate = color(0x555e65);
  const glass = color(0x4b5b61);
  const b = ctx.helpers.bboxOf(ctx.pts);
  const x = (t: number) => b.minX + (b.maxX - b.minX) * t;
  const n = (t: number) => b.minY + (b.maxY - b.minY) * t;
  const wall = 10.75;

  brickShell(ctx, parts, wall, brick, limestone, slate);
  // The footprint has two southward wings. Individual roof volumes preserve
  // its open court, while the central east-west block carries the portico.
  hip(ctx, parts, [0.01, 0.99, 0.43, 0.98], wall, 2.65, slate);
  hip(ctx, parts, [0.02, 0.27, 0.02, 0.59], wall, 2.10, slate);
  hip(ctx, parts, [0.73, 0.98, 0.02, 0.59], wall, 2.10, slate);

  // UMD's exterior photograph is dominated by an elevated, full-height
  // four-column white porch, broad stairs and a pediment above the north door.
  portico(ctx, parts, {
    side: 'north', center: 0.50, width: 12.0, depth: 3.35,
    columns: 4, baseY: 1.50, columnHeight: 8.15, pediment: 1.45,
  }, limestone, glass);
  for (let step = 0; step < 5; step++) {
    box(ctx, parts, ctx.cx - 7.4 - step * 0.25, ctx.cx + 7.4 + step * 0.25,
      b.maxY + 2.75 + step * 0.67, b.maxY + 3.43 + step * 0.67,
      0, 1.46 - step * 0.27, limestone);
  }

  stripWindows(ctx, parts, 'north', [0.04, 0.29], [1.05, 4.20, 7.34], 3, limestone, glass);
  stripWindows(ctx, parts, 'north', [0.34, 0.44], [1.05, 4.20, 7.34], 1, limestone, glass);
  stripWindows(ctx, parts, 'north', [0.56, 0.66], [1.05, 4.20, 7.34], 1, limestone, glass);
  stripWindows(ctx, parts, 'north', [0.71, 0.96], [1.05, 4.20, 7.34], 3, limestone, glass);
  stripWindows(ctx, parts, 'south', [0.27, 0.73], [1.05, 4.20, 7.34], 5, limestone, glass);
  stripWindows(ctx, parts, 'west', [0.07, 0.48], [1.05, 4.20, 7.34], 3, limestone, glass);
  stripWindows(ctx, parts, 'east', [0.07, 0.48], [1.05, 4.20, 7.34], 3, limestone, glass);

  // Projecting white dormers are visible on each side of the portico and in
  // the U-shaped roof plan. Keep them out of the central pediment.
  for (const fraction of [0.17, 0.30, 0.70, 0.83]) {
    const center = x(fraction);
    const north = n(0.91);
    box(ctx, parts, center - 0.79, center + 0.79,
      north - 0.78, north + 0.78, 10.99, 12.44, limestone);
    box(ctx, parts, center - 0.48, center + 0.48,
      north + 0.79, north + 0.92, 11.20, 12.22, glass);
    box(ctx, parts, center - 0.94, center + 0.94,
      north - 0.95, north + 0.95, 12.44, 12.64, slate);
  }
  return parts;
}

export const landmark: LandmarkModule = {
  id: 'way/23891435',
  spec: { name: 'Somerset Hall', color: 0x90513e, height: 11, roof: 'hipped' },
  maxHeight: 14,
  build: addSomersetHall,
};
