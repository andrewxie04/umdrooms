import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import campusData from '../../../../../../public/campus-data.json';
import { ringToShapePoints } from '../../geom-utils';
import { createProjection } from '../../projection';
import type { CampusData } from '../../types';
import { makeLandmarkCtx } from '../index';
import { landmark } from './mckeldin-library';

const building = campusData.buildings.find((entry) => entry.id === landmark.id)!;
const projection = createProjection(campusData as unknown as CampusData);
const points = ringToShapePoints(building.footprint as [number, number][], projection);
const context = makeLandmarkCtx(points, building.height!, landmark.spec);

describe('McKeldin Library model', () => {
  it('keeps the mall-facing portico open in front of the east wall', () => {
    const parts = landmark.build!(context);
    const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
    try {
      const bbox = context.helpers.bboxOf(points);
      const faceX = bbox.maxX - 7.3;
      const porchMiddle = context.cy + 0.5;
      const ray = new THREE.Raycaster(
        new THREE.Vector3(bbox.maxX + 3, 10, -porchMiddle),
        new THREE.Vector3(-1, 0, 0),
      );
      const hit = ray.intersectObjects(parts.map((part) => new THREE.Mesh(part, material)))[0];
      expect(hit).toBeDefined();
      // At this height, halfway between the center columns, the first wall
      // must be behind the porch rather than at its outer footprint edge.
      expect(hit.point.x).toBeLessThan(faceX + 1.2);
      expect(hit.point.x).toBeGreaterThan(faceX - 0.1);
    } finally {
      parts.forEach((part) => part.dispose());
      material.dispose();
    }
  });
});
