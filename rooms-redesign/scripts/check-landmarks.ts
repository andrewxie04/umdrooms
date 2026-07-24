// Temporary sanity check for the landmarks pass — bundled with esbuild and
// run in node, then deleted. Verifies: (a) merged buildings geometry has no
// NaNs in any attribute, (b) vertex growth vs the same build with the
// landmark registry emptied, (c) every registry id exists in the data.
//
// NOTE: the registry (src/components/map3d/scene/landmarks/) auto-collects
// building modules via Vite's import.meta.glob, which esbuild/node does NOT
// provide — so under this script the glob guard leaves the registry empty
// and we register the building modules manually below (same modules the
// Vite build picks up automatically).
import * as fs from 'node:fs';
import { buildSceneGeometries } from '../src/components/map3d/scene/geometry';
import { createProjection } from '../src/components/map3d/scene/projection';
import { LANDMARK_MODULES, registerLandmark } from '../src/components/map3d/scene/landmarks';
import { landmark as mckeldinLibrary } from '../src/components/map3d/scene/landmarks/buildings/mckeldin-library';
import { landmark as stampStudentUnion } from '../src/components/map3d/scene/landmarks/buildings/stamp-student-union';
import { landmark as iribeCenter } from '../src/components/map3d/scene/landmarks/buildings/iribe-center';
import { landmark as memorialChapel } from '../src/components/map3d/scene/landmarks/buildings/memorial-chapel';
import { landmark as secuStadium } from '../src/components/map3d/scene/landmarks/buildings/secu-stadium';
import { landmark as xfinityCenter } from '../src/components/map3d/scene/landmarks/buildings/xfinity-center';
import { landmark as eppleyRecreationCenter } from '../src/components/map3d/scene/landmarks/buildings/eppley-recreation-center';
import type { CampusData } from '../src/components/map3d/scene/types';

if (Object.keys(LANDMARK_MODULES).length === 0) {
  [
    mckeldinLibrary,
    stampStudentUnion,
    iribeCenter,
    memorialChapel,
    secuStadium,
    xfinityCenter,
    eppleyRecreationCenter,
  ].forEach(registerLandmark);
}

const data = JSON.parse(
  fs.readFileSync('/Users/andrewxie/Documents/School/UMD Map /BACKUPS/mapbox-web copy/rooms-redesign/public/campus-data.json', 'utf8'),
) as CampusData;
const proj = createProjection(data);

// (c) every configured id resolves to a real building
const byId = new Set(data.buildings.map((b) => b.id));
const missing = Object.keys(LANDMARK_MODULES).filter((id) => !byId.has(id));
if (missing.length) throw new Error(`registry ids missing from data: ${missing.join(', ')}`);
console.log(`registry ids all present: ${Object.keys(LANDMARK_MODULES).length}`);

function vertexCount(): number {
  const g = buildSceneGeometries(data, proj).buildings;
  for (const name of ['position', 'normal', 'color']) {
    const attr = g.getAttribute(name);
    if (!attr) throw new Error(`missing attribute ${name}`);
    const arr = attr.array as Float32Array;
    for (let i = 0; i < arr.length; i++) {
      if (!Number.isFinite(arr[i])) throw new Error(`non-finite value in ${name}[${i}]`);
    }
  }
  return g.getAttribute('position').count;
}

const withLandmarks = vertexCount();

// Baseline: same build with the registry emptied (mutable at runtime).
const registry = LANDMARK_MODULES as Record<string, unknown>;
const saved = Object.entries(registry).map(([id, mod]) => [id, mod] as const);
for (const id of Object.keys(registry)) delete registry[id];
const baseline = vertexCount();
for (const [id, mod] of saved) registry[id] = mod;

console.log(`buildings vertices: baseline=${baseline} with-landmarks=${withLandmarks} delta=+${withLandmarks - baseline} (+${(((withLandmarks - baseline) / baseline) * 100).toFixed(2)}%)`);
console.log('OK — no NaNs, registry resolves, geometry merged.');
