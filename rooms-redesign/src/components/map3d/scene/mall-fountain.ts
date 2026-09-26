import * as THREE from 'three';
import { mergeAll, withColor } from './geom-utils';
import type { Projection } from './projection';
import type { CampusArea, CampusData } from './types';

/** The ODK Fountain is the long, narrow mapped water polygon on McKeldin Mall.
 * Its five descending basins are a campus landmark; the generic flat water
 * treatment loses that shape. Bounds come from OSM, while the shallow heights
 * and coping widths are visual approximations of UMD's fountain photographs. */
function fountainArea(data: CampusData): CampusArea | undefined {
  return data.areas.find((area) => {
    if (area.kind !== 'water' || area.polygon.length !== 4) return false;
    const lng = area.polygon.reduce((sum, point) => sum + point[0], 0) / 4;
    const lat = area.polygon.reduce((sum, point) => sum + point[1], 0) / 4;
    return Math.abs(lng + 76.941858) < 0.0002 && Math.abs(lat - 38.985994) < 0.0002;
  });
}

export function buildMallFountain(
  data: CampusData,
  proj: Projection,
): { water: THREE.BufferGeometry; stone: THREE.BufferGeometry } | null {
  const area = fountainArea(data);
  if (!area) return null;
  const points = area.polygon.map(([lng, lat]) => proj.toLocal(lng, lat));
  const minX = Math.min(...points.map((point) => point.x));
  const maxX = Math.max(...points.map((point) => point.x));
  const minZ = Math.min(...points.map((point) => point.z));
  const maxZ = Math.max(...points.map((point) => point.z));
  const length = maxX - minX;
  const width = maxZ - minZ;
  if (length < 60 || width < 3 || width > 12) return null;

  const tiers = 5;
  const coping = 0.42;
  const divider = 0.55;
  const basinWidth = width - coping * 2;
  const centerZ = (minZ + maxZ) / 2;
  const stoneParts: THREE.BufferGeometry[] = [];
  const waterParts: THREE.BufferGeometry[] = [];
  const limestone = new THREE.Color(0xbdbbb3);
  const stepFace = new THREE.Color(0x929698);
  const waterBlue = new THREE.Color(0x588ca6);
  const cascade = new THREE.Color(0xa6d5da);

  const box = (
    dest: THREE.BufferGeometry[], color: THREE.Color,
    x: number, y: number, z: number,
    sizeX: number, sizeY: number, sizeZ: number,
  ) => {
    const geometry = new THREE.BoxGeometry(sizeX, sizeY, sizeZ);
    geometry.translate(x, y, z);
    dest.push(withColor(geometry, color));
  };

  for (let i = 0; i < tiers; i++) {
    // The western basin, toward McKeldin Library, is highest. Each following
    // pool drops gently toward Main Administration at the east end of the mall.
    const x0 = minX + (length * i) / tiers;
    const x1 = minX + (length * (i + 1)) / tiers;
    const surfaceY = 0.67 - i * 0.10;
    const middleX = (x0 + x1) / 2;
    const segmentLength = x1 - x0;
    box(waterParts, waterBlue, middleX, surfaceY - 0.035, centerZ,
      segmentLength - divider, 0.07, basinWidth);

    for (const edgeZ of [minZ - coping / 2, maxZ + coping / 2]) {
      box(stoneParts, limestone, middleX, (surfaceY + 0.18) / 2, edgeZ,
        segmentLength, surfaceY - 0.18, coping);
    }
    // Stone weirs give the fountain its photographed five-tier rhythm. A
    // lighter thin lip suggests water spilling over each drop from above.
    if (i < tiers - 1) {
      box(stoneParts, stepFace, x1, (surfaceY + 0.18) / 2, centerZ,
        divider, surfaceY - 0.18, width + coping * 2);
      box(waterParts, cascade, x1 - divider / 2 - 0.05, surfaceY + 0.004, centerZ,
        0.16, 0.025, basinWidth);
    }
  }

  for (const x of [minX - coping / 2, maxX + coping / 2]) {
    box(stoneParts, limestone, x, 0.36, centerZ, coping, 0.36, width + coping * 2);
  }

  return { water: mergeAll(waterParts), stone: mergeAll(stoneParts) };
}
