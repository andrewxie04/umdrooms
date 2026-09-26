import * as THREE from 'three';
import type { LandmarkBuildContext } from '../../types';
import { addFootprint } from './science-parts';

interface CambridgeHallProfile {
  brick: number;
  entranceDirection: [number, number];
  entranceWidth: number;
  portico: 'framed' | 'four-column' | 'two-column';
  steps?: boolean;
}

function faceBox(
  parts: THREE.BufferGeometry[], ctx: LandmarkBuildContext,
  center: THREE.Vector2, tangent: THREE.Vector2, outward: THREE.Vector2,
  width: number, bottom: number, top: number, depth: number, offset: number, color: number,
): void {
  const geom = new THREE.BoxGeometry(width, top - bottom, depth);
  geom.rotateY(Math.atan2(tangent.y, tangent.x));
  geom.translate(center.x + outward.x * offset, (bottom + top) / 2, -(center.y + outward.y * offset));
  parts.push(ctx.helpers.withColor(geom, ctx.helpers.withGlow(color, ctx.spec.nightGlow)));
}

function entranceEdge(ctx: LandmarkBuildContext, direction: [number, number]) {
  const target = new THREE.Vector2(...direction).normalize();
  const buildingCenter = new THREE.Vector2(ctx.cx, ctx.cy);
  let best: { center: THREE.Vector2; tangent: THREE.Vector2; outward: THREE.Vector2; length: number } | null = null;
  let bestScore = -Infinity;
  for (let i = 0; i < ctx.pts.length; i++) {
    const a = ctx.pts[i];
    const b = ctx.pts[(i + 1) % ctx.pts.length];
    const edge = b.clone().sub(a);
    const length = edge.length();
    if (length < 7) continue;
    const tangent = edge.multiplyScalar(1 / length);
    const outward = new THREE.Vector2(tangent.y, -tangent.x);
    const center = a.clone().add(b).multiplyScalar(0.5);
    const displacement = center.clone().sub(buildingCenter);
    const faceScore = outward.dot(target);
    const centerScore = 1 - Math.min(1, displacement.length() / 70);
    const score = faceScore * 4 + centerScore + Math.min(length, 30) * 0.015;
    if (score > bestScore) {
      best = { center, tangent, outward, length };
      bestScore = score;
    }
  }
  return bestScore > 2 ? best : null;
}

/** Native footprint geometry for the five Cambridge Community halls.
 * UMD's building photos distinguish the three low brick halls from the two
 * long towers; each module supplies its own color, entrance and height. */
export function buildCambridgeCommunityHall(
  ctx: LandmarkBuildContext, profile: CambridgeHallProfile,
): THREE.BufferGeometry[] {
  const { helpers, pts, baseHeight: height } = ctx;
  const parts: THREE.BufferGeometry[] = [];
  const stone = 0xd7d3c8;
  const stoneShadow = 0xb4b2aa;
  const roof = 0x555957;
  const glass = 0x334d53;
  const isTower = profile.portico === 'two-column';

  addFootprint(parts, ctx, pts, height - 0.28, profile.brick);
  addFootprint(parts, ctx, helpers.outsetRing(pts, 0.07), 0.44, stoneShadow);
  addFootprint(parts, ctx, helpers.outsetRing(pts, 0.10), height, stone, height - 0.28);
  addFootprint(parts, ctx, helpers.outsetRing(pts, -0.28), height + 0.08, roof, height);

  const edge = entranceEdge(ctx, profile.entranceDirection);
  if (edge) {
    const { center, tangent, outward } = edge;
    const width = Math.min(profile.entranceWidth, edge.length - 0.8);
    const top = profile.portico === 'four-column' ? Math.min(height - 0.7, 11.7) : isTower ? 5.35 : 4.45;
    const columned = profile.portico !== 'framed';
    // The low halls have a solid stone doorway surround. Cambridge and the
    // towers have open porticos: brick remains visible between their columns.
    if (!columned) {
      faceBox(parts, ctx, center, tangent, outward, width + 0.7, 0.55, top, 0.42, 0.20, stone);
    }
    const doorWidth = columned ? Math.min(3.8, width - 1.0) : width - 1.0;
    const doorTop = Math.min(top - 0.55, 3.82);
    faceBox(parts, ctx, center, tangent, outward, doorWidth, 1.05, doorTop, 0.50, 0.51, glass);
    faceBox(parts, ctx, center, tangent, outward, 0.13, 1.05, doorTop, 0.56, 0.80, stoneShadow);
    if (columned) {
      for (const side of [-1, 1]) {
        const jamb = center.clone().addScaledVector(tangent, side * (doorWidth / 2 + 0.16));
        faceBox(parts, ctx, jamb, tangent, outward, 0.28, 0.88, doorTop + 0.22, 0.51, 0.53, stone);
      }
      faceBox(parts, ctx, center, tangent, outward, doorWidth + 0.58,
        doorTop, doorTop + 0.28, 0.57, 0.54, stone);
    }
    faceBox(parts, ctx, center, tangent, outward, width + 1.1, top - 0.45, top + 0.06,
      0.77, 0.49, stone);

    const count = profile.portico === 'four-column' ? 4 : isTower ? 2 : 0;
    for (let i = 0; i < count; i++) {
      const distance = count === 4 ? (i - 1.5) * (width / 3.3) : (i - 0.5) * (width - 1.2);
      const colCenter = center.clone().addScaledVector(tangent, distance);
      faceBox(parts, ctx, colCenter, tangent, outward, count === 4 ? 0.54 : 0.45,
        0.62, top - 0.4, 0.56, 1.0, stone);
      faceBox(parts, ctx, colCenter, tangent, outward, count === 4 ? 0.92 : 0.73,
        top - 0.64, top - 0.30, 0.83, 1.0, stoneShadow);
    }

    if (profile.steps) {
      for (let step = 0; step < 3; step++) {
        faceBox(parts, ctx, center, tangent, outward,
          width + 1.6 + step * 0.55, 0.03, 0.62 - step * 0.16,
          0.95, 1.25 + step * 0.57, stoneShadow);
      }
    }
  }

  // The taller halls have a low rooftop plant room visible above the dark
  // roof plane. Keep it centered so it stays within the mapped narrow slab.
  if (isTower) {
    const unit = new THREE.BoxGeometry(4.4, 0.42, 2.8);
    unit.translate(ctx.cx, height + 0.29, -ctx.cy);
    parts.push(helpers.withColor(unit, helpers.withGlow(0x8e9693, ctx.spec.nightGlow)));
  }
  return parts;
}
