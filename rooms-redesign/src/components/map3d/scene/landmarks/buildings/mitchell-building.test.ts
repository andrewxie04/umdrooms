import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import campusData from '../../../../../../public/campus-data.json';
import { ringToShapePoints } from '../../geom-utils';
import { makeLandmarkCtx } from '../index';
import { createProjection } from '../../projection';
import type { CampusData } from '../../types';
import { landmark } from './mitchell-building';

const building = campusData.buildings.find((entry) => entry.id === landmark.id)!;
const projection = createProjection(campusData as unknown as CampusData);
const points = ringToShapePoints(building.footprint as [number, number][], projection);
const context = makeLandmarkCtx(points, landmark.spec.height!, landmark.spec);
const bounds = context.helpers.bboxOf(points);
const x = (u: number) => bounds.minX + u * (bounds.maxX - bounds.minX);
const n = (v: number) => bounds.minY + v * (bounds.maxY - bounds.minY);

describe('Mitchell Building landmark', () => {
  it('keeps the four-column entrance open and returns merge-compatible geometry', () => {
    const parts = landmark.build!(context);
    const material = new THREE.MeshBasicMaterial({ vertexColors: true });
    try {
      let highest = 0;
      for (const part of parts) {
        expect(part.index).toBeNull();
        expect(part.getAttribute('uv')).toBeUndefined();
        for (const name of ['position', 'normal', 'color']) {
          const attribute = part.getAttribute(name);
          expect(attribute?.itemSize).toBe(3);
          for (const value of attribute.array) expect(Number.isFinite(value)).toBe(true);
        }
        part.computeBoundingBox();
        highest = Math.max(highest, part.boundingBox!.max.y);
      }
      expect(highest).toBeGreaterThan(12);
      expect(highest).toBeLessThanOrEqual(landmark.maxHeight!);

      const meshes = parts.map((part) => new THREE.Mesh(part, material));
      const underPortico = new THREE.Raycaster(
        new THREE.Vector3(x(0.49), 8.2, -n(0.86)), new THREE.Vector3(0, -1, 0),
      ).intersectObjects(meshes);
      expect(underPortico[0]?.point.y).toBeLessThan(1);

      const westRoof = new THREE.Raycaster(
        new THREE.Vector3(x(0.2), 16, -n(0.52)), new THREE.Vector3(0, -1, 0),
      ).intersectObjects(meshes);
      expect(westRoof[0]?.point.y).toBeGreaterThan(9);
    } finally {
      for (const part of parts) part.dispose();
      material.dispose();
    }
  });
});
