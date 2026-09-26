import type { CampusBuilding } from './types';

type Ring = [number, number][];

function bounds(ring: Ring) {
  const lng = ring.map((point) => point[0]);
  const lat = ring.map((point) => point[1]);
  return { left: Math.min(...lng), right: Math.max(...lng),
    bottom: Math.min(...lat), top: Math.max(...lat) };
}

function boxOverlap(a: ReturnType<typeof bounds>, b: ReturnType<typeof bounds>): number {
  const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
  const height = Math.max(0, Math.min(a.top, b.top) - Math.max(a.bottom, b.bottom));
  const overlap = width * height;
  const areaA = (a.right - a.left) * (a.top - a.bottom);
  const areaB = (b.right - b.left) * (b.top - b.bottom);
  return overlap / (areaA + areaB - overlap || 1);
}

function ringArea(ring: Ring): number {
  const [originLng, originLat] = ring[0];
  let twiceArea = 0;
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i], b = ring[(i + 1) % ring.length];
    twiceArea += (a[0] - originLng) * (b[1] - originLat)
      - (b[0] - originLng) * (a[1] - originLat);
  }
  return Math.abs(twiceArea) / 2;
}

function maxVertexGap(from: Ring, to: Ring): number {
  const metresPerLat = 111320;
  const metresPerLng = metresPerLat * Math.cos(from[0][1] * Math.PI / 180);
  let furthest = 0;
  for (const [lng, lat] of from) {
    let nearest = Infinity;
    for (let i = 0; i < to.length; i++) {
      const a = to[i], b = to[(i + 1) % to.length];
      const dx = (b[0] - a[0]) * metresPerLng;
      const dy = (b[1] - a[1]) * metresPerLat;
      const px = (lng - a[0]) * metresPerLng;
      const py = (lat - a[1]) * metresPerLat;
      const t = Math.max(0, Math.min(1, (px * dx + py * dy) / (dx * dx + dy * dy || 1)));
      nearest = Math.min(nearest, Math.hypot(px - t * dx, py - t * dy));
    }
    furthest = Math.max(furthest, nearest);
    if (furthest > 3) break;
  }
  return furthest;
}

function nearDuplicate(a: CampusBuilding, b: CampusBuilding,
  aBounds: ReturnType<typeof bounds>, bBounds: ReturnType<typeof bounds>): boolean {
  // One named outline and one anonymous outline can describe the same whole
  // building at different survey detail. These strict checks exclude adjacent
  // wings and courtyards that only partly share a bounding rectangle.
  if (boxOverlap(aBounds, bBounds) < 0.93) return false;
  const areaA = ringArea(a.footprint), areaB = ringArea(b.footprint);
  if (Math.min(areaA, areaB) / Math.max(areaA, areaB) < 0.9) return false;
  return maxVertexGap(a.footprint, b.footprint) <= 3
    && maxVertexGap(b.footprint, a.footprint) <= 3;
}

function holeDetail(building: CampusBuilding): number {
  return building.holes?.reduce((sum, ring) => sum + ring.length, 0) ?? 0;
}

/**
 * OSM sometimes supplies both a named way and a courtyard relation with the
 * same outer ring. Rendering both puts two walls and two roofs in nearly the
 * same depth plane, which flashes as the camera moves. Keep the named way's
 * identity for search and picking, and borrow the relation's courtyard holes.
 */
export function uniqueBuildingFootprints(buildings: CampusBuilding[]): CampusBuilding[] {
  const result: CampusBuilding[] = [];
  const byOutline = new Map<string, number>();

  for (const building of buildings) {
    const ring = building.footprint;
    if (!ring || ring.length < 3) {
      result.push(building);
      continue;
    }
    // Sorting makes the key independent of which vertex starts the OSM ring
    // and of clockwise/counterclockwise winding. Use exact source coordinates
    // so neighboring, merely similar footprints stay separate.
    const key = ring.map(([lng, lat]) => `${lng},${lat}`).sort().join(';');
    const previousIndex = byOutline.get(key);
    if (previousIndex == null) {
      byOutline.set(key, result.length);
      result.push(building);
      continue;
    }

    const previous = result[previousIndex];
    const named = previous.name || previous.umdCode ? previous
      : building.name || building.umdCode ? building : previous;
    const courtyard = (previous.holes?.length ?? 0) >= (building.holes?.length ?? 0)
      ? previous : building;
    result[previousIndex] = courtyard.holes?.length
      ? { ...named, holes: courtyard.holes }
      : named;
  }

  // Some OSM duplicates have slightly different vertex counts or surveyed
  // coordinates. Edward St. John differs by centimetres, while an anonymous
  // South Campus Commons relation follows its named outline within ~3m. Both
  // otherwise draw a second roof and shimmer as the camera moves.
  const outlines = result.map((building) => building.footprint?.length >= 3 ? bounds(building.footprint) : null);
  const namedIndexes = result.flatMap((building, index) =>
    outlines[index] && (building.name || building.umdCode) ? [index] : []);
  const removed = new Set<number>();
  for (let i = 0; i < result.length; i++) {
    const anonymous = result[i];
    if (anonymous.name || anonymous.umdCode || !outlines[i]) continue;
    for (const index of namedIndexes) {
      const named = result[index];
      if (!nearDuplicate(named, anonymous, outlines[index]!, outlines[i]!)) continue;
      const moreDetailed = anonymous.footprint.length > named.footprint.length ? anonymous : named;
      const betterCourtyard = holeDetail(anonymous) > holeDetail(named) ? anonymous : named;
      result[index] = {
        ...named,
        footprint: moreDetailed.footprint,
        holes: betterCourtyard.holes,
        height: Math.max(named.height, anonymous.height),
      };
      removed.add(i);
      break;
    }
  }
  return result.filter((_, index) => !removed.has(index));
}
