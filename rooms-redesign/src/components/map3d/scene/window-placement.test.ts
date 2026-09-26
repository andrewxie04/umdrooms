import { describe, expect, it } from 'vitest';
import campus from '../../../../public/campus-data.json';
import { ringToShapePoints } from './geom-utils';
import { windowPlacements } from './geometry';
import { createProjection } from './projection';
import type { CampusData } from './types';

const data = campus as unknown as CampusData;
const projection = createProjection(data);

function onlyBuilding(id: string): CampusData {
  const building = data.buildings.find((candidate) => candidate.id === id);
  if (!building) throw new Error(`Missing test building ${id}`);
  return { ...data, buildings: [building] };
}

describe('shared facade windows', () => {
  it('leaves custom landmark facades to their own builders', () => {
    const library = onlyBuilding('way/23408799');
    expect(windowPlacements(library, projection, true)).toHaveLength(0);
    expect(windowPlacements(library, projection, false)).toHaveLength(0);
  });

  it('keeps windows on dorms that opt in and on generic buildings', () => {
    const dorm = onlyBuilding('way/23502767');
    expect(windowPlacements(dorm, projection, true).length).toBeGreaterThan(0);

    const generic: CampusData = {
      ...dorm,
      buildings: [{ ...dorm.buildings[0], id: 'test/generic-building', name: 'Test Hall' }],
    };
    expect(windowPlacements(generic, projection, true).length).toBeGreaterThan(0);
  });

  it('keeps shared panes close to their footprint wall', () => {
    const dorm = onlyBuilding('way/23502767');
    const ring = ringToShapePoints(dorm.buildings[0].footprint, projection);
    const windows = windowPlacements(dorm, projection, true);
    expect(windows.length).toBeGreaterThan(0);

    const distances = windows.map((window) => {
      const x = window.cx;
      const y = -window.cz;
      return Math.min(...ring.map((start, index) => {
        const end = ring[(index + 1) % ring.length];
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const t = Math.max(0, Math.min(1, ((x - start.x) * dx + (y - start.y) * dy) / (dx * dx + dy * dy)));
        return Math.hypot(x - start.x - t * dx, y - start.y - t * dy);
      }));
    });
    expect(Math.max(...distances)).toBeLessThan(0.105);
    expect(distances.some((distance) => distance > 0.095)).toBe(true);
  });

  it('keeps the full width of shared window sills on mapped facades', () => {
    const offending: string[] = [];
    let checkedWindows = 0;
    for (const building of data.buildings.filter((candidate) => candidate.name)) {
      const only = { ...data, buildings: [building] };
      const ring = ringToShapePoints(building.footprint, projection);
      const windows = windowPlacements(only, projection, true);
      const distanceToWall = (x: number, y: number) => Math.min(...ring.map((start, index) => {
        const end = ring[(index + 1) % ring.length];
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const t = Math.max(0, Math.min(1, ((x - start.x) * dx + (y - start.y) * dy) / (dx * dx + dy * dy)));
        return Math.hypot(x - start.x - t * dx, y - start.y - t * dy);
      }));
      for (const window of windows) {
        checkedWindows++;
        for (const side of [-1, 1]) {
          const nx = -window.tz, nz = window.tx;
          const sillHalf = (window.width + 0.46) / 2;
          const distance = distanceToWall(window.cx + nx * 0.055 + side * window.tx * sillHalf,
            -window.cz - nz * 0.055 - side * window.tz * sillHalf);
          if (distance > 0.17 && offending.length < 20) offending.push(`${building.name}: ${distance.toFixed(2)}m`);
        }
      }
    }
    expect(checkedWindows).toBeGreaterThan(500);
    expect(offending).toEqual([]);
  });
});
