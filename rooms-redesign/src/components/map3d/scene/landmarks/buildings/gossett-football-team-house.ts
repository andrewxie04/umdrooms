// Gossett Hall / former Football Team House (way/23579497).
// UMD Athletics describes the sand-molded brick, second-floor terrace and
// skylit training area; its facilities photograph shows the curved pale
// entrance arcade and dark glazed doors. The roof and arcade follow the
// actual, irregular campus-data footprint rather than a rectangular proxy.
// https://umterps.com/news/2013/4/9/208133544
// https://umterps.com/news/2000/9/26/207290568
// https://umterps.com/facilities/gossett-hall/1123
import * as THREE from 'three';
import type { LandmarkModule } from '../types';

export const landmark: LandmarkModule = {
  id: 'way/23579497',
  spec: {
    name: 'Gossett Football Team House',
    color: 0x965747,
    height: 11,
    accent: 0xd8d0bd,
    nightGlow: 0.2,
  },
  maxHeight: 11.7,
  build({ pts, cx, cy, baseHeight, spec, helpers }) {
    const brick = helpers.withGlow(spec.color, spec.nightGlow);
    const limestone = helpers.withGlow(spec.accent ?? 0xd8d0bd, spec.nightGlow);
    const roof = new THREE.Color(0x505659);
    const glass = helpers.withGlow(0x455a62, spec.nightGlow);
    const metal = new THREE.Color(0x929996);
    const parts: THREE.BufferGeometry[] = [];
    const add = (g: THREE.BufferGeometry, c: THREE.Color) =>
      parts.push(helpers.withColor(g, c));

    // Low brick perimeter and an inset office floor leave the continuous
    // second-floor terrace described by Maryland Athletics. The mapped
    // concavities remain visible in both the wall and the flat roof deck.
    const terraceY = baseHeight * 0.64;
    add(helpers.extrudeFootprint(pts, terraceY), brick);
    add(helpers.extrudeFootprint(pts, 0.16).translate(0, terraceY, 0), limestone);
    const upper = helpers.scaleAbout(pts, cx, cy, 0.78);
    add(helpers.extrudeFootprint(upper, baseHeight - terraceY - 0.15)
      .translate(0, terraceY + 0.16, 0), brick);
    add(helpers.extrudeFootprint(upper, 0.17)
      .translate(0, baseHeight + 0.01, 0), roof);

    // Thin dark coping separates the brick roof from the pale arcade below.
    const coping = helpers.outsetRing(upper, 0.28);
    add(helpers.extrudeFootprint(coping, 0.13)
      .translate(0, baseHeight + 0.18, 0), limestone);

    // Facade strips are placed directly on footprint edges. A small outward
    // offset prevents z-fighting with the brick extrusion. Two-sided quads
    // remain visible regardless of the ring's normalized winding.
    const strip = (a: THREE.Vector2, b: THREE.Vector2,
      y0: number, y1: number, offset: number, color: THREE.Color) => {
      const edge = b.clone().sub(a);
      const normal = new THREE.Vector2(edge.y, -edge.x)
        .normalize().multiplyScalar(offset);
      const p = a.clone().add(normal);
      const q = b.clone().add(normal);
      const v = [
        p.x, y0, -p.y, q.x, y0, -q.y, q.x, y1, -q.y,
        p.x, y0, -p.y, q.x, y1, -q.y, p.x, y1, -p.y,
        q.x, y0, -q.y, p.x, y0, -p.y, p.x, y1, -p.y,
        q.x, y0, -q.y, p.x, y1, -p.y, q.x, y1, -q.y,
      ];
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
      g.computeVertexNormals();
      add(g, color);
    };

    const bounds = helpers.bboxOf(pts);
    const width = bounds.maxX - bounds.minX;
    const depth = bounds.maxY - bounds.minY;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      const mid = a.clone().add(b).multiplyScalar(0.5);
      const length = a.distanceTo(b);
      // The mapped west arc is the landmark's curved, stadium-side frontage.
      const arcade = mid.x < bounds.minX + width * 0.34 &&
        mid.y > bounds.minY + depth * 0.37 &&
        mid.y < bounds.minY + depth * 0.86 && length > 3;
      if (arcade) {
        strip(a, b, 0.35, 3.55, 0.09, glass);
        strip(a, b, 3.55, terraceY + 0.24, 0.12, limestone);
        strip(a, b, 0.35, 0.72, 0.16, limestone);
        const pier = (t: number) => {
          const p = a.clone().lerp(b, t - 0.025);
          const q = a.clone().lerp(b, t + 0.025);
          strip(p, q, 0.4, 3.9, 0.18, limestone);
        };
        pier(0.07);
        if (length > 11) pier(0.5);
        pier(0.93);
      } else if (length > 9) {
        // Long brick wings carry paired horizontal office window bands.
        strip(a.clone().lerp(b, 0.08), a.clone().lerp(b, 0.92),
          2.6, 3.9, 0.07, glass);
        strip(a.clone().lerp(b, 0.08), a.clone().lerp(b, 0.92),
          3.92, 4.08, 0.08, limestone);
      }
    }

    // Rooflights sit on the broad center of the mapped roof, a distinctive
    // detail documented for the former strength center. Keep their low
    // profile beneath the selection highlight envelope.
    for (const [dx, dy] of [[-7, -2], [0, 0], [7, 2]]) {
      const g = new THREE.BoxGeometry(3.8, 0.25, 1.6);
      g.rotateY(-0.63);
      g.translate(cx + dx, baseHeight + 0.43, -(cy + dy));
      add(g, metal);
      const pane = new THREE.BoxGeometry(3.35, 0.035, 1.18);
      pane.rotateY(-0.63);
      pane.translate(cx + dx, baseHeight + 0.58, -(cy + dy));
      add(pane, glass);
    }
    return parts;
  },
};
