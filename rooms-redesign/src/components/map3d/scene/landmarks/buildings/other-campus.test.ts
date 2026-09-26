import { describe, expect, it } from 'vitest';
import campusData from '../../../../../../public/campus-data.json';
import { createProjection } from '../../projection';
import { ringToShapePoints } from '../../geom-utils';
import type { CampusData } from '../../types';
import { makeLandmarkCtx } from '..';
import type { LandmarkModule } from '../types';
import { landmark as ans } from './animal-sciences';
import { landmark as arc } from './architecture-building';
import { landmark as asy } from './art-sociology';
import { landmark as atl } from './atlantic-building';
import { landmark as ccc } from './cambridge-community-center';
import { landmark as pac } from './clarice-smith-pac';
import { landmark as esj } from './edward-st-john';
import { landmark as kni } from './knight-hall';
import { landmark as sph } from './school-of-public-health';
import { landmark as sqh } from './susquehanna-hall';
import { landmark as tws } from './tawes-hall';
import { landmark as tmh } from './thurgood-marshall-hall';
import { landmark as vmh } from './van-munching-hall';

const modules: Array<[string, LandmarkModule]> = [
  ['ANS', ans], ['ARC', arc], ['ASY', asy], ['ATL', atl], ['CCC', ccc],
  ['PAC', pac], ['ESJ', esj], ['KNI', kni], ['SPH', sph], ['SQH', sqh],
  ['TWS', tws], ['TMH', tmh], ['VMH', vmh],
];
const data = campusData as unknown as CampusData;
const projection = createProjection(data);

function inside(ring: { x: number; y: number }[], x: number, y: number): boolean {
  let hit = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i], b = ring[j];
    if ((a.y > y) !== (b.y > y) && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) hit = !hit;
  }
  return hit;
}

describe('other campus landmarks', () => {
  it.each(modules)('%s resolves to its campus-data code and emits merge-compatible native geometry', (code, module) => {
    const building = data.buildings.find((item) => item.id === module.id);
    expect(building?.umdCode).toBe(code);
    expect(module.build).toBeDefined();
    const pts = ringToShapePoints(building!.footprint, projection);
    const holes = (building!.holes ?? []).map((hole) => ringToShapePoints(hole, projection));
    const height = module.spec.height ?? building!.height ?? 11;
    const parts = module.build!(makeLandmarkCtx(pts, height, module.spec, holes));
    expect(parts.length).toBeGreaterThan(0);
    let highest = 0;
    for (const part of parts) {
      expect(part.index).toBeNull();
      expect(part.getAttribute('uv')).toBeUndefined();
      const position = part.getAttribute('position');
      const normal = part.getAttribute('normal');
      const color = part.getAttribute('color');
      expect(position.itemSize).toBe(3);
      expect(normal.itemSize).toBe(3);
      expect(color.itemSize).toBe(3);
      expect(normal.count).toBe(position.count);
      expect(color.count).toBe(position.count);
      for (const attribute of [position, normal, color]) {
        for (let i = 0; i < attribute.array.length; i++) expect(Number.isFinite(attribute.array[i])).toBe(true);
      }
      part.computeBoundingBox();
      highest = Math.max(highest, part.boundingBox!.max.y);
    }
    expect(highest).toBeLessThanOrEqual((module.maxHeight ?? height) + 0.01);
  });

  it.each([['ANS', ans], ['PAC', pac]] as Array<[string, LandmarkModule]>)('%s leaves mapped courtyard holes open at the main roof', (_code, module) => {
    const building = data.buildings.find((item) => item.id === module.id)!;
    const pts = ringToShapePoints(building.footprint, projection);
    const holes = building.holes!.map((hole) => ringToShapePoints(hole, projection));
    const height = module.spec.height ?? building.height ?? 11;
    const [main] = module.build!(makeLandmarkCtx(pts, height, module.spec, holes));
    const p = main.getAttribute('position');
    for (let i = 0; i < p.count; i += 3) {
      const ys = [p.getY(i), p.getY(i + 1), p.getY(i + 2)];
      if (!ys.every((value) => Math.abs(value - height) < 0.001)) continue;
      const x = (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3;
      const north = -(p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3;
      expect(holes.some((hole) => inside(hole, x, north))).toBe(false);
    }
  });
});
