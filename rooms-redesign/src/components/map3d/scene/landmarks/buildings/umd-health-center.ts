// UMD's Building 140 is a two-story red-brick clinic with a long slate hip roof,
// a broad white center gable and oculus, small roof dormers, and a modest white
// doorway on the Campus Drive (south) front. The irregular ground plan is the
// mapped OSM footprint, including the two side projections and north entry bay.
// Sources: https://facilities.umd.edu/node/367
//          https://facilities.umd.edu/sites/default/files/UMDBuildings/140.jpg
//          https://health.umd.edu/your-visit/hours-and-location
import * as THREE from 'three';
import type { LandmarkModule } from '../types';

export const landmark: LandmarkModule = {
  id: 'way/23585331',
  spec: {
    name: 'UMD Health Center',
    color: 0x904d41,
    accent: 0xe6e3d9,
    height: 9.3,
    roof: 'hipped',
  },
  maxHeight: 12.8,
  build(ctx) {
    const { helpers } = ctx;
    const bounds = helpers.bboxOf(ctx.pts);
    const width = bounds.maxX - bounds.minX;
    const depth = bounds.maxY - bounds.minY;
    const x = (f: number) => bounds.minX + f * width;
    const n = (f: number) => bounds.minY + f * depth;
    const p = (xf: number, y: number, nf: number) => new THREE.Vector3(x(xf), y, -n(nf));
    const parts: THREE.BufferGeometry[] = [];
    const brick = new THREE.Color(0x904d41);
    const brickShadow = new THREE.Color(0x7d4038);
    const limestone = new THREE.Color(0xe6e3d9);
    const slate = new THREE.Color(0x555e67);
    const slateLight = new THREE.Color(0x657079);
    const glazing = new THREE.Color(0x40575f);
    const sash = new THREE.Color(0xd9dedb);

    function box(x0: number, x1: number, y0: number, y1: number,
      n0: number, n1: number, color: THREE.Color) {
      const geometry = new THREE.BoxGeometry(x(x1) - x(x0), y1 - y0, n(n1) - n(n0));
      geometry.translate((x(x0) + x(x1)) / 2, (y0 + y1) / 2, -(n(n0) + n(n1)) / 2);
      parts.push(helpers.withColor(geometry, color));
    }

    function face(vertices: THREE.Vector3[], outward: THREE.Vector3, color: THREE.Color) {
      const triangles: THREE.Vector3[] = [];
      for (let i = 1; i < vertices.length - 1; i++) {
        const a = vertices[0];
        const b = vertices[i];
        const c = vertices[i + 1];
        const normal = new THREE.Vector3().subVectors(b, a)
          .cross(new THREE.Vector3().subVectors(c, a));
        triangles.push(...(normal.dot(outward) >= 0 ? [a, b, c] : [a, c, b]));
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(
        triangles.flatMap((v) => [v.x, v.y, v.z]), 3,
      ));
      geometry.computeVertexNormals();
      parts.push(helpers.withColor(geometry, color));
    }

    function southWindow(xf: number, sill: number, size = 2.0) {
      const half = 0.016;
      const left = xf - half;
      const right = xf + half;
      // Frames cross into the brick wall. Every visible pane and muntin is
      // seated in that frame instead of hovering in front of the building.
      box(left - 0.003, right + 0.003, sill - 0.12, sill + size + 0.12,
        -0.003, 0.019, limestone);
      box(left, right, sill, sill + size, -0.006, 0.001, glazing);
      box(xf - 0.0013, xf + 0.0013, sill, sill + size, -0.009, -0.003, sash);
      for (const row of [1, 2]) {
        const yy = sill + size * row / 3;
        box(left, right, yy - 0.045, yy + 0.045, -0.009, -0.003, sash);
      }
      box(left - 0.005, right + 0.005, sill - 0.18, sill - 0.08,
        -0.013, 0.019, limestone);
    }

    // The body follows every jog in the survey, including its narrower south
    // frontage. Simple rectangular masses would fill the recesses at the ends.
    parts.push(helpers.withColor(helpers.extrudeFootprint(ctx.pts, ctx.baseHeight), brick));
    box(0.055, 0.955, 8.86, 9.36, -0.002, 0.027, limestone);
    // These projecting wing trims tuck under their slate caps. Ending them
    // at the main body's exact roof height made their pale tops flicker with
    // the brick roof face where the mapped outlines overlap.
    box(0.0, 0.055, 8.88, 9.29, 0.341, 0.614, limestone);
    box(0.955, 1.0, 8.88, 9.29, 0.393, 0.920, limestone);

    // A continuous hip roof runs east-west above the two-story facade. The
    // center ridge is shorter than its eaves, closing both ends with hips.
    const eave = 9.33;
    const ridge = 12.35;
    face([p(0.052, eave, 0.004), p(0.958, eave, 0.004),
      p(0.825, ridge, 0.48), p(0.185, ridge, 0.48)],
    new THREE.Vector3(0, 1, 1), slateLight);
    face([p(0.958, eave, 0.933), p(0.052, eave, 0.933),
      p(0.185, ridge, 0.48), p(0.825, ridge, 0.48)],
    new THREE.Vector3(0, 1, -1), slate);
    face([p(0.052, eave, 0.004), p(0.185, ridge, 0.48),
      p(0.052, eave, 0.933)], new THREE.Vector3(-1, 1, 0), slate);
    face([p(0.958, eave, 0.933), p(0.825, ridge, 0.48),
      p(0.958, eave, 0.004)], new THREE.Vector3(1, 1, 0), slate);
    // The little west and east wings project beyond the long roof's eaves.
    // Their low caps sit directly on those brick walls, as does the north bay.
    box(0.0, 0.055, 9.28, 9.48, 0.341, 0.614, slate);
    box(0.955, 1.0, 9.28, 9.48, 0.393, 0.921, slate);

    // The building's prominent white front gable is part of the roof, with
    // its oculus recessed into the triangular wall facing Campus Drive.
    face([p(0.325, 9.37, -0.012), p(0.685, 9.37, -0.012),
      p(0.505, 12.52, -0.012)], new THREE.Vector3(0, 0, 1), limestone);
    for (const [a, b] of [[0.315, 0.505], [0.505, 0.695]] as const) {
      const ay = a < 0.5 ? 9.34 : 12.52;
      const by = b < 0.6 ? 12.52 : 9.34;
      face([p(a, ay, -0.022), p(b, by, -0.022),
        p(b, by, 0.29), p(a, ay, 0.29)],
      new THREE.Vector3(0, 1, 0), slateLight);
    }
    const oculus = new THREE.CylinderGeometry(0.92, 0.92, 0.18, 24);
    oculus.rotateX(Math.PI / 2);
    oculus.translate(x(0.505), 10.75, -n(-0.019));
    parts.push(helpers.withColor(oculus, limestone));
    const oculusGlass = new THREE.CylinderGeometry(0.66, 0.66, 0.2, 24);
    oculusGlass.rotateX(Math.PI / 2);
    oculusGlass.translate(x(0.505), 10.75, -n(-0.025));
    parts.push(helpers.withColor(oculusGlass, glazing));
    box(0.504, 0.506, 10.12, 11.38, -0.035, -0.027, sash);
    box(0.493, 0.517, 10.70, 10.79, -0.035, -0.027, sash);

    // Paired narrow dormers on each side of the gable break the south slope.
    for (const center of [0.13, 0.25, 0.76, 0.88]) {
      const roofAtFront = eave + (ridge - eave) * (0.165 - 0.004) / (0.48 - 0.004);
      const bottom = roofAtFront - 0.38;
      box(center - 0.025, center + 0.025, bottom, bottom + 2.25,
        0.16, 0.255, limestone);
      box(center - 0.017, center + 0.017, bottom + 0.54, bottom + 1.82,
        0.151, 0.165, glazing);
      box(center - 0.0013, center + 0.0013, bottom + 0.54, bottom + 1.82,
        0.148, 0.157, sash);
      box(center - 0.017, center + 0.017, bottom + 1.13, bottom + 1.20,
        0.148, 0.157, sash);
      face([p(center - 0.030, bottom + 2.18, 0.150),
        p(center, bottom + 2.62, 0.150),
        p(center, bottom + 2.62, 0.268),
        p(center - 0.030, bottom + 2.18, 0.268)],
      new THREE.Vector3(0, 1, 0), slate);
      face([p(center, bottom + 2.62, 0.150),
        p(center + 0.030, bottom + 2.18, 0.150),
        p(center + 0.030, bottom + 2.18, 0.268),
        p(center, bottom + 2.62, 0.268)],
      new THREE.Vector3(0, 1, 0), slate);
    }

    for (const f of [0.11, 0.19, 0.27, 0.35, 0.43, 0.58, 0.66, 0.74, 0.82, 0.90]) {
      southWindow(f, 1.28, 2.08);
      southWindow(f, 5.02, 2.08);
    }

    // The entrance is a modest one-story white surround with glazed double
    // doors and a shallow broken-pediment crown, beneath the larger gable.
    box(0.462, 0.548, 0.04, 4.33, -0.013, 0.018, limestone);
    box(0.474, 0.536, 0.04, 3.56, -0.022, -0.004, glazing);
    box(0.504, 0.507, 0.06, 3.55, -0.028, -0.018, sash);
    box(0.470, 0.540, 3.55, 3.74, -0.026, 0.016, limestone);
    box(0.457, 0.553, 4.19, 4.42, -0.025, 0.023, limestone);
    for (const f of [0.459, 0.541]) {
      box(f - 0.004, f + 0.004, 0.04, 4.18, -0.030, -0.005, limestone);
    }
    face([p(0.456, 4.43, -0.026), p(0.484, 5.12, -0.026),
      p(0.496, 4.91, -0.026)], new THREE.Vector3(0, 0, 1), limestone);
    face([p(0.514, 4.91, -0.026), p(0.526, 5.12, -0.026),
      p(0.554, 4.43, -0.026)], new THREE.Vector3(0, 0, 1), limestone);
    box(0.490, 0.520, 4.86, 4.99, -0.030, -0.020, limestone);

    // A quiet rear elevation keeps the same two-story window scale. Its
    // north wall is split by the shallow center projection in the footprint.
    for (const f of [0.07, 0.15, 0.23, 0.31, 0.69, 0.77, 0.85, 0.93]) {
      for (const sill of [1.4, 5.1]) {
        box(f - 0.018, f + 0.018, sill - 0.13, sill + 2.08,
          0.914, 0.938, limestone);
        box(f - 0.015, f + 0.015, sill, sill + 1.95,
          0.934, 0.944, glazing);
        box(f - 0.001, f + 0.001, sill, sill + 1.95,
          0.942, 0.950, sash);
        box(f - 0.015, f + 0.015, sill + 0.95, sill + 1.03,
          0.942, 0.950, sash);
      }
    }
    for (const nf of [0.46, 0.57, 0.68, 0.79]) {
      for (const sill of [1.4, 5.1]) {
        box(0.995, 1.002, sill - 0.12, sill + 2.08,
          nf - 0.026, nf + 0.026, limestone);
        box(1.001, 1.003, sill, sill + 1.95,
          nf - 0.021, nf + 0.021, glazing);
        box(1.003, 1.004, sill + 0.94, sill + 1.01,
          nf - 0.021, nf + 0.021, sash);
      }
    }
    for (const nf of [0.41, 0.54]) {
      for (const sill of [1.4, 5.1]) {
        box(-0.002, 0.005, sill - 0.12, sill + 2.08,
          nf - 0.026, nf + 0.026, limestone);
        box(-0.003, -0.001, sill, sill + 1.95,
          nf - 0.021, nf + 0.021, glazing);
        box(-0.004, -0.003, sill + 0.94, sill + 1.01,
          nf - 0.021, nf + 0.021, sash);
      }
    }
    box(0.40, 0.59, 9.29, 9.54, 0.913, 0.999, slate);
    box(0.443, 0.553, 0.12, 3.15, 0.997, 1.009, brickShadow);
    box(0.466, 0.530, 0.12, 2.71, 1.004, 1.014, glazing);

    return parts;
  },
};
