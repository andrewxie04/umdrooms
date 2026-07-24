// src/components/map3d/scene/geom-utils.ts
//
// Low-level pure geometry helpers shared by geometry.ts and the landmark
// builder modules (scene/landmarks/). Leaf module: imports only three.js and
// type-only Projection — nothing here imports geometry.ts or landmarks/, so
// there are no import cycles. Every function was MOVED VERBATIM out of
// geometry.ts (same behavior, same comments); the only new addition is
// extrudeWithHoles, which generalizes the stadium-bowl ring extrusion.
//
// Local frame reminder: x = east, z = south, y = up, ground at y = 0. "Shape
// space" is the 2D projection plane (x = east, y = north); extrusions are
// built in shape space then rotateX(-PI/2) into y-up world space.

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Projection } from './projection';

/** Deterministic 32-bit hash -> [0, 1). FNV-1a + finalizer. */
export function hash01(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 13;
  h = Math.imul(h, 0x5bd1e995);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

export function signedArea(pts: THREE.Vector2[]): number {
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    s += a.x * b.y - b.x * a.y;
  }
  return s / 2;
}

/**
 * [lng, lat] ring -> shape-space Vector2s (x = east, y = north), deduped,
 * closure point removed, normalized to CCW so triangulated faces point up
 * after rotateX(-PI/2).
 */
export function ringToShapePoints(ring: [number, number][], proj: Projection): THREE.Vector2[] {
  const pts: THREE.Vector2[] = [];
  for (const [lng, lat] of ring) {
    const p = proj.toLocal(lng, lat);
    const v = new THREE.Vector2(p.x, -p.z); // shape space: y = north
    const last = pts[pts.length - 1];
    if (last && Math.abs(last.x - v.x) < 0.05 && Math.abs(last.y - v.y) < 0.05) continue;
    pts.push(v);
  }
  while (pts.length > 1) {
    const first = pts[0];
    const last = pts[pts.length - 1];
    if (Math.abs(first.x - last.x) < 0.05 && Math.abs(first.y - last.y) < 0.05) pts.pop();
    else break;
  }
  if (signedArea(pts) < 0) pts.reverse();
  return pts;
}

/**
 * Normalizes a geometry for merging: non-indexed, no uv, with a constant
 * per-vertex color. Returns the original geometry when already compatible.
 */
export function withColor(geom: THREE.BufferGeometry, color: THREE.Color): THREE.BufferGeometry {
  const g = geom.index ? geom.toNonIndexed() : geom;
  g.deleteAttribute('uv');
  const count = g.getAttribute('position').count;
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    arr[i * 3] = color.r;
    arr[i * 3 + 1] = color.g;
    arr[i * 3 + 2] = color.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  return g;
}

export function mergeAll(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  if (parts.length === 0) return new THREE.BufferGeometry();
  return mergeGeometries(parts, false) ?? new THREE.BufferGeometry();
}

/** Shape-space footprint ring -> extruded solid, y-up world orientation. */
export function extrudeFootprint(pts: THREE.Vector2[], depth: number): THREE.BufferGeometry {
  const geom = new THREE.ExtrudeGeometry(new THREE.Shape(pts), {
    depth,
    bevelEnabled: false,
    curveSegments: 1,
  });
  geom.rotateX(-Math.PI / 2); // (x, north, depth) -> (x, up=depth, z=-north)
  return geom;
}

/** Shape-space outer ring + hole rings -> extruded band (e.g. a stadium
 * bowl), y-up world orientation. Each hole ring is given in the SAME winding
 * as the outer ring (CCW); it is reversed internally because THREE holes
 * must wind opposite the outer shape. */
export function extrudeWithHoles(
  outer: THREE.Vector2[],
  holes: THREE.Vector2[][],
  depth: number,
): THREE.BufferGeometry {
  const shape = new THREE.Shape(outer);
  for (const hole of holes) {
    shape.holes.push(new THREE.Path([...hole].reverse())); // holes wind opposite the outer ring
  }
  const geom = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: false,
    curveSegments: 1,
  });
  geom.rotateX(-Math.PI / 2);
  return geom;
}

export function centroidOf(pts: THREE.Vector2[]): { cx: number; cy: number } {
  let cx = 0;
  let cy = 0;
  for (const p of pts) {
    cx += p.x;
    cy += p.y;
  }
  return { cx: cx / pts.length, cy: cy / pts.length };
}

export function scaleAbout(pts: THREE.Vector2[], cx: number, cy: number, s: number): THREE.Vector2[] {
  return pts.map((p) => new THREE.Vector2(cx + (p.x - cx) * s, cy + (p.y - cy) * s));
}

export function bboxOf(pts: THREE.Vector2[]): { minX: number; maxX: number; minY: number; maxY: number } {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const p of pts) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, maxX, minY, maxY };
}

/** Pushes every ring vertex outward from the footprint centroid by a FIXED
 * distance in meters — deliberately NOT a scale factor, so narrow wings and
 * thin buildings get the same clearance as wide ones. Pass a NEGATIVE offset
 * to inset the ring instead. */
export function outsetRing(pts: THREE.Vector2[], offset: number): THREE.Vector2[] {
  const { cx, cy } = centroidOf(pts);
  return pts.map((p) => {
    let ox = p.x - cx;
    let oy = p.y - cy;
    const l = Math.hypot(ox, oy);
    if (l < 1e-3) return new THREE.Vector2(p.x + offset, p.y);
    ox /= l;
    oy /= l;
    return new THREE.Vector2(p.x + ox * offset, p.y + oy * offset);
  });
}
