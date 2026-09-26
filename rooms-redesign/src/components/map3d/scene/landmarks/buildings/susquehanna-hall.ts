// UMD Facilities building photo: https://facilities.umd.edu/node/416 . A
// compact four-story brick hall; two roof forms appear in the campus aerial.
import * as THREE from 'three';
import type { LandmarkModule } from '../types';
import { color, stripWindows } from './historic-central-parts';

export const landmark: LandmarkModule = {
  id: 'way/23937386',
  spec: { name: 'Susquehanna Hall', color: 0x9b7165, height: 15.4, roof: 'parapet' },
  maxHeight: 18.6,
  build(ctx) {
    const { pts, baseHeight, helpers } = ctx;
    const b = helpers.bboxOf(pts);
    const x = (f: number) => b.minX + f * (b.maxX - b.minX);
    const n = (f: number) => b.minY + f * (b.maxY - b.minY);
    const rect = (a: number, c: number, d: number, e: number) => [
      new THREE.Vector2(x(a), n(d)), new THREE.Vector2(x(c), n(d)),
      new THREE.Vector2(x(c), n(e)), new THREE.Vector2(x(a), n(e)),
    ];
    const brick = new THREE.Color(0x9b7165);
    const trim = new THREE.Color(0xd3c9b9);
    const roof = new THREE.Color(0xb9b9b1);
    const dark = new THREE.Color(0x5d6362);
    const parts = [
      helpers.withColor(helpers.extrudeFootprint(pts, baseHeight - 0.4), brick),
      helpers.withColor(helpers.extrudeFootprint(pts, 0.4).translate(0, baseHeight - 0.4, 0), trim),
      helpers.withColor(helpers.extrudeFootprint(helpers.scaleAbout(pts, (b.minX + b.maxX) / 2, (b.minY + b.maxY) / 2, 0.95), 0.13).translate(0, baseHeight, 0), roof),
    ];
    for (const [a, c, d, e] of [[0.23, 0.58, 0.56, 0.78], [0.17, 0.42, 0.17, 0.36]]) {
      parts.push(helpers.withColor(helpers.extrudeFootprint(rect(a, c, d, e), 2.25).translate(0, baseHeight, 0), dark));
    }
    stripWindows(ctx, parts, 'south', [0.08, 0.91], [1.8, 5.3, 8.8, 12.3], 5,
      color(0xd3c9b9), color(0x677a7f));
    stripWindows(ctx, parts, 'east', [0.08, 0.91], [1.8, 5.3, 8.8, 12.3], 5,
      color(0xd3c9b9), color(0x677a7f));
    return parts;
  },
};
