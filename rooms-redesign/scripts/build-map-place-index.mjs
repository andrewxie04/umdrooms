// Small browser-search index for the named footprints in the same snapshot
// that builds the 3D scene. Keep the large polygon dataset out of the UI chunk.
import { readFileSync, writeFileSync } from 'node:fs';

const source = JSON.parse(readFileSync(new URL('../public/campus-data.json', import.meta.url), 'utf8'));
const correctedNames = new Map([
  ['way/23546215', 'Worcester Hall'], // misspelled in the OSM snapshot
  ['way/980371045', 'SECU Stadium'], // stadium footprint is unnamed in the snapshot
]);

function centroid(points) {
  const [originLng, originLat] = points[0];
  let twiceArea = 0;
  let lngSum = 0;
  let latSum = 0;
  for (let i = 0; i < points.length; i++) {
    const current = points[i], next = points[(i + 1) % points.length];
    const a = [current[0] - originLng, current[1] - originLat];
    const b = [next[0] - originLng, next[1] - originLat];
    const cross = a[0] * b[1] - b[0] * a[1];
    twiceArea += cross;
    lngSum += (a[0] + b[0]) * cross;
    latSum += (a[1] + b[1]) * cross;
  }
  if (Math.abs(twiceArea) < 1e-11) {
    return [
      points.reduce((sum, p) => sum + p[0], 0) / points.length,
      points.reduce((sum, p) => sum + p[1], 0) / points.length,
    ];
  }
  return [originLng + lngSum / (3 * twiceArea), originLat + latSum / (3 * twiceArea)];
}

const indexed = [];
for (const building of source.buildings) {
  const name = correctedNames.get(building.id) ?? building.name;
  if (!name || !Array.isArray(building.footprint) || building.footprint.length < 3) continue;
  const footprint = building.footprint;
  const [originLng, originLat] = footprint[0];
  let twiceArea = 0;
  for (let i = 0; i < footprint.length; i++) {
    const a = footprint[i], b = footprint[(i + 1) % footprint.length];
    twiceArea += (a[0] - originLng) * (b[1] - originLat) -
      (b[0] - originLng) * (a[1] - originLat);
  }
  // Keep every part tappable; search later chooses the largest named part.
  const area = Math.abs(twiceArea);
  // The stadium footprint is a horseshoe-shaped seating band. Its polygon
  // centroid sits in the stands, so center the map on the whole venue.
  const [lng, lat] = building.id === 'way/980371045'
    ? [(Math.min(...footprint.map(p => p[0])) + Math.max(...footprint.map(p => p[0]))) / 2,
      (Math.min(...footprint.map(p => p[1])) + Math.max(...footprint.map(p => p[1]))) / 2]
    : centroid(footprint);
  indexed.push({
    area,
    id: building.id,
    name,
    ...(building.umdCode ? { code: building.umdCode } : {}),
    lat: Number(lat.toFixed(7)),
    lng: Number(lng.toFixed(7)),
  });
}
const places = indexed
  .sort((a, b) => a.name.localeCompare(b.name) || b.area - a.area)
  .map(({ area, ...place }) => place);
writeFileSync(new URL('../src/lib/map-places.generated.json', import.meta.url),
  `${JSON.stringify(places)}\n`);
console.log(`Indexed ${places.length} named map buildings`);
