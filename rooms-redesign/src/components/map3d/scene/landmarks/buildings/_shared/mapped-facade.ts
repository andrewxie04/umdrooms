import * as THREE from 'three';
import type { LandmarkBuildContext } from '../../types';

type FractionPoint = readonly [number, number];

export interface MappedEdge {
  start: THREE.Vector2;
  tangent: THREE.Vector2;
  outward: THREE.Vector2;
  length: number;
}

/** Use a surveyed footprint segment directly when its index is known. */
export function footprintEdge(pts: THREE.Vector2[], index: number): MappedEdge {
  const start = pts[index];
  const end = pts[(index + 1) % pts.length];
  const vector = end.clone().sub(start);
  const length = vector.length();
  const tangent = vector.multiplyScalar(1 / length);
  const area = pts.reduce((sum, p, i) => {
    const q = pts[(i + 1) % pts.length];
    return sum + p.x * q.y - q.x * p.y;
  }, 0);
  const side = area >= 0 ? 1 : -1;
  return { start, tangent, outward: new THREE.Vector2(tangent.y * side, -tangent.x * side), length };
}

/** Resolve a photographed wall from its approximate footprint endpoints.
 * The edge, rather than the bounding box, supplies both angle and setback. */
export function mappedEdge(
  pts: THREE.Vector2[], bbox: { minX: number; maxX: number; minY: number; maxY: number },
  first: FractionPoint, last: FractionPoint,
): MappedEdge {
  const target = ([fx, fn]: FractionPoint) => new THREE.Vector2(
    bbox.minX + fx * (bbox.maxX - bbox.minX),
    bbox.minY + fn * (bbox.maxY - bbox.minY),
  );
  const aTarget = target(first);
  const bTarget = target(last);
  let best = 0;
  let bestScore = Infinity;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const score = Math.min(
      a.distanceToSquared(aTarget) + b.distanceToSquared(bTarget),
      a.distanceToSquared(bTarget) + b.distanceToSquared(aTarget),
    );
    if (score < bestScore) { bestScore = score; best = i; }
  }
  return footprintEdge(pts, best);
}

/** A shallow pane or mullion with its back embedded just inside the wall. */
export function facadeBoxOnEdge(
  parts: THREE.BufferGeometry[], ctx: LandmarkBuildContext, edge: MappedEdge,
  from: number, to: number, bottom: number, top: number,
  depth: number, outset: number, color: THREE.Color,
): void {
  const geometry = new THREE.BoxGeometry(edge.length * (to - from), top - bottom, depth);
  geometry.rotateY(Math.atan2(edge.tangent.y, edge.tangent.x));
  const center = edge.start.clone().addScaledVector(edge.tangent, edge.length * (from + to) / 2)
    .addScaledVector(edge.outward, outset);
  geometry.translate(center.x, (bottom + top) / 2, -center.y);
  parts.push(ctx.helpers.withColor(geometry, color));
}
