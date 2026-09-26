import { describe, expect, it } from 'vitest';
import campus from '../../../../../public/campus-data.json';
import metadata from '../../../../../public/buildings_metadata.json';
import { createProjection } from '../projection';
import { ringToShapePoints } from '../geom-utils';
import type { CampusData } from '../types';
import { LANDMARK_MODULES, makeLandmarkCtx } from './index';

describe('selectable campus buildings', () => {
  it('has a registered custom Three.js model for every physical building', () => {
    const idsByCode = new Map<string, string[]>();
    for (const building of campus.buildings) {
      if (!building.umdCode) continue;
      const ids = idsByCode.get(building.umdCode) ?? [];
      ids.push(building.id);
      idsByCode.set(building.umdCode, ids);
    }

    const missing = [...new Set(metadata.map((building) => building.code))]
      .filter((code) => !(idsByCode.get(code) ?? []).some((id) => LANDMARK_MODULES[id]?.build));

    expect(missing).toEqual([]);
  });

  it('builds every researched landmark as finite, merge-compatible geometry', () => {
    const data = campus as unknown as CampusData;
    const projection = createProjection(data);
    const byId = new Map(data.buildings.map((building) => [building.id, building]));

    for (const [id, module] of Object.entries(LANDMARK_MODULES)) {
      const building = byId.get(id);
      expect(building, `${module.spec.name} has no mapped footprint`).toBeDefined();
      expect(module.build, `${module.spec.name} lacks custom geometry`).toBeDefined();
      const pts = ringToShapePoints(building!.footprint, projection);
      const holes = (building!.holes ?? []).map((hole) => ringToShapePoints(hole, projection));
      const height = module.spec.height ?? building!.height ?? 11;
      const parts = module.build!(makeLandmarkCtx(pts, height, module.spec, holes));
      expect(parts.length, module.spec.name).toBeGreaterThan(0);

      for (const part of parts) {
        expect(part.index, module.spec.name).toBeNull();
        expect(part.getAttribute('uv'), module.spec.name).toBeUndefined();
        const positions = part.getAttribute('position');
        expect(positions?.count, module.spec.name).toBeGreaterThan(0);
        for (const name of ['normal', 'color']) {
          const attribute = part.getAttribute(name);
          expect(attribute?.count, `${module.spec.name}: ${name}`).toBe(positions.count);
          expect(attribute?.itemSize, `${module.spec.name}: ${name}`).toBe(3);
        }
        for (const name of ['position', 'normal', 'color']) {
          const values = part.getAttribute(name).array;
          for (let i = 0; i < values.length; i++) {
            if (!Number.isFinite(values[i])) throw new Error(`${module.spec.name}: non-finite ${name}[${i}]`);
          }
        }
        part.computeBoundingBox();
        expect(part.boundingBox!.max.y, `${module.spec.name}: shell height`).toBeLessThanOrEqual(
          (module.maxHeight ?? height) + 0.01,
        );
        part.dispose();
      }
    }
  });
});
