import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import campusData from '../../../../../../public/campus-data.json';
import { ringToShapePoints } from '../../geom-utils';
import { makeLandmarkCtx } from '../index';
import { createProjection } from '../../projection';
import type { CampusData } from '../../types';
import { landmark } from './edward-st-john';

const building = campusData.buildings.find((entry) => entry.id === landmark.id)!;
const projection = createProjection(campusData as unknown as CampusData);
const points = ringToShapePoints(building.footprint as [number, number][], projection);
const context = makeLandmarkCtx(points, landmark.spec.height!, landmark.spec);
const bounds = context.helpers.bboxOf(points);
const x = (u: number) => bounds.minX + u * (bounds.maxX - bounds.minX);
const z = (v: number) => -(bounds.minY + v * (bounds.maxY - bounds.minY));

function createModel() {
  const parts = landmark.build!(context);
  const material = new THREE.MeshBasicMaterial({ vertexColors: true });
  const meshes = parts.map((geometry) => new THREE.Mesh(geometry, material));
  return {
    parts,
    meshes,
    dispose() {
      for (const part of parts) part.dispose();
      material.dispose();
    },
  };
}

function visibleRoofHeights(meshes: THREE.Mesh[], u: number, v: number): number[] {
  const ray = new THREE.Raycaster(new THREE.Vector3(x(u), 35, z(v)), new THREE.Vector3(0, -1, 0));
  return ray.intersectObjects(meshes).map((hit) => hit.point.y).sort((a, b) => b - a);
}

describe('Edward St. John model', () => {
  it('has the aerial reference massing with finite, merge-compatible geometry', () => {
    const model = createModel();
    try {
      for (const part of model.parts) {
        expect(part.index).toBeNull();
        expect(part.getAttribute('uv')).toBeUndefined();
        for (const attribute of ['position', 'normal', 'color']) {
          const data = part.getAttribute(attribute);
          expect(data?.itemSize).toBe(3);
          for (const value of data.array) expect(Number.isFinite(value)).toBe(true);
        }
      }
      const north = visibleRoofHeights(model.meshes, 0.5, 0.8)[0];
      const garden = visibleRoofHeights(model.meshes, 0.37, 0.33)[0];
      const eastGable = visibleRoofHeights(model.meshes, 0.88, 0.25)[0];
      const southGable = visibleRoofHeights(model.meshes, 0.345, 0.13)[0];
      expect(north).toBeGreaterThan(15);
      expect(garden).toBeLessThan(13);
      expect(eastGable).toBeGreaterThan(15);
      expect(southGable).toBeGreaterThan(12.5);
      expect(landmark.maxHeight).toBeGreaterThanOrEqual(eastGable);
    } finally {
      model.dispose();
    }
  });

  it('keeps visible roof surfaces separated while the view moves across the footprint', () => {
    const model = createModel();
    try {
      // Offset samples avoid shared triangle edges; near-equal hits at an
      // ordinary pixel would cause the depth buffer to alternate surfaces.
      for (let i = 0; i < 23; i++) {
        for (let j = 0; j < 21; j++) {
          const hits = visibleRoofHeights(model.meshes, (i + 0.371) / 23, (j + 0.413) / 21);
          for (let k = 1; k < hits.length; k++) {
            expect(hits[k - 1] - hits[k]).toBeGreaterThan(0.025);
          }
        }
      }
    } finally {
      model.dispose();
    }
  });
});
