// Main Administration (Thomas V. Miller Jr.) closes the east end of McKeldin
// Mall. Its west-facing white colonnade and triangular pediment are visible
// from the length of the mall.
import * as THREE from 'three';
import type { LandmarkModule } from '../types';
import { facadePointAt, stripWindows } from './historic-central-parts';

export const landmark: LandmarkModule = {
  id: 'way/23544752',
  spec: {
    name: 'Thomas V. Miller Jr. Administration Building',
    color: 0x975546,
    accent: 0xf0eadc,
    height: 14.5,
    roof: 'hipped',
  },
  maxHeight: 16.2,
  build(ctx) {
    const { pts, cy, baseHeight, spec, helpers } = ctx;
    const { minX } = helpers.bboxOf(pts);
    const brick = new THREE.Color(spec.color);
    const stone = new THREE.Color(spec.accent!);
    const slate = new THREE.Color(0x6e7372);
    const wallHeight = baseHeight - 2.9;
    const plinthHeight = 0.7;
    const corniceHeight = 0.32;
    const parts: THREE.BufferGeometry[] = [
      // Stack adjoining volumes. Overlapping full-height extrusions put the
      // brick roof cap exactly under the pale cornice cap, which flickered as
      // the camera zoomed across the Mall.
      helpers.withColor(
        helpers.extrudeFootprint(pts, wallHeight - plinthHeight - corniceHeight)
          .translate(0, plinthHeight, 0), brick,
      ),
      helpers.withColor(helpers.extrudeFootprint(pts, plinthHeight), new THREE.Color(0x927969)),
      helpers.withColor(
        helpers.extrudeFootprint(pts, corniceHeight)
          .translate(0, wallHeight - corniceHeight, 0), stone,
      ),
      helpers.withColor(helpers.buildHippedRoof(pts, wallHeight, 2.9), slate),
    ];
    const faceX = minX + 0.5;
    const halfWidth = 13;
    const rect = (x0: number, x1: number, y0: number, y1: number) => [
      new THREE.Vector2(x0, y0), new THREE.Vector2(x1, y0),
      new THREE.Vector2(x1, y1), new THREE.Vector2(x0, y1),
    ];
    parts.push(helpers.withColor(
      helpers.extrudeFootprint(rect(faceX - 7, faceX + 1, cy - halfWidth, cy + halfWidth), 0.8),
      stone,
    ));
    const colHeight = 10.5;
    for (let i = 0; i < 6; i++) {
      const northing = cy - 10.5 + i * 4.2;
      const col = new THREE.CylinderGeometry(0.43, 0.55, colHeight, 10);
      col.translate(faceX - 5.8, 0.8 + colHeight / 2, -northing);
      parts.push(helpers.withColor(col, stone));
      const foot = new THREE.BoxGeometry(1.18, 0.28, 1.18);
      foot.translate(faceX - 5.8, 0.94, -northing);
      parts.push(helpers.withColor(foot, stone));
      const capital = new THREE.BoxGeometry(1.42, 0.5, 1.42);
      capital.translate(faceX - 5.8, 11.05, -northing);
      parts.push(helpers.withColor(capital, stone));
    }
    parts.push(helpers.withColor(
      helpers.extrudeFootprint(rect(faceX - 7.3, faceX + 1.3, cy - halfWidth, cy + halfWidth), 1.25)
        .translate(0, 11.3, 0), stone,
    ));
    // A shallow triangular prism is the classical pediment above the six
    // columns. Shape x spans north/south, and its y becomes world height.
    const profile = new THREE.Shape([
      new THREE.Vector2(-halfWidth, 0),
      new THREE.Vector2(halfWidth, 0),
      new THREE.Vector2(0, 3),
    ]);
    const pediment = new THREE.ExtrudeGeometry(profile, { depth: 8.6, bevelEnabled: false });
    pediment.rotateY(Math.PI / 2);
    pediment.translate(faceX - 7.3, 12.55, -cy);
    parts.push(helpers.withColor(pediment, stone));
    // Three glazed entrance bays are set back from the columns. The dark
    // center panes and pale jambs distinguish the front from a blind wall.
    for (const offset of [-5.4, 0, 5.4]) {
      const wall = facadePointAt(ctx, 'west', cy + offset)!;
      const z = -wall.north;
      const pane = new THREE.BoxGeometry(0.16, 4.8, 3.1);
      pane.translate(wall.x + wall.outX * 0.17, 3.45, z);
      parts.push(helpers.withColor(pane, new THREE.Color(0x414b4d)));
      for (const side of [-1, 1]) {
        const jamb = new THREE.BoxGeometry(0.25, 5.05, 0.28);
        jamb.translate(wall.x + wall.outX * 0.25, 3.42, z + side * 1.68);
        parts.push(helpers.withColor(jamb, stone));
      }
      const header = new THREE.BoxGeometry(0.25, 0.34, 3.48);
      header.translate(wall.x + wall.outX * 0.25, 5.94, z);
      parts.push(helpers.withColor(header, stone));
    }
    // The long, symmetrical mall elevation has window bays on either side of
    // the six-column temple front. Anchor these to the stepped OSM wall.
    const darkGlass = new THREE.Color(0x46545a);
    stripWindows(ctx, parts, 'west', [0.035, 0.275], [1.9, 6.3], 4, stone, darkGlass);
    stripWindows(ctx, parts, 'west', [0.725, 0.965], [1.9, 6.3], 4, stone, darkGlass);
    stripWindows(ctx, parts, 'east', [0.09, 0.91], [1.9, 6.3], 11, stone, darkGlass);
    // Thin white stringcourse below the cornice gives the brick side wings
    // the same classical horizontal rhythm as the central pediment.
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], z = pts[(i + 1) % pts.length];
      const dx = z.x - a.x, dn = z.y - a.y;
      const length = Math.hypot(dx, dn);
      if (length < 2 || dn / length > -0.85) continue;
      const band = new THREE.BoxGeometry(length, 0.23, 0.24);
      band.rotateY(Math.atan2(dn, dx));
      band.translate((a.x + z.x) / 2 + dn / length * 0.12, 9.1,
        -(a.y + z.y) / 2 + dx / length * 0.12);
      parts.push(helpers.withColor(band, stone));
    }
    return parts;
  },
};
