// Edward St. John Learning and Teaching Center: the irregular mapped outline
// contains a broad north classroom block, lower south atrium, and east wing.
// Roof positions follow the local MD iMAP aerial reference; it is not rendered.
// UMD confirms the traditional red-brick exterior and the columned historic
// entrance on the McKeldin Mall side of the hill.
import * as THREE from 'three';
import type { LandmarkModule } from '../types';
import { facadePointAt } from './historic-central-parts';

export const landmark: LandmarkModule = {
  id: 'way/476961971',
  spec: {
    name: 'Edward St. John Learning and Teaching Center',
    color: 0x9b5948,
    accent: 0xd9d7cd,
    height: 11.8,
    roof: 'parapet',
  },
  maxHeight: 17.2,
  build(ctx) {
    const { pts, baseHeight, helpers } = ctx;
    const { minX, maxX, minY, maxY } = helpers.bboxOf(pts);
    const width = maxX - minX;
    const depth = maxY - minY;
    const x = (fraction: number) => minX + fraction * width;
    const n = (fraction: number) => minY + fraction * depth;
    const brick = new THREE.Color(0x9b5948);
    const brickShade = new THREE.Color(0x874a3e);
    const limestone = new THREE.Color(0xd9d7cd);
    const concrete = new THREE.Color(0xbfc3c0);
    const roof = new THREE.Color(0x9ba4a1);
    const darkRoof = new THREE.Color(0x606967);
    const glass = new THREE.Color(0x425e69);
    const frame = new THREE.Color(0xaab5b4);
    const green = new THREE.Color(0x747d5f);
    const parts: THREE.BufferGeometry[] = [];

    // World z points south; shape-space y points north. Adjacent roof parts
    // overlap in volume or have clear vertical separation. No visible faces
    // occupy the same plane, avoiding depth-buffer shimmer during orbit.
    function box(
      x0: number, x1: number, y0: number, y1: number,
      north0: number, north1: number, color: THREE.Color,
    ) {
      const geometry = new THREE.BoxGeometry(x1 - x0, y1 - y0, north1 - north0);
      geometry.translate((x0 + x1) / 2, (y0 + y1) / 2, -(north0 + north1) / 2);
      parts.push(helpers.withColor(geometry, color));
    }

    function wallPanel(side: 'north' | 'east', along: number, width: number,
      y0: number, y1: number, offset: number, color: THREE.Color) {
      const edge = facadePointAt(ctx, side, along, width / 2 + 0.05);
      if (!edge) return;
      const geometry = new THREE.BoxGeometry(width, y1 - y0, 0.10);
      geometry.rotateY(Math.atan2(edge.tn, edge.tx));
      geometry.translate(edge.x + edge.outX * offset, (y0 + y1) / 2,
        -(edge.north + edge.outN * offset));
      parts.push(helpers.withColor(geometry, color));
    }

    function triangle(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, color: THREE.Color) {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute([
        a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z,
      ], 3));
      geometry.computeVertexNormals();
      parts.push(helpers.withColor(geometry, color));
    }

    function roofQuad(
      a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3,
      color: THREE.Color,
    ) {
      // Both slopes must face upward under the campus's FrontSide material.
      const normal = new THREE.Vector3().subVectors(b, a)
        .cross(new THREE.Vector3().subVectors(c, a));
      const vertices = normal.y >= 0
        ? [a, b, c, a, c, d]
        : [a, c, b, a, d, c];
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(
        vertices.flatMap((point) => [point.x, point.y, point.z]), 3,
      ));
      geometry.computeVertexNormals();
      parts.push(helpers.withColor(geometry, color));
    }

    function gable(
      x0: number, x1: number, north0: number, north1: number,
      eave: number, ridge: number, roofColor: THREE.Color,
    ) {
      const middle = (x0 + x1) / 2;
      const southZ = -north0;
      const northZ = -north1;
      roofQuad(
        new THREE.Vector3(x0, eave, southZ), new THREE.Vector3(middle, ridge, southZ),
        new THREE.Vector3(middle, ridge, northZ), new THREE.Vector3(x0, eave, northZ), roofColor,
      );
      roofQuad(
        new THREE.Vector3(middle, ridge, southZ), new THREE.Vector3(x1, eave, southZ),
        new THREE.Vector3(x1, eave, northZ), new THREE.Vector3(middle, ridge, northZ), roofColor,
      );
      triangle(
        new THREE.Vector3(x0, eave, southZ),
        new THREE.Vector3(x1, eave, southZ),
        new THREE.Vector3(middle, ridge, southZ), limestone,
      );
      triangle(
        new THREE.Vector3(x1, eave, northZ),
        new THREE.Vector3(x0, eave, northZ),
        new THREE.Vector3(middle, ridge, northZ), limestone,
      );
    }

    // A low mapped footprint supports the visibly taller classroom bar.
    parts.push(helpers.withColor(helpers.extrudeFootprint(pts, baseHeight), brick));
    box(x(0.015), x(0.72), baseHeight - 0.08, 15.35, n(0.55), n(0.925), brickShade);
    box(x(0.02), x(0.715), 15.27, 15.57, n(0.555), n(0.92), roof);
    box(x(0.03), x(0.70), 15.53, 15.75, n(0.895), n(0.925), darkRoof);
    // Limestone cornice and continuous glazing face the south atrium.
    box(x(0.018), x(0.718), 14.65, 14.88, n(0.548), n(0.557), limestone);
    box(x(0.08), x(0.64), 12.5, 13.65, n(0.544), n(0.551), glass);
    for (let i = 0; i <= 12; i++) {
      const mullionX = x(0.08 + i * (0.56 / 12));
      box(mullionX, mullionX + 0.12, 12.47, 13.68, n(0.54), n(0.552), frame);
    }
    // Regular punched classroom windows distinguish the traditional brick
    // exterior from the glass atrium. The north wall faces Campus Drive.
    for (let i = 0; i < 10; i++) {
      const x0 = x(0.06 + i * 0.063);
      for (const y0 of [3.2, 8.45]) {
        wallPanel('north', x0 + 0.875, 1.75, y0 - 0.14, y0 + 2.52, 0.12, limestone);
        wallPanel('north', x0 + 0.875, 1.31, y0 + 0.07, y0 + 2.28, 0.20, glass);
        wallPanel('north', x0 + 0.875, 1.41, y0 + 1.06, y0 + 1.16, 0.27, frame);
      }
    }
    // Narrow vertical bays on the east teaching wing and stone sill courses.
    for (let i = 0; i < 7; i++) {
      const north0 = n(0.22 + i * 0.095);
      for (const y0 of [3.5, 8.65]) {
        wallPanel('east', north0 + 0.925, 1.85, y0 - 0.14, y0 + 2.46, 0.12, limestone);
        wallPanel('east', north0 + 0.925, 1.45, y0 + 0.08, y0 + 2.2, 0.20, glass);
      }
    }

    // Square plant well and offset pale service enclosure on the north roof.
    box(x(0.28), x(0.41), 15.51, 16.02, n(0.69), n(0.82), darkRoof);
    box(x(0.305), x(0.385), 15.98, 16.59, n(0.715), n(0.795), concrete);
    box(x(0.48), x(0.58), 15.52, 16.12, n(0.57), n(0.66), concrete);

    // Two raised brick pavilions frame the southern planted atrium roof.
    for (const [left, right] of [[0.045, 0.14], [0.565, 0.645]]) {
      box(x(left), x(right), baseHeight - 0.08, 15.0, n(0.10), n(0.37), brickShade);
      box(x(left - 0.006), x(right + 0.006), 14.92, 15.28, n(0.095), n(0.375), limestone);
      box(x(left + 0.008), x(right - 0.008), 15.24, 15.43, n(0.11), n(0.36), darkRoof);
    }
    box(x(0.15), x(0.54), baseHeight - 0.06, baseHeight + 0.22, n(0.23), n(0.43), concrete);
    box(x(0.165), x(0.525), baseHeight + 0.18, baseHeight + 0.37, n(0.245), n(0.415), green);
    for (const fraction of [0.24, 0.33, 0.42]) {
      box(x(fraction), x(fraction) + 0.10, baseHeight + 0.34, baseHeight + 0.44,
        n(0.248), n(0.412), new THREE.Color(0x969d7b));
    }

    // Compact south gable, recessed glass lobby, and pale trim. The former
    // full-width classical portico did not match the actual entrance.
    box(x(0.274), x(0.410), 1.2, 9.25, n(-0.008), n(0.018), glass);
    for (const fraction of [0.282, 0.322, 0.362, 0.402]) {
      box(x(fraction), x(fraction) + 0.15, 1.15, 9.3, n(-0.014), n(0.022), frame);
    }
    box(x(0.267), x(0.418), 9.35, 9.68, n(-0.014), n(0.025), limestone);
    // A compact stone pier pair marks the actual mall-facing entrance below
    // the gable; this reads as the retained historic doorway at map scale.
    for (const fraction of [0.272, 0.405]) {
      box(x(fraction), x(fraction) + 0.42, 1.0, 9.42, n(-0.019), n(0.03), limestone);
      box(x(fraction) - 0.1, x(fraction) + 0.52, 9.28, 9.55, n(-0.021), n(0.032), limestone);
    }
    box(x(0.265), x(0.422), baseHeight - 0.08, baseHeight + 0.12,
      n(0.025), n(0.21), brickShade);
    gable(x(0.265), x(0.422), n(0.025), n(0.21), baseHeight + 0.12, 14.25, roof);

    // Narrow east arm: a dark flat middle and pitched end pavilions.
    box(x(0.79), x(0.965), baseHeight - 0.08, 14.4, n(0.145), n(0.925), brickShade);
    box(x(0.80), x(0.958), 14.32, 14.59, n(0.35), n(0.75), darkRoof);
    box(x(0.795), x(0.965), 14.32, 14.67, n(0.15), n(0.35), brickShade);
    box(x(0.795), x(0.965), 14.32, 14.67, n(0.75), n(0.925), brickShade);
    gable(x(0.795), x(0.965), n(0.15), n(0.35), 14.67, 16.75, roof);
    gable(x(0.795), x(0.965), n(0.75), n(0.925), 14.67, 16.75, roof);
    // The second, smaller planted roof occupies its central terrace.
    box(x(0.82), x(0.945), 14.53, 14.76, n(0.44), n(0.62), concrete);
    box(x(0.83), x(0.935), 14.72, 14.89, n(0.45), n(0.61), green);

    return parts;
  },
};
