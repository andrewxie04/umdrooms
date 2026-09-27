import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import campus from '../../../../public/campus-data.json';
import { createProjection } from './projection';
import type { CampusData } from './types';
import { landmark } from './landmarks/buildings/secu-stadium';
import { makeLandmarkCtx } from './landmarks';
import { ringToShapePoints } from './geom-utils';
import { ballArc, initSports, sportsFrames } from './sports';

const data = campus as unknown as CampusData;

describe('mini sports scenes', () => {
  it('lands passes at their endpoints without a ground intersection', () => {
    expect(ballArc(0, 2, 1, 8)).toBe(2);
    expect(ballArc(1, 2, 1, 8)).toBe(1);
    for (let i = 0; i <= 100; i++) expect(ballArc(i / 100, 2, 1, 8)).toBeGreaterThanOrEqual(1);
  });

  it('keeps football players and balls over the modeled turf throughout a play', () => {
    const projection = createProjection(data);
    const stadium = data.buildings.find(b => b.id === landmark.id)!;
    const parts = landmark.build!(makeLandmarkCtx(ringToShapePoints(stadium.footprint, projection), landmark.spec.height!, landmark.spec));
    const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
    const turf = new THREE.Mesh(parts[2], material);
    const scene = new THREE.Scene();
    const frame = sportsFrames(data, projection)[0];
    const camera = new THREE.PerspectiveCamera(70, 1, 1, 4000);
    camera.position.set(frame.x, 150, frame.z + 60);
    camera.lookAt(frame.x, 0, frame.z);
    const sports = initSports(scene, camera, data, projection);
    const ray = new THREE.Raycaster();
    const transform = new THREE.Matrix4();
    const position = new THREE.Vector3();
    for (let tick = 0; tick < 90; tick++) {
      sports.update(0.1);
      scene.updateMatrixWorld(true);
      const group = scene.getObjectByName('mini-football')!;
      const rounds = group.children[1] as THREE.InstancedMesh;
      for (let i = 0; i < rounds.count; i++) {
        rounds.getMatrixAt(i, transform);
        position.setFromMatrixPosition(transform).applyMatrix4(group.matrixWorld);
        position.y = 40;
        ray.set(position, new THREE.Vector3(0, -1, 0));
        expect(ray.intersectObject(turf).length).toBeGreaterThan(0);
      }
    }
    sports.dispose();
    parts.forEach(part => part.dispose()); material.dispose();
  });

  it('animates three venues with bounded instance counts and releases resources', () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, 1, 1, 4000);
    const projection = createProjection(data);
    const sports = initSports(scene, camera, data, projection);
    const frames = sportsFrames(data, projection);
    expect(frames.map(f => f.sport)).toEqual(['football', 'soccer', 'baseball']);
    const previous = new THREE.Matrix4();
    const current = new THREE.Matrix4();
    for (const frame of frames) {
      camera.position.set(frame.x, 150, frame.z + 60);
      camera.lookAt(frame.x, 0, frame.z);
      sports.update(0);
      const group = scene.getObjectByName(`mini-${frame.sport}`)!;
      expect(group.visible).toBe(true);
      const balls = group.children[1] as THREE.InstancedMesh;
      balls.getMatrixAt(balls.count - 1, previous);
      sports.update(0.8);
      balls.getMatrixAt(balls.count - 1, current);
      expect(current.equals(previous)).toBe(false);
      for (let tick = 0; tick < 240; tick++) {
        sports.update(0.05);
        for (const child of group.children) {
          const mesh = child as THREE.InstancedMesh;
          expect(mesh.count).toBeGreaterThan(0);
          expect(mesh.count).toBeLessThanOrEqual(mesh.instanceMatrix.count);
          expect(Array.from(mesh.instanceMatrix.array).every(Number.isFinite)).toBe(true);
        }
      }
    }
    camera.position.set(10000, 500, 10000);
    sports.update(0.1);
    expect(scene.children.every(group => !group.visible)).toBe(true);
    sports.dispose();
    expect(scene.children).toHaveLength(0);
  });
});
