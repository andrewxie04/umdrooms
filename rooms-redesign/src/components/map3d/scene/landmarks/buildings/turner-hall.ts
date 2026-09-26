// Turner Hall's stepped end gable and long white visitor-center canopy are
// visible in UMD Facilities and Conferences & Visitor Services photographs.
import * as THREE from 'three';
import type { LandmarkModule } from '../types';

export const landmark: LandmarkModule = {
  id: 'way/23989098',
  spec: { name: 'Turner Hall Visitor Center', color: 0x965242,
    accent: 0xece8db, roof: 'parapet' },
  maxHeight: 19.8,
  build(ctx) {
    const { pts, cx, cy, helpers } = ctx;
    const parts: THREE.BufferGeometry[] = [];
    const brick = new THREE.Color(0x965242);
    const trim = new THREE.Color(0xece8db);
    const glass = new THREE.Color(0x40555c);
    const roofColor = new THREE.Color(0x585d60);
    const add = (g: THREE.BufferGeometry, c: THREE.Color) => parts.push(helpers.withColor(g, c));

    // The long footprint edges, rather than its farthest pair of corners,
    // give the orientation of the historic brick facade.
    let axis = new THREE.Vector2(1, -0.5).normalize();
    let longest = 0;
    for (let i = 0; i < pts.length; i++) {
      const edge = pts[(i + 1) % pts.length].clone().sub(pts[i]);
      if (edge.lengthSq() > longest) {
        longest = edge.lengthSq();
        axis = edge.normalize();
      }
    }
    if (axis.x < 0) axis.negate();
    const ux = axis.x, un = axis.y, vx = -un, vn = ux;
    const angle = Math.atan2(un, ux);
    const local = pts.map(p => ({
      u: (p.x - cx) * ux + (p.y - cy) * un,
      v: (p.x - cx) * vx + (p.y - cy) * vn,
    }));
    const u0 = Math.min(...local.map(p => p.u));
    const u1 = Math.max(...local.map(p => p.u));
    const v0 = Math.min(...local.map(p => p.v));
    const v1 = Math.max(...local.map(p => p.v));
    const xyz = (u: number, v: number, y: number): [number, number, number] => [
      cx + u * ux + v * vx, y, -(cy + u * un + v * vn),
    ];
    const localBox = (a: number, b: number, c: number, d: number,
      bottom: number, top: number, shade: THREE.Color) => {
      const g = new THREE.BoxGeometry(b - a, top - bottom, d - c);
      g.rotateY(angle);
      const u = (a + b) / 2, v = (c + d) / 2;
      g.translate(cx + u * ux + v * vx, (bottom + top) / 2,
        -(cy + u * un + v * vn));
      add(g, shade);
    };
    const panel = (a: [number, number, number], b: [number, number, number],
      c: [number, number, number], d: [number, number, number], shade: THREE.Color) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute([
        ...a, ...b, ...c, ...a, ...c, ...d,
      ], 3));
      g.computeVertexNormals();
      add(g, shade);
    };

    // The mapped perimeter holds the lower wings, while a taller central
    // volume carries the visitor-center gable seen in the photographs.
    add(helpers.extrudeFootprint(pts, 4.35), brick);
    add(helpers.extrudeFootprint(helpers.outsetRing(pts, 0.12), 0.30)
      .translate(0, 4.28, 0), roofColor);
    const mainU0 = u0 + 9.7, mainU1 = u1 - 0.45;
    const mainV0 = v0 + 3.1, mainV1 = v1 - 8.8;
    localBox(mainU0, mainU1, mainV0, mainV1, 4.35, 11.95, brick);
    for (const v of [mainV0 - 0.20, mainV1 + 0.20]) {
      panel(xyz(mainU0, v, 11.95), xyz(mainU1, v, 11.95),
        xyz(mainU1, (mainV0 + mainV1) / 2, 13.45),
        xyz(mainU0, (mainV0 + mainV1) / 2, 13.45), roofColor);
    }
    localBox(mainU0 - 0.10, mainU1 + 0.10, mainV0 - 0.13, mainV0 + 0.13,
      11.55, 12.05, trim);
    localBox(mainU0 - 0.10, mainU1 + 0.10, mainV1 - 0.13, mainV1 + 0.13,
      11.55, 12.05, trim);

    // Brick end wall with shoulders and twin high square piers, including the
    // shallow central notch seen above the visitor-center entrance.
    const midV = (mainV0 + mainV1) / 2;
    const half = (mainV1 - mainV0) / 2;
    const outline: [number, number][] = [
      [midV - half, 4.35], [midV + half, 4.35],
      [midV + half, 12.0], [midV + half * 0.69, 14.15],
      [midV + half * 0.40, 16.25], [midV + half * 0.40, 19.25],
      [midV + half * 0.20, 19.25], [midV + half * 0.20, 17.65],
      [midV - half * 0.20, 17.65], [midV - half * 0.20, 19.25],
      [midV - half * 0.40, 19.25], [midV - half * 0.40, 16.25],
      [midV - half * 0.69, 14.15], [midV - half, 12.0],
    ];
    const shape = new THREE.Shape();
    shape.moveTo(...outline[0]);
    for (const [v, y] of outline.slice(1)) shape.lineTo(v, y);
    shape.closePath();
    const gable = new THREE.ExtrudeGeometry(shape, { depth: 0.65, bevelEnabled: false,
      curveSegments: 1, steps: 1 });
    const pos = gable.getAttribute('position');
    for (let i = 0; i < pos.count; i++) {
      const [x, y, z] = xyz(mainU1 + pos.getZ(i), pos.getX(i), pos.getY(i));
      pos.setXYZ(i, x, y, z);
    }
    pos.needsUpdate = true;
    gable.computeVertexNormals();
    add(gable, brick);

    // The end facade has two regular rows of white sash windows above the
    // visitor canopy. Paint them directly onto the gable plane, rather than
    // projecting them from a rectangular approximation of the footprint.
    const frontU = mainU1 + 0.69;
    const faceRect = (vA: number, vB: number, yA: number, yB: number,
      depth: number, shade: THREE.Color) => panel(
      xyz(frontU + depth, vA, yA), xyz(frontU + depth, vB, yA),
      xyz(frontU + depth, vB, yB), xyz(frontU + depth, vA, yB), shade);
    for (let bay = 0; bay < 5; bay++) {
      const v = mainV0 + (mainV1 - mainV0) * (bay + 0.5) / 5;
      for (const y of [5.12, 8.82]) {
        faceRect(v - 0.82, v + 0.82, y, y + 2.18, 0, trim);
        faceRect(v - 0.62, v + 0.62, y + 0.18, y + 1.98, 0.015, glass);
        faceRect(v - 0.05, v + 0.05, y + 0.18, y + 1.98, 0.025, trim);
        faceRect(v - 0.62, v + 0.62, y + 1.03, y + 1.13, 0.025, trim);
      }
    }
    // The long, open white canopy and slender posts read more like the photo
    // than a heavy classical pediment.
    localBox(mainU1 + 0.7, mainU1 + 5.15,
      mainV0 - 1.25, mainV1 + 1.25, 6.35, 6.76, trim);
    localBox(mainU1 + 0.7, mainU1 + 5.15,
      mainV0 - 1.25, mainV1 + 1.25, 6.83, 7.05, trim);
    for (let i = 0; i < 6; i++) {
      const v = mainV0 - 0.75 + (mainV1 - mainV0 + 1.5) * i / 5;
      const c = new THREE.CylinderGeometry(0.23, 0.28, 6.35, 10);
      c.translate(0, 3.18, 0);
      c.translate(...xyz(mainU1 + 4.65, v, 0));
      add(c, trim);
    }
    localBox(mainU1 + 0.76, mainU1 + 0.90, midV - 1.75, midV + 1.75,
      0.92, 4.65, glass);
    localBox(mainU1 + 0.65, mainU1 + 5.4, midV - 3.2, midV + 3.2,
      0.03, 0.48, trim);

    // The small round opening high in the brick gable is visible in both UMD
    // photographs and is a useful recognition cue even at map scale.
    const round: number[] = [];
    for (let i = 0; i < 20; i++) {
      const a = i * Math.PI * 2 / 20;
      const b = (i + 1) * Math.PI * 2 / 20;
      round.push(...xyz(frontU + 0.04, midV, 16.05),
        ...xyz(frontU + 0.04, midV + Math.cos(a) * 0.66, 16.05 + Math.sin(a) * 0.66),
        ...xyz(frontU + 0.04, midV + Math.cos(b) * 0.66, 16.05 + Math.sin(b) * 0.66));
    }
    const circle = new THREE.BufferGeometry();
    circle.setAttribute('position', new THREE.Float32BufferAttribute(round, 3));
    circle.computeVertexNormals();
    add(circle, trim);
    return parts;
  },
};
