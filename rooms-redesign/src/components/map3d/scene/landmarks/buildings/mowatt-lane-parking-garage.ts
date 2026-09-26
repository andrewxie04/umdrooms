// Mowatt Lane Parking Garage (UMD 404, OSM way/23579407).
// UMD's exterior photo shows five open parking levels in a pale concrete
// frame, tall brick infill piers, and glazed corner stair towers.
// https://facilities.umd.edu/node/524
// https://facilities.umd.edu/sites/default/files/UMDBuildings/404.jpg
// UMD confirms that the top deck is used for visitor parking:
// https://arch.umd.edu/visit-us
import * as THREE from 'three';
import type { LandmarkModule } from '../types';

export const landmark: LandmarkModule = {
  id: 'way/23579407',
  spec: {
    name: 'Mowatt Lane Parking Garage',
    color: 0xb7b4aa,
    height: 16.5,
    roof: 'parapet',
  },
  maxHeight: 19.25,
  build({ pts, helpers }) {
    const b = helpers.bboxOf(pts);
    const parts: THREE.BufferGeometry[] = [];
    const concrete = new THREE.Color(0xc7c6bf);
    const slabColor = new THREE.Color(0x8e9290);
    const brick = new THREE.Color(0x835443);
    const brickDark = new THREE.Color(0x72493c);
    const glass = new THREE.Color(0x526c74);
    const metal = new THREE.Color(0x515858);
    const opening = new THREE.Color(0x4a5050);
    const marking = new THREE.Color(0xe2e2d8);
    const levels = [0.12, 3.20, 6.28, 9.36, 12.44, 15.52];
    const add = (geometry: THREE.BufferGeometry, color: THREE.Color) => {
      parts.push(helpers.withColor(geometry, color));
    };
    const box = (
      x: number, y: number, north: number,
      width: number, height: number, depth: number,
      color: THREE.Color, angle = 0,
    ) => {
      if (width <= 0 || height <= 0 || depth <= 0) return;
      const geometry = new THREE.BoxGeometry(width, height, depth);
      geometry.rotateY(angle);
      geometry.translate(x, y, -north);
      add(geometry, color);
    };

    // Real open decks replace the generic solid block. The mapped L-shaped
    // outline is used for every slab, including the exposed rooftop deck.
    for (let i = 0; i < levels.length; i++) {
      const slab = helpers.extrudeFootprint(pts, 0.26);
      slab.translate(0, levels[i], 0);
      add(slab, slabColor);
    }

    // Pale concrete floor bands and piers follow each actual footprint edge.
    // Occasional continuous red-brick panels reproduce the photographed
    // facade's campus-style rhythm while leaving the other bays ventilated.
    for (let edge = 0; edge < pts.length; edge++) {
      const a = pts[edge];
      const z = pts[(edge + 1) % pts.length];
      const dx = z.x - a.x;
      const dn = z.y - a.y;
      const length = Math.hypot(dx, dn);
      if (length < 2) continue;
      const tx = dx / length;
      const tn = dn / length;
      const angle = Math.atan2(tn, tx);
      const outX = tn;
      const outN = -tx;
      const along = (distance: number, offset: number) => ({
        x: a.x + tx * distance + outX * offset,
        n: a.y + tn * distance + outN * offset,
      });
      const span = (from: number, to: number, y: number, height: number,
        depth: number, color: THREE.Color, offset = 0.22) => {
        const p = along((from + to) / 2, offset);
        box(p.x, y, p.n, to - from, height, depth, color, angle);
      };
      const bays = Math.max(1, Math.round(length / 4.15));
      const bayWidth = length / bays;
      for (let level = 0; level < levels.length - 1; level++) {
        span(0, length, levels[level] + 0.56, 0.52, 0.30, concrete);
        span(0, length, levels[level + 1] - 0.15, 0.22, 0.34, concrete);
      }
      span(0, length, 16.35, 1.35, 0.32, concrete);
      for (let bay = 0; bay <= bays; bay++) {
        const at = Math.min(length - 0.30, Math.max(0.30, bay * bayWidth));
        span(at - 0.29, at + 0.29, 7.90, 15.50, 0.56,
          bay % 4 === 0 ? brickDark : concrete);
      }
      if (length < 12) continue;
      for (let bay = 1; bay < bays; bay += 4) {
        const start = bay * bayWidth + 0.32;
        const end = Math.min(length - 0.34, (bay + 1) * bayWidth - 0.32);
        if (end - start < 1) continue;
        span(start, end, 7.90, 15.46, 0.29, brick);
      }
      for (let bay = 0; bay < bays; bay++) {
        if (bay % 4 === 1) continue;
        const start = bay * bayWidth + 0.45;
        const end = (bay + 1) * bayWidth - 0.45;
        if (end <= start) continue;
        for (let level = 1; level < levels.length - 1; level++) {
          const lower = levels[level] + 0.82;
          const upper = levels[level + 1] - 0.37;
          span(start, end, (lower + upper) / 2, upper - lower,
            0.06, opening, -0.65);
        }
      }
    }

    // Two square glazed stair cores project above the parking deck. Their
    // placement is approximate because public floor plans are restricted.
    const tower = (x: number, n: number, w: number) => {
      box(x, 9.42, n, w, 18.84, w, brick);
      for (const height of [2.0, 5.25, 8.5, 11.75, 15.0, 17.3]) {
        box(x, height, n - w / 2 - 0.065, w - 1.8, 1.18, 0.10, glass);
        box(x + w / 2 + 0.065, height, n, 0.10, 1.18, w - 1.8, glass);
      }
      for (const side of [-1, 1]) {
        box(x + side * (w / 2 - 0.34), 9.46, n - w / 2 - 0.11,
          0.38, 18.92, 0.24, concrete);
      }
      box(x, 19.02, n, w + 1.4, 0.46, w + 1.4, metal);
    };
    tower(b.minX + 3.35, b.maxY - 3.35, 7.0);
    tower(b.maxX - 3.35, b.maxY - 3.35, 7.0);

    // Rooftop lane and a few parking-space stripes make the upper surface
    // read as an outdoor deck at the map's normal overhead angle.
    const roofY = levels[levels.length - 1] + 0.30;
    for (const [startX, north] of [
      [b.minX + 20, b.maxY - 18],
      [b.minX + 48, b.maxY - 43],
    ]) {
      for (let x = startX; x < b.maxX - 16; x += 4.8) {
        box(x, roofY, north, 0.12, 0.045, 4.2, marking);
      }
      box((startX + b.maxX - 16) / 2, roofY, north + 5.2,
        b.maxX - 16 - startX, 0.045, 0.12, marking);
    }
    return parts;
  },
};
