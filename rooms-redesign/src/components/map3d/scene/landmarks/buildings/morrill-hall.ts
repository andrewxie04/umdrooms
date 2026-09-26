// Morrill Hall: Second Empire brick block, slate mansards and an east entry
// tower. The Maryland Historical Trust inventory documents the facade bays,
// tower, chimneys and roof form; all dimensions are scaled to the OSM outline.
import * as THREE from 'three';
import type { LandmarkBuildContext, LandmarkModule } from '../types';
import { box, brickShell, color, facadePointAt, stripWindows, type Parts } from './historic-central-parts';

function mansard(ctx: LandmarkBuildContext, parts: Parts,
  x0: number, x1: number, n0: number, n1: number,
  eave: number, top: number, inset: number, shade: THREE.Color): void {
  const outer = [[x0, n0], [x1, n0], [x1, n1], [x0, n1]];
  const inner = [[x0 + inset, n0 + inset], [x1 - inset, n0 + inset],
    [x1 - inset, n1 - inset], [x0 + inset, n1 - inset]];
  const vertices: number[] = [];
  const push = (p: number[], y: number) => vertices.push(p[0], y, -p[1]);
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4;
    push(outer[i], eave); push(outer[j], eave); push(inner[j], top);
    push(outer[i], eave); push(inner[j], top); push(inner[i], top);
  }
  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geom.computeVertexNormals();
  parts.push(ctx.helpers.withColor(geom, shade));
  box(ctx, parts, x0 + inset, x1 - inset, n0 + inset, n1 - inset,
    top - 0.06, top + 0.06, shade);
}

function addMorrillHall(ctx: LandmarkBuildContext): Parts {
  const parts: Parts = [];
  const brick = color(0x925746);
  const trim = color(0xd6d3c7);
  const slate = color(0x5c626b);
  const glass = color(0x465760);
  const dark = color(0x343b3e);
  const b = ctx.helpers.bboxOf(ctx.pts);
  const x = (t: number) => b.minX + (b.maxX - b.minX) * t;
  const n = (t: number) => b.minY + (b.maxY - b.minY) * t;

  brickShell(ctx, parts, 9.75, brick, trim, slate);
  mansard(ctx, parts, b.minX - 0.18, b.maxX + 0.18,
    b.minY - 0.18, b.maxY + 0.18, 9.88, 13.25, 2.20, slate);

  // The tower projects from the EAST elevation and stands one full storey
  // higher than the long slate roof. Its own miniature mansard is prominent.
  const towerN0 = n(0.39), towerN1 = n(0.61);
  box(ctx, parts, b.maxX - 3.50, b.maxX + 1.50,
    towerN0, towerN1, 0, 12.45, brick);
  box(ctx, parts, b.maxX - 3.63, b.maxX + 1.66,
    towerN0 - 0.13, towerN1 + 0.13, 12.22, 12.57, trim);
  mansard(ctx, parts, b.maxX - 3.68, b.maxX + 1.72,
    towerN0 - 0.17, towerN1 + 0.17, 12.56, 15.45, 0.90, slate);

  // Three bays on either side of the central tower, two tall window rows
  // over a low basement row. The historic windows have pale lug sills.
  for (const range of [[0.04, 0.36], [0.64, 0.96]] as const) {
    stripWindows(ctx, parts, 'east', [range[0], range[1]],
      [3.05, 6.36], 3, trim, glass);
    for (let i = 0; i < 3; i++) {
      const north = n(range[0] + (range[1] - range[0]) * (i + 0.5) / 3);
      const wall = facadePointAt(ctx, 'east', north);
      if (!wall) continue;
      box(ctx, parts, wall.x + 0.10, wall.x + 0.22,
        north - 0.58, north + 0.58, 0.78, 1.78, glass);
      box(ctx, parts, wall.x + 0.10, wall.x + 0.30,
        north - 0.78, north + 0.78, 0.68, 0.83, trim);
    }
  }
  stripWindows(ctx, parts, 'west', [0.06, 0.94], [3.05, 6.36], 6, trim, glass);
  stripWindows(ctx, parts, 'north', [0.08, 0.92], [3.05, 6.36], 4, trim, glass);
  stripWindows(ctx, parts, 'south', [0.08, 0.92], [3.05, 6.36], 4, trim, glass);

  const towerFront = b.maxX + 1.52;
  box(ctx, parts, towerFront, towerFront + 0.15,
    n(0.445), n(0.555), 1.16, 3.48, dark);
  box(ctx, parts, towerFront + 0.16, towerFront + 0.24,
    n(0.443), n(0.557), 3.42, 3.66, trim);
  for (const y of [5.20, 8.27, 11.05]) {
    box(ctx, parts, towerFront + 0.04, towerFront + 0.16,
      n(0.445), n(0.555), y, y + 1.55, trim);
    box(ctx, parts, towerFront + 0.16, towerFront + 0.22,
      n(0.454), n(0.546), y + 0.15, y + 1.42, glass);
  }
  for (let step = 0; step < 5; step++) {
    const y = 1.03 - step * 0.20;
    box(ctx, parts, towerFront + step * 0.39,
      towerFront + (step + 1) * 0.39 + 0.26,
      n(0.39) - 0.10, n(0.61) + 0.10, 0, y, trim);
  }

  // Pedimented slate dormers interrupt the long mansard, one in every bay.
  for (const side of [-1, 1]) {
    const faceX = side > 0 ? x(0.90) : x(0.10);
    for (const fraction of [0.12, 0.24, 0.34, 0.66, 0.76, 0.88]) {
      const north = n(fraction);
      box(ctx, parts, faceX - 0.58, faceX + 0.58,
        north - 0.60, north + 0.60, 11.55, 13.47, trim);
      box(ctx, parts, faceX + side * 0.60 - 0.06,
        faceX + side * 0.60 + 0.06,
        north - 0.38, north + 0.38, 11.80, 13.12, glass);
      box(ctx, parts, faceX - 0.70, faceX + 0.70,
        north - 0.75, north + 0.75, 13.45, 13.68, slate);
    }
  }
  for (const north of [n(0.20), n(0.80)]) {
    box(ctx, parts, x(0.36), x(0.46), north - 0.62, north + 0.62,
      12.55, 14.48, brick);
    box(ctx, parts, x(0.34), x(0.48), north - 0.77, north + 0.77,
      14.48, 14.85, trim);
  }
  return parts;
}

export const landmark: LandmarkModule = {
  id: 'way/24306090',
  spec: { name: 'Morrill Hall', color: 0x925746, height: 12.1, roof: 'parapet' },
  maxHeight: 15.55,
  build: addMorrillHall,
};
