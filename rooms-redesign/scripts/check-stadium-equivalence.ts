// Equivalence check: SECU Stadium's custom builder must produce geometry
// byte-identical to the legacy 'bowl' preset path (landmarkPresetParts).
import * as fs from 'node:fs';
import { createProjection } from '../src/components/map3d/scene/projection';
import { ringToShapePoints } from '../src/components/map3d/scene/geom-utils';
import { landmarkPresetParts, makeLandmarkCtx } from '../src/components/map3d/scene/landmarks';
import { landmark as secuStadium } from '../src/components/map3d/scene/landmarks/buildings/secu-stadium';
import type { CampusData } from '../src/components/map3d/scene/types';
import type * as THREE from 'three';

const data = JSON.parse(
  fs.readFileSync('/Users/andrewxie/Documents/School/UMD Map /BACKUPS/mapbox-web copy/rooms-redesign/public/campus-data.json', 'utf8'),
) as CampusData;
const proj = createProjection(data);
const b = data.buildings.find((x) => x.id === 'way/980371045');
if (!b) throw new Error('stadium not found');
const pts = ringToShapePoints(b.footprint!, proj);
const base = Math.max(1.5, secuStadium.spec.height ?? b.height ?? 11);

const legacy = landmarkPresetParts(pts, base, secuStadium.spec);
const custom = secuStadium.build!(makeLandmarkCtx(pts, base, secuStadium.spec));

if (legacy.length !== custom.length) throw new Error(`part count ${legacy.length} != ${custom.length}`);
function attrs(g: THREE.BufferGeometry): string[] {
  return Object.keys(g.attributes).sort();
}
for (let i = 0; i < legacy.length; i++) {
  const a = attrs(legacy[i]).join(',');
  const c = attrs(custom[i]).join(',');
  if (a !== c) throw new Error(`part ${i} attributes ${a} != ${c}`);
  for (const name of ['position', 'normal', 'color']) {
    const x = legacy[i].getAttribute(name).array as Float32Array;
    const y = custom[i].getAttribute(name).array as Float32Array;
    if (x.length !== y.length) throw new Error(`part ${i} ${name} length ${x.length} != ${y.length}`);
    for (let j = 0; j < x.length; j++) {
      if (x[j] !== y[j]) throw new Error(`part ${i} ${name}[${j}] ${x[j]} != ${y[j]}`);
    }
  }
}
console.log(`OK — custom builder output is byte-identical to the legacy bowl preset (${legacy.length} parts, ${legacy.reduce((n, g) => n + g.getAttribute('position').count, 0)} vertices).`);
