import * as THREE from 'three';
import type { LandmarkBuildContext } from '../../types';

/** Small, y-up primitives for the science and engineering landmark modules. */
export function addBox(
  parts: THREE.BufferGeometry[], ctx: LandmarkBuildContext,
  x0: number, x1: number, north0: number, north1: number,
  bottom: number, top: number, hex: number,
): void {
  if (x1 <= x0 || north1 <= north0 || top <= bottom) return;
  const g = new THREE.BoxGeometry(x1 - x0, top - bottom, north1 - north0);
  g.translate((x0 + x1) / 2, (bottom + top) / 2, -(north0 + north1) / 2);
  parts.push(ctx.helpers.withColor(g, ctx.helpers.withGlow(hex, ctx.spec.nightGlow)));
}

export function addCylinder(
  parts: THREE.BufferGeometry[], ctx: LandmarkBuildContext,
  x: number, north: number, radius: number, bottom: number, top: number,
  hex: number, segments = 24,
): void {
  const g = new THREE.CylinderGeometry(radius, radius, top - bottom, segments);
  g.translate(x, (bottom + top) / 2, -north);
  parts.push(ctx.helpers.withColor(g, ctx.helpers.withGlow(hex, ctx.spec.nightGlow)));
}

export function addFootprint(
  parts: THREE.BufferGeometry[], ctx: LandmarkBuildContext,
  ring: THREE.Vector2[], height: number, hex: number, bottom = 0,
): void {
  const g = ctx.helpers.extrudeFootprint(ring, height - bottom);
  if (bottom) g.translate(0, bottom, 0);
  parts.push(ctx.helpers.withColor(g, ctx.helpers.withGlow(hex, ctx.spec.nightGlow)));
}

export function fractionBox(
  parts: THREE.BufferGeometry[], ctx: LandmarkBuildContext,
  west: number, east: number, south: number, north: number,
  bottom: number, top: number, hex: number,
): void {
  const b = ctx.helpers.bboxOf(ctx.pts);
  const x = (f: number) => b.minX + (b.maxX - b.minX) * f;
  const n = (f: number) => b.minY + (b.maxY - b.minY) * f;
  addBox(parts, ctx, x(west), x(east), n(south), n(north), bottom, top, hex);
}
