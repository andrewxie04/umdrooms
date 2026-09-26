// Adele H. Stamp Student Union — way/23543832
//
// Custom builder for the sprawling 1954 Georgian student union on the north
// side of McKeldin Mall (mall facade faces SOUTH). Real-world reference:
// red brick, white trim/cornice lines, a colonnaded main entrance on the
// mall, and connected wings of varying height around a slightly taller
// central block (photos: stamp.umd.edu/visit front exterior column view;
// collegerank.net "four thick columns in front and a red brick façade").
//
// Massing (all derived from bboxOf the real 44-point OSM footprint, which is
// a stepped L/U complex — each wing is built from 2 overlapping rects so
// nothing pokes past the actual walls; the rect that dominates an overlap
// strip is 0.2m taller so no coplanar top faces z-fight):
//   1. base slab      — full footprint, 11m (tagged height), brick
//   2. west wing      — NW + SW rects at 13.0 / 12.8m
//   3. east wing      — NE + SE rects at 12.0 / 11.8m
//   4. central block  — main + north-tower rects at 14.5 / 14.7m
//   5. penthouse      — 0.6x central-block inset cap, darker brick, 15.9m
//   6. cornice rings  — white 0xf5f2ea band caps at the base top (11m) and
//                       the central block top (14.5m)
//   7. mall portico   — low stone platform + 6 thin white column boxes +
//                       white entablature slab, projecting south of the
//                       facade toward the mall
import * as THREE from 'three';
import type { LandmarkModule } from '../types';
import { facadeBoxOnEdge, mappedEdge } from './_shared/mapped-facade';

export const landmark: LandmarkModule = {
  id: 'way/23543832',
  spec: {
    name: 'Stamp Student Union',
    color: 0x995b4b, // red-brown brick in UMD's exterior photograph
    roof: 'parapet',
    nightGlow: 0.25,
  },
  maxHeight: 16.5, // penthouse tops out at 15.9m
  build(ctx) {
    const { pts, baseHeight, spec, helpers } = ctx;
    const bounds = helpers.bboxOf(pts);
    const { minX, minY, maxY } = bounds;

    const brick = helpers.withGlow(spec.color, spec.nightGlow);
    const trim = helpers.withGlow(0xf5f2ea, spec.nightGlow); // white cornice/columns
    const stone = helpers.withGlow(0xe9e5db, spec.nightGlow); // portico platform
    const roofSlate = new THREE.Color(0x565c5c);
    const roofBrick = helpers.darkerShade(brick);
    const glazing = helpers.withGlow(0x576973, spec.nightGlow);

    /** CCW shape-space rectangle. */
    const rect = (x0: number, y0: number, x1: number, y1: number): THREE.Vector2[] => [
      new THREE.Vector2(x0, y0),
      new THREE.Vector2(x1, y0),
      new THREE.Vector2(x1, y1),
      new THREE.Vector2(x0, y1),
    ];
    /** Brick mass extruded from the ground to `h`. */
    const mass = (ring: THREE.Vector2[], h: number, color = brick): THREE.BufferGeometry =>
      helpers.withColor(helpers.extrudeFootprint(ring, h), color);
    const roofCap = (ring: THREE.Vector2[], h: number): THREE.BufferGeometry => {
      const { minX: x0, maxX: x1, minY: y0, maxY: y1 } = helpers.bboxOf(ring);
      const inset = helpers.scaleAbout(ring, (x0 + x1) / 2, (y0 + y1) / 2, 0.985);
      const g = helpers.extrudeFootprint(inset, 0.16);
      g.translate(0, h + 0.02, 0);
      return helpers.withColor(g, roofSlate);
    };
    /** Thin white cornice band: ring cap from topY to topY + 0.45, outset
     * 0.35 outside the wall and inset 0.4 into the roof (no coplanar walls). */
    const cornice = (ring: THREE.Vector2[], topY: number): THREE.BufferGeometry => {
      const g = helpers.extrudeWithHoles(
        helpers.outsetRing(ring, 0.35),
        [helpers.outsetRing(ring, -0.4)],
        0.45,
      );
      g.translate(0, topY, 0);
      return helpers.withColor(g, trim);
    };

    // -- wing sub-masses (hug the real stepped footprint; see header) --------
    const westSouth = rect(minX + 1.0, minY + 1.2, minX + 28.5, minY + 53.1);
    const westNorth = rect(minX + 4.9, minY + 52.6, minX + 28.5, maxY - 1.2);
    const eastMain = rect(minX + 55.0, minY + 12.6, minX + 96.0, minY + 77.1);
    const eastSouth = rect(minX + 55.0, minY + 4.6, minX + 80.5, minY + 13.6);
    const centerMain = rect(minX + 31.5, minY + 3.1, minX + 54.0, minY + 78.1);
    const centerNorth = rect(minX + 42.5, minY + 77.6, minX + 52.7, minY + 84.4);

    // -- central rooftop penthouse (mechanical block, darker brick) ----------
    const ccx = minX + 42.75;
    const ccy = minY + 40.6;
    const penthouse = helpers.scaleAbout(centerMain, ccx, ccy, 0.6);

    // -- mall-side portico (south facade): platform, columns, entablature ----
    const px0 = minX + 40;
    const px1 = minX + 68;
    const pyFront = minY - 3.6; // projects south, onto the mall walkway
    const pyBack = minY + 0.6; // keyed 0.6m into the facade
    const platform = helpers.withColor(
      helpers.extrudeFootprint(rect(px0, pyFront, px1, pyBack), 0.9),
      stone,
    );
    const colY = minY - 2.4; // near the platform's front edge
    const columns: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 6; i++) {
      const x = px0 + 2.5 + i * 4.6;
      const col = new THREE.BoxGeometry(0.7, 5.6, 0.7);
      col.translate(x, 0.8 + 2.8, -colY); // world: z = -north; base sunk 0.1 into platform
      columns.push(helpers.withColor(col, trim));
    }
    const entablature = new THREE.BoxGeometry(px1 - px0 + 0.8, 1.3, 4.4);
    entablature.translate((px0 + px1) / 2, 6.3 + 0.65, -(minY - 1.6)); // overlaps column tops

    // The columned entrance needs dark recesses to read as an opening at
    // campus scale; the pale columns remain proud of the south facade.
    const entryGlass = new THREE.BoxGeometry(17, 5.5, 0.22);
    entryGlass.translate((px0 + px1) / 2, 3.5, -(minY + 0.15));

    // The Campus Drive elevation is a long sequence of brick piers and
    // recessed dark windows. Keep the rhythm on the two visible south wings
    // rather than wrapping every edge of this irregular footprint.
    const facade: THREE.BufferGeometry[] = [];
    const southBays = (first: readonly [number, number], last: readonly [number, number], count: number) => {
      const edge = mappedEdge(pts, bounds, first, last);
      for (let i = 0; i < count; i++) {
        const center = (i + 0.5) / count;
        const half = 0.26 / count;
        for (const floor of [3.4, 7.4]) {
          facadeBoxOnEdge(facade, ctx, edge, center - half, center + half,
            floor - 1.225, floor + 1.225, 0.13, 0.07, glazing);
        }
        const pierHalf = Math.min(0.16 / edge.length, 0.01);
        const f = Math.max(pierHalf, i / count);
        facadeBoxOnEdge(facade, ctx, edge, f - pierHalf, f + pierHalf,
          0.65, 10.55, 0.32, 0.15, trim);
      }
    };
    // The west and east wings have several small jogs. Individual window
    // runs follow their real south-facing edges and stop before each corner.
    southBays([0.0, 0.0], [0.122, 0.0], 3);
    southBays([0.187, 0.002], [0.338, 0.001], 4);
    southBays([0.687, 0.032], [0.780, 0.033], 2);
    southBays([0.780, 0.033], [0.867, 0.036], 2);
    southBays([0.869, 0.112], [0.914, 0.112], 2);
    southBays([0.914, 0.112], [0.951, 0.112], 1);
    const entryLintel = new THREE.BoxGeometry(18.7, 0.45, 0.48);
    entryLintel.translate((px0 + px1) / 2, 6.45, -(minY + 0.25));
    facade.push(helpers.withColor(entryLintel, trim));

    // UMD's exterior photo shows a low, dark-roofed arcade at the eastern
    // end of the Campus Drive frontage. The arches read as recessed doors
    // and windows in a brick wing, rather than another full-height block.
    const arcade = rect(minX + 55, minY + 2.6, minX + 81, minY + 4.95);
    const arcadeNorth = minY + 2.6;
    const arcadeFrontZ = -arcadeNorth + 0.08;
    const archPanel = (centerX: number, radius: number, spring: number, depth: number) => {
      const shape = new THREE.Shape();
      shape.moveTo(-radius, 0);
      shape.lineTo(-radius, spring);
      shape.absarc(0, spring, radius, Math.PI, 0, true);
      shape.lineTo(radius, 0);
      shape.closePath();
      const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 10 });
      g.translate(centerX, 0.85, arcadeFrontZ);
      return g;
    };
    const arcadeDetails: THREE.BufferGeometry[] = [];
    for (const centerX of [minX + 58.4, minX + 64.7, minX + 71.0, minX + 77.3]) {
      arcadeDetails.push(helpers.withColor(archPanel(centerX, 2.38, 2.55, 0.1), trim));
      const inset = archPanel(centerX, 1.98, 2.47, 0.16);
      inset.translate(0, 0, 0.13);
      arcadeDetails.push(helpers.withColor(inset, glazing));
    }
    const arcadeRoof = helpers.buildHippedRoof(arcade, 5.25, 1.05);

    return [
      mass(pts, baseHeight), // 11m full-footprint base
      mass(westSouth, 12.8),
      mass(westNorth, 13.0),
      mass(eastSouth, 11.8),
      mass(eastMain, 12.0),
      mass(centerMain, 14.5),
      mass(centerNorth, 14.7),
      mass(penthouse, 15.9, roofBrick),
      roofCap(pts, baseHeight),
      roofCap(westSouth, 12.8),
      roofCap(westNorth, 13.0),
      roofCap(eastSouth, 11.8),
      roofCap(eastMain, 12.0),
      roofCap(centerMain, 14.5),
      roofCap(centerNorth, 14.7),
      roofCap(penthouse, 15.9),
      cornice(pts, baseHeight), // continuous Georgian cornice line at 11m
      cornice(centerMain, 14.5), // crown band on the taller central block
      platform,
      helpers.withColor(entryGlass, glazing),
      ...columns,
      helpers.withColor(entablature, trim),
      ...facade,
      mass(arcade, 5.25),
      helpers.withColor(arcadeRoof, roofSlate),
      ...arcadeDetails,
    ];
  },
};
