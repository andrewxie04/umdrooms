import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import campusData from '../../../../../../public/campus-data.json';
import { centroidOf, ringToShapePoints } from '../../geom-utils';
import { createProjection } from '../../projection';
import type { CampusData } from '../../types';
import { makeLandmarkCtx } from '..';
import { landmark } from './physical-sciences-complex';

describe('Physical Sciences Complex model', () => {
  it('uses the actual complex footprint and leaves the mapped atrium open', () => {
    const data = campusData as unknown as CampusData;
    const building = data.buildings.find((item) => item.id === landmark.id)!;
    expect(landmark.id).toBe('relation/2909990');
    expect(building.name).toBe('Physical Sciences Complex');
    const projection = createProjection(data);
    const pts = ringToShapePoints(building.footprint, projection);
    const holes = building.holes!.map((ring) => ringToShapePoints(ring, projection));
    expect(holes).toHaveLength(1);
    const [mainMass] = landmark.build!(makeLandmarkCtx(pts, landmark.spec.height!, landmark.spec, holes));
    const { cx, cy } = centroidOf(holes[0]);
    const mesh = new THREE.Mesh(mainMass, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
    const ray = new THREE.Raycaster(new THREE.Vector3(cx, 50, -cy), new THREE.Vector3(0, -1, 0));
    expect(ray.intersectObject(mesh)).toHaveLength(0);
    mesh.material.dispose();
    mainMass.dispose();
  });
});
