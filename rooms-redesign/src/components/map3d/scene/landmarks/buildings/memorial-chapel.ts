// Memorial Chapel (way/23579314) — UMD's iconic 1952 Colonial chapel at the
// west end of McKeldin Mall. Custom build, structurally true to life:
//
//   1. BODY — full OSM footprint (cruciform-ish: long E-W nave, N/S transept
//      arms, chamfered west entrance block) extruded as the white wall mass.
//   2. ROOFS — real GABLES via custom triangles: main nave gable with its
//      ridge along the E-W axis, plus two smaller cross-gables over the
//      transept arms. Slate gray, darker than the white walls.
//   3. STEEPLE at the west end (facing the Mall): square tower box ->
//      octagonal belfry (8-seg cylinder) -> tall white cone spire. Apex ~27m.
//   4. PORTICO on the west face: 4 white column cylinders + entablature slab
//      + a small pediment gable (ridge E-W, triangle facing the Mall).
//
// All sub-masses are anchored to the real footprint via bboxOf fractions, so
// they track the OSM geometry. Shape-space custom triangles follow the
// presets.ts pattern: built z-up, rotateX(-PI/2), computeVertexNormals,
// withColor LAST. Raw three primitives are translated (x, y, -cy) — MINUS.
import * as THREE from 'three';
import type { LandmarkModule } from '../types';

/** Rectangle gable roof: two slopes + two closed gable ends. Built in shape
 * space (z up), rotateX(-PI/2) -> y-up world. `ridgeAxis 'x'` = ridge runs
 * east-west (gable ends face E/W); 'y' = ridge runs north-south. */
function buildGableRoof(
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
  baseY: number,
  rise: number,
  ridgeAxis: 'x' | 'y',
): THREE.BufferGeometry {
  const positions: number[] = [];
  /** Append a triangle; flip winding if its normal opposes the wanted dir. */
  const tri = (
    ax: number, ay: number, az: number,
    bx: number, by: number, bz: number,
    cx: number, cy: number, cz: number,
    dx: number, dy: number, dz: number,
  ): void => {
    const ux = bx - ax, uy = by - ay, uz = bz - az;
    const vx = cx - ax, vy = cy - ay, vz = cz - az;
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    if (nx * dx + ny * dy + nz * dz < 0) {
      positions.push(ax, ay, az, cx, cy, cz, bx, by, bz);
    } else {
      positions.push(ax, ay, az, bx, by, bz, cx, cy, cz);
    }
  };
  const apex = baseY + rise;
  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;
  if (ridgeAxis === 'x') {
    // ridge from (minX,midY,apex) to (maxX,midY,apex); slopes face S(-y)/N(+y)
    tri(minX, minY, baseY, maxX, minY, baseY, maxX, midY, apex, 0, -1, 1);
    tri(minX, minY, baseY, maxX, midY, apex, minX, midY, apex, 0, -1, 1);
    tri(minX, maxY, baseY, maxX, midY, apex, maxX, maxY, baseY, 0, 1, 1);
    tri(minX, maxY, baseY, minX, midY, apex, maxX, midY, apex, 0, 1, 1);
    // gable ends face west(-x) / east(+x)
    tri(minX, minY, baseY, minX, midY, apex, minX, maxY, baseY, -1, 0, 0);
    tri(maxX, minY, baseY, maxX, maxY, baseY, maxX, midY, apex, 1, 0, 0);
  } else {
    // ridge from (midX,minY,apex) to (midX,maxY,apex); slopes face W/E
    tri(minX, minY, baseY, midX, maxY, apex, midX, minY, apex, -1, 0, 1);
    tri(minX, minY, baseY, minX, maxY, baseY, midX, maxY, apex, -1, 0, 1);
    tri(maxX, minY, baseY, midX, minY, apex, midX, maxY, apex, 1, 0, 1);
    tri(maxX, minY, baseY, midX, maxY, apex, maxX, maxY, baseY, 1, 0, 1);
    // gable ends face south(-y) / north(+y)
    tri(minX, minY, baseY, midX, minY, apex, maxX, minY, baseY, 0, -1, 0);
    tri(minX, maxY, baseY, maxX, maxY, baseY, midX, maxY, apex, 0, 1, 0);
  }
  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.rotateX(-Math.PI / 2);
  geom.computeVertexNormals(); // non-indexed -> flat per-face normals
  return geom;
}

export const landmark: LandmarkModule = {
  id: 'way/23579314',
  spec: {
    name: 'Memorial Chapel',
    color: 0xf5f2ea, // signature white (per item notes)
    roof: 'spire', // silhouette hint: tall spire — matches the custom build
    accent: 0x767c84, // slate-gray gable roofs
    nightGlow: 0.3, // the chapel is softly floodlit at night
  },
  maxHeight: 27.5, // steeple apex (tower 15 + belfry 3.8 + spire 8.4 = 27.2)
  build(ctx) {
    const { pts, baseHeight, spec, helpers } = ctx;
    const glow = spec.nightGlow;
    const wall = helpers.withGlow(spec.color, glow);
    const trim = helpers.withGlow(0xfcfbf7, glow); // bright white: steeple/portico
    const roofC = helpers.withGlow(spec.accent ?? 0x767c84, glow);

    const { minX, maxX, minY, maxY } = helpers.bboxOf(pts);
    const W = maxX - minX; // ~69.7m E-W
    const H = maxY - minY; // ~34.0m N-S
    const wallH = baseHeight * 0.745; // ~8.2m wall top, gables above

    const parts: THREE.BufferGeometry[] = [
      // 1. white wall mass over the full cruciform footprint
      helpers.withColor(helpers.extrudeFootprint(pts, wallH), wall),
      // 2a. main nave gable — ridge E-W over the long sanctuary body,
      // running west right up to the tower's east face
      helpers.withColor(
        buildGableRoof(minX + 0.17 * W, maxX, minY + 0.18 * H, minY + 0.81 * H, wallH, 5.5, 'x'),
        roofC,
      ),
      // 2b/2c. cross-gables over the north & south transept arms
      helpers.withColor(
        buildGableRoof(minX + 0.31 * W, minX + 0.565 * W, minY + 0.81 * H, maxY, wallH, 3.0, 'y'),
        roofC,
      ),
      helpers.withColor(
        buildGableRoof(minX + 0.31 * W, minX + 0.565 * W, minY, minY + 0.18 * H, wallH, 3.0, 'y'),
        roofC,
      ),
    ];

    // 3. steeple stack at the west end, centered on the entrance block
    const tx = minX + 0.088 * W; // ~6m east of the west face
    const ty = minY + 0.48 * H; // N-S center of the chamfered west block
    const towerH = 15;
    const belfryH = 3.8;
    const spireH = 8.4; // slender — the spire is the chapel's signature

    const tower = new THREE.BoxGeometry(9.6, towerH, 9.6);
    tower.translate(tx, towerH / 2, -ty); // world z = -north
    parts.push(helpers.withColor(tower, trim));

    const belfry = new THREE.CylinderGeometry(3.7, 3.9, belfryH, 8); // octagonal belfry
    belfry.translate(tx, towerH + belfryH / 2, -ty);
    parts.push(helpers.withColor(belfry, trim));

    const spire = new THREE.ConeGeometry(3.3, spireH, 8);
    spire.translate(tx, towerH + belfryH + spireH / 2, -ty);
    parts.push(helpers.withColor(spire, trim));

    // 4. west portico: 4 columns + entablature slab + pediment facing the Mall
    const colH = 5.4;
    const colX = minX - 0.9; // projecting proud of the chamfered west face
    for (const off of [-3.6, -1.2, 1.2, 3.6]) {
      const col = new THREE.CylinderGeometry(0.36, 0.4, colH, 8);
      col.translate(colX, colH / 2, -(ty + off));
      parts.push(helpers.withColor(col, trim));
    }
    const slab = new THREE.BoxGeometry(3.6, 0.7, 9.4);
    slab.translate(minX - 0.1, colH + 0.35, -ty);
    parts.push(helpers.withColor(slab, trim));
    parts.push(
      helpers.withColor(
        buildGableRoof(minX - 1.4, minX + 1.3, ty - 4.7, ty + 4.7, colH + 0.7, 2.0, 'x'),
        trim,
      ),
    );

    return parts;
  },
};
