// 251 North / Denton Area Dining Hall. UMD Dining Services' exterior photo
// shows a low, warm-brick facade, pale stone door and window surrounds, and
// a shallow dark roof edge. The unnamed OSM footprint is the building under
// the 251 North dining marker in the Denton community.
import * as THREE from 'three';
import type { LandmarkModule, LandmarkBuildContext } from '../types';
import { addFootprint } from './_shared/science-parts';

function facadePanel(
  parts: THREE.BufferGeometry[], ctx: LandmarkBuildContext,
  a: THREE.Vector2, b: THREE.Vector2, t: number, width: number,
  bottom: number, top: number, depth: number, color: number,
  setback = 0,
): void {
  const dx = b.x - a.x;
  const dn = b.y - a.y;
  const length = Math.hypot(dx, dn);
  if (length < width || top <= bottom) return;
  const cx = a.x + dx * t;
  const cn = a.y + dn * t;
  // The wall is angled on the map. A panel's center is nudged away from the
  // building centroid so its face stays visible over the brick shell.
  const outwardX = cx - ctx.cx;
  const outwardN = cn - ctx.cy;
  const outwardLength = Math.hypot(outwardX, outwardN) || 1;
  const panel = new THREE.BoxGeometry(width, top - bottom, depth);
  panel.rotateY(Math.atan2(dn, dx));
  panel.translate(
    cx + outwardX / outwardLength * setback,
    (bottom + top) / 2,
    -(cn + outwardN / outwardLength * setback),
  );
  parts.push(ctx.helpers.withColor(panel, ctx.helpers.withGlow(color, ctx.spec.nightGlow)));
}

export const landmark: LandmarkModule = {
  id: 'way/23899291',
  spec: {
    name: '251 North Dining Hall',
    color: 0x9a6a59,
    accent: 0x586b68,
    height: 7.5,
    roof: 'parapet',
    nightGlow: 0.15,
  },
  maxHeight: 8.1,
  build(ctx) {
    const parts: THREE.BufferGeometry[] = [];
    const brick = 0x9a6a59;
    const stone = 0xc9c6b9;
    const glass = 0x465b5d;

    addFootprint(parts, ctx, ctx.pts, 7.5, brick);
    addFootprint(parts, ctx, ctx.helpers.outsetRing(ctx.pts, 0.16), 7.64, stone, 7.5);
    addFootprint(parts, ctx, ctx.helpers.outsetRing(ctx.pts, -0.36), 7.72, 0x5d6260, 7.64);

    // The long side facing the north-campus pedestrian paths carries the
    // recognizable window and recessed entrance from UMD's photograph.
    // ringToShapePoints normalizes the clockwise OSM outline to CCW. In that
    // normalized ring, 12→13 is the long eastern face; 0→1 is opposite it.
    const a = ctx.pts[12];
    const b = ctx.pts[13];
    facadePanel(parts, ctx, a, b, 0.27, 7.4, 1.15, 5.65, 0.24, stone, 0.12);
    facadePanel(parts, ctx, a, b, 0.27, 6.4, 1.55, 5.25, 0.27, glass, 0.20);
    for (const t of [0.235, 0.305]) {
      facadePanel(parts, ctx, a, b, t, 0.15, 1.55, 5.25, 0.34, stone, 0.25);
    }
    facadePanel(parts, ctx, a, b, 0.68, 6.2, 0.2, 6.4, 0.28, stone, 0.12);
    facadePanel(parts, ctx, a, b, 0.68, 4.8, 0.2, 5.7, 0.31, 0x545453, 0.20);
    facadePanel(parts, ctx, a, b, 0.68, 3.9, 0.35, 5.5, 0.34, glass, 0.25);
    facadePanel(parts, ctx, a, b, 0.68, 0.14, 0.35, 5.5, 0.41, stone, 0.30);

    // A few tall windows continue around the opposite long wall, while the
    // roof stays nearly flat, as it reads in the campus aerial.
    const oppositeA = ctx.pts[0];
    const oppositeB = ctx.pts[1];
    for (const t of [0.22, 0.39, 0.56, 0.73]) {
      facadePanel(parts, ctx, oppositeA, oppositeB, t, 2.1, 1.5, 5.2, 0.25, stone, 0.12);
      facadePanel(parts, ctx, oppositeA, oppositeB, t, 1.58, 1.85, 4.9, 0.29, glass, 0.19);
    }
    return parts;
  },
};
