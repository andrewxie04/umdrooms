// Regents Drive Parking Garage (building 202) — way/23544624.
// The perimeter comes directly from campus-data.json, including its angled
// northeast side. UMD's exterior photo shows open parking bays, brick-colored
// spandrels, pale stair cores and a flat roof deck; UMD also documents the
// later solar canopy. The exact stall/ramp layout is not public, so interior
// circulation and panel rows are deliberately simplified.
// Sources: https://crr.umd.edu/directions-campus
// https://eng.umd.edu/careers/employers/visitor-info
// https://eng.umd.edu/energy-solutions
// https://sustainability.umd.edu/news/umd-increases-renewable-energy-use-installation-solar-panel-canopies
import * as THREE from 'three';
import type { LandmarkModule } from '../types';

export const landmark: LandmarkModule = {
  id: 'way/23544624',
  spec: {
    name: 'Regents Drive Parking Garage',
    color: 0xa46f5b,
    height: 16.95,
    roof: 'parapet',
    accent: 0x28465c,
  },
  maxHeight: 21.2,
  build({ pts, holes, spec, helpers }) {
    const bounds = helpers.bboxOf(pts);
    const x = (m: number) => bounds.minX + m;
    const north = (m: number) => bounds.minY + m;
    const brick = new THREE.Color(spec.color);
    const concrete = new THREE.Color(0xbcb9b0);
    const pale = new THREE.Color(0xc9c7bf);
    const deck = new THREE.Color(0x858782);
    const shadow = new THREE.Color(0x555954);
    const metal = new THREE.Color(0x8e9695);
    const solar = new THREE.Color(spec.accent ?? 0x28465c);
    const parts: THREE.BufferGeometry[] = [];

    const addBox = (
      color: THREE.Color, cx: number, cy: number, cz: number,
      width: number, height: number, depth: number, tilt = 0,
    ) => {
      const g = new THREE.BoxGeometry(width, height, depth);
      if (tilt) g.rotateX(tilt);
      g.translate(cx, cy, -cz);
      parts.push(helpers.withColor(g, color));
    };
    const rectangle = (x0: number, x1: number, n0: number, n1: number) => [
      new THREE.Vector2(x0, n0), new THREE.Vector2(x1, n0),
      new THREE.Vector2(x1, n1), new THREE.Vector2(x0, n1),
    ];

    // A rectangular opening gives the ramp a real void through the slabs.
    // It sits in the broad southern portion of the mapped footprint.
    const rampOpening = rectangle(x(28), x(62), north(19), north(31));
    // Six deck surfaces (including the open roof) approximate the photographed
    // stacked bays; campus-data's generic 11 m height is too low for them.
    const spacing = 3.15;
    const slabThickness = 0.32;
    const levelCount = 6;
    const roofY = (levelCount - 1) * spacing + slabThickness + 0.06;
    for (let level = 0; level < levelCount; level++) {
      const floorY = level * spacing;
      const slab = level === 0
        ? helpers.extrudeWithHoles(pts, holes, slabThickness)
        : helpers.extrudeWithHoles(pts, [...holes, rampOpening], slabThickness);
      slab.translate(0, floorY + 0.06, 0);
      parts.push(helpers.withColor(slab, level === 0 ? shadow : deck));
    }

    // Perimeter spandrels are actual vertical faces; the gaps between them
    // remain open so the stacked decks and columns read from the street.
    // CCW shape-space edges give these quads outward-facing world normals.
    const facadeFaces: number[] = [];
    const facingQuad = (
      a: THREE.Vector2, b: THREE.Vector2, bottom: number, top: number,
    ) => {
      facadeFaces.push(
        a.x, bottom, -a.y, b.x, bottom, -b.y, b.x, top, -b.y,
        a.x, bottom, -a.y, b.x, top, -b.y, a.x, top, -a.y,
      );
    };
    for (let level = 0; level < levelCount; level++) {
      const floorY = level * spacing;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        const b = pts[(i + 1) % pts.length];
        // The Fieldhouse Drive entrance is left open on the south edge.
        const southEdge = a.y < north(1) && b.y < north(1) &&
          Math.abs(b.x - a.x) > 20;
        if (level === 0 && southEdge) {
          const e0 = a.clone().lerp(b, 0.25);
          const e1 = a.clone().lerp(b, 0.53);
          facingQuad(a, e0, floorY + 0.4, floorY + 1.18);
          facingQuad(e1, b, floorY + 0.4, floorY + 1.18);
        } else {
          facingQuad(a, b, floorY + 0.4, floorY + 1.18);
        }
      }
    }
    const spandrels = new THREE.BufferGeometry();
    spandrels.setAttribute('position', new THREE.Float32BufferAttribute(facadeFaces, 3));
    spandrels.computeVertexNormals();
    parts.push(helpers.withColor(spandrels, brick));

    // Thin pale coping separates each brick band from the open bay above it.
    // The trim is slightly proud of the wall, with distinct height planes.
    for (let level = 0; level < levelCount; level++) {
      const floorY = level * spacing;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        const b = pts[(i + 1) % pts.length];
        const length = a.distanceTo(b);
        if (length < 0.25) continue;
        const dx = b.x - a.x;
        const dn = b.y - a.y;
        const outwardX = dn / length;
        const outwardN = -dx / length;
        const trim = new THREE.BoxGeometry(length, 0.11, 0.13);
        trim.rotateY(Math.atan2(dn, dx));
        trim.translate(
          (a.x + b.x) / 2 + outwardX * 0.065,
          floorY + 1.235,
          -(a.y + b.y) / 2 - outwardN * 0.065,
        );
        parts.push(helpers.withColor(trim, pale));
      }
    }

    // Columns at regular intervals, inset just behind the facade plane.
    const perimeter: number[] = [0];
    for (let i = 0; i < pts.length; i++) {
      perimeter.push(perimeter[i] + pts[i].distanceTo(pts[(i + 1) % pts.length]));
    }
    const total = perimeter[perimeter.length - 1];
    for (let d = 4.5; d < total; d += 8.5) {
      let i = 0;
      while (i < pts.length - 1 && perimeter[i + 1] < d) i++;
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      const t = (d - perimeter[i]) / (perimeter[i + 1] - perimeter[i]);
      const p = a.clone().lerp(b, t);
      const dx = b.x - a.x;
      const dn = b.y - a.y;
      const length = Math.hypot(dx, dn);
      const px = p.x - 0.32 * dn / length;
      const pn = p.y + 0.32 * dx / length;
      for (let level = 0; level < levelCount - 1; level++) {
        addBox(concrete, px, level * spacing + 2.12, pn, 0.48, 1.84, 0.48);
      }
    }

    // The photographed pale enclosed stairs interrupt the open brick bays.
    // Both blocks stay inside the OSM outline and rise just above the coping.
    for (const [x0, x1, n0, n1] of [
      [1.2, 10.6, 59, 73],
      [79.5, 88.8, 49, 64],
    ]) {
      const tower = rectangle(x(x0), x(x1), north(n0), north(n1));
      parts.push(helpers.withColor(helpers.extrudeFootprint(tower, roofY + 1.3), pale));
      addBox(shadow, x((x0 + x1) / 2), 9.0, north(n0 - 0.035),
        Math.min(2.0, x1 - x0 - 1), 13.3, 0.08);
    }

    // Sloped concrete ramp plates occupy the opening instead of intersecting
    // the full decks. Each is inside a bay with a clearance from its slab.
    const rampLength = 29.8;
    const rampTilt = Math.atan2(2.35, rampLength);
    for (let level = 0; level < levelCount - 1; level++) {
      const ramp = new THREE.BoxGeometry(rampLength, 0.22, 7.2);
      ramp.rotateZ(rampTilt);
      ramp.translate(x(45), level * spacing + 1.78, -north(25));
      parts.push(helpers.withColor(ramp, concrete));
    }

    // Rooftop safety rail and the documented solar canopy. The panel banks
    // are grouped so they fit the southern rectangle and northwest shoulder
    // of the actual (nonrectangular) parking deck.
    const canopyBanks: Array<[number, number, number, number]> = [
      [12, 25, 18, 73], [27, 40, 18, 73],
      [42, 55, 18, 73], [57, 70, 18, 73],
      [12, 25, 76, 111], [27, 40, 76, 104],
    ];
    for (const [x0, x1, n0, n1] of canopyBanks) {
      const centerX = x((x0 + x1) / 2);
      const width = x1 - x0;
      const length = n1 - n0;
      for (const px of [x(x0 + 1.1), x(x1 - 1.1)]) {
        for (const pn of [north(n0 + 3.5), north(n1 - 3.5)]) {
          addBox(metal, px, roofY + 1.62, pn, 0.18, 3.24, 0.18);
        }
      }
      for (const px of [x(x0 + 0.55), x(x1 - 0.55)]) {
        addBox(metal, px, roofY + 3.27, north((n0 + n1) / 2),
          0.15, 0.15, length - 0.5);
      }
      const rowLength = 3.4;
      const rows = Math.floor((length - 0.8) / rowLength);
      for (let row = 0; row < rows; row++) {
        const rowNorth = n0 + 0.55 + (row + 0.5) * rowLength;
        const rise = 0.42 * ((rowNorth - n0) / length - 0.5);
        addBox(solar, centerX, roofY + 3.56 + rise, north(rowNorth),
          width - 0.25, 0.1, rowLength - 0.13, Math.atan2(0.42, length));
      }
    }

    return parts;
  },
};
