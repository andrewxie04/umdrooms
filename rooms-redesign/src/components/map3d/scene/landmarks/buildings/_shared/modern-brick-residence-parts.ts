import * as THREE from 'three';
import type { LandmarkBuildContext } from '../../types';
import { addFootprint } from './science-parts';

type HallKind = 'oakland' | 'prince-frederick';
type Face = { center: THREE.Vector2; tangent: THREE.Vector2; outward: THREE.Vector2; length: number; index: number };

function faceBox(
  parts: THREE.BufferGeometry[], ctx: LandmarkBuildContext, face: Face,
  along: number, width: number, bottom: number, top: number,
  depth: number, offset: number, color: number,
): void {
  if (top <= bottom) return;
  const point = face.center.clone().addScaledVector(face.tangent, along);
  const box = new THREE.BoxGeometry(width, top - bottom, depth);
  box.rotateY(Math.atan2(face.tangent.y, face.tangent.x));
  box.translate(point.x + face.outward.x * offset, (bottom + top) / 2,
    -(point.y + face.outward.y * offset));
  parts.push(ctx.helpers.withColor(box, ctx.helpers.withGlow(color, ctx.spec.nightGlow)));
}

function exteriorFaces(pts: THREE.Vector2[]): Face[] {
  return pts.map((point, index) => {
    const next = pts[(index + 1) % pts.length];
    const edge = next.clone().sub(point);
    const length = edge.length();
    const tangent = edge.multiplyScalar(1 / length);
    return {
      center: point.clone().add(next).multiplyScalar(0.5), tangent,
      outward: new THREE.Vector2(tangent.y, -tangent.x), length, index,
    };
  });
}

function frontFace(ctx: LandmarkBuildContext, faces: Face[], kind: HallKind): Face {
  const bounds = ctx.helpers.bboxOf(ctx.pts);
  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;
  const desired = kind === 'oakland'
    ? new THREE.Vector2(-0.47, -0.88) : new THREE.Vector2(0, -1);
  const candidates = faces.filter((face) => face.length >= 13);
  return candidates.reduce((best, face) => {
    // Oakland's entry is centered on the long wall inside its U-shaped court.
    // Prince Frederick's glass lobby is beside the inner corner of its L.
    const x = (face.center.x - bounds.minX) / width;
    const y = (face.center.y - bounds.minY) / height;
    const score = kind === 'oakland'
      ? 8 * face.outward.dot(desired) + Math.min(face.length, 50) * 0.035
      : 8 * face.outward.dot(desired) + y * 3 - x * 0.8
        - Math.abs(face.length - 17) * 0.025;
    const bestX = (best.center.x - bounds.minX) / width;
    const bestY = (best.center.y - bounds.minY) / height;
    const bestScore = kind === 'oakland'
      ? 8 * best.outward.dot(desired) + Math.min(best.length, 50) * 0.035
      : 8 * best.outward.dot(desired) + bestY * 3 - bestX * 0.8
        - Math.abs(best.length - 17) * 0.025;
    return score > bestScore ? face : best;
  });
}

/** Geometry follows the mapped bent footprints; the two halls share a brick
 * material family, but their entry bays and floor rhythms are distinct. */
export function buildModernBrickResidence(ctx: LandmarkBuildContext, kind: HallKind): THREE.BufferGeometry[] {
  const { pts, helpers, baseHeight: h } = ctx;
  const parts: THREE.BufferGeometry[] = [];
  const oakland = kind === 'oakland';
  const brick = oakland ? 0x995e4c : 0xa86b53;
  const cream = oakland ? 0xd9d3c4 : 0xd1cec3;
  const trim = oakland ? 0xddd9cc : 0xbec4c0;
  const glass = 0x405964;
  const dark = 0x38474a;
  const base = oakland ? 2.8 : 4.1;
  const upperRows = oakland ? 8 : 6;
  const pitch = (h - base - 0.5) / upperRows;
  const faces = exteriorFaces(pts);
  const front = frontFace(ctx, faces, kind);

  addFootprint(parts, ctx, pts, h - 0.34, brick);
  addFootprint(parts, ctx, helpers.outsetRing(pts, 0.055), base, cream);
  addFootprint(parts, ctx, helpers.outsetRing(pts, 0.12), h - 0.13, trim, h - 0.34);
  addFootprint(parts, ctx, helpers.outsetRing(pts, -0.32), h + 0.06, dark, h - 0.13);

  for (const face of faces) {
    if (face.length < 8) continue;
    if (!oakland && face.length > 20 && Math.abs(face.outward.y) > 0.7) {
      const bays = Math.floor((face.length - 2) / 4.7);
      for (let bay = 0; bay < bays; bay++) {
        const along = -face.length / 2 + (bay + 0.5) * face.length / bays;
        faceBox(parts, ctx, face, along, 2.35, 0.74, 3.42,
          0.08, 0.04, 0x6e8586);
        faceBox(parts, ctx, face, along, 2.12, 0.88, 3.29,
          0.09, 0.10, glass);
      }
    }
    const columns = Math.max(1, Math.floor((face.length - 1.2) / (oakland ? 3.35 : 3.55)));
    const spacing = face.length / columns;
    for (let column = 0; column < columns; column++) {
      const along = -face.length / 2 + spacing * (column + 0.5);
      if (face.index === front.index && Math.abs(along) < (oakland ? 6.1 : 3.7)) continue;
      for (let row = 0; row < upperRows; row++) {
        const bottom = base + 0.60 + row * pitch;
        const top = Math.min(bottom + (oakland ? 1.58 : 1.88), h - 0.58);
        faceBox(parts, ctx, face, along, 1.32, bottom - 0.08, top + 0.08,
          0.065, 0.0325, trim);
        faceBox(parts, ctx, face, along, 1.11, bottom, top,
          0.07, 0.07, glass);
        faceBox(parts, ctx, face, along, 0.075, bottom, top,
          0.078, 0.13, 0xa7b4b4);
      }
    }
    if (!oakland && face.length > 30 && Math.abs(face.outward.y) > 0.65) {
      // Prince Frederick's long brick wings include broad vertical grey
      // window strips, unlike Oakland's more even punched openings.
      for (const fraction of [-0.25, 0.25]) {
        const along = face.length * fraction;
        faceBox(parts, ctx, face, along, 4.1, base + 0.22, h - 0.6,
          0.07, 0.035, 0x758988);
        for (let row = 0; row < upperRows; row++) {
          const bottom = base + 0.64 + row * pitch;
          faceBox(parts, ctx, face, along, 3.2, bottom,
            Math.min(bottom + 1.96, h - 0.7), 0.07, 0.10, glass);
          faceBox(parts, ctx, face, along, 0.09, bottom,
            Math.min(bottom + 1.96, h - 0.7), 0.08, 0.16, trim);
        }
      }
    }
  }

  if (oakland) {
    // The pale elevator/stair tower is the visual center of Oakland's court.
    faceBox(parts, ctx, front, 0, 11.8, 0.35, h - 0.75, 0.40, 0.20, cream);
    faceBox(parts, ctx, front, -0.55, 7.65, 3.65, h - 2.5,
      0.08, 0.44, dark);
    for (let row = 0; row < 7; row++) {
      const bottom = 3.94 + row * 2.86;
      faceBox(parts, ctx, front, -0.55, 7.22, bottom, bottom + 2.25,
        0.09, 0.52, glass);
      faceBox(parts, ctx, front, 2.15, 0.13, bottom, bottom + 2.25,
        0.10, 0.58, trim);
    }
    faceBox(parts, ctx, front, 0, 5.7, 0.45, 3.05, 0.10, 0.45, dark);
    faceBox(parts, ctx, front, 0, 6.4, 3.05, 3.42, 0.28, 0.67, cream);
    faceBox(parts, ctx, front, 0, 11.8, h - 0.75, h + 2.1,
      3.5, -1.4, 0x3b4143);
  } else {
    // The recessed glass stair bay and narrow projecting canopy distinguish
    // Prince Frederick's lobby from its two long residence wings.
    faceBox(parts, ctx, front, 0, 7.4, 0.8, h - 0.46,
      0.15, 0.075, 0x677b7e);
    for (let row = 0; row < 7; row++) {
      const bottom = 1.1 + row * (h - 1.65) / 7;
      faceBox(parts, ctx, front, 0, 6.35, bottom, bottom + 2.55,
        0.07, 0.18, glass);
      faceBox(parts, ctx, front, 0, 0.13, bottom, bottom + 2.55,
        0.09, 0.24, trim);
    }
    faceBox(parts, ctx, front, 0, 8.1, 3.6, 3.9,
      3.8, 1.8, dark);
    faceBox(parts, ctx, front, 0, 5.0, 0.55, 3.55,
      0.12, 0.18, 0x34484c);
    // Residential Facilities records entrances on both sides of this hall.
    const rear = faces
      .filter((face) => face.length > 25 && face.outward.y > 0.8)
      .sort((a, b) => Math.abs(a.center.x - front.center.x)
        - Math.abs(b.center.x - front.center.x))[0];
    if (rear) {
      faceBox(parts, ctx, rear, 0, 5.2, 0.68, 3.54,
        0.12, 0.06, 0x34484c);
      faceBox(parts, ctx, rear, 0, 5.8, 3.53, 3.83,
        2.3, 1.15, dark);
    }
  }
  return parts;
}
