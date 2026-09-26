import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import campusData from '../../../../public/campus-data.json';
import campusTrees from '../../../../public/campus-trees.json';
import { buildSceneGeometries, buildingMaxHeight, buildingSolidGeometry } from './geometry';
import { LANDMARK_MODULES } from './landmarks';
import { createProjection } from './projection';
import type { CampusBuilding, CampusData } from './types';

const center: [number, number] = [-76.9426, 38.9869];
const east = 0.0002;
const north = 0.0002;

function square(halfLng: number, halfLat: number): [number, number][] {
  return [
    [center[0] - halfLng, center[1] - halfLat],
    [center[0] + halfLng, center[1] - halfLat],
    [center[0] + halfLng, center[1] + halfLat],
    [center[0] - halfLng, center[1] + halfLat],
  ];
}

function fixture(buildings: CampusBuilding[] = [], trees: CampusData['trees'] = []): CampusData {
  return {
    center,
    bbox: [-76.958, 38.976, -76.918, 38.995],
    buildings,
    trees,
    roads: [],
    areas: [],
    waterways: [],
  };
}

function expectFiniteGeometry(geometry: THREE.BufferGeometry, needsColor = true): void {
  const positions = geometry.getAttribute('position');
  expect(positions?.count).toBeGreaterThan(0);
  for (const name of needsColor ? ['position', 'normal', 'color'] : ['position', 'normal']) {
    const attribute = geometry.getAttribute(name);
    expect(attribute?.count).toBe(positions.count);
    for (const value of attribute.array) expect(Number.isFinite(value)).toBe(true);
  }
}

describe('campus rendering data contracts', () => {
  it('keeps surveyed tree geometry at supplied positions with merge-compatible attributes', () => {
    const data = fixture([], [
      [center[0] - east, center[1], 12, 4, 0],
      [center[0] + east, center[1], 15, 3, 1],
    ]);
    const projection = createProjection(data);
    const trees = buildSceneGeometries(data, projection).trees;
    expectFiniteGeometry(trees);
    expect(trees.getAttribute('seasonSeed')?.count).toBe(trees.getAttribute('position').count);

    const left = projection.toLocal(center[0] - east, center[1]);
    const right = projection.toLocal(center[0] + east, center[1]);
    trees.computeBoundingBox();
    expect(trees.boundingBox!.min.x).toBeLessThan(left.x);
    expect(trees.boundingBox!.max.x).toBeGreaterThan(right.x);

    const withoutTrees = buildSceneGeometries(fixture(), projection).trees;
    expect(withoutTrees.getAttribute('position')).toBeUndefined();
  });

  it('builds a finite selection shell above the building, while leaving its courtyard open', () => {
    const building: CampusBuilding = {
      id: 'fixture/courtyard',
      height: 14,
      footprint: square(east, north),
      holes: [square(east / 3, north / 3)],
    };
    const projection = createProjection(fixture([building]));
    const shell = buildingSolidGeometry(building, projection);
    expect(shell).not.toBeNull();
    expectFiniteGeometry(shell!, false);
    shell!.computeBoundingBox();
    expect(shell!.boundingBox!.max.y).toBeGreaterThan(buildingMaxHeight(building));

    const mesh = new THREE.Mesh(shell!, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
    const ray = new THREE.Raycaster(new THREE.Vector3(0, 50, 0), new THREE.Vector3(0, -1, 0));
    expect(ray.intersectObject(mesh)).toHaveLength(0);
    mesh.material.dispose();
    shell!.dispose();
  });

  it('keeps generic rooftop structures above the roof and below the selection shell', () => {
    const building: CampusBuilding = {
      id: 'fixture/academic-hall',
      name: 'Academic Hall',
      height: 16,
      footprint: square(0.0003, 0.0003),
    };
    const data = fixture([building]);
    const projection = createProjection(data);
    const geometry = buildSceneGeometries(data, projection).buildings;
    expectFiniteGeometry(geometry);
    const roofY = buildingMaxHeight(building) - 0.82;
    const positions = geometry.getAttribute('position');
    let raised = 0;
    for (let i = 0; i < positions.count; i++) {
      const y = positions.getY(i);
      expect(y).toBeLessThanOrEqual(buildingMaxHeight(building) + 0.001);
      if (y > roofY + 0.1) raised++;
      // Raised faces have an actual depth gap from the flat roof cap.
      if (y > roofY + 0.001 && y < roofY + 0.02) throw new Error('coplanar roof detail');
    }
    expect(raised).toBeGreaterThan(0);
    const shell = buildingSolidGeometry(building, projection)!;
    shell.computeBoundingBox();
    expect(shell.boundingBox!.max.y).toBeGreaterThan(buildingMaxHeight(building));
    shell.dispose();
    geometry.dispose();
  });

  it('does not place generic roof structures in a courtyard void', () => {
    const building: CampusBuilding = {
      id: 'fixture/courtyard-hall',
      name: 'Courtyard Hall',
      height: 16,
      footprint: square(0.0003, 0.0003),
      holes: [square(0.00008, 0.00008)],
    };
    const data = fixture([building]);
    const geometry = buildSceneGeometries(data, createProjection(data)).buildings;
    const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
    const ray = new THREE.Raycaster(new THREE.Vector3(0, 50, 0), new THREE.Vector3(0, -1, 0));
    expect(ray.intersectObject(mesh)).toHaveLength(0);
    mesh.material.dispose();
    geometry.dispose();
  });

  it('keeps every registered landmark connected to a campus building footprint', () => {
    const data = campusData;
    const ids = new Set(data.buildings.map((building) => building.id));
    const landmarks = Object.keys(LANDMARK_MODULES);
    expect(landmarks.length).toBeGreaterThan(0);
    for (const id of landmarks) {
      expect(ids.has(id), `landmark ${id} has no campus footprint`).toBe(true);
    }
  });

  it('keeps the published tree snapshot in campus bounds without duplicate trunks', () => {
    const data = campusData;
    const trees = campusTrees;
    const [west, south, eastBound, northBound] = data.bbox;
    const seen = new Set<string>();
    expect(trees.length).toBeGreaterThan(0);
    for (const [lng, lat, height, crown, kind] of trees) {
      expect(Number.isFinite(lng) && lng >= west && lng <= eastBound).toBe(true);
      expect(Number.isFinite(lat) && lat >= south && lat <= northBound).toBe(true);
      expect(height).toBeGreaterThan(0);
      expect(crown).toBeGreaterThan(0);
      expect([0, 1, 2]).toContain(kind);
      const key = `${lng},${lat}`;
      expect(seen.has(key), `duplicate surveyed tree at ${key}`).toBe(false);
      seen.add(key);
    }
  });
});
