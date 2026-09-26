// A.V. Williams Building (115), way/23502735.
// UMD Facilities photo: https://facilities.umd.edu/info-resources/building-inventory/bldg-115
// UMD GVIL describes the U-shaped building as three and four stories:
// https://www.cs.umd.edu/projects/gvil/contactUs.shtml
// The campus-data footprint is ~90 x 118 m; its west-facing court is open.
import * as THREE from 'three';
import type { LandmarkModule } from '../types';

/** Clip the mapped outline to the east spine, preserving its actual outer edges. */
function eastOf(ring: THREE.Vector2[], cut: number): THREE.Vector2[] {
  const result: THREE.Vector2[] = [];
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i];
    const b = ring[(i + 1) % ring.length];
    const insideA = a.x >= cut;
    const insideB = b.x >= cut;
    if (insideA) result.push(a.clone());
    if (insideA !== insideB) {
      const t = (cut - a.x) / (b.x - a.x);
      result.push(new THREE.Vector2(cut, a.y + t * (b.y - a.y)));
    }
  }
  return result;
}

/** A capped upper floor with no bottom face against the three-story roof. */
function upperFloor(ring: THREE.Vector2[], bottom: number, top: number): THREE.BufferGeometry {
  const vertices: number[] = [];
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i];
    const b = ring[(i + 1) % ring.length];
    if (a.distanceToSquared(b) < 0.0001) continue;
    const a0 = [a.x, bottom, -a.y];
    const b0 = [b.x, bottom, -b.y];
    const a1 = [a.x, top, -a.y];
    const b1 = [b.x, top, -b.y];
    vertices.push(...a0, ...b0, ...b1, ...a0, ...b1, ...a1);
  }
  const roofTriangles = THREE.ShapeUtils.triangulateShape(ring, []);
  for (const [a, b, c] of roofTriangles) {
    const p = ring[a];
    const q = ring[b];
    const r = ring[c];
    const cross = (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
    const v = cross > 0 ? [p, q, r] : [p, r, q];
    for (const point of v) vertices.push(point.x, top, -point.y);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();
  return geometry;
}

export const landmark: LandmarkModule = {
  id: 'way/23502735',
  spec: {
    name: 'A.V. Williams Building',
    color: 0x9d654f,
    height: 18.0,
    roof: 'parapet',
    accent: 0x5c6e74,
  },
  maxHeight: 21.6,
  build({ pts, helpers, baseHeight }) {
    const parts: THREE.BufferGeometry[] = [];
    const bounds = helpers.bboxOf(pts);
    const width = bounds.maxX - bounds.minX;
    const length = bounds.maxY - bounds.minY;
    const lowRoof = 14.0;
    const upper = eastOf(pts, bounds.minX + width * 0.635);
    const wall = new THREE.Color(0x9d654f);
    const roof = new THREE.Color(0x55595a);
    const cream = new THREE.Color(0xbdb8ac);
    const glass = new THREE.Color(0x566d75);

    const add = (geometry: THREE.BufferGeometry, color: THREE.Color) => {
      parts.push(helpers.withColor(geometry, color));
    };
    const box = (
      x0: number, x1: number, n0: number, n1: number,
      y0: number, y1: number, color: THREE.Color,
    ) => {
      if (x1 <= x0 || n1 <= n0 || y1 <= y0) return;
      const geometry = new THREE.BoxGeometry(x1 - x0, y1 - y0, n1 - n0);
      geometry.translate((x0 + x1) / 2, (y0 + y1) / 2, -(n0 + n1) / 2);
      add(geometry, color);
    };

    // Three-story arms and court-facing walls follow every mapped corner.
    add(helpers.extrudeFootprint(pts, lowRoof), wall);
    // The east spine contains the fourth story; the clipped polygon leaves
    // the west tips of both wings lower and keeps the courtyard empty.
    add(upperFloor(upper, lowRoof, baseHeight), wall);

    // Shallow inset membranes read as flat roofs. Both sit above the masonry
    // cap, with no second full-footprint mass at the same height.
    const lowMembrane = helpers.extrudeFootprint(helpers.outsetRing(pts, -0.48), 0.10);
    lowMembrane.translate(0, lowRoof + 0.025, 0);
    add(lowMembrane, roof);
    const upperMembrane = helpers.extrudeFootprint(helpers.outsetRing(upper, -0.45), 0.10);
    upperMembrane.translate(0, baseHeight + 0.025, 0);
    add(upperMembrane, roof);

    // In the Facilities photo, paired windows sit in tall pale bays with
    // broad, uninterrupted brick piers between them. Follow straight mapped
    // edges, including the long inner courtyard face.
    const bays = (ring: THREE.Vector2[], heights: number[], panelBottom: number, panelTop: number) => {
      for (let i = 0; i < ring.length; i++) {
        const a = ring[i];
        const b = ring[(i + 1) % ring.length];
        const edge = new THREE.Vector2().subVectors(b, a);
        const edgeLength = edge.length();
        if (edgeLength < 13) continue;
        const tangent = edge.clone().divideScalar(edgeLength);
        const outward = new THREE.Vector2(tangent.y, -tangent.x);
        const count = Math.max(1, Math.floor((edgeLength - 4) / 8.0));
        const pitch = edgeLength / count;
        const bayWidth = Math.min(2.9, pitch * 0.40);
        const makeSlab = (along: number, span: number, bottom: number, top: number,
          offset: number, depth: number, color: THREE.Color) => {
          const centerX = a.x + tangent.x * along + outward.x * offset;
          const centerN = a.y + tangent.y * along + outward.y * offset;
          const geometry = new THREE.BoxGeometry(span, top - bottom, depth);
          // Local x follows the edge; local +z faces outward in world space.
          geometry.rotateY(Math.atan2(tangent.y, tangent.x));
          geometry.translate(centerX, (bottom + top) / 2, -centerN);
          add(geometry, color);
        };
        for (let j = 0; j < count; j++) {
          const along = (j + 0.5) * pitch;
          makeSlab(along, bayWidth, panelBottom, panelTop, 0.075, 0.06, cream);
          for (const h of heights) {
            for (const side of [-1, 1]) {
              makeSlab(along + side * bayWidth * 0.23, bayWidth * 0.36,
                h, h + 1.9, 0.11, 0.025, glass);
            }
          }
        }
      }
    };
    bays(pts, [1.2, 5.5, 9.8], 0.55, lowRoof - 0.30);
    bays(upper, [15.0], lowRoof + 0.10, baseHeight - 0.28);

    // Three off-white rooftop mechanical housings visible in the UMD photo.
    const mx = bounds.minX + width * 0.73;
    const ex = bounds.minX + width * 0.91;
    const sections: [number, number, number][] = [
      [0.23, 0.35, 2.2],
      [0.53, 0.64, 2.1],
      [0.77, 0.88, 3.2],
    ];
    for (const [start, end, rise] of sections) {
      const n0 = bounds.minY + length * start;
      const n1 = bounds.minY + length * end;
      box(mx, ex, n0, n1, baseHeight + 0.16, baseHeight + rise,
        new THREE.Color(0xd0d0c9));
      box(mx - 0.12, ex + 0.12, n0 - 0.12, n1 + 0.12,
        baseHeight + rise - 0.04, baseHeight + rise + 0.12, cream);
      if (rise > 3) {
        // Vertical louver slots on the tallest mechanical screen.
        for (let i = 0; i < 8; i++) {
          const n = n0 + (i + 1) * (n1 - n0) / 9;
          box(mx - 0.09, mx + 0.015, n - 0.15, n + 0.15,
            baseHeight + 1.6, baseHeight + 2.8, roof);
        }
      }
    }
    return parts;
  },
};
