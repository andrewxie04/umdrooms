import { expect, it } from 'vitest';
import * as THREE from 'three';
import campusData from '../../../../../../public/campus-data.json';
import { createProjection } from '../../projection';
import { ringToShapePoints } from '../../geom-utils';
import type { CampusData } from '../../types';
import { LANDMARK_MODULES, makeLandmarkCtx } from '..';

const data = campusData as unknown as CampusData;
const projection = createProjection(data);

function distanceToRing(x: number, north: number, ring: THREE.Vector2[]): number {
  let nearest = Infinity;
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i];
    const b = ring[(i + 1) % ring.length];
    const dx = b.x - a.x;
    const dn = b.y - a.y;
    const t = THREE.MathUtils.clamp(((x - a.x) * dx + (north - a.y) * dn) / (dx * dx + dn * dn), 0, 1);
    nearest = Math.min(nearest, Math.hypot(x - a.x - t * dx, north - a.y - t * dn));
  }
  return nearest;
}

it('keeps small custom facade panes attached across the named campus models', () => {
  const failures: string[] = [];
  let checked = 0;
  for (const building of data.buildings) {
    const module = LANDMARK_MODULES[building.id];
    // Parking decks intentionally recess dark bay openings behind the piers.
    if (!building.name || /garage/i.test(building.name) || !module?.build) continue;
    const ring = ringToShapePoints(building.footprint, projection);
    const holes = (building.holes ?? []).map((hole) => ringToShapePoints(hole, projection));
    const ctx = makeLandmarkCtx(ring, module.spec.height ?? building.height ?? 11, module.spec, holes);
    const parts = module.build(ctx);
    try {
      for (const part of parts) {
        part.computeBoundingBox();
        const box = part.boundingBox!;
        // The historic facade helper produces 1.88m glazed bays. Other
        // detailed models use this height too; include those when they are
        // individual panes rather than whole facade sections.
        if (Math.abs(box.max.y - box.min.y - 1.88) > 0.01 ||
          Math.max(box.max.x - box.min.x, box.max.z - box.min.z) > 4.5) continue;
        checked++;
        const vertices = part.getAttribute('position');
        let furthest = 0;
        for (let i = 0; i < vertices.count; i++) {
          const x = vertices.getX(i);
          const north = -vertices.getZ(i);
          furthest = Math.max(furthest, Math.min(distanceToRing(x, north, ring),
            ...holes.map((hole) => distanceToRing(x, north, hole))));
        }
        if (furthest > 0.45 && failures.length < 20) {
          failures.push(`${building.name}: ${furthest.toFixed(2)}m`);
        }
      }
    } finally {
      parts.forEach((part) => part.dispose());
    }
  }
  expect(checked).toBeGreaterThan(200);
  expect(failures).toEqual([]);
}, 15000);
