import * as THREE from 'three';
import type { LandmarkModule } from '../types';
import { stripWindows } from './historic-central-parts';

// Sources: UMD Facilities (1932 building, 1996 renovation and exterior photo)
// https://facilities.umd.edu/node/2427
// RecWell's current exterior: https://recwell.umd.edu/ritchie-coliseum-0
// Prince George's Planning architectural survey, p. 95: nine-bay west front,
// five-bay pedimented center, six Doric pilasters and three arched doorways.
// https://pgplanning.org/wp-content/uploads/2025/06/Final-Report-LivefromPGCounty_Fall2024_compressed.pdf
// Roof plan checked against the 2023 MD iMAP SixInchImagery aerial:
// https://mdgeodata.md.gov/imagery/rest/services/SixInch/SixInchImagery/ImageServer
// The reference image bounds are in design-reference/campus-aerial.SOURCE.txt.
export const landmark: LandmarkModule = {
  id: 'way/23988568',
  spec: { name: 'Ritchie Coliseum', color: 0x8f4639, accent: 0xe6dfd0, height: 11, roof: 'parapet' },
  maxHeight: 14.5,
  build(ctx) {
    const { helpers, pts } = ctx;
    const parts: THREE.BufferGeometry[] = [];
    const brick = new THREE.Color(0x8f4639);
    const darkBrick = new THREE.Color(0x79392f);
    const stone = new THREE.Color(0xe6dfd0);
    const glass = new THREE.Color(0x35454b);
    const door = new THREE.Color(0xddd9cc);
    const slate = new THREE.Color(0x41484b);
    const roof = new THREE.Color(0x77797a);

    const add = (geometry: THREE.BufferGeometry, shade: THREE.Color) =>
      parts.push(helpers.withColor(geometry, shade));

    // The two ends of the west frontage in campus-data.json (OSM way/23988568).
    // Its 8-degree skew matters: all facade and roof details use this frame.
    const south = pts[0];
    const north = pts[8];
    const front = south.clone().add(north).multiplyScalar(0.5);
    const tangent = north.clone().sub(south).normalize();
    const outward = new THREE.Vector2(-tangent.y, tangent.x);
    const at = (along: number, out: number) => new THREE.Vector2(
      front.x + tangent.x * along + outward.x * out,
      front.y + tangent.y * along + outward.y * out,
    );
    const rect = (a0: number, a1: number, o0: number, o1: number) => [
      at(a0, o0), at(a1, o0), at(a1, o1), at(a0, o1),
    ];
    const solid = (
      a0: number, a1: number, o0: number, o1: number,
      y0: number, y1: number, shade: THREE.Color,
    ) => add(helpers.extrudeFootprint(rect(a0, a1, o0, o1), y1 - y0)
      .translate(0, y0, 0), shade);
    const frontFace = (outline: Array<[number, number]>, out: number, shade: THREE.Color) => {
      const positions: number[] = [];
      const vertex = ([along, y]: [number, number]) => {
        const p = at(along, out);
        positions.push(p.x, y, -p.y);
      };
      // Reversed winding makes the face point west (toward Baltimore Avenue).
      for (let i = 1; i < outline.length - 1; i++) {
        vertex(outline[0]); vertex(outline[i + 1]); vertex(outline[i]);
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.computeVertexNormals();
      add(geometry, shade);
    };

    // Full mapped shell preserves the stepped east edge instead of replacing
    // the building with a convenient rectangle.
    add(helpers.extrudeFootprint(pts, 10.55), brick);
    add(helpers.extrudeFootprint(helpers.outsetRing(pts, 0.11), 0.42), stone);
    // Lift the limestone cornice cap clear of the broad brick roof face.
    add(helpers.extrudeFootprint(helpers.outsetRing(pts, 0.10), 0.45)
      .translate(0, 10.2, 0), stone);

    // Aerial: dark perimeter, broad flat gray roof and a long central light.
    // The roof rectangles sit inside the real 52 x 43 m footprint.
    solid(-19.4, 19.4, -49.2, -2.0, 10.54, 10.75, slate);
    solid(-16.9, 16.9, -45.2, -8.5, 10.75, 11.12, roof);
    solid(-2.05, 2.05, -34.3, -20.2, 11.12, 11.28, stone);
    solid(-1.68, 1.68, -33.9, -20.6, 11.28, 11.38, new THREE.Color(0xb9c1bd));
    for (const a of [-12.5, 12.5]) {
      for (const out of [-37.5, -23.0]) {
        solid(a - 0.6, a + 0.6, out - 0.55, out + 0.55, 11.12, 11.55, slate);
      }
    }

    // West elevation: the raised seven-bay center and its five-bay portico.
    solid(-16.0, 16.0, 0.02, 0.32, 0.45, 10.4, darkBrick);
    solid(-11.85, 11.85, 0.32, 0.57, 0.46, 10.37, brick);
    for (const a of [-19.0, -16.0, 16.0, 19.0]) {
      solid(a - 0.36, a + 0.36, 0.10, 0.50, 0.40, 10.5, stone);
      for (let y = 1.05; y < 10; y += 0.82) {
        solid(a - 0.40, a + 0.40, 0.51, 0.56, y, y + 0.10, darkBrick);
      }
    }

    // Nine round-headed lower bays. The middle three are paired doors; the
    // other openings are dark grilles as documented in the planning survey.
    for (let i = -4; i <= 4; i++) {
      const a = i * 4.45;
      const radius = 1.42;
      const spring = 3.03;
      const arch: Array<[number, number]> = [[a - radius, 0.68], [a + radius, 0.68],
        [a + radius, spring]];
      for (let j = 1; j <= 12; j++) {
        const theta = Math.PI * j / 12;
        arch.push([a + radius * Math.cos(theta), spring + radius * Math.sin(theta)]);
      }
      const face = Math.abs(i) <= 2 ? 0.60 : 0.22;
      frontFace(arch, face, glass);
      // Pale voussoir band and keystone follow each curve.
      for (let j = 0; j < 12; j++) {
        const t0 = Math.PI * j / 12;
        const t1 = Math.PI * (j + 1) / 12;
        frontFace([
          [a + radius * Math.cos(t0), spring + radius * Math.sin(t0)],
          [a + (radius + 0.19) * Math.cos(t0), spring + (radius + 0.19) * Math.sin(t0)],
          [a + (radius + 0.19) * Math.cos(t1), spring + (radius + 0.19) * Math.sin(t1)],
          [a + radius * Math.cos(t1), spring + radius * Math.sin(t1)],
        ], face + 0.02, stone);
      }
      if (Math.abs(i) <= 1) {
        solid(a - 1.13, a + 1.13, face + 0.03, face + 0.10, 0.78, 2.81, door);
        solid(a - 0.035, a + 0.035, face + 0.10, face + 0.14, 0.79, 2.82, slate);
      } else {
        for (const bar of [-0.55, 0, 0.55]) {
          solid(a + bar - 0.035, a + bar + 0.035,
            face + 0.03, face + 0.07, 0.8, 3.85, slate);
        }
      }
      // Smaller second-story lights complete the two-level bay rhythm.
      solid(a - 1.02, a + 1.02, face + 0.03, face + 0.11, 6.15, 8.55, stone);
      solid(a - 0.83, a + 0.83, face + 0.11, face + 0.17, 6.35, 8.37, glass);
      solid(a - 0.04, a + 0.04, face + 0.17, face + 0.21, 6.35, 8.37, stone);
    }

    // Six square Doric pilasters, with simple flutes, hold the entablature.
    for (let i = 0; i < 6; i++) {
      const a = -11.15 + i * 4.46;
      solid(a - 0.37, a + 0.37, 0.58, 1.29, 0.58, 10.25, stone);
      solid(a - 0.53, a + 0.53, 0.56, 1.37, 0.48, 0.76, stone);
      solid(a - 0.55, a + 0.55, 0.56, 1.38, 10.0, 10.33, stone);
      for (const flute of [-0.15, 0, 0.15]) {
        solid(a + flute - 0.018, a + flute + 0.018,
          1.30, 1.34, 1.02, 9.81, new THREE.Color(0xc9c4b9));
      }
    }
    solid(-12.0, 12.0, 0.52, 1.52, 10.28, 11.32, stone);
    frontFace([[-12.2, 11.32], [12.2, 11.32], [0, 14.27]], 1.54, stone);
    // Stone shield in the pediment is a small raised rectangle at map scale.
    solid(-0.74, 0.74, 1.55, 1.64, 12.02, 12.88, new THREE.Color(0xc4bcab));

    // The shared window helper follows actual boundary edges on the skewed
    // north and south walls instead of placing panels on a bbox rectangle.
    stripWindows(ctx, parts, 'north', [0.18, 0.88], [1.55, 6.15], 6, stone, glass);
    stripWindows(ctx, parts, 'south', [0.18, 0.88], [1.55, 6.15], 6, stone, glass);

    return parts;
  },
};
