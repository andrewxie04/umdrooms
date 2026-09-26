// UMD Facilities building photo: https://facilities.umd.edu/node/338 . Low
// community-center mass; the broad flat roof follows the mapped outline.
import * as THREE from 'three';
import type { LandmarkModule } from '../types';
import { color, stripWindows } from './historic-central-parts';

export const landmark: LandmarkModule = {
  id: 'way/23547135',
  spec: { name: 'Cambridge Community Center', color: 0xa99b8a, height: 8.8, roof: 'parapet' },
  maxHeight: 12.5,
  build(ctx) {
    const { pts, baseHeight, helpers } = ctx;
    const b = helpers.bboxOf(pts);
    const x = (f: number) => b.minX + f * (b.maxX - b.minX);
    const n = (f: number) => b.minY + f * (b.maxY - b.minY);
    const rect = (a: number, c: number, d: number, e: number) => [
      new THREE.Vector2(x(a), n(d)), new THREE.Vector2(x(c), n(d)),
      new THREE.Vector2(x(c), n(e)), new THREE.Vector2(x(a), n(e)),
    ];
    const stone = new THREE.Color(0xa99b8a);
    const edge = new THREE.Color(0xd2cec4);
    const roof = new THREE.Color(0x999b98);
    const glass = new THREE.Color(0x596a6e);
    const parts = [
      helpers.withColor(helpers.extrudeFootprint(pts, baseHeight), stone),
      helpers.withColor(helpers.extrudeFootprint(helpers.scaleAbout(pts, (b.minX + b.maxX) / 2, (b.minY + b.maxY) / 2, 0.96), 0.13).translate(0, baseHeight + 0.03, 0), roof),
      helpers.withColor(helpers.extrudeFootprint(rect(0.45, 0.61, 0.49, 0.73), 2.4).translate(0, baseHeight, 0), edge),
      helpers.withColor(helpers.extrudeFootprint(rect(0.47, 0.59, 0.51, 0.71), 0.14).translate(0, baseHeight + 2.4, 0), roof),
    ];
    const entry = new THREE.BoxGeometry(x(0.64) - x(0.35), 4.6, 0.26);
    entry.translate((x(0.35) + x(0.64)) / 2, 3.6, -n(0.1));
    parts.push(helpers.withColor(entry, glass));
    stripWindows(ctx, parts, 'north', [0.09, 0.91], [2.4, 5.6], 9,
      color(0xd2cec4), color(0x596a6e));
    return parts;
  },
};
