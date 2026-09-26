// UMD's department photo shows the Regents Drive entrance: four white
// full-height columns, a broad triangular pediment, three rows of white sash
// windows, and a dark pitched roof above the long red-brick mass.
// https://www.geol.umd.edu/department/
// https://www.geol.umd.edu/images/GeologyBuilding.jpg
// https://www.geol.umd.edu/department/location.php
import * as THREE from 'three';
import type { LandmarkModule } from '../types';
import { box, color, stripWindows, type Parts } from './historic-central-parts';

export const landmark: LandmarkModule = {
  id: 'way/23887405',
  spec: { name: 'Geology Building', color: 0x995c4c, accent: 0xe9e5dc, height: 13.2, roof: 'hipped' },
  maxHeight: 13.5,
  build(ctx) {
    const { pts, helpers } = ctx;
    const bounds = helpers.bboxOf(pts);
    const centerN = (bounds.minY + bounds.maxY) / 2;
    const eastWall = bounds.maxX;
    const brick = color(0x995c4c);
    const limestone = color(0xe9e5dc);
    const sill = color(0xc5c4bc);
    const roof = color(0x596168);
    const glass = color(0x43535a);
    const parts: Parts = [];

    // The three registers meet edge-to-edge so their broad horizontal faces
    // cannot flicker against each other as the camera zooms.
    parts.push(helpers.withColor(helpers.extrudeFootprint(pts, 0.55), sill));
    parts.push(helpers.withColor(
      helpers.extrudeFootprint(pts, 9.9).translate(0, 0.55, 0), brick,
    ));
    parts.push(helpers.withColor(
      helpers.extrudeFootprint(helpers.outsetRing(pts, 0.12), 0.34)
        .translate(0, 10.45, 0), limestone,
    ));
    parts.push(helpers.withColor(helpers.buildHippedRoof(pts, 10.79, 2.16), roof));

    // The photo's temple front faces Regents Drive on the east. Keep the
    // pediment anchored to the mapped central protrusion instead of a
    // bounding-box-wide floating facade.
    const frontN0 = centerN - 8.3;
    const frontN1 = centerN + 8.3;
    const columnX = eastWall + 2.0;
    box(ctx, parts, eastWall - 0.15, columnX + 0.56,
      frontN0 - 0.35, frontN1 + 0.35, 0.35, 0.73, limestone);
    for (let i = 0; i < 4; i++) {
      const north = frontN0 + 1.05 + i * (14.5 / 3);
      const column = new THREE.CylinderGeometry(0.39, 0.47, 9.44, 12);
      column.translate(columnX, 0.74 + 9.44 / 2, -north);
      parts.push(helpers.withColor(column, limestone));
      box(ctx, parts, columnX - 0.57, columnX + 0.57,
        north - 0.57, north + 0.57, 9.96, 10.28, limestone);
    }
    box(ctx, parts, eastWall - 0.18, columnX + 0.75,
      frontN0 - 0.45, frontN1 + 0.45, 10.18, 10.95, limestone);
    box(ctx, parts, eastWall - 0.18, columnX + 0.8,
      frontN0 - 0.65, frontN1 + 0.65, 10.95, 11.16, sill);
    const pedimentProfile = new THREE.Shape([
      new THREE.Vector2(-8.95, 0),
      new THREE.Vector2(8.95, 0),
      new THREE.Vector2(0, 1.88),
    ]);
    const pediment = new THREE.ExtrudeGeometry(pedimentProfile, {
      depth: columnX - eastWall + 1.1,
      bevelEnabled: false,
    });
    pediment.rotateY(Math.PI / 2);
    pediment.translate(eastWall - 0.18, 11.16, -centerN);
    parts.push(helpers.withColor(pediment, limestone));

    // Pale double doors and the arched transom sit on the actual front wall;
    // the columns and steps project from it, as in the department photo.
    box(ctx, parts, eastWall + 0.04, eastWall + 0.19,
      centerN - 1.63, centerN + 1.63, 0.78, 4.2, limestone);
    box(ctx, parts, eastWall + 0.19, eastWall + 0.25,
      centerN - 1.34, centerN + 1.34, 1.05, 3.9, glass);
    box(ctx, parts, eastWall + 0.27, eastWall + 0.34,
      centerN - 0.055, centerN + 0.055, 1.02, 3.9, limestone);
    box(ctx, parts, eastWall + 0.12, eastWall + 0.37,
      centerN - 1.8, centerN + 1.8, 4.1, 4.35, limestone);
    for (let i = 0; i < 3; i++) {
      box(ctx, parts, eastWall + 0.4 + i * 0.42, eastWall + 0.83 + i * 0.42,
        centerN - 2.3 - i * 0.25, centerN + 2.3 + i * 0.25,
        0, 0.46 - i * 0.14, sill);
    }

    // Window strips follow real OSM edges, including the shallow setbacks at
    // both ends, and stop short of the temple entrance at ground level.
    stripWindows(ctx, parts, 'east', [0.09, 0.28], [1.25, 4.44, 7.55], 2, limestone, glass);
    stripWindows(ctx, parts, 'east', [0.34, 0.66], [4.44, 7.55], 3, limestone, glass);
    stripWindows(ctx, parts, 'east', [0.72, 0.91], [1.25, 4.44, 7.55], 2, limestone, glass);
    stripWindows(ctx, parts, 'west', [0.09, 0.91], [1.25, 4.44, 7.55], 9, limestone, glass);
    stripWindows(ctx, parts, 'north', [0.20, 0.80], [1.25, 4.44, 7.55], 2, limestone, glass);
    stripWindows(ctx, parts, 'south', [0.20, 0.80], [1.25, 4.44, 7.55], 2, limestone, glass);
    return parts;
  },
};
