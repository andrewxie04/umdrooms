import { describe, expect, it } from 'vitest';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import campusData from '../../../../../../public/campus-data.json';
import { ringToShapePoints } from '../../geom-utils';
import { createProjection } from '../../projection';
import type { CampusData } from '../../types';
import { makeLandmarkCtx } from '../index';
import { landmark } from './ritchie-coliseum';

describe('Ritchie Coliseum landmark', () => {
  it('builds finite, merge-compatible geometry on its mapped footprint', () => {
    const building = campusData.buildings.find((entry) => entry.id === landmark.id);
    expect(building).toBeDefined();
    const projection = createProjection(campusData as unknown as CampusData);
    const points = ringToShapePoints(building!.footprint as [number, number][], projection);
    const ctx = makeLandmarkCtx(points, building!.height!, landmark.spec);
    const parts = landmark.build!(ctx);
    try {
      expect(parts.length).toBeGreaterThan(100);
      for (const part of parts) {
        expect(part.index).toBeNull();
        expect(part.getAttribute('uv')).toBeUndefined();
        const names = Object.keys(part.attributes).sort();
        expect(names).toEqual(['color', 'normal', 'position']);
        for (const name of names) {
          const attribute = part.getAttribute(name);
          expect(attribute.itemSize).toBe(3);
          expect(Array.from(attribute.array).every(Number.isFinite)).toBe(true);
        }
      }
      const merged = mergeGeometries(parts);
      expect(merged).not.toBeNull();
      merged!.computeBoundingBox();
      expect(merged!.boundingBox!.max.y).toBeLessThanOrEqual(landmark.maxHeight!);
      expect(merged!.boundingBox!.max.y).toBeGreaterThan(14);
      merged!.dispose();
    } finally {
      parts.forEach((part) => part.dispose());
    }
  });
});
