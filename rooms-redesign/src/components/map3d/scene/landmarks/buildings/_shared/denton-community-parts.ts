import * as THREE from 'three';
import type { LandmarkBuildContext } from '../../types';
import { addFootprint } from './science-parts';

interface HallStyle {
  height: number;
  brick: number;
  entranceDirection: [number, number];
  archedGroundFloor?: boolean;
}

function wallPanel(
  parts: THREE.BufferGeometry[], ctx: LandmarkBuildContext,
  center: THREE.Vector2, tangent: THREE.Vector2, outward: THREE.Vector2,
  width: number, bottom: number, top: number, depth: number, offset: number, color: number,
): void {
  const g = new THREE.BoxGeometry(width, top - bottom, depth);
  g.rotateY(Math.atan2(tangent.y, tangent.x));
  g.translate(center.x + outward.x * offset, (bottom + top) / 2, -(center.y + outward.y * offset));
  parts.push(ctx.helpers.withColor(g, ctx.helpers.withGlow(color, ctx.spec.nightGlow)));
}

/** The three 1960s Denton Community towers share a brick high-rise vocabulary.
 * Keep their actual mapped outlines and heights; give each its own brick tone,
 * courtyard-facing stone entry, and roof profile seen in UMD's photos. */
export function buildDentonCommunityHall(ctx: LandmarkBuildContext, style: HallStyle): THREE.BufferGeometry[] {
  const parts: THREE.BufferGeometry[] = [];
  const { pts, helpers } = ctx;
  const stone = 0xc9c6bd;
  const stoneShade = 0xaaa9a3;
  const glazing = 0x344b57;
  const roof = 0x747a7b;
  const h = style.height;

  addFootprint(parts, ctx, pts, h - 0.36, style.brick);
  // A continuous pale ground plinth and coping keep the wide towers from
  // reading as featureless brick slabs at walking and aerial camera angles.
  addFootprint(parts, ctx, helpers.outsetRing(pts, 0.08), 0.72, stoneShade);
  addFootprint(parts, ctx, helpers.outsetRing(pts, 0.12), h, stone, h - 0.36);
  addFootprint(parts, ctx, helpers.outsetRing(pts, -0.38), h + 0.08, roof, h);

  // Select a short central edge facing the 251 North courtyard. The mapped
  // towers have small entrance projections; selecting by compass direction
  // avoids depending on OSM ring order after winding normalization.
  const target = new THREE.Vector2(...style.entranceDirection).normalize();
  let entrance: { center: THREE.Vector2; tangent: THREE.Vector2; outward: THREE.Vector2; length: number } | null = null;
  let best = -Infinity;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const edge = b.clone().sub(a);
    const length = edge.length();
    if (length < 6 || length > 17) continue;
    const tangent = edge.multiplyScalar(1 / length);
    const outward = new THREE.Vector2(tangent.y, -tangent.x);
    const center = a.clone().add(b).multiplyScalar(0.5);
    const position = center.clone().sub(new THREE.Vector2(ctx.cx, ctx.cy)).normalize();
    const score = outward.dot(target) * 2 + position.dot(target) - Math.abs(length - 9) * 0.015;
    if (score > best) {
      best = score;
      entrance = { center, tangent, outward, length };
    }
  }
  if (entrance) {
    const { center, tangent, outward, length } = entrance;
    const width = Math.min(7.4, length - 0.5);
    // Recessed dark doors, a broad light-stone frame and projecting lintel.
    wallPanel(parts, ctx, center, tangent, outward, width, 0.8, 5.25, 0.34, 0.22, stone);
    wallPanel(parts, ctx, center, tangent, outward, width - 1.35, 1.02, 4.48, 0.37, 0.45, glazing);
    wallPanel(parts, ctx, center, tangent, outward, 0.18, 1.02, 4.48, 0.42, 0.69, stoneShade);
    wallPanel(parts, ctx, center, tangent, outward, width + 0.85, 4.5, 5.18, 0.66, 0.55, stone);
    wallPanel(parts, ctx, center, tangent, outward, width + 1.1, 0.26, 0.64, 2.2, 0.9, stoneShade);
    // Elkton's photographed ground level has pale arches beside the entry.
    if (style.archedGroundFloor) {
      for (const side of [-1, 1]) {
        const sideCenter = center.clone().addScaledVector(tangent, side * (width * 0.57 + 1.2));
        wallPanel(parts, ctx, sideCenter, tangent, outward, 2.3, 1.0, 4.1, 0.25, 0.20, stone);
        wallPanel(parts, ctx, sideCenter, tangent, outward, 1.55, 1.28, 3.76, 0.28, 0.36, glazing);
      }
    }
  }

  // Dark, low roof housings are kept near the center so they remain within
  // each hall's long narrow mapped footprint.
  const roofUnit = new THREE.BoxGeometry(5.1, 0.65, 3.3);
  roofUnit.translate(ctx.cx, h + 0.35, -ctx.cy);
  parts.push(helpers.withColor(roofUnit, helpers.withGlow(0x939893, ctx.spec.nightGlow)));
  return parts;
}
