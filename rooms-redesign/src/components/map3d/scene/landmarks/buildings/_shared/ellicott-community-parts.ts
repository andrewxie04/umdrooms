import * as THREE from 'three';
import type { LandmarkBuildContext } from '../../types';
import { addFootprint } from './science-parts';

interface HallProfile {
  height: number;
  brick: number;
  baseHeight: number;
  entranceDirection: [number, number];
  entranceWidth: number;
  pairedDoors?: boolean;
  entrySteps?: boolean;
}

function orientedBox(
  parts: THREE.BufferGeometry[], ctx: LandmarkBuildContext,
  center: THREE.Vector2, tangent: THREE.Vector2, outward: THREE.Vector2,
  width: number, bottom: number, top: number, depth: number, offset: number, color: number,
): void {
  const g = new THREE.BoxGeometry(width, top - bottom, depth);
  g.rotateY(Math.atan2(tangent.y, tangent.x));
  g.translate(center.x + outward.x * offset, (bottom + top) / 2, -(center.y + outward.y * offset));
  parts.push(ctx.helpers.withColor(g, ctx.helpers.withGlow(color, ctx.spec.nightGlow)));
}

/** The Ellicott Community towers: brick upper floors on pale entrances.
 * Official photographs show a much broader white lower register than the
 * nearby Denton group; La Plata has a raised, stepped entrance instead. */
export function buildEllicottCommunityHall(ctx: LandmarkBuildContext, profile: HallProfile): THREE.BufferGeometry[] {
  const parts: THREE.BufferGeometry[] = [];
  const { pts, helpers } = ctx;
  const limestone = 0xd5d2c8;
  const trim = 0xb7b8b1;
  const glass = 0x3d525b;
  const roof = 0x6c7273;
  const h = profile.height;

  addFootprint(parts, ctx, pts, h - 0.35, profile.brick);
  addFootprint(parts, ctx, helpers.outsetRing(pts, 0.06), profile.baseHeight, limestone);
  addFootprint(parts, ctx, helpers.outsetRing(pts, 0.12), profile.baseHeight + 0.24, trim, profile.baseHeight);
  addFootprint(parts, ctx, helpers.outsetRing(pts, 0.12), h, limestone, h - 0.35);
  addFootprint(parts, ctx, helpers.outsetRing(pts, -0.4), h + 0.08, roof, h);

  const target = new THREE.Vector2(...profile.entranceDirection).normalize();
  let entry: { center: THREE.Vector2; tangent: THREE.Vector2; outward: THREE.Vector2; length: number } | null = null;
  let highest = -Infinity;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const edge = b.clone().sub(a);
    const length = edge.length();
    if (length < 7 || length > 17) continue;
    const tangent = edge.multiplyScalar(1 / length);
    const outward = new THREE.Vector2(tangent.y, -tangent.x);
    const center = a.clone().add(b).multiplyScalar(0.5);
    const position = center.clone().sub(new THREE.Vector2(ctx.cx, ctx.cy)).normalize();
    const score = 2 * outward.dot(target) + position.dot(target) - Math.abs(length - 10) * 0.01;
    if (score > highest) {
      highest = score;
      entry = { center, tangent, outward, length };
    }
  }
  if (entry) {
    const { center, tangent, outward, length } = entry;
    const width = Math.min(profile.entranceWidth, length - 0.3);
    const top = Math.max(4.9, profile.baseHeight + 1.25);
    orientedBox(parts, ctx, center, tangent, outward, width, 0.48, top, 0.38, 0.21, limestone);
    if (profile.pairedDoors) {
      for (const side of [-1, 1]) {
        const doorCenter = center.clone().addScaledVector(tangent, side * width * 0.28);
        orientedBox(parts, ctx, doorCenter, tangent, outward, width * 0.3, 0.9, 3.66, 0.43, 0.5, glass);
        orientedBox(parts, ctx, doorCenter, tangent, outward, width * 0.36, 3.66, 3.94, 0.46, 0.56, trim);
      }
      orientedBox(parts, ctx, center, tangent, outward, 1.35, 1.25, 3.65, 0.43, 0.5, glass);
    } else {
      orientedBox(parts, ctx, center, tangent, outward, width * 0.6, 0.9, 3.7, 0.43, 0.5, glass);
      orientedBox(parts, ctx, center, tangent, outward, 0.16, 0.9, 3.7, 0.47, 0.73, trim);
    }
    orientedBox(parts, ctx, center, tangent, outward, width + 0.55, top - 0.38, top + 0.14, 0.68, 0.5, limestone);
    if (profile.entrySteps) {
      for (let step = 0; step < 3; step++) {
        orientedBox(parts, ctx, center, tangent, outward,
          width + 1.7 + step * 0.7, 0, 0.55 - step * 0.14,
          1.1, 1.15 + step * 0.65, trim);
      }
    }
  }

  const roofHouse = new THREE.BoxGeometry(5.4, 0.65, 3.1);
  roofHouse.translate(ctx.cx, h + 0.34, -ctx.cy);
  parts.push(helpers.withColor(roofHouse, helpers.withGlow(0x9ea39d, ctx.spec.nightGlow)));
  return parts;
}
