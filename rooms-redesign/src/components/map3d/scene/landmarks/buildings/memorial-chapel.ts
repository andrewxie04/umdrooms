// Memorial Chapel (way/23579314) — UMD's iconic 1952 Colonial chapel at the
// south of McKeldin Mall beside Regents Drive. Custom build:
//
//   1. BODY — full OSM footprint (cruciform-ish: long E-W nave, N/S transept
//      arms, chamfered west garden end) extruded as red brick.
//   2. ROOFS — real GABLES via custom triangles: main nave gable with its
//      ridge along the E-W axis, plus two smaller cross-gables over the
//      transept arms. Slate gray, darker than the brick walls.
//   3. STEEPLE at the east, Regents Drive entrance end: square tower box ->
//      octagonal belfry (8-seg cylinder) -> tall white cone spire. Apex ~27m.
//   4. PORTICO on the east face: six white columns + entablature slab
//      + a small pediment gable (ridge E-W, triangle facing Regents Drive).
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
    color: 0x9e5e4b, // UMD describes the chapel exterior as brick
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
      // 1. brick wall mass over the full cruciform footprint
      helpers.withColor(helpers.extrudeFootprint(pts, wallH), wall),
      // 2a. main nave gable — ridge E-W over the long sanctuary body,
      // ending at the tower on the east (Regents Drive) side
      helpers.withColor(
        buildGableRoof(minX + 0.17 * W, maxX - 0.06 * W, minY + 0.18 * H, minY + 0.81 * H, wallH, 5.5, 'x'),
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

    // 3. steeple stack at the east end, centered on the Regents Drive entrance
    const tx = maxX - 0.088 * W; // ~6m west of the east face
    const ty = minY + 0.53 * H; // N-S center of the east entrance block
    const towerH = 15;
    const belfryH = 3.8;
    const spireH = 8.4; // slender — the spire is the chapel's signature

    const tower = new THREE.BoxGeometry(9.6, towerH, 9.6);
    tower.translate(tx, towerH / 2, -ty); // world z = -north
    parts.push(helpers.withColor(tower, wall));

    // Pale belt course separates the brick tower from its white belfry.
    const belt = new THREE.BoxGeometry(10.2, 0.45, 10.2);
    belt.translate(tx, towerH - 0.25, -ty);
    parts.push(helpers.withColor(belt, trim));

    const belfry = new THREE.CylinderGeometry(3.7, 3.9, belfryH, 8); // octagonal belfry
    belfry.translate(tx, towerH + belfryH / 2, -ty);
    parts.push(helpers.withColor(belfry, trim));

    const spire = new THREE.ConeGeometry(3.3, spireH, 8);
    spire.translate(tx, towerH + belfryH + spireH / 2, -ty);
    parts.push(helpers.withColor(spire, trim));

    // Face the clock and belfry recesses toward Regents Drive.
    const clock = new THREE.CylinderGeometry(1.05, 1.05, 0.13, 24);
    clock.rotateZ(Math.PI / 2);
    clock.translate(tx + 4.89, 12.8, -ty);
    parts.push(helpers.withColor(clock, trim));
    const clockCenter = new THREE.CylinderGeometry(0.12, 0.12, 0.16, 12);
    clockCenter.rotateZ(Math.PI / 2);
    clockCenter.translate(tx + 5.0, 12.8, -ty);
    parts.push(helpers.withColor(clockCenter, roofC));
    for (const offset of [-2.55, 2.55]) {
      const recess = new THREE.BoxGeometry(0.12, 1.65, 1.05);
      recess.translate(tx + 3.73, 16.9, -(ty + offset));
      parts.push(helpers.withColor(recess, roofC));
    }

    // Georgian nave windows follow the two actual long wall segments. Their
    // slight offset exposes the white trim without leaving a gap to the brick.
    const naveEdges = pts.map((a, i) => [a, pts[(i + 1) % pts.length]] as const)
      .filter(([a, end]) => {
        const dx = end.x - a.x;
        const dn = end.y - a.y;
        return Math.abs(dx) > 20 && Math.abs(dn) < 0.03 * Math.abs(dx)
          && (a.x + end.x) / 2 > (minX + maxX) / 2;
      });
    for (const [a, end] of naveEdges) {
      const dx = end.x - a.x;
      const dn = end.y - a.y;
      const length = Math.hypot(dx, dn);
      const angle = Math.atan2(dn, dx);
      const outwardX = dn / length;
      const outwardN = -dx / length;
      for (const fraction of [0.14, 0.38, 0.62, 0.86]) {
        const bx = a.x + fraction * dx;
        const north = a.y + fraction * dn;
        const windowBox = (width: number, height: number, depth: number,
          centerY: number, offset: number, color: THREE.Color) => {
          const box = new THREE.BoxGeometry(width, height, depth);
          box.rotateY(angle);
          box.translate(bx + outwardX * offset, centerY, -(north + outwardN * offset));
          parts.push(helpers.withColor(box, color));
        };
        windowBox(2.1, 4.35, 0.16, 4.45, 0.07, trim);
        windowBox(1.48, 3.55, 0.18, 4.35, 0.16, roofC);
        windowBox(1.55, 0.12, 0.21, 4.45, 0.27, trim);
      }
    }

    // 4. east portico: six columns + entablature slab + pediment at the front
    const colH = 5.4;
    const colX = maxX + 0.9; // projecting toward Regents Drive
    for (const off of [-3.75, -2.25, -0.75, 0.75, 2.25, 3.75]) {
      const col = new THREE.CylinderGeometry(0.27, 0.32, colH, 10);
      col.translate(colX, colH / 2, -(ty + off));
      parts.push(helpers.withColor(col, trim));
    }
    const slab = new THREE.BoxGeometry(3.6, 0.7, 9.4);
    slab.translate(maxX + 0.1, colH + 0.35, -ty);
    parts.push(helpers.withColor(slab, trim));
    parts.push(
      helpers.withColor(
        buildGableRoof(maxX - 1.3, maxX + 1.4, ty - 4.7, ty + 4.7, colH + 0.7, 2.0, 'x'),
        trim,
      ),
    );

    return parts;
  },
};
