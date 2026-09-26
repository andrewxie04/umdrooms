// McKeldin Library (way/23408799) — UMD's flagship 1958 library at the WEST
// end of McKeldin Mall, so the grand entrance faces EAST onto the mall.
// The original east block is red brick with pale columns and a very shallow
// slate roof. The west addition continues the hipped slate roof and limestone
// courses, but replaces Georgian bays with narrow full-height glass bands.
//
// STRUCTURE (all sub-masses derived from the real OSM footprint via bboxOf):
//   1. Main mass: brick walls, pale cornice, shallow slate roof around a flat
//      service deck visible in the campus aerial.
//   2. Portico on the EAST (mall) face, centered on the footprint's small
//      east entrance protrusion:
//      - 3 broad step tiers cascading toward the mall (extruded rect rings)
//      - 6 tapered limestone columns with bases and capitals
//      - entablature beam spanning the column row
//      - triangular pediment cap (custom non-indexed triangles)
import * as THREE from 'three';
import type { LandmarkModule } from '../types';

export const landmark: LandmarkModule = {
  id: 'way/23408799',
  spec: {
    name: 'McKeldin Library',
    color: 0x9a5948, // Maryland brick
    roof: 'parapet',
    accent: 0xf5f1e4, // column / trim limestone (slightly brighter)
    nightGlow: 0.55, // 24/5 flagship library — warmly lit at night
  },
  maxHeight: 25.8, // slate roof and low rooftop plant; pediment apex 23.4
  build(ctx) {
    const { pts, cx, cy, baseHeight, spec, helpers } = ctx;
    // The mapped height reaches the roof, not the top of a flat brick box.
    // Lowering the eave leaves room for the gray slate hip while keeping the
    // pediment apex close to the main roof ridge, as in UMD's front photo.
    const wallTop = baseHeight - 2.2;
    const glow = spec.nightGlow;
    const base = helpers.withGlow(spec.color, glow);
    const accent = spec.accent != null ? helpers.withGlow(spec.accent, glow) : base;
    const roofC = new THREE.Color(0x596166);
    const roofDeckC = new THREE.Color(0x687073);
    const roofPlantC = new THREE.Color(0xaeb1ad);
    const roofVentC = new THREE.Color(0x626b6b);
    const stepC = helpers.darkerShade(base, -0.03);
    const glazing = new THREE.Color(0x344d54);
    const stoneShadow = new THREE.Color(0xc7c4b8);
    const additionBrick = new THREE.Color(0x905b4c);

    const bb = helpers.bboxOf(pts);
    // Intersect the mapped outline with a horizontal/vertical facade ray.
    // The addition steps in and out, so its windows cannot use bbox extrema.
    const wallXsAt = (north: number): number[] => pts.flatMap((a, i) => {
      const b = pts[(i + 1) % pts.length];
      if ((a.y > north) === (b.y > north)) return [];
      return [a.x + (b.x - a.x) * (north - a.y) / (b.y - a.y)];
    });
    const wallNorthsAt = (x: number): number[] => pts.flatMap((a, i) => {
      const b = pts[(i + 1) % pts.length];
      if ((a.x > x) === (b.x > x)) return [];
      return [a.y + (b.y - a.y) * (x - a.x) / (b.x - a.x)];
    });
    const faceX = bb.maxX - 7.3;
    // The mapped east projection includes the open columned porch. Extruding
    // the entire outline to roof height made a brick block *inside* the
    // colonnade, hiding the entry. Keep its footprint as the stone podium and
    // clip the tall walls back to the actual east facade behind the porch.
    const facadeX = faceX + 0.55;
    const bodyPts: THREE.Vector2[] = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      const aInside = a.x <= facadeX;
      const bInside = b.x <= facadeX;
      if (aInside) bodyPts.push(a.clone());
      if (aInside !== bInside) {
        const t = (facadeX - a.x) / (b.x - a.x);
        bodyPts.push(new THREE.Vector2(facadeX, a.y + (b.y - a.y) * t));
      }
    }
    const podiumHeight = 1.05;
    const parts: THREE.BufferGeometry[] = [
      helpers.withColor(helpers.extrudeFootprint(pts, podiumHeight), accent),
      helpers.withColor(
        helpers.extrudeFootprint(bodyPts, wallTop - podiumHeight - 0.55)
          .translate(0, podiumHeight, 0), base,
      ),
      helpers.withColor(
        helpers.extrudeFootprint(bodyPts, 0.55).translate(0, wallTop - 0.55, 0),
        accent,
      ),
      helpers.withColor(
        helpers.extrudeFootprint(helpers.scaleAbout(bodyPts, cx, cy, 0.965), 0.14)
          .translate(0, wallTop, 0), roofC,
      ),
    ];

    // --- portico geometry, derived from the footprint bbox -----------------
    const rectPart = (
      x0: number, x1: number, north0: number, north1: number,
      y0: number, y1: number, color: THREE.Color,
    ): void => {
      const part = new THREE.BoxGeometry(x1 - x0, y1 - y0, north1 - north0);
      part.translate((x0 + x1) / 2, (y0 + y1) / 2, -(north0 + north1) / 2);
      parts.push(helpers.withColor(part, color));
    };
    const spanX = bb.maxX - bb.minX;
    const spanNorth = bb.maxY - bb.minY;
    const originalWest = bb.minX + spanX * 0.48;
    // The west extension sits between the two rearward projections of the
    // original block. Its brick is slightly different from the Georgian front.
    const wingSouth = bb.minY + spanNorth * 0.12;
    const wingNorth = bb.maxY - spanNorth * 0.13;
    rectPart(bb.minX - 0.17, bb.minX + 0.08,
      wingSouth, wingNorth,
      1.5, wallTop - 0.7, additionBrick);
    for (const north of [wingSouth - 0.04, wingNorth + 0.04]) {
      rectPart(bb.minX + 0.15, bb.minX + spanX * 0.37,
        north - 0.15, north + 0.15, 1.5, wallTop - 0.7, additionBrick);
    }
    // Continuous vertical aluminum-and-glass slots are characteristic of the
    // addition on all three exposed elevations; they deliberately ignore the
    // original building's four readable story levels.
    const slotTop = wallTop - 1.05;
    for (let bay = 0; bay < 8; bay++) {
      const x = bb.minX + 3.1 + bay * ((spanX * 0.39 - 6.2) / 7);
      const edges = wallNorthsAt(x);
      for (const north of [Math.min(...edges) - 0.07, Math.max(...edges) + 0.07]) {
        rectPart(x - 0.39, x + 0.39, north - 0.055, north + 0.055,
          2.4, slotTop, glazing);
        rectPart(x - 0.42, x - 0.35, north - 0.10, north + 0.10,
          2.4, slotTop, stoneShadow);
      }
    }
    for (let bay = 0; bay < 10; bay++) {
      const north = wingSouth + 3.4 + bay * ((wingNorth - wingSouth - 6.8) / 9);
      const westX = Math.min(...wallXsAt(north));
      rectPart(westX - 0.11, westX + 0.01, north - 0.39, north + 0.39,
        2.4, slotTop, glazing);
    }
    // Matching pale rusticated-base and cornice lines bind the two eras of
    // McKeldin together even where the facade rhythm changes.
    for (const level of [1.65, wallTop - 0.94]) {
      rectPart(bb.minX - 0.30, bb.minX - 0.12, wingSouth, wingNorth,
        level, level + 0.35, accent);
      for (const north of [wingSouth - 0.26, wingNorth + 0.26]) {
        rectPart(bb.minX - 0.12, bb.minX + spanX * 0.42,
          north - 0.09, north + 0.09, level, level + 0.35, accent);
      }
    }

    // The east (mall) side has a shallow entrance protrusion ~7m deep; the
    // main east facade sits just west of bbox maxX.
    const portCy = cy + 0.5; // centered on the entrance protrusion
    const halfW = 13; // portico spans 26m along the facade
    const yS = portCy - halfW;
    const yN = portCy + halfW;

    // The university's front and south-side photographs show a full pale
    // rusticated ground level, not merely a thin stripe below the brick.
    rectPart(faceX + 0.68, faceX + 0.78, bb.minY + 0.2, bb.maxY - 0.2,
      1.05, 3.7, accent);
    for (const north of [bb.minY + 0.19, bb.maxY - 0.19]) {
      rectPart(originalWest, faceX + 0.75, north - 0.09, north + 0.09,
        1.05, 3.7, accent);
    }
    // The white entablature divides the two lower brick window rows from the
    // smaller top row, rather than crossing through any of the windows.
    rectPart(faceX + 0.70, faceX + 1.08, bb.minY + 0.2, bb.maxY - 0.2,
      14.25, 14.75, accent);

    // The original facade has three brick window tiers over small windows in
    // the stone basement. White sash bars make the openings read like the
    // photographed multi-pane windows instead of dark square holes.
    const eastWallX = faceX + 0.74;
    const brickRows = [4.85, 10.1, 17.1];
    for (const floorY of brickRows) {
      for (let bay = 0; bay < 10; bay++) {
        const north = bb.minY + 5.3 + bay * ((spanNorth - 10.6) / 9);
        if (Math.abs(north - portCy) < 15) continue;
        rectPart(eastWallX, eastWallX + 0.19, north - 0.98, north + 0.98,
          floorY, floorY + 2.8, stoneShadow);
        rectPart(eastWallX + 0.19, eastWallX + 0.25,
          north - 0.76, north + 0.76, floorY + 0.25, floorY + 2.55, glazing);
        rectPart(eastWallX + 0.26, eastWallX + 0.30,
          north - 0.045, north + 0.045, floorY + 0.25, floorY + 2.55, accent);
        for (const barY of [floorY + 1.02, floorY + 1.79]) {
          rectPart(eastWallX + 0.26, eastWallX + 0.30,
            north - 0.76, north + 0.76, barY, barY + 0.075, accent);
        }
        rectPart(eastWallX + 0.24, eastWallX + 0.32,
          north - 1.06, north + 1.06, floorY + 2.8, floorY + 2.97, accent);
        rectPart(eastWallX + 0.24, eastWallX + 0.32,
          north - 1.04, north + 1.04, floorY - 0.16, floorY, accent);
      }
    }
    for (let bay = 0; bay < 10; bay++) {
      const north = bb.minY + 5.3 + bay * ((spanNorth - 10.6) / 9);
      if (Math.abs(north - portCy) < 15) continue;
      rectPart(eastWallX + 0.1, eastWallX + 0.17,
        north - 0.53, north + 0.53, 1.85, 3.15, glazing);
      rectPart(eastWallX + 0.18, eastWallX + 0.22,
        north - 0.035, north + 0.035, 1.85, 3.15, accent);
    }
    for (const north of [bb.minY + 0.25, bb.maxY - 0.25]) {
      for (const floorY of brickRows) {
        for (let bay = 0; bay < 8; bay++) {
          const x = originalWest + 2.7 + bay * ((faceX - originalWest - 5.4) / 7);
          rectPart(x - 0.82, x + 0.82, north - 0.22, north + 0.22,
            floorY, floorY + 2.8, stoneShadow);
          rectPart(x - 0.65, x + 0.65, north - 0.30, north + 0.30,
            floorY + 0.23, floorY + 2.52, glazing);
          rectPart(x - 0.045, x + 0.045, north - 0.34, north + 0.34,
            floorY + 0.23, floorY + 2.52, accent);
          for (const barY of [floorY + 1.02, floorY + 1.79]) {
            rectPart(x - 0.65, x + 0.65, north - 0.34, north + 0.34,
              barY, barY + 0.075, accent);
          }
        }
      }
      for (let bay = 0; bay < 8; bay++) {
        const x = originalWest + 2.7 + bay * ((faceX - originalWest - 5.4) / 7);
        rectPart(x - 0.45, x + 0.45, north - 0.30, north + 0.30,
          1.9, 3.12, glazing);
      }
    }

    const rectRing = (x0: number, x1: number, y0: number, y1: number): THREE.Vector2[] => [
      new THREE.Vector2(x0, y0),
      new THREE.Vector2(x1, y0),
      new THREE.Vector2(x1, y1),
      new THREE.Vector2(x0, y1),
    ];

    // The historic east block has a low dark roof visible above its white
    // cornice in the university's front elevation photo. The campus aerial
    // shows a flat service deck inside the sloped perimeter, with small
    // rooftop units. Give the addition its own matching perimeter treatment.
    type RoofDeck = { x0: number; x1: number; n0: number; n1: number; y: number };
    const roofWithDeck = (x0: number, x1: number, n0: number, n1: number): RoofDeck => {
      const inset = Math.min(8.2, (x1 - x0) * 0.25, (n1 - n0) * 0.22);
      const outerY = wallTop + 0.24; // clears the low roof cap below
      const innerY = outerY + 2.12;
      const outer = [[x0, n0], [x1, n0], [x1, n1], [x0, n1]];
      const inner = [[x0 + inset, n0 + inset], [x1 - inset, n0 + inset],
        [x1 - inset, n1 - inset], [x0 + inset, n1 - inset]];
      const slopePositions: number[] = [];
      const push = (a: number[], b: number[], c: number[]) =>
        slopePositions.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
      for (let side = 0; side < 4; side++) {
        const next = (side + 1) % 4;
        const a = [...outer[side], outerY];
        const b = [...outer[next], outerY];
        const c = [...inner[next], innerY];
        const d = [...inner[side], innerY];
        push(a, b, c);
        push(a, c, d);
      }
      const slope = new THREE.BufferGeometry();
      slope.setAttribute('position', new THREE.Float32BufferAttribute(slopePositions, 3));
      slope.rotateX(-Math.PI / 2);
      slope.computeVertexNormals();
      parts.push(helpers.withColor(slope, roofC));

      const deck = new THREE.ShapeGeometry(new THREE.Shape(inner.map(
        ([x, north]) => new THREE.Vector2(x, north),
      )));
      deck.rotateX(-Math.PI / 2);
      deck.translate(0, innerY, 0);
      parts.push(helpers.withColor(deck, roofDeckC));
      return { x0: inner[0][0], x1: inner[1][0], n0: inner[0][1], n1: inner[2][1], y: innerY };
    };
    const originalDeck = roofWithDeck(
      originalWest, faceX + 0.28, bb.minY + 0.55, bb.maxY - 0.55,
    );
    const additionDeck = roofWithDeck(
      bb.minX + 0.35, originalWest, wingSouth + 0.25, wingNorth - 0.25,
    );
    const roofUnit = (deck: RoofDeck, fx: number, fn: number, width: number, depth: number, height: number) => {
      const w = Math.min(width, (deck.x1 - deck.x0) * 0.25);
      const d = Math.min(depth, (deck.n1 - deck.n0) * 0.25);
      const x = THREE.MathUtils.lerp(deck.x0 + w / 2, deck.x1 - w / 2, fx);
      const north = THREE.MathUtils.lerp(deck.n0 + d / 2, deck.n1 - d / 2, fn);
      rectPart(x - w / 2, x + w / 2, north - d / 2, north + d / 2,
        deck.y + 0.04, deck.y + height, roofPlantC);
      rectPart(x - w * 0.38, x + w * 0.38, north - d * 0.38, north + d * 0.38,
        deck.y + height + 0.02, deck.y + height + 0.09, roofVentC);
    };
    roofUnit(originalDeck, 0.38, 0.32, 4.0, 5.2, 1.12);
    roofUnit(originalDeck, 0.65, 0.66, 3.0, 3.6, 0.72);
    roofUnit(additionDeck, 0.34, 0.38, 4.2, 5.4, 1.18);
    roofUnit(additionDeck, 0.68, 0.68, 3.2, 4.0, 0.82);

    // Each tread owns a separate strip. Nested extrusions put coincident top
    // faces on the entrance podium and flicker when the camera zooms in.
    const tiers: Array<{ x0: number; x1: number; h: number }> = [
      { x0: faceX + 8.4, x1: faceX + 9.0, h: 0.35 },
      { x0: faceX + 7.8, x1: faceX + 8.4, h: 0.70 },
      { x0: faceX, x1: faceX + 7.8, h: 1.12 },
    ];
    for (const tread of tiers) {
      rectPart(tread.x0, tread.x1, yS, yN, 0, tread.h, stepC);
    }

    // Six columns, matching the real mall facade. Their flared capitals and
    // thin square abaci give the entry the profile visible in UMD's photo.
    const colX = faceX + 6.35;
    const colTop = 18.4;
    const baseTop = 2.05;
    const capitalBottom = 17.55;
    const colH = capitalBottom - baseTop;
    const nCols = 6;
    for (let i = 0; i < nCols; i++) {
      const t = i / (nCols - 1);
      const colY = portCy - 10.5 + t * 21;
      const foot = new THREE.BoxGeometry(1.35, 1, 1.35);
      foot.translate(colX, 1.55, -colY);
      parts.push(helpers.withColor(foot, accent));
      const col = new THREE.CylinderGeometry(0.49, 0.58, colH, 12);
      col.translate(colX, baseTop + colH / 2, -colY); // world: z = -north
      parts.push(helpers.withColor(col, accent));
      const neck = new THREE.CylinderGeometry(0.58, 0.50, 0.16, 12);
      neck.translate(colX, capitalBottom + 0.08, -colY);
      parts.push(helpers.withColor(neck, accent));
      const flare = new THREE.CylinderGeometry(0.78, 0.55, 0.52, 12);
      flare.translate(colX, capitalBottom + 0.42, -colY);
      parts.push(helpers.withColor(flare, accent));
      const abacus = new THREE.BoxGeometry(1.72, 0.17, 1.72);
      abacus.translate(colX, colTop - 0.085, -colY);
      parts.push(helpers.withColor(abacus, accent));
    }

    // The real entry rises from a broad limestone base into three rounded
    // arches. A dark inset inside each pale surround reads as a deep doorway.
    const entryX = faceX + 0.73;
    const entryStone = helpers.darkerShade(accent, -0.04);
    const baseWall = new THREE.BoxGeometry(0.46, 6.35, 20.6);
    baseWall.translate(entryX - 0.22, 4.22, -portCy);
    parts.push(helpers.withColor(baseWall, entryStone));
    const arch = (radius: number, spring: number, depth: number, x: number, north: number) => {
      const shape = new THREE.Shape();
      shape.moveTo(-radius, 0);
      shape.lineTo(-radius, spring);
      shape.absarc(0, spring, radius, Math.PI, 0, true);
      shape.lineTo(radius, 0);
      shape.closePath();
      const geom = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 8 });
      geom.rotateY(Math.PI / 2);
      geom.translate(x, 1.05, -north);
      return geom;
    };
    for (const offset of [-5.2, 0, 5.2]) {
      const north = portCy + offset;
      parts.push(helpers.withColor(arch(1.83, 3.58, 0.18, entryX + 0.1, north), accent));
      parts.push(helpers.withColor(arch(1.47, 3.48, 0.12, entryX + 0.3, north), new THREE.Color(0x303a3d)));
      const divider = new THREE.BoxGeometry(0.11, 3.28, 0.09);
      divider.translate(entryX + 0.46, 2.69, -north);
      parts.push(helpers.withColor(divider, new THREE.Color(0xaeb7b5)));
    }

    // Entablature beam across the column tops.
    const entH = 1.7;
    const ent = helpers.extrudeFootprint(
      rectRing(faceX + 0.4, faceX + 7.75, yS, yN),
      entH,
    );
    ent.translate(0, colTop, 0);
    parts.push(helpers.withColor(ent, accent));
    const friezeFront = faceX + 7.75;
    for (const y of [colTop + 0.18, colTop + entH - 0.23]) {
      rectPart(friezeFront + 0.01, friezeFront + 0.12,
        yS + 0.18, yN - 0.18, y, y + 0.10, stoneShadow);
    }
    for (let tooth = 0; tooth < 24; tooth++) {
      const north = yS + 0.58 + tooth * ((yN - yS - 1.16) / 23);
      rectPart(friezeFront + 0.02, friezeFront + 0.16,
        north - 0.23, north + 0.23,
        colTop + entH - 0.40, colTop + entH - 0.24, accent);
    }

    // Triangular pediment: gable prism over the entablature, apex centered.
    // Apex rises just past the main roof ridge so the temple front stays
    // silhouetted from the mall.
    const pedZ0 = colTop + entH; // 20.1
    const pedZ1 = 23.4;
    const pedX0 = faceX + 0.4;
    const pedX1 = faceX + 7.75;
    const positions: number[] = [];
    type V3 = [number, number, number];
    const pushTri = (a: V3, b: V3, c: V3, n: V3): void => {
      const ux = b[0] - a[0];
      const uy = b[1] - a[1];
      const uz = b[2] - a[2];
      const vx = c[0] - a[0];
      const vy = c[1] - a[1];
      const vz = c[2] - a[2];
      const nx = uy * vz - uz * vy;
      const ny = uz * vx - ux * vz;
      const nz = ux * vy - uy * vx;
      if (nx * n[0] + ny * n[1] + nz * n[2] < 0) {
        positions.push(a[0], a[1], a[2], c[0], c[1], c[2], b[0], b[1], b[2]);
      } else {
        positions.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
      }
    };
    // front + back gable triangles
    pushTri([pedX1, yS, pedZ0], [pedX1, yN, pedZ0], [pedX1, portCy, pedZ1], [1, 0, 0]);
    pushTri([pedX0, yS, pedZ0], [pedX0, yN, pedZ0], [pedX0, portCy, pedZ1], [-1, 0, 0]);
    // south slope (toward -north) and north slope
    const sSlope: V3 = [0, -0.9, 0.5];
    const nSlope: V3 = [0, 0.9, 0.5];
    pushTri([pedX0, yS, pedZ0], [pedX1, yS, pedZ0], [pedX1, portCy, pedZ1], sSlope);
    pushTri([pedX0, yS, pedZ0], [pedX1, portCy, pedZ1], [pedX0, portCy, pedZ1], sSlope);
    pushTri([pedX0, yN, pedZ0], [pedX1, yN, pedZ0], [pedX1, portCy, pedZ1], nSlope);
    pushTri([pedX0, yN, pedZ0], [pedX1, portCy, pedZ1], [pedX0, portCy, pedZ1], nSlope);
    // underside (hidden against the entablature, kept for a closed solid)
    const down: V3 = [0, 0, -1];
    pushTri([pedX0, yS, pedZ0], [pedX1, yS, pedZ0], [pedX1, yN, pedZ0], down);
    pushTri([pedX0, yS, pedZ0], [pedX1, yN, pedZ0], [pedX0, yN, pedZ0], down);

    const ped = new THREE.BufferGeometry();
    ped.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    ped.rotateX(-Math.PI / 2); // shape space (x, north, up) -> world (x, up, -north)
    ped.computeVertexNormals(); // non-indexed -> flat per-face normals
    parts.push(helpers.withColor(ped, accent));

    // Small round oculus in the pediment is a particularly recognizable
    // detail in the university's elevation photograph.
    const oculusY = pedZ0 + 1.58;
    const oculusX = pedX1 + 0.035;
    const oculusGlass = new THREE.CylinderGeometry(0.36, 0.36, 0.075, 16);
    oculusGlass.rotateZ(-Math.PI / 2);
    oculusGlass.translate(oculusX, oculusY, -portCy);
    parts.push(helpers.withColor(oculusGlass, glazing));
    const oculusRim = new THREE.TorusGeometry(0.43, 0.10, 6, 20);
    oculusRim.rotateY(Math.PI / 2);
    oculusRim.translate(oculusX + 0.075, oculusY, -portCy);
    parts.push(helpers.withColor(oculusRim, accent));

    return parts;
  },
};
