import { expect, it } from 'vitest';
import campusData from '../../../../public/campus-data.json';
import { uniqueBuildingFootprints } from './building-footprints';
import { buildSceneGeometries } from './geometry';
import { createProjection } from './projection';
import type { CampusData } from './types';

type Point = [number, number];
type RoofFace = { triangle: number; color: string; minX: number; maxX: number; minZ: number; maxZ: number };

function cross(a: Point, b: Point, c: Point): number {
  return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
}

/** Area shared by two horizontal triangles, including partial intersections. */
function sharedArea(first: Point[], second: Point[]): number {
  let polygon = first;
  const winding = Math.sign(cross(second[0], second[1], second[2]));
  for (let side = 0; side < 3; side++) {
    const a = second[side], b = second[(side + 1) % 3];
    const input = polygon;
    polygon = [];
    for (let vertex = 0; vertex < input.length; vertex++) {
      const from = input[vertex], to = input[(vertex + 1) % input.length];
      const start = cross(a, b, from) * winding;
      const end = cross(a, b, to) * winding;
      if (start >= -1e-7) polygon.push(from);
      if ((start < 0 && end > 0) || (start > 0 && end < 0)) {
        const t = start / (start - end);
        polygon.push([from[0] + t * (to[0] - from[0]), from[1] + t * (to[1] - from[1])]);
      }
    }
    if (!polygon.length) return 0;
  }
  if (polygon.length < 3) return 0;
  return Math.abs(polygon.reduce((sum, a, i) => {
    const b = polygon[(i + 1) % polygon.length];
    return sum + a[0] * b[1] - b[0] * a[1];
  }, 0)) / 2;
}

it('does not stack differently colored roof faces over visible areas', () => {
  const data = structuredClone(campusData) as unknown as CampusData;
  data.buildings = uniqueBuildingFootprints(data.buildings);
  const geometry = buildSceneGeometries(data, createProjection(data)).buildings;
  const positions = geometry.getAttribute('position');
  const normals = geometry.getAttribute('normal');
  const colors = geometry.getAttribute('color');
  const index = geometry.index;
  const count = index?.count ?? positions.count;
  const vertex = (i: number) => index ? index.getX(i) : i;
  const triangle = (i: number): Point[] => [i, i + 1, i + 2].map(vertex)
    .map((j) => [positions.getX(j), positions.getZ(j)]);
  const bins = new Map<string, RoofFace[]>();
  const checkedPairs = new Set<string>();
  const overlaps: string[] = [];

  for (let i = 0; i + 2 < count; i += 3) {
    const ids = [vertex(i), vertex(i + 1), vertex(i + 2)];
    const height = positions.getY(ids[0]);
    if (height < 1 || normals.getY(ids[0]) < 0.995 ||
      ids.some((j) => Math.abs(positions.getY(j) - height) > 0.005)) continue;
    const points = triangle(i);
    const minX = Math.min(...points.map((p) => p[0]));
    const maxX = Math.max(...points.map((p) => p[0]));
    const minZ = Math.min(...points.map((p) => p[1]));
    const maxZ = Math.max(...points.map((p) => p[1]));
    if (maxX - minX < 0.03 || maxZ - minZ < 0.03) continue;
    const color = [colors.getX(ids[0]), colors.getY(ids[0]), colors.getZ(ids[0])]
      .map((channel) => Math.round(channel * 255)).join(',');
    const face: RoofFace = { triangle: i, color, minX, maxX, minZ, maxZ };
    const level = Math.round(height * 100);
    for (let x = Math.floor(minX / 20); x <= Math.floor(maxX / 20); x++) {
      for (let z = Math.floor(minZ / 20); z <= Math.floor(maxZ / 20); z++) {
        const key = `${level}:${x}:${z}`;
        const bin = bins.get(key) ?? [];
        for (const other of bin) {
          if (other.color === color || other.maxX <= minX + 0.01 || other.minX >= maxX - 0.01 ||
            other.maxZ <= minZ + 0.01 || other.minZ >= maxZ - 0.01) continue;
          const pair = `${other.triangle}:${i}`;
          if (checkedPairs.has(pair)) continue;
          checkedPairs.add(pair);
          const area = sharedArea(points, triangle(other.triangle));
          // Smaller contacts are trim and window joints. Broad roof caps
          // should never share a plane with a differently colored surface.
          if (area > 0.1 && overlaps.length < 8) {
            overlaps.push(`${area.toFixed(2)}m² at height ${height.toFixed(2)}, x=${minX.toFixed(1)}, z=${minZ.toFixed(1)}`);
          }
        }
        bin.push(face);
        bins.set(key, bin);
      }
    }
  }

  expect(overlaps).toEqual([]);
});
