// UMD: https://facilities.umd.edu/node/369 ; courtyard and south green wall:
// https://today.umd.edu/a-peek-inside-ecological-engineer-dave-tilleys-office
import * as THREE from 'three';
import type { LandmarkModule } from '../types';
import { color, stripWindows } from './historic-central-parts';

export const landmark: LandmarkModule = {
  id: 'relation/20447083',
  spec: { name: 'Animal Sciences/Agricultural Engineering Building', color: 0xb6aa93, height: 13.2, roof: 'parapet' },
  maxHeight: 17.2,
  build(ctx) {
    const { pts, holes, baseHeight, helpers } = ctx;
    const b = helpers.bboxOf(pts);
    const x = (f: number) => b.minX + f * (b.maxX - b.minX);
    const n = (f: number) => b.minY + f * (b.maxY - b.minY);
    const rect = (a: number, c: number, d: number, e: number) => [
      new THREE.Vector2(x(a), n(d)), new THREE.Vector2(x(c), n(d)),
      new THREE.Vector2(x(c), n(e)), new THREE.Vector2(x(a), n(e)),
    ];
    const stone = new THREE.Color(0xb6aa93);
    const cap = new THREE.Color(0xd7d4c7);
    const roof = new THREE.Color(0x837f77);
    const green = new THREE.Color(0x65745c);
    const parts = [
      helpers.withColor(holes.length ? helpers.extrudeWithHoles(pts, holes, baseHeight) : helpers.extrudeFootprint(pts, baseHeight), stone),
      helpers.withColor((holes.length ? helpers.extrudeWithHoles(pts, holes, 0.5) : helpers.extrudeFootprint(pts, 0.5)).translate(0, baseHeight, 0), cap),
    ];
    // Roof service enclosure on the east wing, with a dark recessed top.
    parts.push(helpers.withColor(helpers.extrudeFootprint(rect(0.8, 0.92, 0.42, 0.61), 3.3).translate(0, baseHeight, 0), stone));
    parts.push(helpers.withColor(helpers.extrudeFootprint(rect(0.81, 0.91, 0.44, 0.59), 0.18).translate(0, baseHeight + 3.3, 0), roof));
    // The south facade has a documented planted wall; it is modeled as a
    // restrained green strip rather than a photographic texture.
    const wall = new THREE.BoxGeometry(x(0.65) - x(0.28), 5.5, 0.2);
    wall.translate((x(0.28) + x(0.65)) / 2, 5.1, -n(0.035));
    parts.push(helpers.withColor(wall, green));
    // The long laboratory elevations have a restrained, repeated window
    // rhythm; the mapped inner ring remains completely open to the sky.
    stripWindows(ctx, parts, 'north', [0.1, 0.9], [2.4, 6.3, 10.2], 12,
      color(0xc9c6b9), color(0x687d7d));
    stripWindows(ctx, parts, 'east', [0.12, 0.88], [2.4, 6.3, 10.2], 11,
      color(0xc9c6b9), color(0x687d7d));
    return parts;
  },
};
