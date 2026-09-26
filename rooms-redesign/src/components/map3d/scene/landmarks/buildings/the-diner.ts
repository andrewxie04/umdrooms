// The Diner / Ellicott Area Dining Hall (UMD building 257), way/23579583.
// UMD Facilities identifies the 1967 building and photographs the exterior:
// https://facilities.umd.edu/node/437
// Maryland Today's 2023 exterior photo shows tan brick, pale entrance trim,
// a round window and a raised, white-framed clerestory above the entrance:
// https://today.umd.edu/what-you-need-to-know-in-fall-2023-dining-services
// The former Diner space now houses North Campus Market. The local 2023 MD
// iMAP aerial (design-reference/campus-aerial-core.jpg) shows a mostly flat,
// equipment-filled roof: https://mdgeodata.md.gov/imagery/rest/services/SixInch/SixInchImagery/ImageServer
// The main mass follows the actual campus-data ring.
import * as THREE from 'three';
import type { LandmarkModule } from '../types';
import { addBox, addFootprint, fractionBox } from './_shared/science-parts';

export const landmark: LandmarkModule = {
  id: 'way/23579583',
  spec: {
    name: 'The Diner',
    color: 0xa77b62,
    accent: 0xd9d6cb,
    height: 5.0,
    roof: 'parapet',
    nightGlow: 0.12,
  },
  maxHeight: 7.65,
  build(ctx) {
    const parts: THREE.BufferGeometry[] = [];
    const b = ctx.helpers.bboxOf(ctx.pts);
    const x = (f: number) => b.minX + (b.maxX - b.minX) * f;
    const north = (f: number) => b.minY + (b.maxY - b.minY) * f;
    const brick = 0xa77b62;
    const pale = 0xd9d6cb;
    const glazing = 0x53636a;

    // The 37-vertex mapped outline includes the south entrance steps, broad
    // western kitchen wing and small rounded southeast projection. Its tagged
    // 3.3 m height is low for the photographed door and upper clerestory; the
    // 5 m wall height is an approximation from those visible proportions.
    addFootprint(parts, ctx, ctx.pts, 5.0, brick);
    addFootprint(parts, ctx, ctx.helpers.scaleAbout(ctx.pts, ctx.cx, ctx.cy, 0.993),
      5.16, 0xb8b8b1, 5.0);

    // Thin, light masonry cornice and dark roof edge follow the stepped plan.
    addFootprint(parts, ctx, ctx.helpers.scaleAbout(ctx.pts, ctx.cx, ctx.cy, 0.998),
      5.34, pale, 5.16);
    addFootprint(parts, ctx, ctx.helpers.scaleAbout(ctx.pts, ctx.cx, ctx.cy, 0.980),
      5.42, 0x747776, 5.34);

    // South courtyard entrance, on the long straight portion of the actual
    // southern wall (footprint fractions x=.31-.69, north=.02-.03).
    fractionBox(parts, ctx, 0.397, 0.603, 0.019, 0.037, 0.15, 3.33, pale);
    fractionBox(parts, ctx, 0.407, 0.593, 0.016, 0.030, 0.28, 3.12, glazing);
    fractionBox(parts, ctx, 0.494, 0.506, 0.013, 0.031, 0.28, 3.20, pale);
    fractionBox(parts, ctx, 0.393, 0.607, 0.002, 0.039, 3.31, 3.52, pale);

    // The round window is the entrance's most recognizable detail in both
    // the UMD photo and older exterior photos of The Diner.
    const oculus = new THREE.CylinderGeometry(1.18, 1.18, 0.12, 32);
    oculus.rotateX(Math.PI / 2);
    oculus.translate(x(0.5), 4.10, -north(0.016));
    parts.push(ctx.helpers.withColor(oculus, ctx.helpers.withGlow(glazing, ctx.spec.nightGlow)));
    const oculusTrim = new THREE.TorusGeometry(1.19, 0.15, 8, 32);
    oculusTrim.translate(x(0.5), 4.10, -north(0.014));
    parts.push(ctx.helpers.withColor(oculusTrim, ctx.helpers.withGlow(pale, ctx.spec.nightGlow)));

    // Pale rooftop clerestory: a glazed front under a wide, shallow cap.
    fractionBox(parts, ctx, 0.391, 0.609, 0.105, 0.265, 5.42, 7.22, pale);
    fractionBox(parts, ctx, 0.405, 0.595, 0.098, 0.111, 5.61, 6.99, glazing);
    for (const f of [0.452, 0.5, 0.548]) {
      addBox(parts, ctx, x(f) - 0.06, x(f) + 0.06,
        north(0.094), north(0.116), 5.60, 7.00, pale);
    }
    fractionBox(parts, ctx, 0.375, 0.625, 0.088, 0.286, 7.22, 7.48, 0xd0d0c9);

    // Sparse roof equipment is visible in the MD iMAP aerial. The simplified
    // blocks are inset so they never replace the footprint-shaped main roof.
    fractionBox(parts, ctx, 0.19, 0.32, 0.47, 0.59, 5.42, 6.30, 0x8a8b85);
    fractionBox(parts, ctx, 0.40, 0.56, 0.57, 0.66, 5.42, 6.50, 0x969791);
    fractionBox(parts, ctx, 0.66, 0.79, 0.43, 0.54, 5.42, 6.16, 0x888b88);
    return parts;
  },
};
