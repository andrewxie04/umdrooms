import * as THREE from 'three';
import { expect, it } from 'vitest';
import campusData from '../../../../../../public/campus-data.json';
import { ringToShapePoints } from '../../geom-utils';
import { createProjection } from '../../projection';
import type { CampusData } from '../../types';
import { makeLandmarkCtx } from '../index';
import { landmark } from './memorial-chapel';

it('places the Chapel tower and front portico on the Regents Drive (east) end', () => {
  const building = campusData.buildings.find((item) => item.id === landmark.id);
  if (!building) throw new Error('Memorial Chapel footprint is missing');
  const projection = createProjection(campusData as unknown as CampusData);
  const pts = ringToShapePoints(building.footprint as [number, number][], projection);
  const ctx = makeLandmarkCtx(pts, building.height ?? 11, landmark.spec);
  const { minX, maxX } = ctx.helpers.bboxOf(pts);
  const midpoint = (minX + maxX) / 2;
  const parts = landmark.build!(ctx);
  try {
    for (const part of parts) {
      expect(part.index).toBeNull();
      expect(part.getAttribute('uv')).toBeUndefined();
      for (const key of ['position', 'normal', 'color']) {
        expect(part.getAttribute(key)?.itemSize).toBe(3);
      }
      part.computeBoundingBox();
      expect(part.boundingBox!.max.y).toBeLessThanOrEqual(landmark.maxHeight! + 0.001);
    }
    // Body and three roof pieces precede the tower; the portico gable is last.
    const tower = parts[4];
    const frontPediment = parts.at(-1)!;
    const towerCenter = tower.boundingBox!.getCenter(new THREE.Vector3());
    expect(towerCenter.x).toBeGreaterThan(midpoint);
    expect(frontPediment.boundingBox!.min.x).toBeGreaterThan(midpoint);
    expect(frontPediment.boundingBox!.max.x).toBeGreaterThan(maxX);
  } finally {
    parts.forEach((part) => part.dispose());
  }
});
