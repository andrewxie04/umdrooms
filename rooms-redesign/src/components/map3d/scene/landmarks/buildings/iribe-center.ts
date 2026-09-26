// IRB: six-story curved curtain wall, cantilevered upper floors, roof park.
// References: https://www.whiting-turner.com/projects/higher-education/university-of-maryland-brendan-iribe-center-for-computer-science-and-innovation/
// https://www.erieap.com/portfolio_page/the-brendan-iribe-center-at-the-university-of-maryland/
import * as THREE from 'three';
import type { LandmarkModule } from '../types';
import { addBox, fractionBox } from './_shared/science-parts';

const GROUND = 6.5;
const UPPER_FLOOR = 3.0;

export const landmark: LandmarkModule = {
  id: 'way/684949095',
  spec: {
    name: 'Brendan Iribe Center', color: 0xb8cbd1, height: 21.5,
    roof: 'glass', accent: 0xd6e2e2, nightGlow: 0.45,
  },
  maxHeight: 23,
  build(ctx) {
    const { pts, helpers } = ctx;
    const p: THREE.BufferGeometry[] = [];
    const darkGlass = helpers.withGlow(0x758b96, ctx.spec.nightGlow);
    const glass = helpers.withGlow(0xb8cbd1, ctx.spec.nightGlow);
    const pale = helpers.withGlow(0xa9c7d1, ctx.spec.nightGlow);
    const metal = helpers.withGlow(0x89979b, ctx.spec.nightGlow);
    // The lower glass story is set back. The upper mass follows the mapped
    // curved footprint and projects over it, the building's defining gesture.
    p.push(helpers.withColor(helpers.extrudeFootprint(helpers.outsetRing(pts, -1.3), GROUND), darkGlass));
    for (let i = 0; i < 5; i++) {
      const floor = helpers.extrudeFootprint(pts, UPPER_FLOOR);
      floor.translate(0, GROUND + i * UPPER_FLOOR, 0);
      p.push(helpers.withColor(floor, i % 2 ? glass : pale));
      // Keep only the vertical perimeter faces. Extruding a complete metal
      // slab gave it a horizontal cap on exactly the same plane as the floor
      // roof. A holed polygon is unreliable on this concave mapped outline.
      const fullBand = helpers.extrudeFootprint(helpers.outsetRing(pts, 0.14), 0.18);
      const source = fullBand.index ? fullBand.toNonIndexed() : fullBand;
      const sourcePos = source.getAttribute('position');
      const sourceNorm = source.getAttribute('normal');
      const sidePos: number[] = [];
      const sideNorm: number[] = [];
      for (let vertex = 0; vertex + 2 < sourcePos.count; vertex += 3) {
        if (Math.abs(sourceNorm.getY(vertex)) > 0.5) continue;
        for (let corner = 0; corner < 3; corner++) {
          const j = vertex + corner;
          sidePos.push(sourcePos.getX(j), sourcePos.getY(j), sourcePos.getZ(j));
          sideNorm.push(sourceNorm.getX(j), sourceNorm.getY(j), sourceNorm.getZ(j));
        }
      }
      const band = new THREE.BufferGeometry();
      band.setAttribute('position', new THREE.Float32BufferAttribute(sidePos, 3));
      band.setAttribute('normal', new THREE.Float32BufferAttribute(sideNorm, 3));
      if (source !== fullBand) source.dispose();
      fullBand.dispose();
      band.translate(0, GROUND + (i + 1) * UPPER_FLOOR - 0.18, 0);
      p.push(helpers.withColor(band, metal));
    }
    // Slim curtain-wall mullions and projecting fins follow the mapped curved
    // perimeter. Spacing is architectural shorthand rather than a pane count.
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      const length = a.distanceTo(b);
      const steps = Math.max(1, Math.round(length / 4.2));
      for (let j = 0; j < steps; j++) {
        const t = j / steps;
        const x = a.x + (b.x - a.x) * t;
        const north = a.y + (b.y - a.y) * t;
        addBox(p, ctx, x - 0.075, x + 0.075, north - 0.075, north + 0.075,
          GROUND, 21.45, 0x748c98);
        if (j % 3 === 0) {
          addBox(p, ctx, x - 0.12, x + 0.12, north - 0.28, north + 0.28,
            12.5, 21.45, 0x89999b);
        }
      }
    }
    // Reisse Park reads as a planted inset inside a low roof-edge guard.
    fractionBox(p, ctx, 0.31, 0.65, 0.13, 0.35, 21.5, 21.68, 0x596b61);
    fractionBox(p, ctx, 0.34, 0.62, 0.16, 0.32, 21.68, 21.78, 0x779573);
    fractionBox(p, ctx, 0.30, 0.66, 0.12, 0.14, 21.5, 22.0, 0x9ca9a7);
    return p;
  },
};
