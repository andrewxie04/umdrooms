// KEB: brick academic wings and a three-story glazed rotunda/entry colonnade.
// Reference: https://eng.umd.edu/facilities/kim-building
import * as THREE from 'three';
import type { LandmarkModule } from '../types';
import { addCylinder, addFootprint, fractionBox } from './_shared/science-parts';

export const landmark: LandmarkModule = {
  id: 'way/23937556',
  spec: {
    name: 'Jeong H. Kim Engineering Building', color: 0xa45f49,
    height: 17.0, roof: 'parapet', accent: 0x89aeb9, nightGlow: 0.22,
  },
  maxHeight: 20,
  build(ctx) {
    const p: THREE.BufferGeometry[] = [];
    addFootprint(p, ctx, ctx.pts, 17, 0xa45f49);
    const b = ctx.helpers.bboxOf(ctx.pts);
    const x = b.minX + (b.maxX - b.minX) * 0.632;
    const n = b.minY + (b.maxY - b.minY) * 0.436;
    // Main glass drum; its center follows the curved bulge in the OSM outline.
    addCylinder(p, ctx, x, n, 6.5, 0, 15.2, 0x88adb8, 28);
    addCylinder(p, ctx, x, n, 8.0, 15.15, 15.7, 0xe0ded4, 28);
    // The curved glazing is subdivided by thin metal uprights and floor bands.
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      addCylinder(p, ctx, x + 6.57 * Math.cos(a), n + 6.57 * Math.sin(a),
        0.09, 0, 15.2, 0x667d86, 6);
    }
    for (const h of [4.8, 9.6]) {
      const ring = new THREE.TorusGeometry(6.58, 0.09, 4, 32);
      ring.rotateX(Math.PI / 2);
      ring.translate(x, h, -n);
      p.push(ctx.helpers.withColor(ring, ctx.helpers.withGlow(0x73878d, ctx.spec.nightGlow)));
    }
    for (let i = 0; i < 6; i++) {
      const a = Math.PI + (Math.PI * i) / 5;
      addCylinder(p, ctx, x + 7.6 * Math.cos(a), n + 7.6 * Math.sin(a),
        0.34, 0, 15.1, 0xe2e0d7, 8);
    }
    // Place the repeated laboratory bays on the mapped north and south
    // wing walls. Bounding-box latitudes miss the stepped south facade.
    const glass = ctx.helpers.withGlow(0x7795a0, ctx.spec.nightGlow);
    for (let edge = 0; edge < ctx.pts.length; edge++) {
      const a = ctx.pts[edge];
      const end = ctx.pts[(edge + 1) % ctx.pts.length];
      const dx = end.x - a.x;
      const dn = end.y - a.y;
      const length = Math.hypot(dx, dn);
      if (length < 15 || Math.abs(dn) > length * 0.08) continue;
      const north = (a.y + end.y) / 2;
      if (north > b.minY + 1.5 && north < b.maxY - 1.5) continue;
      const outwardX = dn / length;
      const outwardN = -dx / length;
      const bays = Math.floor((length - 1.5) / 4);
      for (const level of [4.3, 8.1, 11.9]) {
        for (let i = 0; i < bays; i++) {
          const t = (i + 0.5) / bays;
          const pane = new THREE.BoxGeometry(1.8, 1.55, 0.16);
          pane.rotateY(Math.atan2(dn, dx));
          pane.translate(a.x + dx * t + outwardX * 0.07,
            level + 0.775, -(a.y + dn * t + outwardN * 0.07));
          p.push(ctx.helpers.withColor(pane, glass));
        }
      }
    }
    // Flat dark roof and the small setback lab plant seen in the reference aerial.
    fractionBox(p, ctx, 0.08, 0.39, 0.64, 0.96, 17, 17.25, 0x5e6566);
    fractionBox(p, ctx, 0.76, 0.95, 0.67, 0.96, 17, 17.25, 0x5e6566);
    fractionBox(p, ctx, 0.81, 0.92, 0.76, 0.90, 17.25, 18.8, 0x979b96);
    return p;
  },
};
