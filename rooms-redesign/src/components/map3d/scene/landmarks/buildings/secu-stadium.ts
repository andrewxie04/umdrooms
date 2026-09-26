// SECU Stadium (Capital One Field at Maryland Stadium) — way/980371045.
// Structural recreation of the real venue:
//   - Concrete outer foundation follows the real OSM horseshoe band. The
//     upper band is stepped toward its rim instead of being one flat cap.
//   - The mapped horseshoe band carries fine west/lower-bowl terraces. A
//     separate, taller north upper deck has an open, supported underside.
//   - Regulation-proportion FieldTurf rectangle in the open center, oriented
//     from the two straight sides of the mapped seating band. The former
//     C100 x 0.62 turf patch covered only the western bowl, leaving most of
//     the real playing field as plain ground.
//   - Tyser Tower is modeled on its own mapped footprint in tyser-tower.ts.
//   - The raised black videoboard at the west end zone has open supports.
// spec.roof stays 'bowl'; the north upper deck rises above the lower seating.
import * as THREE from 'three';
import type { LandmarkModule } from '../types';

export const landmark: LandmarkModule = {
  id: 'way/980371045',
  spec: {
    name: 'SECU Stadium',
    color: 0xaeb1af,
    height: 18,
    roof: 'bowl',
    accent: 0x346d3f,
    nightGlow: 0.2,
  },
  maxHeight: 35,
  build(ctx) {
    const { pts, baseHeight, spec, helpers } = ctx;
    const concrete = helpers.withGlow(spec.color, spec.nightGlow);
    const fieldC = helpers.withGlow(spec.accent ?? 0x4f7d42, spec.nightGlow);
    const dark = helpers.withGlow(0x3a3f44, spec.nightGlow);
    const seat = helpers.withGlow(0xaeb3b1, spec.nightGlow);
    const upperSeat = helpers.withGlow(0xc6c9c7, spec.nightGlow);
    const seatGroove = helpers.withGlow(0x858e8b, spec.nightGlow);
    const upperGroove = helpers.withGlow(0x9fa7a3, spec.nightGlow);
    const red = helpers.withGlow(0xb32235, spec.nightGlow);
    const gold = helpers.withGlow(0xe8bb42, spec.nightGlow);
    const flagBlack = helpers.withGlow(0x20262a, spec.nightGlow);

    // --- Bowl floor polygon C100 -----------------------------------------
    // The footprint is a BAND (crescent) polygon: inner arc + outer arc
    // joined by two long chord edges. Extract the inner boundary chain (the
    // shorter of the two chains between the chord edges); closed across the
    // opening it forms the D-shaped bowl floor.
    const n = pts.length;
    const edgeLen = (i: number) =>
      Math.hypot(pts[(i + 1) % n].x - pts[i].x, pts[(i + 1) % n].y - pts[i].y);
    let e1 = 0;
    let e2 = 1;
    for (let i = 0; i < n; i++) {
      const l = edgeLen(i);
      if (l > edgeLen(e1)) {
        e2 = e1;
        e1 = i;
      } else if (i !== e1 && l > edgeLen(e2)) {
        e2 = i;
      }
    }
    const lo = Math.min(e1, e2);
    const hi = Math.max(e1, e2);
    const chainA = pts.slice(lo + 1, hi + 1);
    const chainB = [...pts.slice(hi + 1), ...pts.slice(0, lo + 1)];
    const chainLen = (c: THREE.Vector2[]) => {
      let s = 0;
      for (let i = 0; i < c.length - 1; i++) s += Math.hypot(c[i + 1].x - c[i].x, c[i + 1].y - c[i].y);
      return s;
    };
    const innerIsA = chainLen(chainA) <= chainLen(chainB);
    const innerChain = innerIsA ? chainA : chainB;
    // Walk the outer edge in the same direction as the inner edge. The two
    // polylines bound the grandstand strip, including its long north wing.
    const outerChain: THREE.Vector2[] = [];
    const outerStart = innerIsA ? lo : hi;
    const outerEnd = innerIsA ? (hi + 1) % n : (lo + 1) % n;
    for (let i = outerStart; ; i = (i - 1 + n) % n) {
      outerChain.push(pts[i]);
      if (i === outerEnd) break;
    }
    const fc = helpers.centroidOf(innerChain);

    const sampleChain = (chain: THREE.Vector2[], t: number): THREE.Vector2 => {
      const total = chainLen(chain);
      let remaining = THREE.MathUtils.clamp(t, 0, 1) * total;
      for (let i = 0; i < chain.length - 1; i++) {
        const length = chain[i].distanceTo(chain[i + 1]);
        if (remaining <= length) return chain[i].clone().lerp(chain[i + 1], remaining / length);
        remaining -= length;
      }
      return chain[chain.length - 1].clone();
    };
    const grandstandPoint = (t: number, depth: number): THREE.Vector2 =>
      sampleChain(innerChain, t).lerp(sampleChain(outerChain, t), depth);
    const grandstandParts: THREE.BufferGeometry[] = [];
    const terraceCount = 18;
    const rimSamples = 40;
    const terraceSurface = (
      depth0: number, depth1: number, height: number, color: THREE.Color,
      fromT = 0, toT = 1,
    ) => {
      const positions: number[] = [];
      const vertex = (point: THREE.Vector2) => positions.push(point.x, height, -point.y);
      const segments = Math.max(1, Math.ceil((toT - fromT) * rimSamples));
      for (let i = 0; i < segments; i++) {
        const t0 = THREE.MathUtils.lerp(fromT, toT, i / segments);
        const t1 = THREE.MathUtils.lerp(fromT, toT, (i + 1) / segments);
        const a = grandstandPoint(t0, depth0);
        const b = grandstandPoint(t1, depth0);
        const c = grandstandPoint(t1, depth1);
        const d = grandstandPoint(t0, depth1);
        const upFacing = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x) > 0;
        if (upFacing) {
          vertex(a); vertex(b); vertex(c);
          vertex(a); vertex(c); vertex(d);
        } else {
          vertex(a); vertex(c); vertex(b);
          vertex(a); vertex(d); vertex(c);
        }
      }
      const surface = new THREE.BufferGeometry();
      surface.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      surface.computeVertexNormals();
      grandstandParts.push(helpers.withColor(surface, color));
    };
    const terraceAisle = (
      centerT: number, depth0: number, depth1: number, height: number,
    ) => {
      terraceSurface(depth0, depth1, height, red,
        centerT - 0.004, centerT + 0.004);
    };
    for (let tier = 0; tier < terraceCount; tier++) {
      const innerDepth = tier / terraceCount;
      const outerDepth = (tier + 1) / terraceCount;
      const ring: THREE.Vector2[] = [];
      for (let i = 0; i <= rimSamples; i++) ring.push(grandstandPoint(i / rimSamples, innerDepth));
      for (let i = rimSamples; i >= 0; i--) ring.push(grandstandPoint(i / rimSamples, outerDepth));
      let twiceArea = 0;
      for (let i = 0; i < ring.length; i++) {
        const a = ring[i];
        const b = ring[(i + 1) % ring.length];
        twiceArea += a.x * b.y - b.x * a.y;
      }
      if (twiceArea < 0) ring.reverse();
      const height = baseHeight * (0.68 + 0.32 * ((tier + 1) / terraceCount));
      const shade = helpers.darkerShade(seat, tier % 2 === 0 ? 0.015 : -0.018);
      grandstandParts.push(helpers.withColor(helpers.extrudeFootprint(ring, height), shade));
      // Fine seat-row seams and narrow aisle breaks give the concrete bowl
      // the scale seen in the stadium aerial without thousands of seat meshes.
      const span = outerDepth - innerDepth;
      for (const fraction of [0.27, 0.68]) {
        terraceSurface(innerDepth + span * fraction,
          innerDepth + span * (fraction + 0.055), height + 0.09, seatGroove);
      }
      // Aisle lines in the west/lower bowl read as actual breaks in the
      // seating from above, as in the UMD stadium aerial. Each patch sits
      // above the seat seams rather than sharing their depth plane.
      for (const aisle of [0.13, 0.34, 0.56, 0.78]) {
        terraceAisle(aisle,
          innerDepth + span * 0.08,
          outerDepth - span * 0.08,
          height + 0.18);
      }
      // The west curve has conspicuous red seat sections in the 2024 UMD
      // aerial. Their diagonal edges read as seat blocks, not painted turf.
      if (tier >= 4 && tier <= 14) {
        const sweep = (tier - 4) / 10;
        for (const start of [0.54, 0.67, 0.79]) {
          const t = start + 0.028 * Math.abs(sweep - 0.5);
          terraceSurface(innerDepth + span * 0.12,
            outerDepth - span * 0.12, height + 0.24, red,
            t, t + 0.065);
        }
      }
    }

    // --- Anchors ----------------------------------------------------------
    let west = pts[0];
    for (const p of pts) {
      if (p.x < west.x) west = p;
    }

    // The 120-by-54-foot board faces the field from the west end zone.
    const sx = west.x + 10;
    const sy = fc.cy;
    const boardRing = [
      new THREE.Vector2(sx - 2, sy - 19.1),
      new THREE.Vector2(sx + 2, sy - 19.1),
      new THREE.Vector2(sx + 2, sy + 19.1),
      new THREE.Vector2(sx - 2, sy + 19.1),
    ];

    // Each straight side of the OSM band runs from the inner bowl to the
    // eastern opening. Their average direction is the field's long axis.
    const innerA = innerIsA ? pts[(lo + 1) % n] : pts[(hi + 1) % n];
    const innerB = innerIsA ? pts[hi] : pts[lo];
    const outerA = innerIsA ? pts[lo] : pts[hi];
    const outerB = innerIsA ? pts[(hi + 1) % n] : pts[(lo + 1) % n];
    const fieldCenter = new THREE.Vector2()
      .add(innerA).add(innerB).add(outerA).add(outerB).multiplyScalar(0.25);
    const along = new THREE.Vector2()
      .subVectors(outerA, innerA).add(new THREE.Vector2().subVectors(outerB, innerB))
      .normalize();
    const across = new THREE.Vector2(-along.y, along.x);
    const point = (length: number, width: number) => new THREE.Vector2(
      fieldCenter.x + along.x * length + across.x * width,
      fieldCenter.y + along.y * length + across.y * width,
    );
    const rect = (x0: number, x1: number, w0: number, w1: number) => [
      point(x0, w0), point(x1, w0), point(x1, w1), point(x0, w1),
    ];
    // NCAA playing surface: 120 x 53⅓ yards, including two 10-yard end zones.
    // Its center follows the mapped stadium opening; the exact painted
    // graphics are simplified, not a claim about the current game-day design.
    const halfLength = 54.864;
    const halfWidth = 24.384;
    const fieldMarks: THREE.BufferGeometry[] = [];
    const fieldColor: THREE.BufferGeometry[] = [];
    const white = helpers.withGlow(0xf2f0e4, spec.nightGlow);
    // The merged stadium geometry uses one material, so painted surfaces
    // cannot rely on per-layer polygon offset. Give each layer enough depth
    // separation to survive the full campus camera range.
    const TURF_MARK_HEIGHT = 1.14;
    const flatMark = (x0: number, x1: number, w0: number, w1: number,
      color: THREE.Color, surface = TURF_MARK_HEIGHT, target = fieldMarks) => {
      const geometry = new THREE.ShapeGeometry(new THREE.Shape(rect(x0, x1, w0, w1)));
      geometry.rotateX(-Math.PI / 2);
      geometry.translate(0, surface, 0);
      target.push(helpers.withColor(geometry, color));
    };
    // UMD's 2024 aerial shows alternating mow bands, Maryland-flag end zones
    // and a red midfield M. These are meshes on the turf, not map imagery.
    for (let band = 0; band < 10; band++) {
      if (band % 2 === 0) flatMark(-45.72 + band * 9.144,
        -45.72 + (band + 1) * 9.144, -halfWidth, halfWidth,
        helpers.withGlow(0x3e7847, spec.nightGlow), 1.075, fieldColor);
    }
    for (const [end0, end1] of [[-halfLength, -45.72], [45.72, halfLength]]) {
      const mid = (end0 + end1) / 2;
      for (const [x0, x1, w0, w1, checks] of [
        [end0, mid, -halfWidth, 0, true],
        [mid, end1, -halfWidth, 0, false],
        [end0, mid, 0, halfWidth, false],
        [mid, end1, 0, halfWidth, true],
      ] as [number, number, number, number, boolean][]) {
        flatMark(x0, x1, w0, w1, checks ? flagBlack : red, 1.10, fieldColor);
        const rows = checks ? 6 : 4;
        const cols = checks ? 4 : 3;
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            if ((row + col) % 2 !== 0) continue;
            flatMark(x0 + (x1 - x0) * col / cols,
              x0 + (x1 - x0) * (col + 1) / cols,
              w0 + (w1 - w0) * row / rows,
              w0 + (w1 - w0) * (row + 1) / rows,
              checks ? gold : white, 1.125, fieldColor);
          }
        }
      }
    }
    const markPoly = (vertices: [number, number][], color: THREE.Color) => {
      const geometry = new THREE.ShapeGeometry(new THREE.Shape(
        vertices.map(([x, w]) => point(x, w))));
      geometry.rotateX(-Math.PI / 2);
      geometry.translate(0, 1.155, 0);
      fieldMarks.push(helpers.withColor(geometry, color));
    };
    // Block M, simplified for legibility at the campus-map camera height.
    markPoly([[-7, -6], [-7, 6], [-4.4, 6], [-4.4, -6]], red);
    markPoly([[4.4, -6], [4.4, 6], [7, 6], [7, -6]], red);
    markPoly([[-4.4, 6], [0, -0.8], [0, -5.5], [-4.4, 1.3]], red);
    markPoly([[0, -5.5], [0, -0.8], [4.4, 6], [4.4, 1.3]], red);
    // Thin sidelines, end lines, goal lines and five-yard transverse marks.
    for (const w of [-halfWidth, halfWidth]) {
      flatMark(-halfLength, halfLength, w - 0.11, w + 0.11, white);
    }
    for (const x of [-halfLength, halfLength]) {
      flatMark(x - 0.11, x + 0.11, -halfWidth, halfWidth, white);
    }
    for (let yard = -50; yard <= 50; yard += 5) {
      const x = yard * 0.9144;
      const thickness = yard % 10 === 0 ? 0.24 : 0.12;
      flatMark(x - thickness / 2, x + thickness / 2, -halfWidth + 0.35, halfWidth - 0.35, white);
    }
    // College inbounds marks sit 60 ft in from each sideline. The short
    // one-yard ticks make the playing surface read as a real football field
    // at close zoom without filling the center with painted texture.
    const hashOffset = halfWidth - 18.288;
    for (let yard = -49; yard <= 49; yard++) {
      if (yard % 5 === 0) continue; // the full-width five-yard line is already there
      const x = yard * 0.9144;
      for (const side of [-1, 1]) {
        const w = side * hashOffset;
        flatMark(x - 0.06, x + 0.06, w - 0.31, w + 0.31, white, 1.165);
      }
    }
    // Maryland's north upper deck rises well above the lower bowl. Its rows
    // are thin seating slabs, leaving the underside open between supports;
    // ground-to-top extrusions made it look like a solid cliff.
    const upperDeck: THREE.BufferGeometry[] = [];
    const upperRows = 18;
    const upperFrontHeight = 18.8;
    for (let row = 0; row < upperRows; row++) {
      const t0 = row / upperRows, t1 = (row + 1) / upperRows;
      const w0 = 47 + 45 * t0, w1 = 47 + 45 * t1;
      const x0 = -61 - 11 * t1, x1 = 48 - 3 * t1;
      const h = 19.0 + 14.0 * t1;
      const previousHeight = row === 0 ? upperFrontHeight : 19.0 + 14.0 * t0;
      // Adjacent slabs meet only at an edge. Overlapping coplanar riser faces
      // flicker when the camera pulls back from the stadium.
      const slabBase = previousHeight;
      upperDeck.push(helpers.withColor(helpers.extrudeFootprint(
        rect(x0, x1, w0, w1), h - slabBase).translate(0, slabBase, 0),
      helpers.darkerShade(upperSeat, row % 2 === 0 ? 0.02 : -0.012)));
      for (const fraction of [0.28, 0.66]) {
        const stripe0 = THREE.MathUtils.lerp(w0, w1, fraction);
        const stripe1 = THREE.MathUtils.lerp(w0, w1, fraction + 0.045);
        flatMark(x0 + 0.4, x1 - 0.4, stripe0, stripe1,
          upperGroove, h + 0.12, upperDeck);
      }
      for (const aisle of [-45, -15, 15, 36]) {
        flatMark(aisle - 0.42, aisle + 0.42, w0 + 0.08, w1 - 0.08,
          red, h + 0.2, upperDeck);
      }
      if (row === 0 || row === Math.floor(upperRows * 0.4)) {
        // The long red cross-aisle is a defining line in the north stand.
        // One restrained edge stripe and one broader mid-deck band keep it
        // visible without turning the seating into a painted slab.
        const bandWidth = row === Math.floor(upperRows * 0.4) ? 1.45 : 0.7;
        flatMark(x0 + 0.4, x1 - 0.4, w0 + 0.12, w0 + 0.12 + bandWidth,
          red, h + 0.27, upperDeck);
      }
      if (row === upperRows - 1) {
        // The long red back rim is visible above the pale upper seating.
        flatMark(x0 + 0.4, x1 - 0.4, w1 - 0.9, w1 - 0.18,
          red, h + 0.27, upperDeck);
      }
    }
    // Slender rear supports recall the exposed concrete under the high stand.
    // Their heights stop at the underside of the row directly above them.
    for (const alongPosition of [-55, -28, -1, 26, 40]) {
      const supportWidth = 81;
      const row = Math.floor((supportWidth - 47) / 45 * upperRows);
      const underside = 19.0 + 14.0 * row / upperRows;
      upperDeck.push(helpers.withColor(helpers.extrudeFootprint(
        rect(alongPosition - 1.05, alongPosition + 1.05,
          supportWidth - 1.05, supportWidth + 1.05), underside), concrete));
    }
    const goalposts: THREE.BufferGeometry[] = [];
    const goldPost = helpers.withGlow(0xe3ba4a, spec.nightGlow);
    const rod = (x0: number, w0: number, y0: number,
      x1: number, w1: number, y1: number, radius: number) => {
      const a = point(x0, w0), b = point(x1, w1);
      const start = new THREE.Vector3(a.x, y0, -a.y);
      const end = new THREE.Vector3(b.x, y1, -b.y);
      const direction = end.clone().sub(start);
      const geometry = new THREE.CylinderGeometry(radius, radius,
        direction.length(), 8);
      geometry.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0), direction.normalize()));
      const middle = start.add(end).multiplyScalar(0.5);
      geometry.translate(middle.x, middle.y, middle.z);
      goalposts.push(helpers.withColor(geometry, goldPost));
    };
    for (const end of [-1, 1]) {
      const x = end * (halfLength + 2.5);
      rod(x + end * 2.0, 0, 1.0, x, 0, 6.5, 0.17);
      rod(x, -3.0, 6.5, x, 3.0, 6.5, 0.15);
      for (const w of [-3.0, 3.0]) rod(x, w, 6.5, x, w, 13.2, 0.12);
    }
    // Maryland Athletics specifies a 120-by-54-foot west-end display.
    const screen = new THREE.BoxGeometry(0.18, 16.46, 36.58);
    screen.translate(sx + 2.12, 14.35, -sy); // field-facing east side
    const screenBorder = new THREE.BoxGeometry(0.42, 0.52, 38.2);
    screenBorder.translate(sx + 2.15, 22.96, -sy);

    // The west videoboard is an elevated cabinet, not a ground-to-rim wall.
    // A red M on its back faces the west concourse seen in UMD's aerial.
    const boardCabinet = helpers.extrudeFootprint(boardRing, 18.0)
      .translate(0, 5.6, 0);
    const backM = new THREE.ShapeGeometry(new THREE.Shape([
      new THREE.Vector2(-4, 18.0), new THREE.Vector2(-4, 22.1),
      new THREE.Vector2(-2.8, 22.1), new THREE.Vector2(0, 19.4),
      new THREE.Vector2(2.8, 22.1), new THREE.Vector2(4, 22.1),
      new THREE.Vector2(4, 18.0), new THREE.Vector2(2.8, 18.0),
      new THREE.Vector2(2.8, 20.4), new THREE.Vector2(0, 18.4),
      new THREE.Vector2(-2.8, 20.4), new THREE.Vector2(-2.8, 18.0),
    ]));
    backM.rotateY(-Math.PI / 2);
    backM.translate(sx - 2.08, 0, -sy);
    const boardSupports: THREE.BufferGeometry[] = [];
    for (const offset of [-13, -4.3, 4.3, 13]) {
      boardSupports.push(helpers.withColor(helpers.extrudeFootprint([
        new THREE.Vector2(sx - 1.25, sy + offset - 0.75),
        new THREE.Vector2(sx + 1.25, sy + offset - 0.75),
        new THREE.Vector2(sx + 1.25, sy + offset + 0.75),
        new THREE.Vector2(sx - 1.25, sy + offset + 0.75),
      ], 5.65), dark));
    }

    return [
      // Lower structural band and fine seating terraces; their risers
      // create actual depth and shadow across the northern upper deck.
      helpers.withColor(helpers.extrudeFootprint(pts, baseHeight * 0.62), concrete),
      // The dark apron wraps a full rectangular field, rather than filling
      // only the D-shaped west bowl. The turf rises just above it.
      helpers.withColor(helpers.extrudeFootprint(rect(-58, 58, -28, 28), 0.94), helpers.withGlow(0x53614f, spec.nightGlow)),
      helpers.withColor(helpers.extrudeFootprint(rect(-halfLength, halfLength, -halfWidth, halfWidth), 1.025), fieldC),
      ...fieldColor,
      ...fieldMarks,
      ...goalposts,
      ...grandstandParts,
      ...upperDeck,
      // Raised west-end screen and its freestanding rear legs.
      helpers.withColor(boardCabinet, dark),
      ...boardSupports,
      helpers.withColor(screen, helpers.withGlow(0x14242c, spec.nightGlow)),
      helpers.withColor(screenBorder, helpers.withGlow(0x252c31, spec.nightGlow)),
      helpers.withColor(backM, red),
    ];
  },
};
