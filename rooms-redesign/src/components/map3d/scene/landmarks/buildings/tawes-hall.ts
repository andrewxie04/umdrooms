// UMD Facilities: https://facilities.umd.edu/node/368 ; history/photo:
// https://today.umd.edu/whatever-happened-to-tawes-theatre . Former theatre
// mass and academic wing retain their distinct roof silhouettes.
import * as THREE from 'three';
import type { LandmarkModule } from '../types';
import { color, stripWindows } from './historic-central-parts';

export const landmark: LandmarkModule = {
  id: 'way/23543131',
  spec: { name: 'Tawes Hall', color: 0x986d60, height: 13.5 },
  maxHeight: 20.4,
  build(ctx) {
    const { pts, baseHeight, helpers } = ctx;
    const b = helpers.bboxOf(pts);
    const x = (f: number) => b.minX + f * (b.maxX - b.minX);
    const n = (f: number) => b.minY + f * (b.maxY - b.minY);
    const rect = (a: number, c: number, d: number, e: number) => [
      new THREE.Vector2(x(a), n(d)), new THREE.Vector2(x(c), n(d)),
      new THREE.Vector2(x(c), n(e)), new THREE.Vector2(x(a), n(e)),
    ];
    const brick = new THREE.Color(0x986d60);
    const dark = new THREE.Color(0x54585a);
    const pale = new THREE.Color(0xbfc1bc);
    const parts = [helpers.withColor(helpers.extrudeFootprint(pts, baseHeight), brick)];
    // Large stage/lecture roof is lower and unadorned; the eastern spine
    // carries distinct light hipped end pavilions visible above the flat bar.
    parts.push(helpers.withColor(helpers.extrudeFootprint(rect(0.07, 0.52, 0.36, 0.71), 0.22).translate(0, baseHeight + 0.02, 0), dark));
    for (const [d, e] of [[0.06, 0.21], [0.72, 0.94]]) {
      const ring = rect(0.76, 0.94, d, e);
      parts.push(helpers.withColor(helpers.extrudeFootprint(ring, 2.4).translate(0, baseHeight - 0.1, 0), brick));
      parts.push(helpers.withColor(helpers.buildHippedRoof(ring, baseHeight + 2.3, 2.1), pale));
    }
    const middle = rect(0.77, 0.93, 0.27, 0.67);
    parts.push(helpers.withColor(helpers.extrudeFootprint(middle, 0.18).translate(0, baseHeight + 0.02, 0), dark));
    stripWindows(ctx, parts, 'east', [0.12, 0.89], [2.2, 5.7, 9.2], 9,
      color(0xbfc1bc), color(0x64777b));
    return parts;
  },
};
