// Brendan Iribe Center for Computer Science and Engineering (way/684949095)
// HDR, 2019 — UMD's glass "front door" on Baltimore Avenue.
//
// Real building (refs: HDR / Education Snapshots / Inform Magazine / Erie AP):
//   - six-story curved glass tower, unitized curtain wall with horizontal
//     solar-shading bands, 30-ft cantilever of the upper floors over a
//     recessed double-height ground floor / plaza
//   - dramatic projected glass fins / faceted prow on the corner
//   - roofline steps up at one end
//
// Modeling decisions (campus-zoom readable, Apple-Maps-landmark fidelity):
//   1. Recessed ground plinth (inset 1.2m, dark glass) + upper mass at the
//      full footprint -> the signature cantilever.
//   2. Upper mass as 3.5m stacked slices with alternating vertex colors ->
//      the horizontal floor-band striping of the curtain wall.
//   3. Faceted glass prow: two angled quads meeting at an outward-leaning
//      fin edge at the most protruding corner (double-wound so the fin
//      reads from both sides).
//   4. Corner tower: inset ring shifted toward the prow corner, +3.5m ->
//      roofline variation. maxHeight 18 covers it.
import * as THREE from 'three';
import type { LandmarkModule } from '../types';

const FLOOR = 3.5; // band pitch, meters

export const landmark: LandmarkModule = {
  id: 'way/684949095',
  spec: {
    name: 'Iribe Center',
    color: 0xc9d4d8,
    height: 14,
    roof: 'glass',
    accent: 0xdfe9ec,
    nightGlow: 0.6,
  },
  maxHeight: 18,
  build(ctx) {
    const { pts, cx, cy, baseHeight, spec, helpers } = ctx;
    const glow = spec.nightGlow;
    const glassA = helpers.withGlow(0xc9d4d8, glow); // curtain-wall glass
    const glassB = helpers.withGlow(0xdfe9ec, glow); // lighter band glass
    // Solar-shading band: same 0xc9d4d8 family, dropped in lightness so the
    // horizontal striping actually reads at campus zoom.
    const bandC = helpers.darkerShade(helpers.withGlow(0xc9d4d8, glow), -0.11);
    const plinthC = helpers.withGlow(0x8a969d, glow); // recessed dark glass ground floor
    const roofC = helpers.darkerShade(helpers.withGlow(0xc3ced3, glow), -0.02);

    const parts: THREE.BufferGeometry[] = [];

    // 1. Recessed ground-floor plinth (0..FLOOR), upper floors cantilever over it.
    const plinthRing = helpers.outsetRing(pts, -1.2);
    parts.push(helpers.withColor(helpers.extrudeFootprint(plinthRing, FLOOR), plinthC));

    // 2. Banded upper mass: full-footprint slices, alternating glass shades.
    const bands = Math.max(1, Math.round((baseHeight - FLOOR) / FLOOR));
    for (let i = 0; i < bands; i++) {
      const g = helpers.extrudeFootprint(pts, FLOOR);
      g.translate(0, FLOOR + i * FLOOR, 0);
      parts.push(helpers.withColor(g, i % 2 === 0 ? glassB : bandC));
    }

    // 3. Thin roof cap hides the top slice edge.
    const capRing = helpers.outsetRing(pts, -0.35);
    const cap = helpers.extrudeFootprint(capRing, 0.4);
    cap.translate(0, baseHeight, 0);
    parts.push(helpers.withColor(cap, roofC));

    // 4. Taller corner tower, biased toward the prow corner (roofline step).
    //    Find the most protruding corner = footprint vertex farthest from centroid.
    let corner = pts[0];
    let best = -1;
    for (const p of pts) {
      const d = (p.x - cx) ** 2 + (p.y - cy) ** 2;
      if (d > best) {
        best = d;
        corner = p;
      }
    }
    const dirX = corner.x - cx;
    const dirY = corner.y - cy;
    const dirLen = Math.hypot(dirX, dirY) || 1;
    const ux = dirX / dirLen;
    const uy = dirY / dirLen;
    const towerRing = helpers.outsetRing(pts, -16).map(
      (p) => new THREE.Vector2(p.x + ux * 10, p.y + uy * 10),
    );
    const tower = helpers.extrudeFootprint(towerRing, FLOOR);
    tower.translate(0, baseHeight, 0); // baseHeight .. baseHeight+3.5 = 17.5 apex
    parts.push(helpers.withColor(tower, glassA));
    const towerCapRing = helpers.outsetRing(towerRing, -0.3);
    const towerCap = helpers.extrudeFootprint(towerCapRing, 0.4);
    towerCap.translate(0, baseHeight + FLOOR, 0);
    parts.push(helpers.withColor(towerCap, roofC));

    // 5. Faceted glass prow fin at that corner. Built in shape space
    //    (xEast, yNorth, zUp) then rotateX(-PI/2) -> world (x, up, -north).
    const tx = -uy; // tangent along the wall
    const ty = ux;
    const finHalf = 7.5; // fin width along the facade
    const rootX = corner.x - ux * 1.5; // root edge 1.5m inside the facade
    const rootY = corner.y - uy * 1.5;
    const tipBaseX = corner.x + ux * 2.4; // fin base protrudes
    const tipBaseY = corner.y + uy * 2.4;
    const tipTopX = corner.x + ux * 5.2; // and leans outward as it rises
    const tipTopY = corner.y + uy * 5.2;
    const zBot = 2.5;
    const zMid = baseHeight + 0.5; // 14.5
    const zTop = 17.5;

    const positions: number[] = [];
    const tri = (
      ax: number, ay: number, az: number,
      bx: number, by: number, bz: number,
      cx2: number, cy2: number, cz2: number,
    ): void => {
      // push both windings: the fin is a thin membrane read from both sides
      positions.push(ax, ay, az, bx, by, bz, cx2, cy2, cz2);
      positions.push(ax, ay, az, cx2, cy2, cz2, bx, by, bz);
    };
    for (const s of [1, -1] as const) {
      // facet root edge (tapers slightly inward with height)
      const rbX = rootX + tx * finHalf * s;
      const rbY = rootY + ty * finHalf * s;
      const rtX = rootX + tx * finHalf * 0.55 * s;
      const rtY = rootY + ty * finHalf * 0.55 * s;
      // quad: rootBot -> tipBase -> tipTop -> rootTop (two triangles)
      tri(rbX, rbY, zBot, tipBaseX, tipBaseY, zBot, tipTopX, tipTopY, zTop);
      tri(rbX, rbY, zBot, tipTopX, tipTopY, zTop, rtX, rtY, zMid);
    }
    const fin = new THREE.BufferGeometry();
    fin.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    fin.rotateX(-Math.PI / 2);
    fin.computeVertexNormals();
    parts.push(helpers.withColor(fin, glassB));

    return parts;
  },
};
