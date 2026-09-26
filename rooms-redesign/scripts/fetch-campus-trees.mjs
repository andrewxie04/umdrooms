// Snapshot the UMD Arboretum's public campus plant inventory for the 3D map.
// Coordinates are surveyed locations, not generated lawn samples.
import fs from 'node:fs/promises';

const SERVICE = 'https://services9.arcgis.com/1rOwFRpAwrxe0rBl/arcgis/rest/services/CampusPlantInventory/FeatureServer/0/query';
const CENTER = [-76.9426, 38.9869];
const BBOX = '-76.956,38.978,-76.928,38.994';
const EVERGREEN_CONIFERS = new Set(['Abies', 'Cedrus', 'Chamaecyparis', 'Cryptomeria', 'Juniperus', 'Picea', 'Pinus', 'Platycladus', 'Taxodium', 'Thuja', 'Tsuga']);
const EVERGREEN_BROADLEAF = new Set(['Ilex', 'Magnolia']);
const campus = JSON.parse(await fs.readFile(new URL('../public/campus-data.json', import.meta.url), 'utf8'));
const buildings = campus.buildings.map(({ footprint, holes }) => ({
  footprint, holes,
  minX: Math.min(...footprint.map((p) => p[0])),
  maxX: Math.max(...footprint.map((p) => p[0])),
  minY: Math.min(...footprint.map((p) => p[1])),
  maxY: Math.max(...footprint.map((p) => p[1])),
}));

function inRing(x, y, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i];
    const b = ring[j];
    if ((a[1] > y) !== (b[1] > y) && x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}

function insideBuilding(x, y) {
  return buildings.some((b) => x >= b.minX && x <= b.maxX && y >= b.minY && y <= b.maxY
    && inRing(x, y, b.footprint) && !b.holes?.some((hole) => inRing(x, y, hole)));
}

async function page(offset) {
  const params = new URLSearchParams({
    where: "removed = 'False' AND height >= 28 AND cradavg >= 6",
    geometry: BBOX,
    geometryType: 'esriGeometryEnvelope',
    inSR: '4326',
    spatialRel: 'esriSpatialRelIntersects',
    outFields: 'OBJECTID,genus,height,cradavg',
    outSR: '4326',
    orderByFields: 'OBJECTID',
    resultRecordCount: '2000',
    resultOffset: String(offset),
    f: 'json',
  });
  const response = await fetch(`${SERVICE}?${params}`);
  if (!response.ok) throw new Error(`UMD tree inventory returned ${response.status}`);
  const json = await response.json();
  if (json.error) throw new Error(JSON.stringify(json.error));
  return json.features;
}

const features = [];
for (let offset = 0; ; offset += 2000) {
  const rows = await page(offset);
  features.push(...rows);
  if (rows.length < 2000) break;
}

const feetToMeters = 0.3048;
const trees = features.flatMap(({ attributes, geometry }) => {
  const { x: lng, y: lat } = geometry ?? {};
  const dx = (lng - CENTER[0]) * 86550;
  const dy = (lat - CENTER[1]) * 111000;
  if (!Number.isFinite(dx) || !Number.isFinite(dy) || dx * dx + dy * dy > 1400 ** 2) return [];
  if (insideBuilding(lng, lat)) return [];
  const height = Math.min(25, Math.max(7, attributes.height * feetToMeters));
  const crown = Math.min(9, Math.max(2, attributes.cradavg * feetToMeters));
  const genus = attributes.genus?.trim() ?? '';
  const kind = EVERGREEN_CONIFERS.has(genus) ? 1 : EVERGREEN_BROADLEAF.has(genus) ? 2 : 0;
  return [[Number(lng.toFixed(7)), Number(lat.toFixed(7)), Number(height.toFixed(2)), Number(crown.toFixed(2)), kind]];
});

// Keep the canopy legible at an oblique, whole-campus scale. Prioritize larger
// surveyed trees and thin overlapping crowns; retain the tighter oak
// allees along McKeldin Mall. A distance rule follows real locations, unlike
// sampling a lattice or adding synthetic trees.
const surveyed = trees.map((tree, index) => {
  const [lng, lat, height, crown] = tree;
  return {
    tree, index,
    x: (lng - CENTER[0]) * 86550,
    y: (lat - CENTER[1]) * 111000,
    mall: lng > -76.9448 && lng < -76.9400 && lat > 38.98525 && lat < 38.9868,
    priority: crown * 1.1 + height * 0.09,
  };
});
surveyed.sort((a, b) => Number(b.mall) - Number(a.mall) || b.priority - a.priority || a.index - b.index);
const chosen = [];
for (const candidate of surveyed) {
  const candidateSpacing = candidate.mall ? 19 : 32;
  if (chosen.some((existing) => {
    const spacing = Math.max(candidateSpacing, existing.mall ? 19 : 32);
    return (candidate.x - existing.x) ** 2 + (candidate.y - existing.y) ** 2 < spacing ** 2;
  })) continue;
  chosen.push(candidate);
}
chosen.sort((a, b) => a.index - b.index);
const rendered = chosen.map(({ tree }) => tree);

await fs.writeFile(new URL('../public/campus-trees.json', import.meta.url), `${JSON.stringify(rendered)}\n`);
console.log(`Saved ${rendered.length} surveyed UMD trees from ${trees.length} candidates`);
