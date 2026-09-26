// The mapped outline contains the south-facing rotunda, the broad alumni
// hall to its north, and the long, stepped administration wing to the east.
// UMD photographs show a pale curved entry with arches and brick wings.
import * as THREE from 'three';
import type { LandmarkModule } from '../types';

export const landmark: LandmarkModule = {
  id: 'way/23972895',
  spec: { name: 'Samuel Riggs IV Alumni Center', color: 0x965446,
    accent: 0xeeeae0, roof: 'parapet', height: 10.8 },
  maxHeight: 15.65,
  build(ctx) {
    const { pts, helpers } = ctx;
    const brick = new THREE.Color(0x965446);
    const pale = new THREE.Color(0xeeeae0);
    const stone = new THREE.Color(0xcfc9bc);
    const glass = new THREE.Color(0x354b53);
    const roof = new THREE.Color(0x555b5d);
    const parts: THREE.BufferGeometry[] = [];
    const add = (g: THREE.BufferGeometry, color: THREE.Color) =>
      parts.push(helpers.withColor(g, color));
    const point = (p: THREE.Vector2, y: number): [number, number, number] =>
      [p.x, y, -p.y];
    const quad = (a: THREE.Vector2, b: THREE.Vector2,
      low: number, high: number, color: THREE.Color) => {
      // Both sides are present because the campus mesh uses a front-side material.
      const v = [
        ...point(a, low), ...point(b, low), ...point(b, high),
        ...point(a, low), ...point(b, high), ...point(a, high),
        ...point(b, low), ...point(a, low), ...point(a, high),
        ...point(b, low), ...point(a, high), ...point(b, high),
      ];
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
      g.computeVertexNormals();
      add(g, color);
    };
    const wall = (i: number, t0: number, t1: number, low: number,
      high: number, color: THREE.Color, offset = 0.12) => {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      const outward = new THREE.Vector2(b.y - a.y, a.x - b.x)
        .normalize().multiplyScalar(offset);
      quad(a.clone().lerp(b, t0).add(outward),
        a.clone().lerp(b, t1).add(outward), low, high, color);
    };

    // All lower walls follow the complete OSM ring, including the small
    // alternating setbacks in the east wing and the rotunda's two curves.
    add(helpers.extrudeFootprint(pts, 10.8), brick);
    add(helpers.extrudeFootprint(helpers.scaleAbout(pts, ctx.cx, ctx.cy, 0.996),
      0.16).translate(0, 10.8, 0), roof);

    // The four-story wing is cut from its actual mapped subset, preserving
    // each south-facing projection instead of covering them with a box.
    const wing = pts.slice(23, 40);
    add(helpers.extrudeFootprint(wing, 4.05).translate(0, 10.8, 0), brick);
    add(helpers.extrudeFootprint(helpers.outsetRing(wing, 0.10), 0.36)
      .translate(0, 14.82, 0), pale);
    add(helpers.extrudeFootprint(helpers.scaleAbout(wing,
      helpers.centroidOf(wing).cx, helpers.centroidOf(wing).cy, 0.975), 0.10)
      .translate(0, 15.18, 0), roof);

    // Long hall roof: a shallow slate hip and a light eave distinguish it
    // from the higher flat administration roof in the overhead map view.
    const hall = pts.slice(0, 10);
    add(helpers.buildHippedRoof(hall, 10.95, 1.8), roof);
    for (let i = 0; i < 9; i++) {
      if (hall[i].distanceTo(hall[i + 1]) > 4) {
        wall(i, 0, 1, 10.35, 10.95, pale, 0.18);
      }
    }

    // Five recessed arches wrap the white rotunda's principal south face.
    // Their centers are sampled on the mapped arc, so the windows stay aligned
    // even though that facade is represented by short polygon segments.
    const arc = pts.slice(10, 23);
    for (let i = 10; i < 22; i++) wall(i, 0, 1, 0.16, 10.65, pale, 0.09);
    const lengths = arc.slice(1).map((p, i) => p.distanceTo(arc[i]));
    const arcLength = lengths.reduce((sum, n) => sum + n, 0);
    const sample = (fraction: number) => {
      let distance = fraction * arcLength;
      for (let i = 0; i < lengths.length; i++) {
        if (distance <= lengths[i] || i === lengths.length - 1) {
          const tangent = arc[i + 1].clone().sub(arc[i]).normalize();
          const center = arc[i].clone().addScaledVector(tangent, distance);
          const outward = new THREE.Vector2(tangent.y, -tangent.x);
          return { center, tangent, outward };
        }
        distance -= lengths[i];
      }
      throw new Error('Rotunda arc has no segments');
    };
    const arch = (fraction: number, halfWidth: number, bottom: number,
      spring: number, color: THREE.Color, offset: number) => {
      const { center, tangent, outward } = sample(fraction);
      const p = (across: number) => center.clone()
        .addScaledVector(tangent, across).addScaledVector(outward, offset);
      quad(p(-halfWidth), p(halfWidth), bottom, spring, color);
      const vertices: number[] = [];
      for (let j = 0; j < 12; j++) {
        const a = Math.PI * j / 12;
        const b = Math.PI * (j + 1) / 12;
        const left = p(-halfWidth * Math.cos(a));
        const right = p(-halfWidth * Math.cos(b));
        const top = p(0);
        vertices.push(...point(top, spring),
          ...point(left, spring + halfWidth * Math.sin(a)),
          ...point(right, spring + halfWidth * Math.sin(b)));
        vertices.push(...point(top, spring),
          ...point(right, spring + halfWidth * Math.sin(b)),
          ...point(left, spring + halfWidth * Math.sin(a)));
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      g.computeVertexNormals();
      add(g, color);
    };
    for (const fraction of [0.14, 0.32, 0.50, 0.68, 0.86]) {
      arch(fraction, 1.42, 0.42, 4.6, stone, 0.17);
      arch(fraction, 1.18, 0.54, 4.55, glass, 0.21);
      const { center, tangent, outward } = sample(fraction);
      const a = center.clone().addScaledVector(outward, 0.24);
      quad(a.clone().addScaledVector(tangent, -0.055),
        a.clone().addScaledVector(tangent, 0.055), 0.65, 5.35, pale);
    }
    for (let i = 10; i < 22; i++) {
      wall(i, 0, 1, 7.55, 7.87, stone, 0.21);
      wall(i, 0, 1, 10.30, 11.20, pale, 0.22);
    }
    add(helpers.extrudeFootprint(helpers.scaleAbout(pts.slice(10, 23),
      helpers.centroidOf(pts.slice(10, 23)).cx,
      helpers.centroidOf(pts.slice(10, 23)).cy, 0.96), 0.10)
      .translate(0, 11.20, 0), roof);

    // Tall hall glazing faces both the entrance court and Moxley Gardens.
    for (const i of [0, 7]) {
      const length = pts[i].distanceTo(pts[i + 1]);
      const bays = Math.floor(length / 4.7);
      for (let bay = 0; bay < bays; bay++) {
        const mid = (bay + 0.5) / bays;
        const half = Math.min(0.32 / bays, 1.3 / length);
        wall(i, mid - half - 0.016, mid + half + 0.016, 2.05, 9.10, pale, 0.17);
        wall(i, mid - half, mid + half, 2.25, 8.92, glass, 0.20);
        wall(i, mid - half, mid + half, 5.35, 5.50, pale, 0.22);
      }
    }

    // Regular dark sash bays and thin stone floor lines show the scale of
    // the four-story administration wing without overwhelming the footprint.
    for (let i = 23; i < 39; i++) {
      const length = pts[i].distanceTo(pts[i + 1]);
      if (length < 10 || Math.abs(pts[i + 1].y - pts[i].y) > 1.2) continue;
      for (const y of [3.45, 6.85, 10.25, 13.65]) {
        wall(i, 0.02, 0.98, y, y + 0.19, pale, 0.17);
      }
      const bays = Math.max(3, Math.round(length / 3.4));
      for (let bay = 0; bay < bays; bay++) {
        const mid = (bay + 0.5) / bays;
        const half = 0.28 / bays;
        for (const y of [0.85, 4.25, 7.65, 11.05]) {
          wall(i, mid - half - 0.012, mid + half + 0.012,
            y, y + 2.15, pale, 0.16);
          wall(i, mid - half, mid + half,
            y + 0.13, y + 2.02, glass, 0.19);
        }
      }
    }
    return parts;
  },
};
