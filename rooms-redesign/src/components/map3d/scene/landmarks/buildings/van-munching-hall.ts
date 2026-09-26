// VMH: Smith School's long brick east spine and its round west bays. The
// mapped outline is deeply indented around its exterior courtyards, so it is
// retained as the wall mass rather than filled with a bounding rectangle.
import * as THREE from 'three';
import type { LandmarkModule } from '../types';
import { facadePointAt, stripWindows } from './historic-central-parts';

export const landmark: LandmarkModule = {
  id: 'way/24006939',
  spec: { name: 'Van Munching Hall', color: 0x9a685a, height: 24.2, roof: 'parapet' },
  maxHeight: 29.4,
  build(ctx) {
    const { pts, baseHeight, helpers } = ctx;
    const b = helpers.bboxOf(pts);
    const x = (f: number) => b.minX + f * (b.maxX - b.minX);
    const n = (f: number) => b.minY + f * (b.maxY - b.minY);
    const rect = (a: number, c: number, d: number, e: number) => [
      new THREE.Vector2(x(a), n(d)), new THREE.Vector2(x(c), n(d)),
      new THREE.Vector2(x(c), n(e)), new THREE.Vector2(x(a), n(e)),
    ];
    const brick = new THREE.Color(0x9a685a);
    const pale = new THREE.Color(0xd9d0c3);
    const dark = new THREE.Color(0x575a59);
    const glass = new THREE.Color(0x57717a);
    const lowWing = 18.6;
    const parts = [helpers.withColor(helpers.extrudeFootprint(pts, lowWing), brick)];
    // The successive north and south additions rise above the lower west
    // wings. Keep the breaks between them visible as actual changes in mass.
    for (const [d, e] of [[0.05, 0.42], [0.48, 0.94]]) {
      parts.push(helpers.withColor(helpers.extrudeFootprint(rect(0.73, 0.91, d, e), baseHeight), brick));
      parts.push(helpers.withColor(helpers.extrudeFootprint(rect(0.73, 0.91, d, e), 0.42).translate(0, baseHeight, 0), pale));
      parts.push(helpers.withColor(helpers.extrudeFootprint(rect(0.75, 0.89, d + 0.015, e - 0.015), 0.12).translate(0, baseHeight + 0.42, 0), dark));
    }
    // The two round west bays end in pale, low roof rings; the exterior
    // courtyards between them remain open in the mapped footprint.
    for (const [fx, fy, radius] of [[0.43, 0.78, 8.0], [0.38, 0.13, 6.4]]) {
      const drum = new THREE.CylinderGeometry(radius - 0.4, radius - 0.4, 2.0, 24);
      drum.translate(x(fx), lowWing + 1.0, -n(fy));
      parts.push(helpers.withColor(drum, brick));
      const cap = new THREE.CylinderGeometry(radius, radius, 0.55, 24);
      cap.translate(x(fx), lowWing + 2.28, -n(fy));
      parts.push(helpers.withColor(cap, pale));
      const inner = new THREE.CylinderGeometry(radius - 1.3, radius - 1.3, 0.2, 24);
      inner.translate(x(fx), lowWing + 2.62, -n(fy));
      parts.push(helpers.withColor(inner, dark));
    }
    // Glazed atrium strip at the western side of the east spine, with tall
    // pale piers that echo the entrance seen from Mayer Mall.
    // Clip the glazing to each mapped wall edge. The recess changes planes
    // twice, so a single straight band would bridge open courtyard space.
    const atriumStart = n(0.43), atriumEnd = n(0.59);
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], z = pts[(i + 1) % pts.length];
      const dx = z.x - a.x, dn = z.y - a.y;
      const length = Math.hypot(dx, dn);
      if (length < 0.01 || dn / length > -0.85) continue;
      const north0 = Math.max(atriumStart, Math.min(a.y, z.y));
      const north1 = Math.min(atriumEnd, Math.max(a.y, z.y));
      if (north1 - north0 < 0.1) continue;
      const t = ((north0 + north1) / 2 - a.y) / dn;
      const glassPanel = new THREE.BoxGeometry(length * (north1 - north0) / Math.abs(dn), 14, 0.28);
      glassPanel.rotateY(Math.atan2(dn, dx));
      glassPanel.translate(a.x + dx * t + dn / length * 0.17, 10.5,
        -(north0 + north1) / 2 + dx / length * 0.17);
      parts.push(helpers.withColor(glassPanel, glass));
    }
    for (let i = 0; i <= 7; i++) {
      const north = n(0.43 + i * 0.16 / 7);
      const edge = facadePointAt(ctx, 'west', north);
      if (!edge) continue;
      const pier = new THREE.BoxGeometry(0.34, 14.2, 0.38);
      pier.translate(edge.x + edge.outX * 0.23, 10.5, -edge.north);
      parts.push(helpers.withColor(pier, pale));
    }
    stripWindows(ctx, parts, 'east', [0.07, 0.93],
      [2.0, 6.5, 11.0, 15.5], 12, pale, glass);
    return parts;
  },
};
