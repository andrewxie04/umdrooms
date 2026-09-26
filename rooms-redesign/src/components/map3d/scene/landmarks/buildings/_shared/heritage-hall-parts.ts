import * as THREE from 'three';
import type { LandmarkBuildContext } from '../../types';
import { addFootprint } from './science-parts';

interface HeritageHallProfile {
  entranceDirection: [number, number];
  wall: number;
  accent: number;
}

function facadeBox(
  parts: THREE.BufferGeometry[], ctx: LandmarkBuildContext,
  center: THREE.Vector2, tangent: THREE.Vector2, outward: THREE.Vector2,
  width: number, bottom: number, top: number, depth: number, offset: number, color: number,
): void {
  const geom = new THREE.BoxGeometry(width, top - bottom, depth);
  geom.rotateY(Math.atan2(tangent.y, tangent.x));
  geom.translate(center.x + outward.x * offset, (bottom + top) / 2, -(center.y + outward.y * offset));
  parts.push(ctx.helpers.withColor(geom, ctx.helpers.withGlow(color, ctx.spec.nightGlow)));
}

/** Pyon-Chen and Johnson-Whittle: light six-floor wings around a dark public
 * first level. All plan geometry follows the mapped, bent building footprint. */
export function buildHeritageHall(ctx: LandmarkBuildContext, profile: HeritageHallProfile): THREE.BufferGeometry[] {
  const { pts, helpers, baseHeight: height } = ctx;
  const parts: THREE.BufferGeometry[] = [];
  const glass = 0x3c535c;
  const frame = 0x626b6c;
  const canopy = 0x3b4142;

  addFootprint(parts, ctx, pts, 0.58, 0x8b5948);
  addFootprint(parts, ctx, pts, 3.72, glass, 0.58);
  addFootprint(parts, ctx, pts, height - 0.28, profile.wall, 3.72);
  addFootprint(parts, ctx, helpers.outsetRing(pts, 0.12), height, profile.accent, height - 0.28);
  addFootprint(parts, ctx, helpers.outsetRing(pts, -0.32), height + 0.10, 0x525b5d, height);

  const desiredFace = new THREE.Vector2(...profile.entranceDirection).normalize();
  let entry: { center: THREE.Vector2; tangent: THREE.Vector2; outward: THREE.Vector2; length: number } | null = null;
  let entryScore = -Infinity;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const delta = b.clone().sub(a);
    const length = delta.length();
    if (length < 7) continue;
    const tangent = delta.multiplyScalar(1 / length);
    const outward = new THREE.Vector2(tangent.y, -tangent.x);
    const center = a.clone().add(b).multiplyScalar(0.5);
    const score = outward.dot(desiredFace) * 4
      + (1 - Math.min(1, center.distanceTo(new THREE.Vector2(ctx.cx, ctx.cy)) / 75))
      + Math.min(length, 30) * 0.018;
    if (score > entryScore) {
      entry = { center, tangent, outward, length };
      entryScore = score;
    }

    // Slim dark window slots, five upper rows plus the glazed ground floor.
    // Their floor pitch follows UMD's documented six levels rather than the
    // generic campus-wide window spacing.
    if (length < 9) continue;
    const columns = Math.max(1, Math.floor((length - 2) / 3.05));
    for (let column = 0; column < columns; column++) {
      const distance = (column + 0.5) * length / columns;
      const windowCenter = a.clone().addScaledVector(tangent, distance);
      for (let floor = 0; floor < 5; floor++) {
        const bottom = 4.20 + floor * 3.14;
        const top = Math.min(bottom + 2.28, height - 0.62);
        facadeBox(parts, ctx, windowCenter, tangent, outward, 1.04,
          bottom - 0.07, top + 0.07, 0.045, 0.0225, frame);
        facadeBox(parts, ctx, windowCenter, tangent, outward, 0.88,
          bottom, top, 0.055, 0.07, glass);
      }
    }
  }

  if (entry && entryScore > 2) {
    const { center, tangent, outward } = entry;
    const width = Math.min(10.2, entry.length - 0.5);
    facadeBox(parts, ctx, center, tangent, outward, width - 1.4,
      0.56, 3.52, 0.34, 0.34, 0x2d4147);
    for (const side of [-1, 1]) {
      const mullion = center.clone().addScaledVector(tangent, side * width * 0.20);
      facadeBox(parts, ctx, mullion, tangent, outward, 0.13,
        0.65, 3.50, 0.38, 0.59, 0xb7c2c0);
    }
    // The long dark flat canopy is the clearest landmark at walking height.
    facadeBox(parts, ctx, center, tangent, outward, width + 1.6,
      3.56, 3.98, 3.3, 1.45, canopy);
    for (const side of [-1, 1]) {
      const support = center.clone().addScaledVector(tangent, side * (width / 2 - 0.8));
      facadeBox(parts, ctx, support, tangent, outward, 0.18,
        0.60, 3.56, 0.18, 2.15, frame);
    }
  }
  return parts;
}
