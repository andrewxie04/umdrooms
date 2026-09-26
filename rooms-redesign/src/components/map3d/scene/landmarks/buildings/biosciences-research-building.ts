// Biosciences Research Building (UMD building 413, mapped relation/9681971).
// Sources: UMD Facilities building record https://facilities.umd.edu/node/529
// UMD exterior/entry photograph and orientation:
// https://qtd-hub.umd.edu/event/symposium-2023/directions.pdf
// UMD account of the six-column semicircular entry and atrium:
// https://science.umd.edu/labs/atrium/Symposium/meeting%20location%20and%20directions.htm
// UMD Campus Web Map aerial basemap: https://maps.umd.edu/
// Roof layout checked against Maryland iMAP SixInchImagery aerial reference:
// https://mdgeodata.md.gov/imagery/rest/services/SixInch/SixInchImagery/ImageServer
// The mapped inner ring remains an actual opening through the mass and roof.
import * as THREE from 'three';
import type { LandmarkBuildContext, LandmarkModule } from '../types';

type Parts = THREE.BufferGeometry[];

function box(
  ctx: LandmarkBuildContext, parts: Parts,
  x0: number, x1: number, n0: number, n1: number,
  y0: number, y1: number, hex: number,
): void {
  if (x1 <= x0 || n1 <= n0 || y1 <= y0) return;
  const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, n1 - n0);
  g.translate((x0 + x1) / 2, (y0 + y1) / 2, -(n0 + n1) / 2);
  parts.push(ctx.helpers.withColor(g, ctx.helpers.withGlow(hex, ctx.spec.nightGlow)));
}

// A thin surface following a real footprint edge; the offset keeps colored
// glass and stone trim clear of the structural brick wall beneath them.
function panel(
  ctx: LandmarkBuildContext, parts: Parts,
  a: THREE.Vector2, b: THREE.Vector2, t0: number, t1: number,
  y0: number, y1: number, offset: number, inward: boolean, hex: number,
): void {
  const dx = b.x - a.x;
  const dn = b.y - a.y;
  const length = Math.hypot(dx, dn);
  if (length < 0.01 || t1 <= t0 || y1 <= y0) return;
  const side = inward ? -1 : 1;
  const ox = side * dn / length * offset;
  const on = -side * dx / length * offset;
  const point = (t: number, y: number) => [a.x + t * dx + ox, y, -(a.y + t * dn + on)];
  const p0 = point(t0, y0);
  const p1 = point(t1, y0);
  const p2 = point(t1, y1);
  const p3 = point(t0, y1);
  const vertices = inward
    ? [...p0, ...p2, ...p1, ...p0, ...p3, ...p2]
    : [...p0, ...p1, ...p2, ...p0, ...p2, ...p3];
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  g.computeVertexNormals();
  parts.push(ctx.helpers.withColor(g, ctx.helpers.withGlow(hex, ctx.spec.nightGlow)));
}

function cylinder(
  ctx: LandmarkBuildContext, parts: Parts,
  x: number, n: number, radius: number, y0: number, y1: number, hex: number,
): void {
  const g = new THREE.CylinderGeometry(radius, radius, y1 - y0, 10);
  g.translate(x, (y0 + y1) / 2, -n);
  parts.push(ctx.helpers.withColor(g, ctx.helpers.withGlow(hex, ctx.spec.nightGlow)));
}

function portico(ctx: LandmarkBuildContext, parts: Parts, cx: number, south: number): void {
  const pale = 0xd8d3c5;
  const radius = 5.55;
  const centerN = south + 0.10;
  // The UMD entrance photograph shows an open, six-column curved arcade in
  // front of a dark glazed doorway, capped by a pale semicircular entablature.
  box(ctx, parts, cx - 3.35, cx + 3.35, south - 0.16, south - 0.09, 0.42, 7.45, 0x405e68);
  for (let i = 0; i < 6; i++) {
    const angle = Math.PI + (i + 0.5) * Math.PI / 6;
    const x = cx + radius * Math.cos(angle);
    const n = centerN + radius * Math.sin(angle);
    cylinder(ctx, parts, x, n, 0.37, 0.30, 7.63, pale);
    cylinder(ctx, parts, x, n, 0.49, 0.22, 0.48, 0xb9b4a9);
    cylinder(ctx, parts, x, n, 0.51, 7.54, 7.79, pale);
  }
  // Each arc section has its own face, with no coincident roof/wall plane.
  const frieze = new THREE.BufferGeometry();
  const roof = new THREE.BufferGeometry();
  const faces: number[] = [];
  const cap: number[] = [];
  const segments = 18;
  for (let i = 0; i < segments; i++) {
    const a0 = Math.PI + i * Math.PI / segments;
    const a1 = Math.PI + (i + 1) * Math.PI / segments;
    const p0 = [cx + 6.13 * Math.cos(a0), -(centerN + 6.13 * Math.sin(a0))];
    const p1 = [cx + 6.13 * Math.cos(a1), -(centerN + 6.13 * Math.sin(a1))];
    faces.push(
      p0[0], 7.77, p0[1], p1[0], 7.77, p1[1], p1[0], 8.46, p1[1],
      p0[0], 7.77, p0[1], p1[0], 8.46, p1[1], p0[0], 8.46, p0[1],
    );
    cap.push(cx, 8.49, -centerN, p0[0], 8.49, p0[1], p1[0], 8.49, p1[1]);
  }
  frieze.setAttribute('position', new THREE.Float32BufferAttribute(faces, 3));
  frieze.computeVertexNormals();
  roof.setAttribute('position', new THREE.Float32BufferAttribute(cap, 3));
  roof.computeVertexNormals();
  parts.push(ctx.helpers.withColor(frieze, ctx.helpers.withGlow(pale, ctx.spec.nightGlow)));
  parts.push(ctx.helpers.withColor(roof, ctx.helpers.withGlow(0xc9c8bf, ctx.spec.nightGlow)));
}

export const landmark: LandmarkModule = {
  id: 'relation/9681971',
  spec: {
    name: 'Biosciences Research Building',
    color: 0x9d5946,
    height: 18.2,
    roof: 'parapet',
    accent: 0x6f8b96,
    nightGlow: 0.12,
  },
  maxHeight: 21.6,
  build(ctx) {
    const { pts, holes, helpers } = ctx;
    const parts: Parts = [];
    const bounds = helpers.bboxOf(pts);
    const x = (f: number) => bounds.minX + f * (bounds.maxX - bounds.minX);
    const n = (f: number) => bounds.minY + f * (bounds.maxY - bounds.minY);
    const mass = holes.length
      ? helpers.extrudeWithHoles(pts, holes, 18.2)
      : helpers.extrudeFootprint(pts, 18.2);
    parts.push(helpers.withColor(mass, helpers.withGlow(ctx.spec.color, ctx.spec.nightGlow)));

    // Four occupied levels of punched glass bays. They trace both the outer
    // walls and the real courtyard walls instead of crossing the opening.
    for (const [ring, inward] of [[pts, false], ...holes.map((h) => [h, true])] as [THREE.Vector2[], boolean][]) {
      for (let i = 0; i < ring.length; i++) {
        const a = ring[i];
        const b = ring[(i + 1) % ring.length];
        const length = a.distanceTo(b);
        if (length < 3.5) continue;
        const bays = Math.max(1, Math.floor(length / 3.75));
        for (let j = 0; j < bays; j++) {
          const left = (j + 0.17) / bays;
          const right = (j + 0.83) / bays;
          for (const level of [1.65, 5.7, 9.75, 13.8]) {
            panel(ctx, parts, a, b, left, right, level, level + 2.18, 0.075, inward, 0x516e7b);
            panel(ctx, parts, a, b, left, right, level - 0.14, level - 0.02, 0.087, inward, 0xd0c4b3);
            panel(ctx, parts, a, b, left, right, level + 2.21, level + 2.34, 0.087, inward, 0xd0c4b3);
            panel(ctx, parts, a, b, (left + right) / 2 - 0.008, (left + right) / 2 + 0.008,
              level, level + 2.18, 0.09, inward, 0xa7b5b5);
          }
        }
      }
    }

    // Roof skin follows the full original polygon and retains its mapped
    // courtyard hole. Raised surfaces below distinguish the three wings.
    const roof = holes.length
      ? helpers.extrudeWithHoles(pts, holes, 0.16)
      : helpers.extrudeFootprint(pts, 0.16);
    roof.translate(0, 18.22, 0);
    parts.push(helpers.withColor(roof, helpers.withGlow(0xb8b7ad, ctx.spec.nightGlow)));

    // Long, dark north roof; slender west laboratory roof/skylight spine;
    // broad pale mechanical roof to the southeast as seen from above.
    box(ctx, parts, x(0.045), x(0.945), n(0.87), n(0.95), 18.41, 18.58, 0x454c50);
    box(ctx, parts, x(0.16), x(0.29), n(0.16), n(0.76), 18.41, 18.59, 0x7b8384);
    box(ctx, parts, x(0.58), x(0.94), n(0.42), n(0.74), 18.41, 18.60, 0xc5c4bb);
    for (let i = 0; i < 8; i++) {
      const f = 0.22 + i * 0.066;
      box(ctx, parts, x(0.23), x(0.255), n(f), n(f + 0.031), 18.62, 18.70, 0x536d77);
    }
    for (let i = 0; i < 5; i++) {
      const f = 0.14 + i * 0.16;
      box(ctx, parts, x(f), x(f + 0.055), n(0.895), n(0.916), 18.61, 18.68, 0x687c83);
    }

    // Set-back service wells, fan housings and ductwork form the busy eastern
    // roofline. All sit above the roof plane and clear the courtyard ring.
    box(ctx, parts, x(0.625), x(0.88), n(0.48), n(0.64), 18.63, 19.25, 0xaaa9a0);
    box(ctx, parts, x(0.675), x(0.81), n(0.51), n(0.60), 19.25, 21.0, 0xb6b5ae);
    box(ctx, parts, x(0.60), x(0.88), n(0.44), n(0.46), 18.63, 19.45, 0x898e8d);
    for (const f of [0.64, 0.75, 0.86]) {
      const fan = new THREE.CylinderGeometry(1.35, 1.35, 0.35, 12);
      fan.translate(x(f), 19.48, -n(0.67));
      parts.push(helpers.withColor(fan, helpers.withGlow(0x737d7d, ctx.spec.nightGlow)));
    }

    // A low edge screen reveals the roof as flat without capping the court.
    for (const [ring, inward] of [[pts, false], ...holes.map((h) => [h, true])] as [THREE.Vector2[], boolean][]) {
      for (let i = 0; i < ring.length; i++) {
        panel(ctx, parts, ring[i], ring[(i + 1) % ring.length], 0, 1,
          18.42, 18.88, 0.055, inward, 0xbfbcb2);
      }
    }

    // The south-facing entry bay is a red-brick gable above the curved arcade.
    // Its face stands just outside the mapped south wall; the short roof slopes
    // terminate above the flat structural roof instead of sharing its plane.
    const entryX = x(0.233);
    const south = bounds.minY;
    const half = 8.7;
    const gable = new THREE.BufferGeometry();
    gable.setAttribute('position', new THREE.Float32BufferAttribute([
      entryX - half, 18.25, -(south - 0.12),
      entryX + half, 18.25, -(south - 0.12),
      entryX, 21.32, -(south - 0.12),
    ], 3));
    gable.computeVertexNormals();
    parts.push(helpers.withColor(gable, helpers.withGlow(0x965342, ctx.spec.nightGlow)));
    for (const side of [-1, 1]) {
      const eaveX = entryX + side * half;
      const frontN = south - 0.12;
      const backN = south + 5.6;
      const frontEave = [eaveX, 18.29, -frontN];
      const frontRidge = [entryX, 21.32, -frontN];
      const backEave = [eaveX, 18.29, -backN];
      const backRidge = [entryX, 21.32, -backN];
      const vertices = side < 0
        ? [...frontEave, ...frontRidge, ...backRidge, ...frontEave, ...backRidge, ...backEave]
        : [...frontRidge, ...frontEave, ...backEave, ...frontRidge, ...backEave, ...backRidge];
      const slope = new THREE.BufferGeometry();
      slope.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      slope.computeVertexNormals();
      parts.push(helpers.withColor(slope, helpers.withGlow(0x545d61, ctx.spec.nightGlow)));
    }
    portico(ctx, parts, entryX, south);
    return parts;
  },
};
