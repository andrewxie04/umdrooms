// Clarice Smith Performing Arts Center ("The Clarice") — way/23547877.
//
// NOTE: the bake (public/campus-data.json at authoring time) does NOT include
// this way — OSM maps the Clarice as multipolygon relation 9660599 with all
// tags on the relation, so the untagged outer way 23547877 was dropped (the
// dataset contains zero relation/* entries). This module is keyed to the real
// outer way id; it renders as soon as the bake includes way/23547877. UMD
// building code: PAC (buildings_metadata.json id 386, 38.99068, -76.95044).
//
// ARCHITECTURE (Moore Ruble Yudell, 2001; verified against Esri World
// Imagery z19 aerial + Wikipedia): a white "arts village" of low limestone
// wings (School of Music / TDPS, ~11m) wrapped around three signature masses:
//   - Dekelboum Concert Hall: cylindrical DRUM (~18m) in the NE quadrant,
//     wrapped on the plaza side by the curved glass Grand Pavilion.
//   - Kay Theatre: tall blank FLY TOWER (~30m box) over the stage house on
//     the north half of the proscenium block, mid-east of the complex.
//   - Angled GLASS lobby bars (~13m, sawtooth atrium spine) running SW from
//     the drum through the village, plus hipped recital-hall pavilions at
//     the north tip.
//
// The drum + pavilion sit in an annulus carved out of the base mass so the
// curved glass wall reads against open air instead of z-fighting the base.
// All anchors are FOOTPRINT-BBOX FRACTIONS of the real OSM ring (x=east,
// y=north): measured off way/23547877 (bbox ~174.5m x ~233.5m). Sub-mass
// rectangles are additionally shrunk inward until every corner is inside the
// real footprint (fitRect), so nothing can poke outside the actual walls.
import * as THREE from 'three';
import type { LandmarkModule } from '../types';

/** Ray-cast point-in-ring over shape-space Vector2s (x=east, y=north). */
function pointInRing(pts: THREE.Vector2[], x: number, y: number): boolean {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i];
    const b = pts[j];
    if (a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) {
      inside = !inside;
    }
  }
  return inside;
}

export const landmark: LandmarkModule = {
  id: 'way/23547877',
  spec: {
    name: 'Clarice Smith Performing Arts Center',
    color: 0xece7d8, // warm-white limestone panels
    height: 11, // village wing baseline
    accent: 0xdfe9ec, // angled glass lobby / Grand Pavilion
    nightGlow: 0.4, // lobby glass glows warm at night
  },
  maxHeight: 32, // fly tower box (30m) + roof lip
  build(ctx) {
    const { pts, baseHeight, spec, helpers } = ctx;
    const white = helpers.withGlow(spec.color, spec.nightGlow);
    const whiteDark = helpers.darkerShade(white, -0.06);
    const glassGlow = Math.min(1, (spec.nightGlow ?? 0) + 0.4);
    const glass = helpers.withGlow(spec.accent ?? 0xdfe9ec, glassGlow);

    const { minX, maxX, minY, maxY } = helpers.bboxOf(pts);
    const w = maxX - minX;
    const h = maxY - minY;
    const ax = (f: number): number => minX + f * w;
    const ay = (f: number): number => minY + f * h;

    /** CCW rectangle ring from bbox fractions, shrunk toward its center
     * until all corners sit inside the real footprint (max ~28% shrink). */
    const fitRect = (fx0: number, fy0: number, fx1: number, fy1: number): THREE.Vector2[] => {
      let [x0, y0, x1, y1] = [ax(fx0), ay(fy0), ax(fx1), ay(fy1)];
      for (let k = 0; k < 12; k++) {
        const ok =
          pointInRing(pts, x0, y0) &&
          pointInRing(pts, x1, y0) &&
          pointInRing(pts, x1, y1) &&
          pointInRing(pts, x0, y1);
        if (ok) break;
        const mx = (x0 + x1) / 2;
        const my = (y0 + y1) / 2;
        x0 += (mx - x0) * 0.03;
        x1 += (mx - x1) * 0.03;
        y0 += (my - y0) * 0.03;
        y1 += (my - y1) * 0.03;
      }
      return [
        new THREE.Vector2(x0, y0),
        new THREE.Vector2(x1, y0),
        new THREE.Vector2(x1, y1),
        new THREE.Vector2(x0, y1),
      ];
    };

    const circle = (ccx: number, ccy: number, r: number, n: number): THREE.Vector2[] => {
      const ring: THREE.Vector2[] = [];
      for (let i = 0; i < n; i++) {
        const t = (i / n) * Math.PI * 2;
        ring.push(new THREE.Vector2(ccx + r * Math.cos(t), ccy + r * Math.sin(t)));
      }
      return ring;
    };

    /** Rotated bar ring from shape-space A to B with a fixed width (CCW). */
    const bar = (
      ax0: number,
      ay0: number,
      bx0: number,
      by0: number,
      width: number,
    ): THREE.Vector2[] => {
      const dx = bx0 - ax0;
      const dy = by0 - ay0;
      const len = Math.hypot(dx, dy) || 1;
      const px = (-dy / len) * (width / 2);
      const py = (dx / len) * (width / 2);
      return [
        new THREE.Vector2(ax0 + px, ay0 + py),
        new THREE.Vector2(bx0 + px, by0 + py),
        new THREE.Vector2(bx0 - px, by0 - py),
        new THREE.Vector2(ax0 - px, ay0 - py),
      ];
    };

    // -- anchors measured off the real ring (verified on z19 aerial) --------
    const drumC = { x: ax(0.571), y: ay(0.648) }; // Dekelboum drum center
    const DRUM_R = 18;
    const DRUM_H = 18;
    const HOLE_R = 24; // annulus carved from the base for the drum + pavilion
    const GLASS_H = 13; // glass pieces rise ~2m above the 11m village roofs

    const parts: THREE.BufferGeometry[] = [];

    // 1. Arts-village base: whole footprint at wing height, annulus carved
    //    around the drum so the Grand Pavilion glass reads against open air.
    parts.push(
      helpers.withColor(
        helpers.extrudeWithHoles(pts, [circle(drumC.x, drumC.y, HOLE_R, 36)], baseHeight),
        white,
      ),
    );

    // 2. East service/scene-shop block along the Stadium Drive frontage.
    parts.push(
      helpers.withColor(helpers.extrudeFootprint(fitRect(0.735, 0.207, 0.985, 0.545), 14), white),
    );

    // 3. Kay Theatre auditorium block (proscenium hall, N-S ridge).
    parts.push(
      helpers.withColor(helpers.extrudeFootprint(fitRect(0.594, 0.306, 0.726, 0.542), 17), white),
    );

    // 4. Fly tower: tall blank box over the stage house + thin roof lip.
    const tower = fitRect(0.612, 0.439, 0.712, 0.536);
    parts.push(helpers.withColor(helpers.extrudeFootprint(tower, 30), white));
    const { cx: tcx, cy: tcy } = helpers.centroidOf(tower);
    parts.push(
      helpers.withColor(
        helpers.extrudeFootprint(helpers.scaleAbout(tower, tcx, tcy, 0.86), 30.8),
        whiteDark,
      ),
    );

    // 5. Dekelboum drum: faceted cylinder + inset darker roof cap.
    const drum = new THREE.CylinderGeometry(DRUM_R, DRUM_R, DRUM_H, 28);
    drum.translate(drumC.x, DRUM_H / 2, -drumC.y); // world z = -north
    parts.push(helpers.withColor(drum, white));
    const cap = new THREE.CylinderGeometry(DRUM_R - 3, DRUM_R - 3, 1.8, 28);
    cap.translate(drumC.x, DRUM_H - 0.15 + 0.9, -drumC.y); // overlaps drum top — no coplanar faces
    parts.push(helpers.withColor(cap, whiteDark));

    // 6. Grand Pavilion: curved glass band wrapping the drum's plaza side
    //    (S -> SE -> E -> NE) inside the carved annulus.
    const band: THREE.Vector2[] = [];
    const T0 = (-115 * Math.PI) / 180;
    const T1 = (25 * Math.PI) / 180;
    const SEG = 16;
    for (let i = 0; i <= SEG; i++) {
      const t = T0 + ((T1 - T0) * i) / SEG;
      band.push(new THREE.Vector2(drumC.x + 23.5 * Math.cos(t), drumC.y + 23.5 * Math.sin(t)));
    }
    for (let i = SEG; i >= 0; i--) {
      const t = T0 + ((T1 - T0) * i) / SEG;
      band.push(new THREE.Vector2(drumC.x + 19.5 * Math.cos(t), drumC.y + 19.5 * Math.sin(t)));
    }
    parts.push(helpers.withColor(helpers.extrudeFootprint(band, GLASS_H), glass));

    // 7. Angled glass lobby bars: the atrium spine running SW from the drum
    //    through the village, plus the far-west link along the prong wing.
    parts.push(
      helpers.withColor(
        helpers.extrudeFootprint(bar(ax(0.296), ay(0.5065), ax(0.503), ay(0.632), 9), GLASS_H),
        glass,
      ),
    );
    parts.push(
      helpers.withColor(
        helpers.extrudeFootprint(bar(ax(0.1014), ay(0.439), ax(0.2676), ay(0.5113), 7), GLASS_H),
        glass,
      ),
    );

    // 8. North tip: recital-hall pavilions with hipped roofs (Gildenhorn
    //    block reads as small hip-roofed pavilions on the aerial).
    const pavH1 = 12 + helpers.hash01(`${spec.name}:pav1`) * 1.5;
    const pav1 = fitRect(0.319, 0.799, 0.43, 0.885);
    parts.push(helpers.withColor(helpers.extrudeFootprint(pav1, pavH1), white));
    parts.push(
      helpers.withColor(helpers.buildHippedRoof(pav1, pavH1, 2.5), helpers.darkerShade(white, -0.075)),
    );
    const pavH2 = 12 + helpers.hash01(`${spec.name}:pav2`) * 1.5;
    const pav2 = fitRect(0.42, 0.83, 0.51, 0.97);
    parts.push(helpers.withColor(helpers.extrudeFootprint(pav2, pavH2), white));
    parts.push(
      helpers.withColor(helpers.buildHippedRoof(pav2, pavH2, 2.5), helpers.darkerShade(white, -0.075)),
    );

    return parts;
  },
};
