import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import campusData from '../../../../../../public/campus-data.json';
import { ringToShapePoints } from '../../geom-utils';
import { createProjection } from '../../projection';
import type { CampusData } from '../../types';
import { makeLandmarkCtx } from '../index';
import { landmark } from './secu-stadium';

function insideRing(point: THREE.Vector2, ring: THREE.Vector2[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i];
    const b = ring[j];
    if ((a.y > point.y) !== (b.y > point.y) &&
        point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x) {
      inside = !inside;
    }
  }
  return inside;
}

describe('SECU Stadium field', () => {
  it('occupies a full-sized playing rectangle in the open bowl, clear of the seating band', () => {
    const data = campusData as unknown as CampusData;
    const building = data.buildings.find((entry) => entry.id === landmark.id)!;
    const footprint = ringToShapePoints(building.footprint, createProjection(data));
    const context = makeLandmarkCtx(footprint, landmark.spec.height!, landmark.spec);
    const parts = landmark.build!(context);
    try {
      // The field follows the mapped wall and its surrounding apron.
      const turf = parts[2];
      const positions = turf.getAttribute('position');
      const corners = new Map<string, THREE.Vector2>();
      for (let i = 0; i < positions.count; i++) {
        if (Math.abs(positions.getY(i) - 1.025) > 0.001) continue;
        const point = new THREE.Vector2(positions.getX(i), -positions.getZ(i));
        corners.set(`${point.x.toFixed(3)},${point.y.toFixed(3)}`, point);
      }
      const top = [...corners.values()];
      expect(top).toHaveLength(4);
      const distances: number[] = [];
      for (let i = 0; i < top.length; i++) {
        expect(insideRing(top[i], footprint)).toBe(false);
        for (let j = i + 1; j < top.length; j++) distances.push(top[i].distanceTo(top[j]));
      }
      distances.sort((a, b) => a - b);
      expect(distances[0]).toBeCloseTo(48.768, 1);
      expect(distances[2]).toBeCloseTo(109.728, 1);

      const center = top.reduce((sum, point) => sum.add(point), new THREE.Vector2())
        .multiplyScalar(1 / top.length);
      const ray = new THREE.Raycaster(
        new THREE.Vector3(center.x, 40, -center.y),
        new THREE.Vector3(0, -1, 0),
      );
      const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
      try {
        const hits = ray.intersectObjects(parts.map((part) => new THREE.Mesh(part, material)));
        expect(hits[0]?.point.y).toBeLessThan(1.2);
      } finally {
        material.dispose();
      }
    } finally {
      for (const part of parts) part.dispose();
    }
  });
});
