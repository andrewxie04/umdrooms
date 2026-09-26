import * as THREE from 'three';
import type { LandmarkBuildContext, LandmarkModule } from '../types';
import { box, brickShell, color, hip, stripWindows, type Parts } from './historic-central-parts';

function addWorcesterHall(ctx: LandmarkBuildContext): Parts {
  const parts: Parts = [];
  const brick = color(0x90503f);
  const white = color(0xe9e5dc);
  const slate = color(0x555e63);
  const glass = color(0x495b63);
  const rail = color(0x333a3b);
  const b = ctx.helpers.bboxOf(ctx.pts);
  const x = (t: number) => b.minX + (b.maxX - b.minX) * t;
  const n = (t: number) => b.minY + (b.maxY - b.minY) * t;
  // The OSM way carries a west-side entrance=steps node at 38.9846244,
  // -76.9451169. On this footprint it is 38% of the south-to-north span.
  const entranceN = n(0.38);
  const wall = 11.0;

  brickShell(ctx, parts, wall, brick, white, slate);
  // The surveyed footprint consists of a long north-south hall joined to a
  // shorter eastward wing at its south end, each with its own slate roof.
  hip(ctx, parts, [0.01, 0.43, 0.02, 0.99], wall, 3.0, slate);
  hip(ctx, parts, [0.01, 0.99, 0.01, 0.34], wall, 2.55, slate);

  stripWindows(ctx, parts, 'west', [0.05, 0.23], [1.05, 4.24, 7.43], 2, white, glass);
  stripWindows(ctx, parts, 'west', [0.52, 0.96], [1.05, 4.24, 7.43], 5, white, glass);
  stripWindows(ctx, parts, 'east', [0.39, 0.94], [1.05, 4.24, 7.43], 6, white, glass);
  stripWindows(ctx, parts, 'south', [0.47, 0.93], [1.05, 4.24, 7.43], 4, white, glass);

  // The photographed west entrance sits on a raised brick landing with a
  // stair running down each side; the ground-floor door remains below it.
  box(ctx, parts, b.minX - 3.75, b.minX + 0.18,
    entranceN - 5.0, entranceN + 5.0, 0, 1.95, brick);
  box(ctx, parts, b.minX - 3.85, b.minX + 0.10,
    entranceN - 5.12, entranceN + 5.12, 1.95, 2.12, white);
  for (const side of [-1, 1]) {
    for (let step = 0; step < 5; step++) {
      const center = entranceN + side * (5.6 + step * 0.83);
      box(ctx, parts, b.minX - 3.9, b.minX - 0.25,
        center - 0.47, center + 0.47, 0, 1.74 - step * 0.33, white);
    }
    const railN = entranceN + side * 5.15;
    box(ctx, parts, b.minX - 4.04, b.minX - 3.98,
      railN - 0.10, railN + 0.10, 2.05, 3.11, rail);
  }
  box(ctx, parts, b.minX - 3.97, b.minX - 3.86,
    entranceN - 1.46, entranceN + 1.46, 0.08, 1.88, white);
  box(ctx, parts, b.minX - 4.08, b.minX - 3.97,
    entranceN - 1.18, entranceN + 1.18, 0.18, 1.72, glass);

  // White pilasters, lintel, and a split curved pediment make the upper door
  // recognizable without adding a texture or a separate draw material.
  const doorFace = b.minX - 0.30;
  box(ctx, parts, doorFace - 0.24, doorFace + 0.04,
    entranceN - 2.24, entranceN - 1.74, 2.12, 5.47, white);
  box(ctx, parts, doorFace - 0.24, doorFace + 0.04,
    entranceN + 1.74, entranceN + 2.24, 2.12, 5.47, white);
  box(ctx, parts, doorFace - 0.29, doorFace + 0.05,
    entranceN - 2.50, entranceN + 2.50, 5.15, 5.57, white);
  box(ctx, parts, doorFace - 0.39, doorFace - 0.27,
    entranceN - 1.68, entranceN + 1.68, 2.12, 4.65, glass);
  for (const side of [-1, 1]) {
    const ornament = new THREE.BoxGeometry(0.24, 0.28, 2.2);
    ornament.rotateX(side * 0.38);
    ornament.translate(doorFace - 0.26, 5.97, -(entranceN + side * 1.14));
    parts.push(ctx.helpers.withColor(ornament, white));
  }
  const octagon = new THREE.CylinderGeometry(1.04, 1.04, 0.20, 8);
  octagon.rotateZ(Math.PI / 2);
  octagon.translate(b.minX - 0.24, 7.23, -entranceN);
  parts.push(ctx.helpers.withColor(octagon, white));
  const octagonGlass = new THREE.CylinderGeometry(0.70, 0.70, 0.15, 8);
  octagonGlass.rotateZ(Math.PI / 2);
  octagonGlass.translate(b.minX - 0.41, 7.23, -entranceN);
  parts.push(ctx.helpers.withColor(octagonGlass, glass));

  for (const side of [-1, 1]) {
    const dx = side < 0 ? x(0.055) : x(0.375);
    for (const fraction of [0.25, 0.43, 0.79, 0.91]) {
      const center = n(fraction);
      box(ctx, parts, dx - 0.76, dx + 0.76, center - 0.85, center + 0.85,
        11.24, 12.76, white);
      box(ctx, parts, dx + side * 0.77 - 0.07, dx + side * 0.77 + 0.07,
        center - 0.48, center + 0.48, 11.47, 12.52, glass);
      box(ctx, parts, dx - 0.92, dx + 0.92, center - 1.05, center + 1.05,
        12.76, 12.98, slate);
    }
  }
  return parts;
}

export const landmark: LandmarkModule = {
  id: 'way/23546215',
  spec: { name: 'Worcester Hall', color: 0x90503f, height: 11, roof: 'hipped' },
  maxHeight: 14.4,
  build: addWorcesterHall,
};
