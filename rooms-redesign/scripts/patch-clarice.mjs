// patch-clarice.mjs
// ---------------------------------------------------------------------------
// Hand-patch for The Clarice Smith Performing Arts Center.
//
// In OSM the building is mapped as multipolygon **relation 9660599** with all
// tags on the relation; its untagged outer way 23547877 carries the geometry.
// scripts/fetch-campus-data.mjs queries ways by building tags, so relation-
// tagged buildings like this one (and PSC = relation 2909990) are dropped
// by the bake. The landmark module
// src/components/map3d/scene/landmarks/buildings/clarice-smith-pac.ts is keyed
// to 'way/23547877', so we inject that way's ring into campus-data.json here.
//
// Usage: node scripts/patch-clarice.mjs
// Idempotent: skips if way/23547877 is already present.
// Preserves the file's compact (minified) JSON formatting byte-for-byte.
// ---------------------------------------------------------------------------

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'public', 'campus-data.json');

const OVERPASS_URL =
  'https://overpass-api.de/api/interpreter?data=' +
  encodeURIComponent('way(23547877);out geom;');

async function fetchRing() {
  const res = await fetch(OVERPASS_URL, {
    headers: { 'User-Agent': 'mapbox-web-patch/1.0' },
  });
  if (!res.ok) throw new Error(`Overpass HTTP ${res.status}`);
  const xml = await res.text();
  const ring = [...xml.matchAll(/<nd ref="\d+" lat="([\d.-]+)" lon="([\d.-]+)"\/>/g)].map(
    (m) => [Number(m[2]), Number(m[1])] // [lng, lat]
  );
  if (ring.length < 3) throw new Error(`Overpass returned only ${ring.length} nodes`);
  // Dataset convention: unclosed ring (first != last).
  const [fx, fy] = ring[0];
  const [lx, ly] = ring[ring.length - 1];
  if (fx === lx && fy === ly) ring.pop();
  return ring;
}

const raw = await readFile(DATA, 'utf8');
const data = JSON.parse(raw);

if (data.buildings.some((b) => b.id === 'way/23547877')) {
  console.log('way/23547877 already present — nothing to do.');
  process.exit(0);
}

const ring = await fetchRing();
data.buildings.push({
  id: 'way/23547877',
  name: 'The Clarice Smith Performing Arts Center',
  footprint: ring,
  height: 15,
  umdCode: 'PAC',
});
data.featureCounts.buildings = data.buildings.length;

// Compact dump matches the existing file format (no indent, no trailing newline).
await writeFile(DATA, JSON.stringify(data));
console.log(
  `Patched: appended way/23547877 (${ring.length} nodes) — ${data.buildings.length} buildings total.`
);
