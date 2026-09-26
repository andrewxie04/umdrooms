import * as THREE from 'three';
import type { LandmarkBuildContext, LandmarkModule } from '../types';
import { box, brickShell, color, hip, stripWindows, type Parts } from './historic-central-parts';

function addCarolineHall(ctx: LandmarkBuildContext): Parts {
  const parts: Parts = [];
  const brick = color(0x8c4c3b);
  const white = color(0xe5e0d4);
  const slate = color(0x555d64);
  const glass = color(0x4a5d65);
  const b = ctx.helpers.bboxOf(ctx.pts);
  const x = (t: number) => b.minX + (b.maxX - b.minX) * t;
  const n = (t: number) => b.minY + (b.maxY - b.minY) * t;
  const wall = 10.48;

  brickShell(ctx, parts, wall, brick, white, slate);
  hip(ctx, parts, [0.01, 0.99, 0.03, 0.97], wall, 3.35, slate);

  // The photographed long elevation has a restrained white door surround,
  // a short set of approach steps and three tiers of spaced sash windows.
  const entranceX = x(0.50);
  // The north wall slopes across the footprint: its midpoint is well south
  // of the bbox maximum. Anchor the entrance to the actual wall edge.
  const northFace = ctx.pts.flatMap((a, i) => {
    const end = ctx.pts[(i + 1) % ctx.pts.length];
    const dx = end.x - a.x;
    if (dx >= -0.01 || entranceX < Math.min(a.x, end.x) || entranceX > Math.max(a.x, end.x)) return [];
    const dy = end.y - a.y;
    const north = a.y + dy * (entranceX - a.x) / dx;
    return [{ north, angle: Math.atan2(dy, dx) }];
  }).sort((a, z) => z.north - a.north)[0];
  const faceNorth = northFace?.north ?? b.maxY;
  const faceAngle = northFace?.angle ?? 0;
  const entranceBox = (width: number, near: number, far: number,
    bottom: number, top: number, shade: typeof white) => {
    const offset = (near + far) / 2;
    const panel = new THREE.BoxGeometry(width, top - bottom, far - near);
    panel.rotateY(faceAngle);
    panel.translate(entranceX + Math.sin(faceAngle) * offset, (bottom + top) / 2,
      -faceNorth + Math.cos(faceAngle) * offset);
    parts.push(ctx.helpers.withColor(panel, shade));
  };
  entranceBox(5.10, -0.02, 0.22, 0.53, 4.16, white);
  entranceBox(3.44, 0.22, 0.38, 0.53, 3.36, glass);
  entranceBox(5.88, -0.02, 0.42, 4.15, 4.48, white);
  for (let step = 0; step < 3; step++) {
    entranceBox(6.2 + step * 0.48, 0.02 + step * 0.72,
      0.45 + step * 0.72, 0, 0.52 - step * 0.15, white);
  }
  stripWindows(ctx, parts, 'north', [0.05, 0.44], [1.08, 4.17, 7.27], 5, white, glass);
  stripWindows(ctx, parts, 'north', [0.56, 0.95], [1.08, 4.17, 7.27], 5, white, glass);
  stripWindows(ctx, parts, 'south', [0.05, 0.95], [1.08, 4.17, 7.27], 11, white, glass);
  stripWindows(ctx, parts, 'east', [0.15, 0.85], [1.08, 4.17, 7.27], 2, white, glass);
  stripWindows(ctx, parts, 'west', [0.15, 0.85], [1.08, 4.17, 7.27], 2, white, glass);

  // White dormers at the roof edge are the strongest feature in the UMD
  // exterior image and are also evident in the campus aerial imagery.
  for (const side of [-1, 1]) {
    const north = side < 0 ? n(0.12) : n(0.88);
    for (const fraction of [0.14, 0.29, 0.43, 0.57, 0.71, 0.86]) {
      const center = x(fraction);
      box(ctx, parts, center - 0.82, center + 0.82,
        north - 0.82, north + 0.82, 10.75, 12.55, white);
      box(ctx, parts, center - 0.53, center + 0.53,
        north + side * 0.83 - 0.08, north + side * 0.83 + 0.08,
        11.02, 12.25, glass);
      box(ctx, parts, center - 0.98, center + 0.98,
        north - 1.04, north + 1.04, 12.55, 12.78, slate);
    }
  }
  return parts;
}

export const landmark: LandmarkModule = {
  id: 'way/23579434',
  spec: { name: 'Caroline Hall', color: 0x8c4c3b, height: 11, roof: 'hipped' },
  maxHeight: 14.2,
  build: addCarolineHall,
};
