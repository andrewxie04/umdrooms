import * as THREE from 'three';
import type { LandmarkBuildContext, LandmarkModule } from '../types';
import { box, brickShell, color, hip, portico, stripWindows, type Parts } from './historic-central-parts';

function addAnneArundelHall(ctx: LandmarkBuildContext): Parts {
  const parts: Parts = [];
  const brick = color(0x92543f);
  const white = color(0xe6e3d9);
  const slate = color(0x737b80);
  const glass = color(0x4b5f67);
  const b = ctx.helpers.bboxOf(ctx.pts);
  const centerNorth = (b.minY + b.maxY) / 2;

  brickShell(ctx, parts, 10.7, brick, white, slate);
  hip(ctx, parts, [0.01, 0.99, 0.01, 0.99], 10.82, 2.55, slate);

  // The east-facing white entrance and its pediment interrupt the long brick
  // elevation; its position follows the small central OSM projection.
  portico(ctx, parts, {
    side: 'east', center: 0.5, width: 11.4, depth: 2.8,
    columns: 4, baseY: 0.60, columnHeight: 7.8, pediment: 1.45,
  }, white, glass);
  for (let step = 0; step < 3; step++) {
    box(ctx, parts, b.maxX + 2.1 + step * 0.55, b.maxX + 2.85 + step * 0.55,
      centerNorth - 6.25, centerNorth + 6.25, 0, 0.52 - step * 0.13, white);
  }

  stripWindows(ctx, parts, 'east', [0.04, 0.36], [1.05, 4.15, 7.25], 3, white, glass);
  stripWindows(ctx, parts, 'east', [0.64, 0.96], [1.05, 4.15, 7.25], 3, white, glass);
  stripWindows(ctx, parts, 'west', [0.08, 0.92], [1.05, 4.15, 7.25], 7, white, glass);

  // Small white dormers punctuate both slate roof slopes.
  for (const side of [-1, 1]) {
    const x = side < 0 ? b.minX + 1.0 : b.maxX - 1.0;
    for (const fraction of [0.17, 0.31, 0.69, 0.83]) {
      const north = b.minY + (b.maxY - b.minY) * fraction;
      box(ctx, parts, x - 0.75, x + 0.75, north - 0.96, north + 0.96,
        10.95, 12.50, white);
      box(ctx, parts, x + side * 0.77 - 0.07, x + side * 0.77 + 0.07,
        north - 0.52, north + 0.52, 11.22, 12.23, glass);
      box(ctx, parts, x - 0.95, x + 0.95, north - 1.12, north + 1.12,
        12.50, 12.70, slate);
    }
  }

  // Anne Arundel's square white tower rises above an open lantern and dark
  // dome. The cupola is also documented as a student lounge.
  const towerX = ctx.cx;
  const towerN = centerNorth;
  box(ctx, parts, towerX - 2.6, towerX + 2.6, towerN - 2.6, towerN + 2.6,
    12.85, 17.45, white);
  for (const side of [-1, 1]) {
    box(ctx, parts, towerX + side * 2.62 - 0.07, towerX + side * 2.62 + 0.07,
      towerN - 0.85, towerN - 0.30, 14.25, 16.55, glass);
    box(ctx, parts, towerX + side * 2.62 - 0.07, towerX + side * 2.62 + 0.07,
      towerN + 0.30, towerN + 0.85, 14.25, 16.55, glass);
  }
  box(ctx, parts, towerX - 3.0, towerX + 3.0, towerN - 3.0, towerN + 3.0,
    17.45, 17.82, white);
  box(ctx, parts, towerX - 2.35, towerX + 2.35, towerN - 2.35, towerN + 2.35,
    17.82, 20.42, glass);
  for (const xSide of [-1, 1]) {
    for (const nSide of [-1, 1]) {
      box(ctx, parts, towerX + xSide * 2.18 - 0.27, towerX + xSide * 2.18 + 0.27,
        towerN + nSide * 2.18 - 0.27, towerN + nSide * 2.18 + 0.27,
        17.82, 20.43, white);
    }
  }
  box(ctx, parts, towerX - 2.65, towerX + 2.65, towerN - 2.65, towerN + 2.65,
    20.42, 20.74, white);
  const dome = new THREE.SphereGeometry(2.35, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  dome.translate(towerX, 20.74, -towerN);
  parts.push(ctx.helpers.withColor(dome, color(0x383b3c)));
  const finial = new THREE.CylinderGeometry(0.065, 0.12, 0.85, 7);
  finial.translate(towerX, 23.48, -towerN);
  parts.push(ctx.helpers.withColor(finial, color(0x333739)));
  return parts;
}

export const landmark: LandmarkModule = {
  id: 'way/23543512',
  spec: { name: 'Anne Arundel Hall', color: 0x92543f, height: 11, roof: 'hipped' },
  maxHeight: 24,
  build: addAnneArundelHall,
};
