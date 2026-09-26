import * as THREE from 'three';
import { expect, it } from 'vitest';
import campusData from '../../../../../../public/campus-data.json';
import { ringToShapePoints } from '../../geom-utils';
import { createProjection } from '../../projection';
import type { CampusData } from '../../types';
import { makeLandmarkCtx } from '../index';
import { landmark } from './caroline-hall';

it('keeps Caroline Hall entrance glass attached to its sloping north wall', () => {
  const data = campusData as unknown as CampusData;
  const building = data.buildings.find((candidate) => candidate.id === landmark.id)!;
  const pts = ringToShapePoints(building.footprint, createProjection(data));
  const ctx = makeLandmarkCtx(pts, building.height ?? 11, landmark.spec);
  const bounds = ctx.helpers.bboxOf(pts);
  const entranceX = (bounds.minX + bounds.maxX) / 2;
  const parts = landmark.build!(ctx);
  try {
    const glass = new THREE.Color(0x4a5d65);
    const door = parts.find((part) => {
      part.computeBoundingBox();
      const bounds = part.boundingBox!;
      const colors = part.getAttribute('color');
      return Math.abs(bounds.min.y - 0.53) < 0.01
        && Math.abs(bounds.max.y - 3.36) < 0.01
        && Math.abs(colors.getX(0) - glass.r) < 0.001;
    });
    expect(door).toBeDefined();
    const center = door!.boundingBox!.getCenter(new THREE.Vector3());
    const northEdge = pts.flatMap((a, i) => {
      const end = pts[(i + 1) % pts.length];
      if (end.x >= a.x || entranceX < end.x || entranceX > a.x) return [];
      const t = (entranceX - a.x) / (end.x - a.x);
      return [{ north: a.y + t * (end.y - a.y),
        normal: new THREE.Vector2(end.y - a.y, a.x - end.x).normalize() }];
    }).sort((a, b) => b.north - a.north)[0];
    expect(northEdge).toBeDefined();
    const outwardDistance = new THREE.Vector2(center.x - entranceX, -center.z - northEdge.north)
      .dot(northEdge.normal);
    expect(outwardDistance).toBeGreaterThan(0.2);
    expect(outwardDistance).toBeLessThan(0.4);
  } finally {
    parts.forEach((part) => part.dispose());
  }
});
