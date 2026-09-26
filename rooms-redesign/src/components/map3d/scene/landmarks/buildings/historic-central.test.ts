import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import campusData from '../../../../../../public/campus-data.json';
import { ringToShapePoints } from '../../geom-utils';
import { createProjection } from '../../projection';
import type { CampusData } from '../../types';
import { makeLandmarkCtx } from '../index';
import type { LandmarkModule } from '../types';
import { landmark as edu } from './benjamin-building';
import { landmark as key } from './francis-scott-key-hall';
import { landmark as hjp } from './h-j-patterson-hall';
import { landmark as hbk } from './hornbake-library';
import { landmark as jmz } from './jimenez-hall';
import { landmark as lef } from './lefrak-hall';
import { landmark as mmh } from './marie-mount-hall';
import { landmark as arm } from './reckord-armory';
import { landmark as shm } from './shoemaker-building';
import { landmark as skn } from './skinner-building';
import { landmark as sym } from './symons-hall';
import { landmark as tlf } from './taliaferro-hall';
import { landmark as tyd } from './tydings-hall';
import { landmark as wds } from './woods-hall';
import { color, stripWindows } from './historic-central-parts';

const modules: LandmarkModule[] = [edu, key, hjp, hbk, jmz, lef, mmh, arm,
  shm, skn, sym, tlf, tyd, wds];
const projection = createProjection(campusData as unknown as CampusData);

function model(mod: LandmarkModule) {
  const building = campusData.buildings.find((b) => b.id === mod.id);
  if (!building) throw new Error(`Missing footprint: ${mod.id}`);
  const pts = ringToShapePoints(building.footprint as [number, number][], projection);
  const holes = (building.holes ?? []).map((hole) =>
    ringToShapePoints(hole as [number, number][], projection));
  const ctx = makeLandmarkCtx(pts, mod.spec.height ?? building.height ?? 11, mod.spec, holes);
  return { ctx, parts: mod.build!(ctx) };
}

describe('historic/central landmark geometry', () => {
  it('anchors window bays to actual straight edges of a recessed facade', () => {
    const pts = [
      new THREE.Vector2(0, 0), new THREE.Vector2(20, 0),
      new THREE.Vector2(20, 20), new THREE.Vector2(15, 20),
      new THREE.Vector2(15, 5), new THREE.Vector2(5, 5),
      new THREE.Vector2(5, 20), new THREE.Vector2(0, 20),
    ];
    const ctx = makeLandmarkCtx(pts, 10,
      { name: 'U test', color: 0x995544, roof: 'parapet' });
    const parts: THREE.BufferGeometry[] = [];
    try {
      stripWindows(ctx, parts, 'north', [0, 1], [1], 8,
        color(0xeeeeee), color(0x445566));
      expect(parts.length).toBeGreaterThan(6);
      for (const part of parts) {
        part.computeBoundingBox();
        const c = part.boundingBox!.getCenter(new THREE.Vector3());
        const expectedNorth = c.x > 5 && c.x < 15 ? 5 : 20;
        expect(Math.abs(-c.z - expectedNorth)).toBeLessThan(0.35);
      }
    } finally {
      parts.forEach((p) => p.dispose());
    }
  });

  it('builds every named footprint with merge-compatible attributes and a valid height cap', () => {
    for (const mod of modules) {
      const { parts } = model(mod);
      try {
        expect(parts.length, mod.id).toBeGreaterThan(3);
        for (const part of parts) {
          expect(part.index, mod.id).toBeNull();
          expect(part.getAttribute('uv'), mod.id).toBeUndefined();
          for (const key of ['position', 'normal', 'color']) {
            const attr = part.getAttribute(key);
            expect(attr?.itemSize, `${mod.id}: ${key}`).toBe(3);
            for (const value of attr.array) expect(Number.isFinite(value), mod.id).toBe(true);
          }
          part.computeBoundingBox();
          expect(part.boundingBox!.max.y, mod.id).toBeLessThanOrEqual(mod.maxHeight! + 0.001);
        }
      } finally {
        parts.forEach((p) => p.dispose());
      }
    }
  }, 15000);

  it('leaves Benjamin’s mapped interior courtyard open through its roof', () => {
    const { ctx, parts } = model(edu);
    const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
    try {
      expect(ctx.holes).toHaveLength(1);
      const c = ctx.helpers.centroidOf(ctx.holes[0]);
      const meshes = parts.map((part) => new THREE.Mesh(part, material));
      const ray = new THREE.Raycaster(
        new THREE.Vector3(c.cx, 35, -c.cy), new THREE.Vector3(0, -1, 0));
      expect(ray.intersectObjects(meshes)).toHaveLength(0);
    } finally {
      parts.forEach((p) => p.dispose());
      material.dispose();
    }
  });
});
