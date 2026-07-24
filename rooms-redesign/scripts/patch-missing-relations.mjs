// patch-missing-relations.mjs
// ---------------------------------------------------------------------------
// Hand-patch for buildings mapped in OSM as multipolygon relations, which
// scripts/fetch-campus-data.mjs drops (it queries ways tagged building=*
// only — see the KNOWN GAP note there). Victims patched here:
//
//   - Chemistry Building (CHM)            — relation 2063641
//   - Animal Science/Agricultural
//     Engineering Building (ANS)          — relation 20447083 (untagged name)
//   - unnamed wing by Chemical/Nuclear
//     Engineering                         — relation 20447085
//   - Benjamin Building (EDU)             — relation 9692235
//
// Also fixes bake-assigned umdCode collisions (the highlight matcher takes
// the FIRST code match, so a stale/wrong holder shadows the real building):
//   - way/24924848  Animal Science Service Building — drops 'ANS'
//   - way/23543940  Cambridge Hall                  — drops 'CCC'
//
// (The Clarice has its own older patch: scripts/patch-clarice.mjs.)
//
// Usage:
//   node scripts/patch-missing-relations.mjs             # fetch from Overpass
//   node scripts/patch-missing-relations.mjs cache.json  # use a saved
//                                                        # `relation(id:...);out geom;` response
//
// Idempotent: skips any relation id already present in campus-data.json.
// Preserves the file's compact (minified) JSON formatting.
// ---------------------------------------------------------------------------

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'public', 'campus-data.json');

/** Per-relation metadata: names/codes from UMD buildings_data.json, heights
 * from the OSM tags where present (Chemistry has none — 11 matches the
 * bake's default for untagged buildings). */
const PATCHES = [
  {
    id: 2063641,
    name: 'Chemistry Building',
    umdCode: 'CHM',
    height: 11,
  },
  {
    id: 20447083,
    name: 'Animal Science/Agricultural Engineering Building',
    umdCode: 'ANS',
    height: 7.42,
  },
  {
    id: 20447085,
    name: null, // unnamed in OSM; renders as a generic building
    umdCode: null,
    height: 11.65,
  },
  {
    id: 9692235,
    name: 'Benjamin Building',
    umdCode: 'EDU',
    height: 11,
  },
];

/** Buildings whose bake-assigned umdCode belongs to a different building. */
const CODE_FIXES = [
  { id: 'way/24924848', dropCode: 'ANS' }, // Animal Science Service Building
  { id: 'way/23543940', dropCode: 'CCC' }, // Cambridge Hall
];

const QUERY = `[out:json][timeout:120];relation(id:${PATCHES.map((p) => p.id).join(',')});out geom;`;
const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

async function fetchRelations() {
  const cachePath = process.argv[2];
  if (cachePath) {
    console.log(`Using cached Overpass response: ${cachePath}`);
    return JSON.parse(await readFile(cachePath, 'utf8'));
  }
  let lastErr = null;
  for (const endpoint of ENDPOINTS) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch(`${endpoint}?data=${encodeURIComponent(QUERY)}`, {
          headers: { 'User-Agent': 'UMD-Rooms-CampusMap/1.0' },
        });
        const text = await res.text();
        if (!res.ok || !text.trimStart().startsWith('{')) {
          throw new Error(`Overpass busy/error (HTTP ${res.status}) from ${endpoint}`);
        }
        return JSON.parse(text);
      } catch (err) {
        lastErr = err;
        console.warn(`  ${err.message}; backing off…`);
        await new Promise((r) => setTimeout(r, 20000 * (attempt + 1)));
      }
    }
  }
  throw lastErr;
}

/** Outer-ring [lng, lat] list in the dataset convention: closing duplicate
 * removed, consecutive duplicates dropped. Multi-way outers are stitched by
 * shared endpoints (all three current relations have a single outer way). */
function extractRing(relation) {
  const outers = relation.members.filter((m) => m.role === 'outer' && m.geometry);
  if (outers.length === 0) throw new Error(`relation ${relation.id}: no outer members`);
  const segs = outers.map((m) => m.geometry.map((g) => [g.lon, g.lat]));
  const near = (a, b) => Math.abs(a[0] - b[0]) < 1e-7 && Math.abs(a[1] - b[1]) < 1e-7;
  const ring = segs.shift().slice();
  let grew = true;
  while (grew && segs.length > 0) {
    grew = false;
    for (let i = 0; i < segs.length; i++) {
      const s = segs[i];
      const head = ring[0];
      const tail = ring[ring.length - 1];
      if (near(tail, s[0])) ring.push(...s.slice(1));
      else if (near(tail, s[s.length - 1])) ring.push(...s.slice(0, -1).reverse());
      else if (near(head, s[s.length - 1])) ring.unshift(...s.slice(0, -1));
      else if (near(head, s[0])) ring.unshift(...s.slice(1).reverse());
      else continue;
      segs.splice(i, 1);
      grew = true;
      break;
    }
  }
  if (segs.length > 0) throw new Error(`relation ${relation.id}: disjoint outer ways`);
  if (ring.length > 1 && near(ring[0], ring[ring.length - 1])) ring.pop();
  if (ring.length < 3) throw new Error(`relation ${relation.id}: degenerate ring`);
  return ring;
}

const raw = await readFile(DATA, 'utf8');
const data = JSON.parse(raw);
let changed = 0;

// -- code fixes -------------------------------------------------------------
for (const fix of CODE_FIXES) {
  const b = data.buildings.find((x) => x.id === fix.id);
  if (b && b.umdCode === fix.dropCode) {
    delete b.umdCode;
    changed += 1;
    console.log(`  ~ ${fix.id}: dropped bogus umdCode ${fix.dropCode}`);
  }
}

// -- missing relations ------------------------------------------------------
const todo = PATCHES.filter((p) => !data.buildings.some((b) => b.id === `relation/${p.id}`));
if (todo.length > 0) {
  const overpass = await fetchRelations();
  const byId = new Map(overpass.elements.map((e) => [e.id, e]));
  for (const patch of todo) {
    const rel = byId.get(patch.id);
    if (!rel) throw new Error(`relation ${patch.id} missing from Overpass response`);
    const ring = extractRing(rel);
    const entry = { id: `relation/${patch.id}`, footprint: ring, height: patch.height };
    if (patch.name) entry.name = patch.name;
    if (patch.umdCode) entry.umdCode = patch.umdCode;
    data.buildings.push(entry);
    changed += 1;
    console.log(`  + relation/${patch.id} (${ring.length} nodes) ${patch.name ?? ''}`);
  }
  data.featureCounts.buildings = data.buildings.length;
}

if (changed === 0) {
  console.log('Everything already patched — nothing to do.');
  process.exit(0);
}

// Compact dump matches the existing file format (no indent).
await writeFile(DATA, JSON.stringify(data));
console.log(`Applied ${changed} change(s) — ${data.buildings.length} buildings total.`);
