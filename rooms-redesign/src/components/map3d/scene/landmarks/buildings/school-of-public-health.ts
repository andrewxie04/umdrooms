// UMD Facilities photo: https://facilities.umd.edu/node/435 . The 1973
// academic/athletic range has distinct roof zones in the campus aerial.
import * as THREE from 'three';
import type { LandmarkModule } from '../types';
import { color, facadePointAt, stripWindows } from './historic-central-parts';

export const landmark: LandmarkModule = {
  id: 'way/23545670',
  spec: { name: 'School of Public Health Building', color: 0x8a6d62, height: 17.5, roof: 'parapet' },
  maxHeight: 22.4,
  build(ctx) {
    const { pts, baseHeight, helpers } = ctx;
    const b = helpers.bboxOf(pts);
    const x = (f: number) => b.minX + f * (b.maxX - b.minX);
    const n = (f: number) => b.minY + f * (b.maxY - b.minY);
    const rect = (a: number, c: number, d: number, e: number) => [
      new THREE.Vector2(x(a), n(d)), new THREE.Vector2(x(c), n(d)),
      new THREE.Vector2(x(c), n(e)), new THREE.Vector2(x(a), n(e)),
    ];
    const brick = new THREE.Color(0x8a6d62);
    const pale = new THREE.Color(0xd7d6d0);
    const dark = new THREE.Color(0x464d50);
    const glass = new THREE.Color(0x607983);
    const parts = [helpers.withColor(helpers.extrudeFootprint(pts, baseHeight), brick)];
    // Dark western gym/large-span roof, articulated middle roof, and the
    // light roof of the east block are visible in the aerial reference.
    parts.push(helpers.withColor(helpers.extrudeFootprint(rect(0.08, 0.36, 0.3, 0.77), 0.19).translate(0, baseHeight + 0.04, 0), dark));
    parts.push(helpers.withColor(helpers.extrudeFootprint(rect(0.41, 0.65, 0.3, 0.75), 0.18).translate(0, baseHeight + 0.04, 0), pale));
    parts.push(helpers.withColor(helpers.extrudeFootprint(rect(0.71, 0.93, 0.31, 0.76), 0.18).translate(0, baseHeight + 0.04, 0), pale));
    for (const f of [0.12, 0.2, 0.28]) {
      parts.push(helpers.withColor(helpers.extrudeFootprint(rect(f, f + 0.02, 0.33, 0.74), 0.17).translate(0, baseHeight + 0.23, 0), pale));
    }
    parts.push(helpers.withColor(helpers.extrudeFootprint(rect(0.47, 0.59, 0.48, 0.64), 2.9).translate(0, baseHeight, 0), dark));
    const entryCenter = (x(0.04) + x(0.11)) / 2;
    const entryWall = facadePointAt(ctx, 'south', entryCenter)!;
    const entry = new THREE.BoxGeometry(x(0.11) - x(0.04), 6, 0.22);
    entry.rotateY(Math.atan2(entryWall.tn, entryWall.tx));
    entry.translate(entryWall.x + entryWall.outX * 0.15, 5,
      -(entryWall.north + entryWall.outN * 0.15));
    parts.push(helpers.withColor(entry, glass));
    stripWindows(ctx, parts, 'south', [0.41, 0.91], [2.6, 6.4, 10.2, 14.0], 10,
      color(0xc2bbb0), color(0x607983));
    stripWindows(ctx, parts, 'north', [0.39, 0.91], [2.6, 6.4, 10.2, 14.0], 10,
      color(0xc2bbb0), color(0x607983));
    return parts;
  },
};
