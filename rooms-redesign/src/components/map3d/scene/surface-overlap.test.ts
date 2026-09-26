import { expect, it } from 'vitest';
import campusData from '../../../../public/campus-data.json';
import { uniqueBuildingFootprints } from './building-footprints';
import { buildSceneGeometries } from './geometry';
import { createProjection } from './projection';
import type { CampusData } from './types';

it('keeps differently colored visible building faces off the same plane', () => {
  const data = structuredClone(campusData) as unknown as CampusData;
  data.buildings = uniqueBuildingFootprints(data.buildings);
  const geometry = buildSceneGeometries(data, createProjection(data)).buildings;
  const positions = geometry.getAttribute('position');
  const colors = geometry.getAttribute('color');
  const normals = geometry.getAttribute('normal');
  const index = geometry.index;
  const seen = new Map<string, Array<{ color: string; normal: [number, number, number] }>>();
  const visibleOverlaps: string[] = [];
  const vertex = (i: number) => {
    const j = index ? index.getX(i) : i;
    return `${Math.round(positions.getX(j) * 100)},${Math.round(positions.getY(j) * 100)},${Math.round(positions.getZ(j) * 100)}`;
  };
  for (let i = 0; i + 2 < (index?.count ?? positions.count); i += 3) {
    const corners = [vertex(i), vertex(i + 1), vertex(i + 2)].sort();
    const key = corners.join('|');
    const j = index ? index.getX(i) : i;
    const color = `${Math.round(colors.getX(j) * 255)},${Math.round(colors.getY(j) * 255)},${Math.round(colors.getZ(j) * 255)}`;
    const normal: [number, number, number] = [normals.getX(j), normals.getY(j), normals.getZ(j)];
    const previous = seen.get(key) ?? [];
    for (const face of previous) {
      if (face.color === color) continue;
      const dot = normal.reduce((sum, component, axis) => sum + component * face.normal[axis], 0);
      // Opposing faces are closed internal joints. Down-facing caps at y=0
      // sit against the ground and cannot shimmer in the visible scene.
      if (dot > 0.9 && normal[1] > -0.9 && visibleOverlaps.length < 5) {
        visibleOverlaps.push(`triangle ${i / 3} at ${corners[1]}: ${face.color} / ${color}`);
      }
    }
    previous.push({ color, normal });
    seen.set(key, previous);
  }
  expect(visibleOverlaps).toEqual([]);
}, 15000);
