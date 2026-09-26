import * as THREE from 'three';
import type { LandmarkBuildContext, LandmarkModule } from '../types';
import { box, brickShell, color, hip, stripWindows, type Parts } from './historic-central-parts';

function pitchedRoof(ctx: LandmarkBuildContext, parts: Parts,
  x0: number, x1: number, n0: number, n1: number,
  eave: number, ridge: number, shade: THREE.Color): void {
  const mid = (n0 + n1) / 2;
  for (const [outer, reverse] of [[n0, false], [n1, true]] as const) {
    const positions = reverse ? [
      x0, eave, -outer, x1, ridge, -mid, x1, eave, -outer,
      x0, eave, -outer, x0, ridge, -mid, x1, ridge, -mid,
    ] : [
      x0, eave, -outer, x1, eave, -outer, x1, ridge, -mid,
      x0, eave, -outer, x1, ridge, -mid, x0, ridge, -mid,
    ];
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.computeVertexNormals();
    parts.push(ctx.helpers.withColor(geom, shade));
  }
}

function addDorchesterHall(ctx: LandmarkBuildContext): Parts {
  const parts: Parts = [];
  const brick = color(0x934f3e);
  const limestone = color(0xe5e0d2);
  const slate = color(0x656e72);
  const glass = color(0x485b64);
  const b = ctx.helpers.bboxOf(ctx.pts);
  const x = (t: number) => b.minX + (b.maxX - b.minX) * t;
  const n = (t: number) => b.minY + (b.maxY - b.minY) * t;
  const faceN = n(0.205);
  const wall = 11.05;
  const ridge = 15.45;

  // The surveyed outline forms an L. The east-west wing terminates in the
  // prominent west-facing Georgian gable; its perpendicular wing runs north.
  brickShell(ctx, parts, wall, brick, limestone, slate);
  pitchedRoof(ctx, parts, x(0.00), x(0.72), n(0.015), n(0.43),
    wall + 0.20, ridge, slate);
  hip(ctx, parts, [0.60, 0.99, 0.39, 0.99], wall, 3.05, slate);

  // Brick gable with a pale raking cornice. The photographed elevation has
  // three high windows and a small attic vent above the entry axis.
  const halfN = (n(0.43) - n(0.015)) / 2;
  const shape = new THREE.Shape([
    new THREE.Vector2(-halfN, 0),
    new THREE.Vector2(halfN, 0),
    new THREE.Vector2(0, ridge - wall - 0.20),
  ]);
  const gable = new THREE.ExtrudeGeometry(shape, { depth: 3.2, bevelEnabled: false });
  gable.rotateY(Math.PI / 2);
  gable.translate(b.minX - 0.06, wall + 0.20, -faceN);
  parts.push(ctx.helpers.withColor(gable, brick));
  for (const side of [-1, 1]) {
    const rafter = new THREE.BoxGeometry(Math.hypot(halfN, ridge - wall - 0.20), 0.20, 0.23);
    rafter.rotateX(side * Math.atan2(ridge - wall - 0.20, halfN));
    rafter.translate(b.minX - 0.22, (ridge + wall + 0.20) / 2,
      -(faceN + side * halfN / 2));
    parts.push(ctx.helpers.withColor(rafter, limestone));
  }

  // Dorchester's raised front landing has paired stairs, a recessed white
  // doorway and a tall limestone surround rather than a columned porch.
  box(ctx, parts, b.minX - 3.6, b.minX + 0.55, faceN - 6.1, faceN + 6.1,
    0, 1.38, limestone);
  for (const side of [-1, 1]) {
    for (let step = 0; step < 4; step++) {
      const center = faceN + side * (5.4 + step * 0.55);
      box(ctx, parts, b.minX - 3.8 - step * 0.46, b.minX - 0.15,
        center - 0.72, center + 0.72, 0, 1.25 - step * 0.26, limestone);
    }
  }
  box(ctx, parts, b.minX - 0.27, b.minX + 0.02,
    faceN - 2.35, faceN + 2.35, 1.40, 5.05, limestone);
  box(ctx, parts, b.minX - 0.40, b.minX - 0.26,
    faceN - 1.55, faceN + 1.55, 1.42, 4.05, glass);
  box(ctx, parts, b.minX - 0.48, b.minX - 0.22,
    faceN - 3.05, faceN + 3.05, 4.82, 5.25, limestone);

  for (const offset of [-5.55, 5.55]) {
    for (const height of [1.65, 5.08, 8.10]) {
      box(ctx, parts, b.minX - 0.24, b.minX - 0.09,
        faceN + offset - 1.28, faceN + offset + 1.28,
        height, height + 2.12, limestone);
      box(ctx, parts, b.minX - 0.35, b.minX - 0.23,
        faceN + offset - 1.02, faceN + offset + 1.02,
        height + 0.18, height + 1.90, glass);
    }
  }
  box(ctx, parts, b.minX - 0.23, b.minX - 0.08,
    faceN - 1.06, faceN + 1.06, 8.13, 10.25, limestone);
  box(ctx, parts, b.minX - 0.37, b.minX - 0.23,
    faceN - 0.82, faceN + 0.82, 8.34, 10.04, glass);
  const vent = new THREE.CylinderGeometry(0.78, 0.78, 0.13, 16, 1, false, 0, Math.PI);
  vent.rotateZ(Math.PI / 2);
  vent.translate(b.minX - 0.25, 12.56, -faceN);
  parts.push(ctx.helpers.withColor(vent, limestone));

  stripWindows(ctx, parts, 'south', [0.06, 0.57], [1.32, 4.40, 7.48], 6, limestone, glass);
  stripWindows(ctx, parts, 'north', [0.09, 0.55], [1.32, 4.40, 7.48], 5, limestone, glass);
  stripWindows(ctx, parts, 'east', [0.45, 0.92], [1.32, 4.40, 7.48], 4, limestone, glass);

  // White roof dormers repeat on the long wing and break its slate plane.
  for (const side of [-1, 1]) {
    const north = side < 0 ? n(0.055) : n(0.39);
    for (const fraction of [0.36, 0.55]) {
      const center = x(fraction);
      box(ctx, parts, center - 0.90, center + 0.90, north - 0.82, north + 0.82,
        11.54, 13.26, limestone);
      box(ctx, parts, center - 0.53, center + 0.53,
        north + side * 0.83 - 0.07, north + side * 0.83 + 0.07,
        11.77, 13.00, glass);
      box(ctx, parts, center - 1.08, center + 1.08, north - 1.04, north + 1.04,
        13.26, 13.48, slate);
    }
  }
  return parts;
}

export const landmark: LandmarkModule = {
  id: 'way/23585307',
  spec: { name: 'Dorchester Hall', color: 0x934f3e, height: 11, roof: 'hipped' },
  maxHeight: 15.5,
  build: addDorchesterHall,
};
