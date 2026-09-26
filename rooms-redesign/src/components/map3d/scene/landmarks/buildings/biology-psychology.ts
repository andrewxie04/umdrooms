// Biology-Psychology Building. UMD's Facilities and Psychology photographs
// show a long, low red-brick academic block, a shallow dark roof and a
// four-column pale-stone entrance facing Hornbake Plaza to the south.
// The mapped footprint is retained rather than replacing it with a rectangle.
// References: https://facilities.umd.edu/node/371
// https://psyc.umd.edu/history-department
import * as THREE from 'three';
import type { LandmarkModule } from '../types';
import { box, color, portico, type Parts } from './historic-central-parts';

export const landmark: LandmarkModule = {
  id: 'way/23958000',
  spec: {
    name: 'Biology-Psychology Building',
    color: 0x995342,
    accent: 0xe7dfce,
    height: 10.8,
  },
  maxHeight: 12.5,
  build(ctx) {
    const parts: Parts = [];
    const { pts, helpers } = ctx;
    const bounds = helpers.bboxOf(pts);
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const brick = color(0x995342);
    const stone = color(0xe7dfce);
    const roof = color(0x53595a);
    const glazing = color(0x465962);

    // Three occupied levels and a clear stone ground course. The slight
    // outward offsets keep details visible at an oblique map camera angle.
    parts.push(helpers.withColor(helpers.extrudeFootprint(pts, 10.4), brick));
    const plinth = helpers.extrudeFootprint(helpers.outsetRing(pts, 0.11), 0.54);
    parts.push(helpers.withColor(plinth, stone));
    const cornice = helpers.extrudeFootprint(helpers.outsetRing(pts, 0.17), 0.38);
    cornice.translate(0, 10.25, 0);
    parts.push(helpers.withColor(cornice, stone));
    // Low pitched roof visible in UMD exterior photographs. It sits above
    // the cornice so its planes do not fight the flat structural roof below.
    const roofRing = helpers.scaleAbout(pts, ctx.cx, ctx.cy, 0.973);
    parts.push(helpers.withColor(helpers.buildHippedRoof(roofRing, 10.64, 1.34), roof));

    // The south entrance is a stone portico with four columns, a straight
    // entablature and dark glazing behind it, rather than a full-width glass
    // wall. The portico includes its own shallow plinth.
    portico(ctx, parts, {
      side: 'south', width: 17.8, depth: 3.4, columns: 4,
      baseY: 0.55, columnHeight: 7.1,
    }, stone, glazing);
    // A dark doorway and narrow pale mullion read clearly between columns.
    box(ctx, parts, centerX - 4.4, centerX + 4.4,
      bounds.minY - 0.23, bounds.minY - 0.11, 0.86, 4.35, glazing);
    box(ctx, parts, centerX - 0.10, centerX + 0.10,
      bounds.minY - 0.30, bounds.minY - 0.20, 0.86, 4.34, stone);
    // The entrance's upper level is a tall glazed band under the name panel.
    box(ctx, parts, centerX - 8.4, centerX + 8.4,
      bounds.minY - 0.22, bounds.minY - 0.10, 4.78, 6.70, glazing);
    box(ctx, parts, centerX - 9.9, centerX + 9.9,
      bounds.minY - 0.47, bounds.minY - 0.28, 7.54, 8.17, stone);
    for (let i = 0; i < 4; i++) {
      const x = centerX - 6.3 + i * 4.2;
      box(ctx, parts, x - 0.09, x + 0.09,
        bounds.minY - 0.29, bounds.minY - 0.19, 4.78, 6.70, stone);
    }
    // Short flights of broad steps make the entrance legible from above.
    for (let i = 0; i < 3; i++) {
      const outward = 3.55 + i * 0.58;
      box(ctx, parts, centerX - 9.0, centerX + 9.0,
        bounds.minY - outward - 0.54, bounds.minY - outward,
        0.03, 0.42 - i * 0.10, stone);
    }
    // A few small mechanical boxes on the shallow roof, kept toward the
    // back so they do not overpower its recognisable silhouette.
    const unit = new THREE.BoxGeometry(2.8, 0.50, 2.1);
    unit.translate(centerX + 12, 11.16, -(bounds.maxY - 7));
    parts.push(helpers.withColor(unit, color(0x777d79)));
    return parts;
  },
};
