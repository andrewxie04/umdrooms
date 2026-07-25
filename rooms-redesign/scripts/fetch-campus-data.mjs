#!/usr/bin/env node
/**
 * fetch-campus-data.mjs
 *
 * Pulls real UMD College Park campus geometry from OpenStreetMap via the
 * Overpass API and bakes it into public/campus-data.json for the three.js
 * renderer (see plan.md, Phase 2).
 *
 * Data: © OpenStreetMap contributors, ODbL 1.0 (openstreetmap.org/copyright)
 *
 * Usage: node scripts/fetch-campus-data.mjs
 * No dependencies — Node 20+ (global fetch).
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_JSON = path.join(ROOT, 'public', 'campus-data.json');
const OUT_LICENSE = path.join(ROOT, 'public', 'campus-data.LICENSE.txt');
const METADATA_JSON = path.join(ROOT, 'public', 'buildings_metadata.json');

// ---- Bbox (plan.md): south, west, north, east -----------------------------
// Extended south/east (was 38.979 / -76.928) to capture Paint Branch (east
// edge) and Lake Artemesia (SE of campus).
const S = 38.976, W = -76.958, N = 38.995, E = -76.918;
const CENTER = [-76.9426, 38.9869]; // [lng, lat] per plan.md
const BBOX_OUT = [W, S, E, N];      // [west, south, east, north] per plan.md

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];
const UA = 'UMD-Rooms-CampusMap/1.0 (campus geometry fetch; contact: umdrooms.com)';

const MAX_TREES = 800;
const TARGET_MAX_BYTES = 3 * 1024 * 1024; // shrink below this if possible

// ---- Overpass query --------------------------------------------------------
const QL = `
[out:json][timeout:120];
(
  way["building"](${S},${W},${N},${E});
  relation["building"](${S},${W},${N},${E});
  way["highway"](${S},${W},${N},${E});
  way["landuse"="grass"](${S},${W},${N},${E});
  way["leisure"~"^(park|garden|pitch|track|tennis_court)$"](${S},${W},${N},${E});
  way["natural"~"^(scrub|water)$"](${S},${W},${N},${E});
  way["landuse"="reservoir"](${S},${W},${N},${E});
  way["amenity"="parking"](${S},${W},${N},${E});
  way["waterway"~"^(stream|river|ditch|canal|drain)$"](${S},${W},${N},${E});
  way["amenity"="fountain"](${S},${W},${N},${E});
  way["leisure"="swimming_pool"](${S},${W},${N},${E});
  way["man_made"~"^(pond|basin)$"](${S},${W},${N},${E});
  relation["landuse"="grass"](${S},${W},${N},${E});
  relation["leisure"~"^(park|garden|pitch|track|tennis_court)$"](${S},${W},${N},${E});
  relation["natural"~"^(scrub|water)$"](${S},${W},${N},${E});
  relation["landuse"="reservoir"](${S},${W},${N},${E});
  relation["amenity"="parking"](${S},${W},${N},${E});
  relation["man_made"~"^(pond|basin)$"](${S},${W},${N},${E});
  node["natural"="tree"](${S},${W},${N},${E});
  node["amenity"="fountain"](${S},${W},${N},${E});
);
out geom;
`.trim();

// ---- Fetch with retry + endpoint fallback ----------------------------------
async function fetchOverpass() {
  let lastErr = null;
  for (const endpoint of ENDPOINTS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        console.log(`GET ${endpoint} (attempt ${attempt + 1}) …`);
        const res = await fetch(`${endpoint}?data=${encodeURIComponent(QL)}`, {
          headers: { 'User-Agent': UA, Accept: 'application/json' },
        });
        if (res.status === 429 || res.status >= 500) {
          lastErr = new Error(`HTTP ${res.status} from ${endpoint}`);
          console.warn(`  ${lastErr.message}; backing off…`);
          await sleep(3000 * (attempt + 1));
          continue;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status} from ${endpoint}`);
        const json = await res.json();
        console.log(`  OK — ${json.elements?.length ?? 0} elements`);
        return json;
      } catch (err) {
        lastErr = err;
        console.warn(`  fetch failed: ${err.message}`);
        await sleep(2000 * (attempt + 1));
      }
    }
  }
  throw lastErr ?? new Error('all Overpass endpoints failed');
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- Geo helpers -----------------------------------------------------------
const R7 = (v) => Math.round(v * 1e7) / 1e7;
const M_PER_DEG_LAT = 111320;
const mPerDegLng = (lat) => M_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180);

// Approx polygon area in m² (shoelace in local meters)
function ringAreaM2(ring) {
  if (!ring || ring.length < 3) return 0;
  const lat0 = ring[0][1];
  const kx = mPerDegLng(lat0), ky = M_PER_DEG_LAT;
  let a = 0;
  for (let i = 0; i < ring.length; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[(i + 1) % ring.length];
    a += (x1 * kx) * (y2 * ky) - (x2 * kx) * (y1 * ky);
  }
  return Math.abs(a) / 2;
}

function cleanRing(geom) {
  // geometry: [{lat, lon}, ...] → [[lng, lat], ...], drop closing dup, round
  let pts = geom.map((g) => [R7(g.lon), R7(g.lat)]);
  if (pts.length > 1) {
    const [ax, ay] = pts[0], [bx, by] = pts[pts.length - 1];
    if (ax === bx && ay === by) pts = pts.slice(0, -1);
  }
  return pts;
}

// 6 m-diameter octagon (r = 3 m) around a point, for node fountains
function pointOctagon(lng, lat) {
  const r = 3;
  const kx = mPerDegLng(lat), ky = M_PER_DEG_LAT;
  const pts = [];
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI / 4) * i;
    pts.push([R7(lng + (r * Math.cos(a)) / kx), R7(lat + (r * Math.sin(a)) / ky)]);
  }
  return pts;
}

// ---- Classification --------------------------------------------------------
function areaKind(tags) {
  if (!tags) return null;
  if (tags.amenity === 'parking') return 'parking';
  if (tags.natural === 'water' || tags.landuse === 'reservoir') return 'water';
  if (['pond', 'basin'].includes(tags.man_made)) return 'water';
  if (tags.amenity === 'fountain') return 'fountain';
  if (tags.leisure === 'swimming_pool') return 'pool';
  if (['pitch', 'track', 'tennis_court'].includes(tags.leisure)) return 'sport';
  if (tags.landuse === 'grass' || ['park', 'garden'].includes(tags.leisure) || tags.natural === 'scrub') return 'grass';
  return null;
}

const WATERWAY_WIDTHS = { river: 10, canal: 6, stream: 4, ditch: 2, drain: 2 };

const ROAD_WIDTHS = {
  motorway: 14, trunk: 14, primary: 12, secondary: 10, tertiary: 9,
  residential: 8, unclassified: 8,
};
function roadClass(tags) {
  const h = tags.highway;
  if (['footway', 'cycleway', 'pedestrian', 'steps', 'path'].includes(h)) return { kind: 'path', width: 2.5 };
  if (['service', 'parking_aisle', 'driveway'].includes(h)) return { kind: 'service', width: 5 };
  return { kind: 'road', width: ROAD_WIDTHS[h] ?? 7 };
}

function parseHeight(tags) {
  // meters: tags.height if present; else building:levels * 3.3; else 11
  if (tags.height) {
    const s = String(tags.height).trim().toLowerCase();
    const m = s.match(/^([\d.]+)\s*(m|meter|meters)?$/);
    if (m) { const v = parseFloat(m[1]); if (v > 0 && v < 500) return Math.round(v * 100) / 100; }
    const ft = s.match(/^([\d.]+)\s*(ft|feet|')$/);
    if (ft) { const v = parseFloat(ft[1]) * 0.3048; if (v > 0 && v < 500) return Math.round(v * 100) / 100; }
  }
  const lv = parseLevels(tags);
  if (lv != null) return R7(lv * 3.3);
  return 11;
}
function parseLevels(tags) {
  const raw = tags['building:levels'];
  if (raw == null) return null;
  const n = parseInt(String(raw), 10);
  return Number.isFinite(n) && n > 0 && n < 200 ? n : null;
}

// ---- UMD name matching -----------------------------------------------------
const STOPWORDS = new Set([
  'building', 'buildings', 'hall', 'center', 'centre', 'the', 'of', 'and', 'for',
  'student', 'university', 'maryland', 'college', 'park', 'science', 'sciences',
  // generic institutional nouns — fine inside containment matches, but they
  // must never drive a token match on their own
  'research', 'health', 'community', 'facility', 'facilities', 'service',
  'services', 'resources', 'institute', 'laboratory',
]);
function nameTokens(name) {
  return String(name).toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 4 && !STOPWORDS.has(t));
}
// Tokens (≥5 chars) that identify exactly ONE metadata entry, e.g. "mckeldin",
// "iribe", "williams". Tokens shared by several entries ("engineering",
// "research", "community") are NOT distinctive and must never drive a match.
function buildDistinctiveTokens(metadata) {
  const byToken = new Map(); // token -> Set(code)
  for (const m of metadata) {
    for (const t of nameTokens(m.name)) {
      if (t.length < 5) continue;
      if (!byToken.has(t)) byToken.set(t, new Set());
      byToken.get(t).add(m.code);
    }
  }
  const distinctive = new Map();
  for (const [t, codes] of byToken) if (codes.size === 1) distinctive.set(t, [...codes][0]);
  return distinctive;
}
function matchUmdCode(osmName, metadata, distinctive) {
  if (!osmName) return null;
  const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const o = norm(osmName);
  // Rule 1 — strong: normalized containment either way
  for (const m of metadata) {
    const u = norm(m.name);
    if (u && (o.includes(u) || u.includes(o))) return m.code;
  }
  // Rule 2 — exact distinctive-token hit; all hits must agree on one code,
  // AND every content token of the OSM name must appear in that metadata
  // entry's token set (kills "Physics Vortex"→PHY, "Cambridge Hall" stays
  // possible only because "cambridge" is genuinely distinctive).
  const oTok = nameTokens(osmName);
  const hits = new Set();
  for (const t of oTok) {
    if (t.length >= 5 && distinctive.has(t)) hits.add(distinctive.get(t));
  }
  if (hits.size !== 1) return null;
  const code = [...hits][0];
  const meta = metadata.find((m) => m.code === code);
  const uTok = new Set(nameTokens(meta.name));
  return oTok.every((t) => uTok.has(t)) ? code : null;
}

// ---- Stitching OSM relation outer ways into rings -------------------------
const near = (a, b) => Math.abs(a[0] - b[0]) < 1e-7 && Math.abs(a[1] - b[1]) < 1e-7;

function stitchRings(members) {
  const segs = members.filter((m) => Array.isArray(m.geometry) && m.geometry.length > 0).map((m) => m.geometry.map((g) => [R7(g.lon), R7(g.lat)]));
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

function extractRelationRings(relation) {
  const outers = (relation.members || []).filter((m) => (m.role === 'outer' || m.role === '') && m.geometry);
  if (outers.length === 0) return null;
  const rings = stitchRings(outers);
  return rings.length > 0 ? rings[0] : null;
}

function extractHoles(relation) {
  const inners = (relation.members || []).filter((m) => m.role === 'inner' && m.geometry);
  return inners.length > 0 ? stitchRings(inners) : [];
}

const RELATION_OVERRIDES = new Map([
  [9660599, { id: 'way/23547877', name: 'The Clarice Smith Performing Arts Center', umdCode: 'PAC', height: 15 }],
  [2063641, { name: 'Chemistry Building', umdCode: 'CHM', height: 11 }],
  [20447083, { name: 'Animal Science/Agricultural Engineering Building', umdCode: 'ANS', height: 7.42 }],
  [20447085, { height: 11.65 }],
  [9692235, { name: 'Benjamin Building', umdCode: 'EDU', height: 11 }],
  [9681971, { name: 'Biosciences Research Building', umdCode: 'BRB', height: 11 }],
  [8676516, { name: 'The Varsity', height: 24, levels: 6 }],
]);

const CODE_FIXES = [
  { id: 'way/24924848', dropCode: 'ANS' },
  { id: 'way/23543940', dropCode: 'CCC' },
];

const CODE_ADDS = [
  { id: 'way/1499355421', addCode: 'AJC' },
  { id: 'way/23546586', addCode: 'MTH' },
  { id: 'way/23888747', addCode: 'PHY' },
];

const HEIGHT_FIXES = [
  { id: 'way/1499355421', height: 20 },
];

const AREA_WIDEN = [
  { label: 'McKeldin Mall fountain', kind: 'water', lat: 38.98599, lng: -76.94186, factor: 1.4 },
];

// ---- Main ------------------------------------------------------------------
async function main() {
  const metadata = JSON.parse(await readFile(METADATA_JSON, 'utf8'));
  const distinctive = buildDistinctiveTokens(metadata);
  console.log(`Loaded ${metadata.length} UMD building metadata entries (${distinctive.size} distinctive tokens)`);

  const raw = await fetchOverpass();

  const buildings = [];
  const roads = [];
  const areas = [];
  const waterways = [];
  let trees = [];
  let skippedRelations = 0;
  const skipReasons = { degenerate: 0, tinyShed: 0 };

  for (const el of raw.elements ?? []) {
    const tags = el.tags ?? {};

    if (el.type === 'node') {
      if (typeof el.lat === 'number' && typeof el.lon === 'number'
        && el.lat >= S && el.lat <= N && el.lon >= W && el.lon <= E) {
        if (tags.natural === 'tree') {
          trees.push([R7(el.lon), R7(el.lat)]);
        } else if (tags.amenity === 'fountain') {
          areas.push({ kind: 'fountain', polygon: pointOctagon(el.lon, el.lat) });
        }
      }
      continue;
    }

    if (el.type === 'way') {
      const geom = el.geometry ?? [];
      if (tags.building) {
        const ring = cleanRing(geom);
        const area = ringAreaM2(ring);
        if (ring.length < 3 || area < 15) { skipReasons.degenerate++; continue; }
        const btype = String(tags.building).toLowerCase();
        const name = tags.name ?? null;
        if (['roof', 'entrance', 'garage'].includes(btype) && area < 40 && !name) {
          skipReasons.tinyShed++;
          continue;
        }
        const b = {
          id: `way/${el.id}`,
          name,
          footprint: ring,
          height: parseHeight(tags),
          levels: parseLevels(tags),
        };
        const code = matchUmdCode(name, metadata, distinctive);
        if (code) b.umdCode = code;
        buildings.push(b);
        continue;
      }
      if (tags.highway) {
        if (geom.length < 2) continue;
        const { kind, width } = roadClass(tags);
        roads.push({
          kind,
          highway: tags.highway,
          name: tags.name ?? null,
          width,
          line: geom.map((g) => [R7(g.lon), R7(g.lat)]),
        });
        continue;
      }
      if (tags.waterway) {
        if (geom.length < 2) continue;
        const w = String(tags.waterway);
        waterways.push({
          id: `way/${el.id}`,
          kind: WATERWAY_WIDTHS[w] != null ? w : 'stream',
          name: tags.name ?? null,
          width: WATERWAY_WIDTHS[w] ?? 3,
          line: geom.map((g) => [R7(g.lon), R7(g.lat)]),
        });
        continue;
      }
      const k = areaKind(tags);
      if (k) {
        const ring = cleanRing(geom);
        if (ring.length >= 3) areas.push({ kind: k, polygon: ring });
      }
      continue;
    }

    if (el.type === 'relation') {
      if (tags.building || RELATION_OVERRIDES.has(el.id)) {
        const override = RELATION_OVERRIDES.get(el.id) || {};
        const ring = extractRelationRings(el);
        if (!ring || ring.length < 3) { skippedRelations++; continue; }
        const holes = extractHoles(el);
        const name = override.name ?? tags.name ?? null;
        const b = {
          id: override.id ?? `relation/${el.id}`,
          name,
          footprint: ring,
          height: override.height ?? parseHeight(tags),
          levels: override.levels ?? parseLevels(tags),
        };
        if (holes.length > 0) b.holes = holes;
        const code = override.umdCode ?? matchUmdCode(name, metadata, distinctive);
        if (code) b.umdCode = code;
        buildings.push(b);
        continue;
      }

      const k = areaKind(tags);
      if (!k) continue;
      const outer = (el.members ?? []).filter((m) => m.type === 'way' && (m.role === 'outer' || m.role === '') && Array.isArray(m.geometry));
      if (outer.length === 0) { skippedRelations++; continue; }
      const ring = cleanRing(outer[0].geometry);
      if (ring.length >= 3) areas.push({ kind: k, polygon: ring });
      else skippedRelations++;
    }
  }

  // ---- Post-bake fixes & overrides -------------------------------------------
  for (const fix of CODE_FIXES) {
    const b = buildings.find((x) => x.id === fix.id);
    if (b && b.umdCode === fix.dropCode) delete b.umdCode;
  }
  for (const add of CODE_ADDS) {
    const b = buildings.find((x) => x.id === add.id);
    if (b) b.umdCode = add.addCode;
  }
  for (const hFix of HEIGHT_FIXES) {
    const b = buildings.find((x) => x.id === hFix.id);
    if (b) b.height = hFix.height;
  }
  for (const widen of AREA_WIDEN) {
    const mPerLng = M_PER_DEG_LAT * Math.cos((widen.lat * Math.PI) / 180);
    for (const area of areas) {
      if (area.kind !== widen.kind) continue;
      const poly = area.polygon || [];
      if (poly.length < 3) continue;
      const cLng = poly.reduce((s, p) => s + p[0], 0) / poly.length;
      const cLat = poly.reduce((s, p) => s + p[1], 0) / poly.length;
      if (Math.hypot((cLng - widen.lng) * mPerLng, (cLat - widen.lat) * M_PER_DEG_LAT) < 200) {
        area.polygon = poly.map(([lng, lat]) => [
          R7(cLng + (lng - cLng) * widen.factor),
          R7(cLat + (lat - cLat) * widen.factor),
        ]);
      }
    }
  }

  // ---- Size discipline -------------------------------------------------------
  trees = trees.slice(0, MAX_TREES);
  let droppedTrees = false, droppedTinyAreas = false;
  const buildOutput = () => ({
    center: CENTER,
    bbox: BBOX_OUT,
    generatedAt: new Date().toISOString(),
    featureCounts: {
      buildings: buildings.length,
      roads: roads.length,
      areas: areas.length,
      waterways: waterways.length,
      trees: trees.length,
    },
    buildings, roads, areas, waterways, trees,
  });
  let out = buildOutput();
  let size = Buffer.byteLength(JSON.stringify(out));
  if (size > TARGET_MAX_BYTES && trees.length > 0) {
    trees = [];
    droppedTrees = true;
    out = buildOutput();
    size = Buffer.byteLength(JSON.stringify(out));
  }
  if (size > TARGET_MAX_BYTES) {
    const before = areas.length;
    areas.splice(0, areas.length, ...areas.filter((a) => ringAreaM2(a.polygon) >= 200));
    droppedTinyAreas = areas.length !== before;
    out = buildOutput();
    size = Buffer.byteLength(JSON.stringify(out));
  }

  await writeFile(OUT_JSON, JSON.stringify(out));
  await writeFile(
    OUT_LICENSE,
    'Campus geometry data: © OpenStreetMap contributors, ODbL 1.0, openstreetmap.org/copyright\n'
  );

  // ---- Report ----------------------------------------------------------------
  const matched = buildings.filter((b) => b.umdCode);
  console.log('\n=== campus-data.json written ===');
  console.log(`path: ${OUT_JSON}`);
  console.log(`size: ${(size / 1024).toFixed(1)} KB`);
  console.log(`counts: ${JSON.stringify(out.featureCounts)}`);
  console.log(`skipped: degenerate buildings=${skipReasons.degenerate}, tiny sheds=${skipReasons.tinyShed}, unresolved relations=${skippedRelations}`);
  if (droppedTrees) console.log('NOTE: trees dropped to satisfy size budget');
  if (droppedTinyAreas) console.log('NOTE: tiny areas (<200 m²) dropped to satisfy size budget');
  console.log(`umdCode matched: ${matched.length}/${buildings.length} buildings`);

  const withMetaHeight = buildings.filter((b) => b.levels != null).length;
  console.log(`buildings with real height/levels tags: ${withMetaHeight}/${buildings.length} (rest defaulted to 11 m)`);

  console.log('\n=== spot checks ===');
  for (const probe of ['mckeldin', 'stamp', 'iribe']) {
    const hits = buildings.filter((b) => b.name && b.name.toLowerCase().includes(probe));
    if (hits.length === 0) console.log(`  "${probe}": NO MATCH in OSM names`);
    for (const h of hits) {
      console.log(`  "${probe}" → ${h.name} | id=${h.id} | height=${h.height} m | levels=${h.levels} | umdCode=${h.umdCode ?? 'none'} | pts=${h.footprint.length}`);
    }
  }

  console.log('\n=== water checks ===');
  const areaKinds = {};
  for (const a of areas) areaKinds[a.kind] = (areaKinds[a.kind] ?? 0) + 1;
  console.log(`area kinds: ${JSON.stringify(areaKinds)}`);
  const waterwayKinds = {};
  for (const w of waterways) waterwayKinds[w.kind] = (waterwayKinds[w.kind] ?? 0) + 1;
  console.log(`waterway kinds: ${JSON.stringify(waterwayKinds)}`);
  const pb = waterways.filter((w) => w.name && w.name.toLowerCase().includes('paint branch'));
  if (pb.length === 0) {
    // fallback: unnamed stream along the east edge (~-76.93)?
    const east = waterways.filter((w) => w.line.some(([lng]) => lng > -76.94 && lng < -76.92));
    console.log(`  "Paint Branch": NO NAMED MATCH; ${east.length} waterway(s) run along the east edge (-76.94..-76.92):`);
    for (const w of east) {
      const lngs = w.line.map(([lng]) => lng);
      console.log(`    ${w.id} kind=${w.kind} name=${w.name ?? 'none'} pts=${w.line.length} lng ${Math.min(...lngs)}..${Math.max(...lngs)}`);
    }
  } else {
    for (const w of pb) console.log(`  "Paint Branch" → ${w.name} | id=${w.id} | kind=${w.kind} | pts=${w.line.length}`);
  }
  const waterAreas = areas.filter((a) => a.kind === 'water');
  if (waterAreas.length === 0) {
    console.log('  largest water polygon: NONE (no water areas in bbox)');
  } else {
    const largest = waterAreas.reduce((a, b) => (b.polygon.length > a.polygon.length ? b : a));
    const lats = largest.polygon.map(([, la]) => la), lngs = largest.polygon.map(([ln]) => ln);
    console.log(`  largest water polygon: ${largest.polygon.length} pts, ~${Math.round(ringAreaM2(largest.polygon))} m², ` +
      `lat ${Math.min(...lats)}..${Math.max(...lats)}, lng ${Math.min(...lngs)}..${Math.max(...lngs)} (Lake Artemesia-ish?)`);
  }
}

main().catch((err) => {
  console.error(`FATAL: ${err.message}`);
  process.exit(1);
});
