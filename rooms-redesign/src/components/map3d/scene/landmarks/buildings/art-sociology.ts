// UMD Facilities: https://facilities.umd.edu/node/373 ; Art studios:
// https://art.umd.edu/facilities-tour . Roof zones follow the campus aerial.
import * as THREE from 'three';
import type { LandmarkModule } from '../types';
import { color, stripWindows } from './historic-central-parts';

export const landmark: LandmarkModule = {
  id: 'way/23543523',
  spec: { name: 'Parren J. Mitchell Art-Sociology Building', color: 0x8b756b, height: 16.2, roof: 'parapet' },
  maxHeight: 19.4,
  build(ctx) {
    const { pts, baseHeight, helpers } = ctx;
    const b = helpers.bboxOf(pts);
    const x = (f: number) => b.minX + f * (b.maxX - b.minX);
    const n = (f: number) => b.minY + f * (b.maxY - b.minY);
    const rect = (a: number, c: number, d: number, e: number) => [
      new THREE.Vector2(x(a), n(d)), new THREE.Vector2(x(c), n(d)),
      new THREE.Vector2(x(c), n(e)), new THREE.Vector2(x(a), n(e)),
    ];
    const brick = new THREE.Color(0x8b756b);
    const limestone = new THREE.Color(0xcdc6b9);
    const roof = new THREE.Color(0xd3d1ca);
    const dark = new THREE.Color(0x555c5e);
    const parts = [helpers.withColor(helpers.extrudeFootprint(pts, baseHeight), brick)];
    // The stepped art studios on the east read as a pale roofed, taller bar.
    parts.push(helpers.withColor(helpers.extrudeFootprint(rect(0.76, 0.96, 0.18, 0.83), 1.6).translate(0, baseHeight - 0.1, 0), limestone));
    parts.push(helpers.withColor(helpers.extrudeFootprint(rect(0.78, 0.94, 0.2, 0.81), 0.16).translate(0, baseHeight + 1.5, 0), roof));
    // The longer west wing remains visually lower than the studio end.
    parts.push(helpers.withColor(helpers.extrudeFootprint(rect(0.05, 0.52, 0.11, 0.45), 0.18).translate(0, baseHeight + 0.02, 0), roof));
    // Light-filled studios are represented by glazing on the tall east face,
    // not invented rooftop equipment.
    const glass = new THREE.BoxGeometry(0.16, 8.0, n(0.69) - n(0.29));
    glass.translate(x(0.955), 9.5, -(n(0.29) + n(0.69)) / 2);
    parts.push(helpers.withColor(glass, dark));
    stripWindows(ctx, parts, 'south', [0.08, 0.66], [3.0, 7.5, 12.0], 8,
      color(0xb9afa2), color(0x59696d));
    return parts;
  },
};
