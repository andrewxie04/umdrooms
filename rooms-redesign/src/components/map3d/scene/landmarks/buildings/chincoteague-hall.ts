// Chincoteague Hall's north-facing 1957 Colonial Revival front: a raised
// four-column portico, three ground arches, broad stairs and roof dormers.
import * as THREE from 'three';
import type { LandmarkBuildContext, LandmarkModule } from '../types';
import { box, brickShell, color, hip, stripWindows, type Parts } from './historic-central-parts';

function addChincoteagueHall(ctx: LandmarkBuildContext): Parts {
  const parts: Parts = [];
  const brick = color(0x906453);
  const stone = color(0xe8e6df);
  const slate = color(0x59616a);
  const glass = color(0x485b66);
  const shadow = color(0x343d42);
  const b = ctx.helpers.bboxOf(ctx.pts);
  const x = (t: number) => b.minX + (b.maxX - b.minX) * t;
  const n = (t: number) => b.minY + (b.maxY - b.minY) * t;
  const center = x(0.50);

  brickShell(ctx, parts, 10.28, brick, stone, slate);
  // The north-center footprint projection is the portico. The main slate
  // roof stops behind it rather than filling in its open column bay.
  hip(ctx, parts, [0.01, 0.99, 0.02, 0.82], 10.40, 2.35, slate);

  // Front is the short north projection in the mapped polygon. The pale
  // first floor has three deep arch openings under a dark balcony rail.
  const front = b.maxY + 0.02;
  box(ctx, parts, center - 8.7, center + 8.7,
    front - 0.32, front + 0.24, 0, 4.13, stone);
  for (const offset of [-4.95, 0, 4.95]) {
    const arch = new THREE.Shape();
    arch.moveTo(offset - 1.55, 0);
    arch.lineTo(offset - 1.55, 2.46);
    arch.absarc(offset, 2.46, 1.55, Math.PI, 0, true);
    arch.lineTo(offset + 1.55, 0);
    arch.closePath();
    const opening = new THREE.ExtrudeGeometry(arch,
      { depth: 0.10, bevelEnabled: false, curveSegments: 10 });
    opening.translate(center, 0.45, -front - 0.26);
    parts.push(ctx.helpers.withColor(opening, shadow));
    box(ctx, parts, center + offset - 0.55, center + offset + 0.55,
      front + 0.39, front + 0.47, 0.45, 2.6, glass);
  }
  box(ctx, parts, center - 9.0, center + 9.0,
    front - 0.40, front + 1.82, 4.05, 4.46, stone);
  // Balcony guard and three simple vertical dividers, held below the
  // white second-storey columns.
  box(ctx, parts, center - 8.25, center + 8.25,
    front + 1.56, front + 1.68, 4.46, 5.15, shadow);
  for (const offset of [-7.9, -5.9, -3.9, -1.9, 0.1, 2.1, 4.1, 6.1, 8.1]) {
    box(ctx, parts, center + offset - 0.055, center + offset + 0.055,
      front + 1.65, front + 1.83, 4.45, 5.12, shadow);
  }

  const columns = [-7.15, -2.38, 2.38, 7.15];
  for (const offset of columns) {
    const shaft = new THREE.CylinderGeometry(0.40, 0.52, 5.50, 12);
    shaft.translate(center + offset, 7.36, -(front + 1.20));
    parts.push(ctx.helpers.withColor(shaft, stone));
    box(ctx, parts, center + offset - 0.72, center + offset + 0.72,
      front + 0.48, front + 1.92, 4.49, 4.78, stone);
    box(ctx, parts, center + offset - 0.66, center + offset + 0.66,
      front + 0.54, front + 1.86, 10.03, 10.37, stone);
  }
  box(ctx, parts, center - 9.10, center + 9.10,
    front - 0.10, front + 2.00, 10.26, 11.18, stone);
  const pediment = new THREE.Shape([
    new THREE.Vector2(-9.35, 0),
    new THREE.Vector2(9.35, 0),
    new THREE.Vector2(0, 3.08),
  ]);
  const gable = new THREE.ExtrudeGeometry(pediment,
    { depth: 1.85, bevelEnabled: false });
  gable.translate(center, 11.20, -(front + 2.0));
  parts.push(ctx.helpers.withColor(gable, stone));
  for (const side of [-1, 1]) {
    const rake = new THREE.BoxGeometry(9.85, 0.21, 0.24);
    rake.rotateZ(-side * Math.atan2(3.08, 9.35));
    rake.translate(center + side * 4.67, 12.77, -(front + 2.10));
    parts.push(ctx.helpers.withColor(rake, stone));
  }

  // The broad stairs run straight north from the three arches. They step
  // down from the raised entrance without encroaching on neighboring halls.
  for (let step = 0; step < 6; step++) {
    box(ctx, parts, center - 7.45 - step * 0.18,
      center + 7.45 + step * 0.18,
      front + 0.28 + step * 0.58,
      front + 1.07 + step * 0.58,
      0, 1.48 - step * 0.23, stone);
  }

  stripWindows(ctx, parts, 'north', [0.06, 0.28], [1.03, 4.52, 7.42], 4, stone, glass);
  stripWindows(ctx, parts, 'north', [0.72, 0.94], [1.03, 4.52, 7.42], 4, stone, glass);
  stripWindows(ctx, parts, 'south', [0.05, 0.95], [1.03, 4.52, 7.42], 10, stone, glass);
  stripWindows(ctx, parts, 'east', [0.10, 0.78], [1.03, 4.52, 7.42], 3, stone, glass);
  stripWindows(ctx, parts, 'west', [0.10, 0.78], [1.03, 4.52, 7.42], 3, stone, glass);

  // Two groups of dormers frame the gable in UMD's front photograph.
  for (const fraction of [0.13, 0.24, 0.76, 0.87]) {
    const cx = x(fraction);
    const north = n(0.71);
    box(ctx, parts, cx - 0.85, cx + 0.85,
      north - 0.87, north + 0.87, 10.70, 12.35, stone);
    box(ctx, parts, cx - 0.53, cx + 0.53,
      north + 0.88, north + 1.00, 10.99, 12.13, glass);
    box(ctx, parts, cx - 1.0, cx + 1.0,
      north - 1.02, north + 1.02, 12.35, 12.56, slate);
  }
  return parts;
}

export const landmark: LandmarkModule = {
  id: 'way/23546179',
  spec: { name: 'Chincoteague Hall', color: 0x906453, height: 11, roof: 'hipped' },
  maxHeight: 14.45,
  build: addChincoteagueHall,
};
