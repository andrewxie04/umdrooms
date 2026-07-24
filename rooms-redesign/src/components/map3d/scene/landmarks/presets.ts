// src/components/map3d/scene/landmarks/presets.ts
//
// The five shared preset roof treatments (parapet / hipped / spire / bowl /
// glass), MOVED VERBATIM from geometry.ts (the former landmarkParts path).
// geometry.ts renders any landmark module WITHOUT a custom `build` through
// landmarkPresetParts — this is the legacy code path, byte-for-byte, so all
// preset landmarks stay pixel-identical.
//
// NOTE on nightGlow: the buildings material emissive is global
// (scene.ts/palette.ts), so true per-landmark emissive isn't possible without
// changing scene.ts — instead nightGlow lerps the landmark's vertex colors
// slightly toward warm amber, which reads as a subtle warm tint under the
// night palette.

import * as THREE from 'three';
import {
  bboxOf,
  centroidOf,
  extrudeFootprint,
  extrudeWithHoles,
  scaleAbout,
  withColor,
} from '../geom-utils';
import type { LandmarkSpec } from './types';

export const NIGHT_GLOW_TINT = new THREE.Color(0xffc98a); // warm amber
export const NIGHT_GLOW_STRENGTH = 0.18; // lerp amount at nightGlow = 1 — deliberately subtle

export function withGlow(hex: number, glow: number | undefined): THREE.Color {
  const c = new THREE.Color(hex);
  if (glow && glow > 0) c.lerp(NIGHT_GLOW_TINT, Math.min(1, glow) * NIGHT_GLOW_STRENGTH);
  return c;
}

export function darkerShade(c: THREE.Color, dl = -0.055): THREE.Color {
  const d = c.clone();
  d.offsetHSL(0, 0, dl);
  return d;
}

/**
 * Hipped roof: the footprint ring at baseY converges to a ridge segment along
 * the footprint's longest bbox axis at baseY + rise. Each ring edge is fanned
 * to the nearer ridge endpoint; seam triangles close the surface where the
 * assignment flips. Built in shape space (z = up), then rotateX(-PI/2) like
 * the extrusions. Non-indexed with flat per-face normals.
 */
export function buildHippedRoof(pts: THREE.Vector2[], baseY: number, rise: number): THREE.BufferGeometry {
  const { minX, maxX, minY, maxY } = bboxOf(pts);
  const { cx, cy } = centroidOf(pts);
  const longX = maxX - minX >= maxY - minY;
  const ridgeHalf = 0.25 * Math.max(maxX - minX, maxY - minY);
  const r1 = longX ? { x: cx - ridgeHalf, y: cy } : { x: cx, y: cy - ridgeHalf };
  const r2 = longX ? { x: cx + ridgeHalf, y: cy } : { x: cx, y: cy + ridgeHalf };
  const apexY = baseY + rise;

  const positions: number[] = [];
  /** Appends a triangle, swapping winding if its normal points down (-z). */
  const pushUpTri = (
    ax: number, ay: number, az: number,
    bx: number, by: number, bz: number,
    cx2: number, cy2: number, cz2: number,
  ): void => {
    const crossZ = (bx - ax) * (cy2 - ay) - (by - ay) * (cx2 - ax);
    if (crossZ < 0) positions.push(ax, ay, az, cx2, cy2, cz2, bx, by, bz);
    else positions.push(ax, ay, az, bx, by, bz, cx2, cy2, cz2);
  };
  const near = (px: number, py: number): { x: number; y: number } => {
    const d1 = (px - r1.x) ** 2 + (py - r1.y) ** 2;
    const d2 = (px - r2.x) ** 2 + (py - r2.y) ** 2;
    return d1 <= d2 ? r1 : r2;
  };

  let firstApex: { x: number; y: number } | null = null;
  let prevApex: { x: number; y: number } | null = null;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const apex = near((a.x + b.x) / 2, (a.y + b.y) / 2);
    if (prevApex && apex !== prevApex) {
      // seam where the fan switches from one ridge endpoint to the other
      pushUpTri(a.x, a.y, baseY, prevApex.x, prevApex.y, apexY, apex.x, apex.y, apexY);
    }
    pushUpTri(a.x, a.y, baseY, b.x, b.y, baseY, apex.x, apex.y, apexY);
    if (!firstApex) firstApex = apex;
    prevApex = apex;
  }
  if (prevApex && firstApex && prevApex !== firstApex) {
    // wrap-around seam at pts[0]
    pushUpTri(pts[0].x, pts[0].y, baseY, prevApex.x, prevApex.y, apexY, firstApex.x, firstApex.y, apexY);
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.rotateX(-Math.PI / 2);
  geom.computeVertexNormals(); // non-indexed -> flat per-face normals
  return geom;
}

/** Renders a landmark spec through its preset `roof` treatment. This is the
 * exact former geometry.ts landmarkParts — the fallback path for landmark
 * modules that don't define a custom `build`. */
export function landmarkPresetParts(
  pts: THREE.Vector2[],
  height: number,
  spec: LandmarkSpec,
): THREE.BufferGeometry[] {
  const base = withGlow(spec.color, spec.nightGlow);
  const accent = spec.accent != null ? withGlow(spec.accent, spec.nightGlow) : base;
  const { cx, cy } = centroidOf(pts);

  switch (spec.roof) {
    case 'parapet': {
      // Rooftop setback: footprint x0.82 about the centroid, +1.8m, darker.
      return [
        withColor(extrudeFootprint(pts, height), base),
        withColor(extrudeFootprint(scaleAbout(pts, cx, cy, 0.82), height + 1.8), darkerShade(base)),
      ];
    }
    case 'hipped': {
      // Rise keeps the real tagged total height when one exists (>= 2.5m).
      const baseH = height * 0.8;
      return [
        withColor(extrudeFootprint(pts, baseH), base),
        withColor(buildHippedRoof(pts, baseH, Math.max(2.5, height - baseH)), darkerShade(base, -0.075)),
      ];
    }
    case 'spire': {
      const { minX, maxX, minY, maxY } = bboxOf(pts);
      const radius = 0.12 * Math.min(maxX - minX, maxY - minY);
      const cone = new THREE.ConeGeometry(radius, 12, 10);
      cone.translate(cx, height + 6, -cy); // world: x east, z = -north; cone is centered, so base sits at `height`
      return [withColor(extrudeFootprint(pts, height), base), withColor(cone, accent)];
    }
    case 'bowl': {
      // Outer band (1.0x..0.78x) at full height + inner field mass at 35%.
      const inner = scaleAbout(pts, cx, cy, 0.78);
      return [
        withColor(extrudeWithHoles(pts, [inner], height), base),
        withColor(extrudeFootprint(inner, height * 0.35), accent),
      ];
    }
    case 'glass':
    default:
      return [withColor(extrudeFootprint(pts, height), base)];
  }
}
