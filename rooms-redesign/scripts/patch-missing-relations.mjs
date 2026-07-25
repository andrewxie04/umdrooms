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
// …and tags extra ways of multi-way buildings (way/1499355421 -> 'AJC') so
// the whole complex highlights.
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
  {
    id: 9681971,
    name: 'Biosciences Research Building',
    umdCode: 'BRB',
    height: 11,
  },
  {
    // North campus apartments on Baltimore Ave. Two outer ways that join
    // end-to-end into one ring (extractRing stitches them). No height tag;
    // 6 levels x 3.3 = 19.8 matches the bake's levels->height rule.
    id: 8676516,
    name: 'The Varsity',
    umdCode: null,
    height: 19.8,
    levels: 6,
  },
];

/** Buildings whose bake-assigned umdCode belongs to a different building. */
const CODE_FIXES = [
  { id: 'way/24924848', dropCode: 'ANS' }, // Animal Science Service Building
  { id: 'way/23543940', dropCode: 'CCC' }, // Cambridge Hall
];

/** One real building split across several OSM ways: tag the extra parts with
 * the same umdCode so code-driven UI (the selection highlight collects ALL
 * code matches) covers the whole complex. */
const CODE_ADDS = [
  // A. James Clark Hall = named angled-prow way/363185813 (which carries
  // AJC from the bake) + this unnamed main mass.
  { id: 'way/1499355421', addCode: 'AJC' },
  // Buildings whose UMD code never got assigned by the bake (OSM name
  // differs from the UMD name): tag them so highlight matches by code
  // instead of relying on the nearest-centroid fallback.
  { id: 'way/23546586', addCode: 'MTH' }, // William E. Kirwan Hall = Math
  { id: 'way/23888747', addCode: 'PHY' }, // John S. Toll Physics
];

/** Area polygons widened for legibility. OSM traces the McKeldin Mall
 * reflecting pool as a 73m x 5.2m hairline, which nearly vanishes under the
 * water shader's shore ring + gradient insets at browsing zooms. Matched by
 * centroid (areas carry no ids) and scaled about it on the short axis. */
const AREA_WIDEN = [
  {
    label: 'McKeldin Mall fountain',
    kind: 'water',
    lat: 38.98599,
    lng: -76.94186,
    /** Short-axis scale: 5.2m -> ~7.3m. */
    factor: 1.4,
  },
];

/** OSM height tags that are LiDAR maxima (antennas/penthouses), not wall
 * height — they render (and highlight) as comically tall blocks. */
const HEIGHT_FIXES = [
  // AJC main mass: tagged 38.41; the building is 5 lab floors. 20 matches
  // the a-james-clark-hall landmark module's spec height.
  { id: 'way/1499355421', height: 20 },
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

const near = (a, b) => Math.abs(a[0] - b[0]) < 1e-7 && Math.abs(a[1] - b[1]) < 1e-7;

/** Stitches a role's member ways into closed rings by shared endpoints. A
 * relation can hold several disjoint rings for one role (e.g. three separate
 * courtyards as `inner`), so this returns an array. Each ring comes back in
 * the dataset convention: unclosed (first != last), degenerates dropped. */
function stitchRings(members) {
  const segs = members.map((m) => m.geometry.map((g) => [g.lon, g.lat]));
  const rings = [];
  while (segs.length > 0) {
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
    if (ring.length > 1 && near(ring[0], ring[ring.length - 1])) ring.pop();
    if (ring.length >= 3) rings.push(ring);
  }
  return rings;
}

/** The relation's single outer ring. */
function extractRing(relation) {
  const outers = relation.members.filter((m) => m.role === 'outer' && m.geometry);
  if (outers.length === 0) throw new Error(`relation ${relation.id}: no outer members`);
  const rings = stitchRings(outers);
  if (rings.length === 0) throw new Error(`relation ${relation.id}: degenerate outer ring`);
  if (rings.length > 1) {
    throw new Error(
      `relation ${relation.id}: ${rings.length} disjoint outer rings — needs a multi-part entry`,
    );
  }
  return rings[0];
}

/** Courtyard rings (`inner` members) — [] when the relation has none. */
function extractHoles(relation) {
  const inners = relation.members.filter((m) => m.role === 'inner' && m.geometry);
  return inners.length > 0 ? stitchRings(inners) : [];
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

for (const add of CODE_ADDS) {
  const b = data.buildings.find((x) => x.id === add.id);
  if (b && b.umdCode !== add.addCode) {
    b.umdCode = add.addCode;
    changed += 1;
    console.log(`  ~ ${add.id}: tagged umdCode ${add.addCode}`);
  }
}

// -- area widening ----------------------------------------------------------
const M_PER_DEG_LAT = 111320;
for (const widen of AREA_WIDEN) {
  const mPerLng = M_PER_DEG_LAT * Math.cos((widen.lat * Math.PI) / 180);
  // Find the matching area by kind + centroid proximity (areas carry no ids).
  let match = null;
  for (const area of data.areas) {
    if (area.kind !== widen.kind) continue;
    const poly = area.polygon || [];
    if (poly.length < 3) continue;
    const cLng = poly.reduce((s, p) => s + p[0], 0) / poly.length;
    const cLat = poly.reduce((s, p) => s + p[1], 0) / poly.length;
    const d = Math.hypot((cLng - widen.lng) * mPerLng, (cLat - widen.lat) * M_PER_DEG_LAT);
    if (d < 15) {
      match = { area, cLng, cLat };
      break;
    }
  }
  if (!match) {
    console.warn(`  ! ${widen.label}: no matching ${widen.kind} area near centroid — skipped`);
    continue;
  }
  const { area, cLng, cLat } = match;
  const spanLng =
    (Math.max(...area.polygon.map((p) => p[0])) - Math.min(...area.polygon.map((p) => p[0]))) *
    mPerLng;
  const spanLat =
    (Math.max(...area.polygon.map((p) => p[1])) - Math.min(...area.polygon.map((p) => p[1]))) *
    M_PER_DEG_LAT;
  const shortIsLat = spanLat <= spanLng;
  const before = shortIsLat ? spanLat : spanLng;
  const targetKey = shortIsLat ? '_widenedLat' : '_widenedLng';
  if (area[targetKey]) {
    console.log(`  = ${widen.label}: already widened — skipped`);
    continue;
  }
  area.polygon = area.polygon.map(([lng, lat]) =>
    shortIsLat
      ? [lng, cLat + (lat - cLat) * widen.factor]
      : [cLng + (lng - cLng) * widen.factor, lat],
  );
  area[targetKey] = true; // idempotence marker
  changed += 1;
  console.log(
    `  ~ ${widen.label}: short axis ${before.toFixed(1)}m -> ${(before * widen.factor).toFixed(1)}m`,
  );
}

for (const fix of HEIGHT_FIXES) {
  const b = data.buildings.find((x) => x.id === fix.id);
  if (b && b.height !== fix.height) {
    console.log(`  ~ ${fix.id}: height ${b.height} -> ${fix.height}`);
    b.height = fix.height;
    changed += 1;
  }
}

// -- missing relations ------------------------------------------------------
// `holes` absent = never checked for courtyards (entries predating hole
// support); `holes: []` = checked, none found. Both the add and the backfill
// paths need the Overpass geometry, so they share one fetch.
const todo = PATCHES.filter((p) => !data.buildings.some((b) => b.id === `relation/${p.id}`));
const backfill = PATCHES.filter((p) => {
  const b = data.buildings.find((x) => x.id === `relation/${p.id}`);
  return b && b.holes === undefined;
});
if (todo.length > 0 || backfill.length > 0) {
  const overpass = await fetchRelations();
  const byId = new Map(overpass.elements.map((e) => [e.id, e]));

  for (const patch of backfill) {
    const rel = byId.get(patch.id);
    if (!rel) {
      console.warn(`  ! relation ${patch.id}: not in Overpass response — holes not backfilled`);
      continue;
    }
    const entry = data.buildings.find((x) => x.id === `relation/${patch.id}`);
    const holes = extractHoles(rel);
    entry.holes = holes; // [] records "checked, no courtyards"
    changed += 1;
    console.log(
      `  ~ relation/${patch.id}: ${holes.length} courtyard(s) punched out ${patch.name ?? ''}`,
    );
  }
  for (const patch of todo) {
    const rel = byId.get(patch.id);
    if (!rel) throw new Error(`relation ${patch.id} missing from Overpass response`);
    const ring = extractRing(rel);
    const holes = extractHoles(rel);
    const entry = { id: `relation/${patch.id}`, footprint: ring, height: patch.height };
    if (holes.length > 0) entry.holes = holes;
    if (patch.name) entry.name = patch.name;
    if (patch.umdCode) entry.umdCode = patch.umdCode;
    if (patch.levels != null) entry.levels = patch.levels;
    data.buildings.push(entry);
    changed += 1;
    const holeNote = holes.length > 0 ? `, ${holes.length} courtyard(s)` : '';
    console.log(`  + relation/${patch.id} (${ring.length} nodes${holeNote}) ${patch.name ?? ''}`);
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
