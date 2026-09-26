// Reusable architectural primitives for the historic/central landmark modules.
// All coordinates are in the landmark shape's east/north metre space. The
// source geometry is native Three.js and every part passes through withColor.
import * as THREE from 'three';
import type { LandmarkBuildContext } from '../types';

export type Parts = THREE.BufferGeometry[];
export type Side = 'north' | 'south' | 'east' | 'west';
export type BoxFractions = [number, number, number, number];

export function color(hex: number): THREE.Color { return new THREE.Color(hex); }

export function rect(x0: number, x1: number, n0: number, n1: number): THREE.Vector2[] {
  return [new THREE.Vector2(x0, n0), new THREE.Vector2(x1, n0),
    new THREE.Vector2(x1, n1), new THREE.Vector2(x0, n1)];
}

export function boundsRect(ctx: LandmarkBuildContext, f: BoxFractions): THREE.Vector2[] {
  const b = ctx.helpers.bboxOf(ctx.pts);
  const x = (t: number) => b.minX + (b.maxX - b.minX) * t;
  const n = (t: number) => b.minY + (b.maxY - b.minY) * t;
  return rect(x(f[0]), x(f[1]), n(f[2]), n(f[3]));
}

export function box(ctx: LandmarkBuildContext, parts: Parts,
  x0: number, x1: number, n0: number, n1: number,
  y0: number, y1: number, shade: THREE.Color): void {
  const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, n1 - n0);
  g.translate((x0 + x1) / 2, (y0 + y1) / 2, -(n0 + n1) / 2);
  parts.push(ctx.helpers.withColor(g, shade));
}

export function fractionBox(ctx: LandmarkBuildContext, parts: Parts, f: BoxFractions,
  y0: number, y1: number, shade: THREE.Color): void {
  const b = ctx.helpers.bboxOf(ctx.pts);
  box(ctx, parts,
    b.minX + (b.maxX - b.minX) * f[0], b.minX + (b.maxX - b.minX) * f[1],
    b.minY + (b.maxY - b.minY) * f[2], b.minY + (b.maxY - b.minY) * f[3],
    y0, y1, shade);
}

export function brickShell(ctx: LandmarkBuildContext, parts: Parts,
  wallY: number, brick: THREE.Color, stone: THREE.Color, roof: THREE.Color,
  roofInset = 0.978): void {
  const { pts, holes, cx, cy, helpers } = ctx;
  const extrude = (outer: THREE.Vector2[], depth: number, holeClearance = 0) =>
    holes.length > 0
      ? helpers.extrudeWithHoles(outer,
        holes.map((h) => helpers.outsetRing(h, holeClearance)), depth)
      : helpers.extrudeFootprint(outer, depth);
  parts.push(helpers.withColor(extrude(pts, wallY), brick));
  parts.push(helpers.withColor(
    extrude(helpers.outsetRing(pts, 0.10), 0.55, 0.20), stone));
  parts.push(helpers.withColor(
    // The stone cap must finish above the brick roof face. When both ended
    // at wallY, their broad upward triangles occupied the same depth plane
    // and alternated colors during camera motion.
    extrude(helpers.outsetRing(pts, 0.16), 0.45, 0.25)
      .translate(0, wallY - 0.35, 0), stone));
  parts.push(helpers.withColor(
    extrude(helpers.scaleAbout(pts, cx, cy, roofInset), 0.12, 0.35)
      .translate(0, wallY + 0.10, 0), roof));
}

export function hip(ctx: LandmarkBuildContext, parts: Parts, f: BoxFractions,
  wallY: number, rise: number, shade: THREE.Color): void {
  parts.push(ctx.helpers.withColor(
    ctx.helpers.buildHippedRoof(boundsRect(ctx, f), wallY + 0.24, rise), shade));
}

type FacadePoint = { x: number; north: number; tx: number; tn: number; outX: number; outN: number };

// Find the outermost mapped wall crossing an east/north axis coordinate.
export function facadePointAt(ctx: LandmarkBuildContext, side: Side, along: number,
  clearance = 0): FacadePoint | undefined {
  const horizontal = side === 'north' || side === 'south';
  let outermost: FacadePoint | undefined;
  let outerFace = side === 'north' || side === 'east' ? -Infinity : Infinity;
  for (let j = 0; j < ctx.pts.length; j++) {
    const a = ctx.pts[j], z = ctx.pts[(j + 1) % ctx.pts.length];
    const dx = z.x - a.x, dn = z.y - a.y;
    const length = Math.hypot(dx, dn);
    if (length < 0.01) continue;
    const tx = dx / length, tn = dn / length;
    const outX = tn, outN = -tx; // outward right normal of CCW outer ring
    if (horizontal ? Math.abs(tx) < 0.92 : Math.abs(tn) < 0.92) continue;
    if (side === 'north' && outN < 0.85) continue;
    if (side === 'south' && outN > -0.85) continue;
    if (side === 'east' && outX < 0.85) continue;
    if (side === 'west' && outX > -0.85) continue;
    const aa = horizontal ? a.x : a.y;
    const zz = horizontal ? z.x : z.y;
    if (along < Math.min(aa, zz) + clearance ||
      along > Math.max(aa, zz) - clearance) continue;
    const u = (along - aa) / (zz - aa);
    const x = a.x + dx * u, north = a.y + dn * u;
    const face = horizontal ? north : x;
    if (outermost && (side === 'north' || side === 'east' ? face <= outerFace : face >= outerFace)) continue;
    outerFace = face;
    outermost = { x, north, tx, tn, outX, outN };
  }
  return outermost;
}

export function stripWindows(ctx: LandmarkBuildContext, parts: Parts,
  side: Side, along: [number, number], floors: number[], count: number,
  trim: THREE.Color, glass: THREE.Color): void {
  const b = ctx.helpers.bboxOf(ctx.pts);
  const horizontal = side === 'north' || side === 'south';
  const total = horizontal ? b.maxX - b.minX : b.maxY - b.minY;
  const start = horizontal ? b.minX : b.minY;
  const half = Math.min(1.03, total * (along[1] - along[0]) / count * 0.29);
  for (let i = 0; i < count; i++) {
    const t = along[0] + (along[1] - along[0]) * (i + 0.5) / count;
    const c = start + total * t;
    // A bbox extremity is not necessarily a wall on U/L/stepped footprints.
    const edge = facadePointAt(ctx, side, c, half + 0.24);
    if (!edge) continue;
    const angle = Math.atan2(edge.tn, edge.tx);
    const panel = (y0: number, y1: number, width: number,
      offset: number, shade: THREE.Color) => {
      const g = new THREE.BoxGeometry(width, y1 - y0, 0.10);
      g.rotateY(angle);
      g.translate(edge.x + edge.outX * offset, (y0 + y1) / 2,
        -(edge.north + edge.outN * offset));
      parts.push(ctx.helpers.withColor(g, shade));
    };
    for (const y of floors) {
      panel(y - 0.12, y + 2.25, 2 * (half + 0.13), 0.12, trim);
      panel(y + 0.12, y + 2.00, 2 * half, 0.20, glass);
      panel(y + 2.20, y + 2.43, 2 * (half + 0.22), 0.26, trim);
    }
  }
}

export interface PorticoOptions {
  side: Side;
  width: number;
  depth: number;
  columns: number;
  baseY?: number;
  columnHeight: number;
  pediment?: number;
  center?: number;
  faceOffset?: number;
}

export function portico(ctx: LandmarkBuildContext, parts: Parts,
  opts: PorticoOptions, stone: THREE.Color, dark: THREE.Color): void {
  const b = ctx.helpers.bboxOf(ctx.pts);
  const horizontal = opts.side === 'north' || opts.side === 'south';
  const axisMin = horizontal ? b.minX : b.minY;
  const axisMax = horizontal ? b.maxX : b.maxY;
  const center = axisMin + (axisMax - axisMin) * (opts.center ?? 0.5);
  const wall = facadePointAt(ctx, opts.side, center);
  if (!wall) return;
  const faceBase = horizontal ? wall.north : wall.x;
  const outward = opts.side === 'north' || opts.side === 'east' ? 1 : -1;
  const face = faceBase + outward * (opts.faceOffset ?? 0);
  const outer = face + outward * opts.depth;
  const baseY = opts.baseY ?? 0;
  const top = baseY + opts.columnHeight;
  const half = opts.width / 2;
  const cross0 = Math.min(face - outward * 0.5, outer);
  const cross1 = Math.max(face - outward * 0.5, outer);
  if (horizontal) {
    box(ctx, parts, center - half - 0.7, center + half + 0.7,
      cross0, cross1, baseY, baseY + 0.44, stone);
    box(ctx, parts, center - half - 0.6, center + half + 0.6,
      cross0, cross1, top, top + 1.15, stone);
    box(ctx, parts, center - half * 0.72, center + half * 0.72,
      face - 0.15, face + 0.15, baseY + 0.48, baseY + 3.2, dark);
  } else {
    box(ctx, parts, cross0, cross1, center - half - 0.7, center + half + 0.7,
      baseY, baseY + 0.44, stone);
    box(ctx, parts, cross0, cross1, center - half - 0.6, center + half + 0.6,
      top, top + 1.15, stone);
    box(ctx, parts, face - 0.15, face + 0.15,
      center - half * 0.72, center + half * 0.72,
      baseY + 0.48, baseY + 3.2, dark);
  }
  for (let i = 0; i < opts.columns; i++) {
    const c = center - half + (i + 0.5) * opts.width / opts.columns;
    const col = new THREE.CylinderGeometry(0.38, 0.48, opts.columnHeight - 0.45, 10);
    const x = horizontal ? c : outer - outward * 0.75;
    const north = horizontal ? outer - outward * 0.75 : c;
    col.translate(x, baseY + 0.44 + (opts.columnHeight - 0.45) / 2, -north);
    parts.push(ctx.helpers.withColor(col, stone));
    box(ctx, parts, x - 0.65, x + 0.65, north - 0.65, north + 0.65,
      top - 0.38, top + 0.1, stone);
  }
  if (opts.pediment && opts.pediment > 0) {
    const shape = new THREE.Shape([
      new THREE.Vector2(-half - 0.5, 0),
      new THREE.Vector2(half + 0.5, 0),
      new THREE.Vector2(0, opts.pediment),
    ]);
    const g = new THREE.ExtrudeGeometry(shape, {
      depth: Math.max(0.7, opts.depth - 0.4), bevelEnabled: false,
    });
    if (horizontal) g.translate(center, top + 1.16, -Math.max(face, outer));
    else {
      g.rotateY(Math.PI / 2);
      g.translate(Math.min(face, outer), top + 1.16, -center);
    }
    parts.push(ctx.helpers.withColor(g, stone));
  }
}

export function cupola(ctx: LandmarkBuildContext, parts: Parts,
  x: number, north: number, y: number, stone: THREE.Color, roof: THREE.Color): void {
  const add = (g: THREE.BufferGeometry, shade: THREE.Color) =>
    parts.push(ctx.helpers.withColor(g, shade));
  const drum = new THREE.CylinderGeometry(2.55, 2.55, 0.72, 8);
  drum.translate(x, y + 0.36, -north);
  add(drum, stone);
  // The photographed lantern is open between slender white uprights. An
  // octagonal ring reads as a cupola at map scale without a solid white cube.
  for (let i = 0; i < 8; i++) {
    const angle = Math.PI * 2 * i / 8 + Math.PI / 8;
    const col = new THREE.CylinderGeometry(0.17, 0.20, 2.85, 7);
    col.translate(x + Math.cos(angle) * 1.87, y + 2.17,
      -(north + Math.sin(angle) * 1.87));
    add(col, stone);
  }
  const cornice = new THREE.CylinderGeometry(2.63, 2.38, 0.52, 8);
  cornice.translate(x, y + 3.86, -north);
  add(cornice, stone);
  const cap = new THREE.ConeGeometry(2.57, 1.82, 8);
  cap.rotateY(Math.PI / 8);
  cap.translate(x, y + 5.02, -north);
  add(cap, stone);
  const finial = new THREE.CylinderGeometry(0.08, 0.12, 0.82, 6);
  finial.translate(x, y + 6.32, -north);
  add(finial, roof);
}
