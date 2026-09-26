// Tyser Tower follows its own south-rim footprint instead of being repeated
// as an offset block inside the SECU Stadium bowl model.
import * as THREE from 'three';
import type { LandmarkModule } from '../types';

export const landmark: LandmarkModule = {
  id: 'way/25215513',
  spec: { name: 'Tyser Tower', color: 0x995a4b,
    accent: 0xe2ded5, roof: 'parapet', height: 24.4 },
  maxHeight: 27.4,
  build(ctx) {
    const { pts, helpers } = ctx;
    const brick = new THREE.Color(0x995a4b);
    const glass = new THREE.Color(0x40515b);
    const pale = new THREE.Color(0xe2ded5);
    const roof = new THREE.Color(0x50585a);
    const parts: THREE.BufferGeometry[] = [];
    const add = (g: THREE.BufferGeometry, c: THREE.Color) =>
      parts.push(helpers.withColor(g, c));

    // A long mapped wall edge establishes the field-aligned basis. Its
    // perpendicular points toward the north, where the suites face the field.
    let axis = new THREE.Vector2(1, -0.75).normalize();
    let longest = 0;
    for (let i = 0; i < pts.length; i++) {
      const edge = pts[(i + 1) % pts.length].clone().sub(pts[i]);
      if (edge.lengthSq() > longest) {
        longest = edge.lengthSq();
        axis = edge.normalize();
      }
    }
    if (axis.x < 0) axis.negate();
    const north = new THREE.Vector2(-axis.y, axis.x);
    const projections = pts.map(p => p.dot(north));
    const minV = Math.min(...projections), maxV = Math.max(...projections);

    add(helpers.extrudeFootprint(pts, 24.1), brick);
    add(helpers.extrudeFootprint(helpers.outsetRing(pts, 0.12), 0.48)
      .translate(0, 24.02, 0), pale);
    add(helpers.extrudeFootprint(helpers.scaleAbout(pts,
      helpers.centroidOf(pts).cx, helpers.centroidOf(pts).cy, 0.97), 0.16)
      .translate(0, 24.5, 0), roof);

    const quad = (a: THREE.Vector2, b: THREE.Vector2,
      y0: number, y1: number, shade: THREE.Color) => {
      const vertices = [
        a.x, y0, -a.y, b.x, y0, -b.y, b.x, y1, -b.y,
        a.x, y0, -a.y, b.x, y1, -b.y, a.x, y1, -a.y,
        b.x, y0, -b.y, a.x, y0, -a.y, a.x, y1, -a.y,
        b.x, y0, -b.y, a.x, y1, -a.y, b.x, y1, -b.y,
      ];
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      g.computeVertexNormals();
      add(g, shade);
    };

    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      const edge = b.clone().sub(a);
      const length = edge.length();
      const midV = a.clone().add(b).multiplyScalar(0.5).dot(north);
      if (length < 7 || Math.abs(edge.clone().normalize().dot(axis)) < 0.78 ||
          midV < minV + (maxV - minV) * 0.54) continue;
      const onEdge = (t: number) => a.clone().lerp(b, t)
        .addScaledVector(north, 0.13);
      // Five dark suite ribbons broken by slender pale piers and courses.
      for (const y of [3.8, 7.8, 11.8, 15.8, 19.8]) {
        quad(onEdge(0.04), onEdge(0.96), y, y + 1.9, glass);
        quad(onEdge(0.02), onEdge(0.98), y + 1.9, y + 2.08, pale);
      }
      const bays = Math.max(2, Math.round(length / 9));
      for (let bay = 1; bay < bays; bay++) {
        const t = bay / bays;
        quad(onEdge(t - 0.012), onEdge(t + 0.012), 2.6, 22.4, pale);
      }
    }

    // Rooftop technical rooms are kept below the documented 90-foot extent.
    const center = helpers.centroidOf(pts);
    for (const [du, dv, w, d, h] of [
      [-24, 0, 7, 4.5, 1.45], [13, -1, 9, 5, 1.85],
    ]) {
      const p = new THREE.Vector2(center.cx, center.cy)
        .addScaledVector(axis, du).addScaledVector(north, dv);
      const g = new THREE.BoxGeometry(w, h, d);
      g.rotateY(Math.atan2(axis.y, axis.x));
      g.translate(p.x, 24.65 + h / 2, -p.y);
      add(g, roof);
    }
    return parts;
  },
};
