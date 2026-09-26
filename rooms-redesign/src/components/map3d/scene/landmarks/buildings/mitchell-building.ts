// Clarence M. Mitchell, Jr. Building (not the Mitchell Art-Sociology Building).
// UMD Facilities photo and building record: https://www.facilities.umd.edu/node/304
// UMD Immersive Media Design entrance photo: https://imd.umd.edu/current-students
// The mapped north projection is the open four-column portico; the two-story
// brick wings, slate roof, white trim, and pediment follow those photographs.
import * as THREE from 'three';
import type { LandmarkModule } from '../types';

export const landmark: LandmarkModule = {
  id: 'way/23970685',
  spec: {
    name: 'Clarence M. Mitchell, Jr. Building',
    color: 0x8f5347,
    accent: 0xe8e8e1,
    height: 11,
    roof: 'hipped',
  },
  maxHeight: 13.1,
  build(ctx) {
    const { pts, helpers } = ctx;
    const bounds = helpers.bboxOf(pts);
    const width = bounds.maxX - bounds.minX;
    const depth = bounds.maxY - bounds.minY;
    const x = (fraction: number) => bounds.minX + width * fraction;
    const n = (fraction: number) => bounds.minY + depth * fraction;
    const brick = new THREE.Color(ctx.spec.color);
    const stone = new THREE.Color(ctx.spec.accent);
    const slate = new THREE.Color(0x626b70);
    const glass = new THREE.Color(0x4d6068);
    const sash = new THREE.Color(0xcbd0cb);
    const stair = new THREE.Color(0xaaa69d);
    const parts: THREE.BufferGeometry[] = [];

    const rectangle = (x0: number, x1: number, n0: number, n1: number) => [
      new THREE.Vector2(x0, n0), new THREE.Vector2(x1, n0),
      new THREE.Vector2(x1, n1), new THREE.Vector2(x0, n1),
    ];
    const box = (
      x0: number, x1: number, y0: number, y1: number,
      n0: number, n1: number, color: THREE.Color,
    ) => {
      const geometry = new THREE.BoxGeometry(x1 - x0, y1 - y0, n1 - n0);
      geometry.translate((x0 + x1) / 2, (y0 + y1) / 2, -(n0 + n1) / 2);
      parts.push(helpers.withColor(geometry, color));
    };

    // The OSM outline includes the column canopy. Pull only its two northern
    // tips back to the wall so the space under the portico remains open.
    const wallLine = n(0.785);
    const body = pts.map((point) => new THREE.Vector2(
      point.x, point.y > n(0.94) ? wallLine : point.y,
    ));
    const eave = ctx.baseHeight - 2.2;
    parts.push(helpers.withColor(helpers.extrudeFootprint(body, eave), brick));

    // One broad roof spans the long east-west bar. The three shallow rear
    // wings occupy the southern teeth of the mapped footprint.
    parts.push(helpers.withColor(
      helpers.buildHippedRoof(rectangle(x(0.012), x(0.988), n(0.226), n(0.762)), eave, 2.2),
      slate,
    ));
    for (const [a, b, s] of [
      [0.013, 0.203, 0.012], [0.400, 0.622, 0.030], [0.818, 0.987, 0.052],
    ]) {
      parts.push(helpers.withColor(
        helpers.buildHippedRoof(rectangle(x(a), x(b), n(s), n(0.219)), eave, 0.9),
        slate,
      ));
    }

    // The front wing walls step slightly in the survey, so each window row
    // uses the actual wall's northing rather than a single floating strip.
    const northWindow = (center: number, face: number, bottom: number, height: number, windowWidth: number) => {
      const cx = x(center);
      const half = windowWidth / 2;
      const wall = n(face);
      box(cx - half - 0.13, cx + half + 0.13, bottom - 0.13, bottom + height + 0.13,
        wall - 0.075, wall + 0.045, stone);
      box(cx - half, cx + half, bottom, bottom + height,
        wall + 0.028, wall + 0.072, glass);
      box(cx - half, cx + half, bottom + height * 0.52 - 0.045,
        bottom + height * 0.52 + 0.045, wall + 0.068, wall + 0.086, sash);
      box(cx - 0.045, cx + 0.045, bottom, bottom + height,
        wall + 0.068, wall + 0.086, sash);
    };
    for (const [start, end, face] of [
      [0.045, 0.355, 0.774], [0.635, 0.955, 0.799],
    ]) {
      for (let i = 0; i < 5; i++) {
        const u = start + (end - start) * i / 4;
        northWindow(u, face, 2.38, 1.85, 1.35);
        northWindow(u, face, 5.37, 2.12, 1.35);
        northWindow(u, face, 0.56, 0.85, 1.18);
      }
      box(x(start) - 1.15, x(end) + 1.15, 8.27, 8.59,
        n(face) - 0.08, n(face) + 0.12, stone);
      box(x(start) - 1.15, x(end) + 1.15, 1.9, 2.08,
        n(face) - 0.07, n(face) + 0.09, stone);
    }

    // A quieter rear elevation follows the three projecting brick bays.
    for (const [start, end, face, count] of [
      [0.025, 0.19, 0.000, 3], [0.415, 0.606, 0.018, 4],
      [0.83, 0.973, 0.039, 3],
    ]) {
      for (let i = 0; i < count; i++) {
        const center = x(start + (end - start) * (i + 0.5) / count);
        const wall = n(face);
        for (const bottom of [2.42, 5.42]) {
          box(center - 0.76, center + 0.76, bottom - 0.12, bottom + 2.02,
            wall - 0.055, wall + 0.065, stone);
          box(center - 0.62, center + 0.62, bottom, bottom + 1.88,
            wall - 0.08, wall - 0.04, glass);
          box(center - 0.62, center + 0.62, bottom + 0.92, bottom + 1.00,
            wall - 0.094, wall - 0.075, sash);
        }
      }
    }

    // Broad steps and landing are inside the mapped entrance projection.
    box(x(0.406), x(0.574), 0, 0.86, n(0.785), n(0.945), stair);
    for (let i = 0; i < 4; i++) {
      const front = 0.945 + i * 0.013;
      box(x(0.406), x(0.574), 0, 0.68 - i * 0.16,
        n(front), n(0.998), stair);
    }
    // A pair of doors and upper windows occupy the brick wall behind the
    // columns; all glazing is sunk into that wall.
    for (const u of [0.466, 0.514]) {
      northWindow(u, 0.785, 5.33, 2.1, 1.18);
    }
    box(x(0.475), x(0.505), 0.85, 3.95, n(0.782), n(0.802), glass);
    box(x(0.473), x(0.507), 3.9, 4.13, n(0.779), n(0.808), stone);

    // Four full-height round columns support a white entablature and a
    // triangular pediment with the small circular attic window.
    const front = n(0.912);
    const columnBase = 0.86;
    const columnTop = 9.42;
    for (const u of [0.424, 0.468, 0.512, 0.556]) {
      const column = new THREE.CylinderGeometry(0.42, 0.5, columnTop - columnBase, 12);
      column.translate(x(u), (columnTop + columnBase) / 2, -front);
      parts.push(helpers.withColor(column, stone));
      box(x(u) - 0.62, x(u) + 0.62, 0.84, 1.09,
        front - 0.62, front + 0.62, stone);
      box(x(u) - 0.64, x(u) + 0.64, columnTop - 0.2, columnTop + 0.24,
        front - 0.62, front + 0.62, stone);
    }
    box(x(0.398), x(0.582), 9.38, 10.45,
      n(0.78), n(0.977), stone);
    box(x(0.393), x(0.587), 10.40, 10.57,
      n(0.776), n(0.982), stone);
    const halfPediment = (x(0.587) - x(0.393)) / 2;
    const pediment = new THREE.Shape([
      new THREE.Vector2(-halfPediment, 0),
      new THREE.Vector2(halfPediment, 0),
      new THREE.Vector2(0, 2.18),
    ]);
    const wedge = new THREE.ExtrudeGeometry(pediment, {
      depth: n(0.982) - n(0.781), bevelEnabled: false,
    });
    wedge.translate(x(0.49), 10.55, -n(0.982));
    parts.push(helpers.withColor(wedge, stone));
    const oculus = new THREE.CylinderGeometry(0.37, 0.37, 0.08, 16);
    oculus.rotateX(Math.PI / 2);
    oculus.translate(x(0.49), 11.34, -n(0.984));
    parts.push(helpers.withColor(oculus, glass));

    return parts;
  },
};
