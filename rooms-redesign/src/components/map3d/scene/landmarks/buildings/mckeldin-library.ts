// McKeldin Library (way/23408799) — UMD's flagship 1958 library at the WEST
// end of McKeldin Mall (Wikipedia: "Located at the western end of McKeldin
// Mall"), so the grand entrance faces EAST onto the mall. Stripped-classical
// limestone mass; the item brief asks for the full Georgian/Colonial-Revival
// reading: monumental columned portico + triangular pediment + ceremonial
// steps on the mall side.
//
// STRUCTURE (all sub-masses derived from the real OSM footprint via bboxOf):
//   1. Main mass: full-footprint extrusion to 0.8 * baseHeight (walls) +
//      buildHippedRoof to the tagged total height (preset-like 'hipped').
//   2. Portico on the EAST (mall) face, centered on the footprint's small
//      east entrance protrusion:
//      - 3 broad step tiers cascading toward the mall (extruded rect rings)
//      - 8 tapered limestone columns (~0.5-0.6m dia) at full facade height
//      - entablature beam spanning the column row
//      - triangular pediment cap (custom non-indexed triangles)
import * as THREE from 'three';
import type { LandmarkModule } from '../types';

export const landmark: LandmarkModule = {
  id: 'way/23408799',
  spec: {
    name: 'McKeldin Library',
    color: 0xece7d8, // light limestone
    roof: 'hipped',
    accent: 0xf5f1e4, // column / trim limestone (slightly brighter)
    nightGlow: 0.55, // 24/5 flagship library — warmly lit at night
  },
  maxHeight: 24.5, // roof ridge 23.1, pediment apex 23.4
  build(ctx) {
    const { pts, cy, baseHeight, spec, helpers } = ctx;
    const glow = spec.nightGlow;
    const base = helpers.withGlow(spec.color, glow);
    const accent = spec.accent != null ? helpers.withGlow(spec.accent, glow) : base;
    const roofC = helpers.darkerShade(base, -0.075);
    const stepC = helpers.darkerShade(base, -0.03);

    // --- main mass: walls + hipped roof (mirrors the 'hipped' preset) ------
    const wallH = baseHeight * 0.8;
    const parts: THREE.BufferGeometry[] = [
      helpers.withColor(helpers.extrudeFootprint(pts, wallH), base),
      helpers.withColor(
        helpers.buildHippedRoof(pts, wallH, Math.max(2.5, baseHeight - wallH)),
        roofC,
      ),
    ];

    // --- portico geometry, derived from the footprint bbox -----------------
    const bb = helpers.bboxOf(pts);
    // The east (mall) side has a shallow entrance protrusion ~7m deep; the
    // main east facade sits just west of bbox maxX.
    const faceX = bb.maxX - 7.3;
    const portCy = cy + 0.5; // centered on the entrance protrusion
    const halfW = 13; // portico spans 26m along the facade
    const yS = portCy - halfW;
    const yN = portCy + halfW;

    const rectRing = (x0: number, x1: number, y0: number, y1: number): THREE.Vector2[] => [
      new THREE.Vector2(x0, y0),
      new THREE.Vector2(x1, y0),
      new THREE.Vector2(x1, y1),
      new THREE.Vector2(x0, y1),
    ];

    // Ceremonial steps: 3 tiers, each taller tier pulled back toward the
    // facade so the treads cascade down toward the mall.
    const tiers: Array<{ x1: number; h: number }> = [
      { x1: faceX + 12.8, h: 0.35 },
      { x1: faceX + 12.2, h: 0.7 },
      { x1: faceX + 11.6, h: 1.05 },
    ];
    for (const t of tiers) {
      parts.push(
        helpers.withColor(
          helpers.extrudeFootprint(rectRing(faceX, t.x1, yS, yN), t.h),
          stepC,
        ),
      );
    }

    // Column row: 8 slightly tapered columns at (near) full facade height,
    // standing on the top step tier just inside the platform edge. ~1m dia so
    // the colonnade still reads at campus zoom.
    const colX = faceX + 10.2;
    const colTop = 17.6;
    const colH = colTop - 1.05;
    const nCols = 8;
    for (let i = 0; i < nCols; i++) {
      const t = i / (nCols - 1);
      const colY = portCy - 10.5 + t * 21;
      const col = new THREE.CylinderGeometry(0.42, 0.5, colH, 10);
      col.translate(colX, 1.05 + colH / 2, -colY); // world: z = -north
      parts.push(helpers.withColor(col, accent));
    }

    // Entablature beam across the column tops.
    const entH = 1.7;
    const ent = helpers.extrudeFootprint(
      rectRing(faceX + 0.4, faceX + 11.6, yS, yN),
      entH,
    );
    ent.translate(0, colTop, 0);
    parts.push(helpers.withColor(ent, base));

    // Triangular pediment: gable prism over the entablature, apex centered.
    // Apex rises just past the main roof ridge so the temple front stays
    // silhouetted from the mall.
    const pedZ0 = colTop + entH; // 19.3
    const pedZ1 = 23.4;
    const pedX0 = faceX + 0.4;
    const pedX1 = faceX + 11.6;
    const positions: number[] = [];
    type V3 = [number, number, number];
    const pushTri = (a: V3, b: V3, c: V3, n: V3): void => {
      const ux = b[0] - a[0];
      const uy = b[1] - a[1];
      const uz = b[2] - a[2];
      const vx = c[0] - a[0];
      const vy = c[1] - a[1];
      const vz = c[2] - a[2];
      const nx = uy * vz - uz * vy;
      const ny = uz * vx - ux * vz;
      const nz = ux * vy - uy * vx;
      if (nx * n[0] + ny * n[1] + nz * n[2] < 0) {
        positions.push(a[0], a[1], a[2], c[0], c[1], c[2], b[0], b[1], b[2]);
      } else {
        positions.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
      }
    };
    // front + back gable triangles
    pushTri([pedX1, yS, pedZ0], [pedX1, yN, pedZ0], [pedX1, portCy, pedZ1], [1, 0, 0]);
    pushTri([pedX0, yS, pedZ0], [pedX0, yN, pedZ0], [pedX0, portCy, pedZ1], [-1, 0, 0]);
    // south slope (toward -north) and north slope
    const sSlope: V3 = [0, -0.9, 0.5];
    const nSlope: V3 = [0, 0.9, 0.5];
    pushTri([pedX0, yS, pedZ0], [pedX1, yS, pedZ0], [pedX1, portCy, pedZ1], sSlope);
    pushTri([pedX0, yS, pedZ0], [pedX1, portCy, pedZ1], [pedX0, portCy, pedZ1], sSlope);
    pushTri([pedX0, yN, pedZ0], [pedX1, yN, pedZ0], [pedX1, portCy, pedZ1], nSlope);
    pushTri([pedX0, yN, pedZ0], [pedX1, portCy, pedZ1], [pedX0, portCy, pedZ1], nSlope);
    // underside (hidden against the entablature, kept for a closed solid)
    const down: V3 = [0, 0, -1];
    pushTri([pedX0, yS, pedZ0], [pedX1, yS, pedZ0], [pedX1, yN, pedZ0], down);
    pushTri([pedX0, yS, pedZ0], [pedX1, yN, pedZ0], [pedX0, yN, pedZ0], down);

    const ped = new THREE.BufferGeometry();
    ped.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    ped.rotateX(-Math.PI / 2); // shape space (x, north, up) -> world (x, up, -north)
    ped.computeVertexNormals(); // non-indexed -> flat per-face normals
    parts.push(helpers.withColor(ped, base));

    return parts;
  },
};
