// Jeong H. Kim Engineering Building (KEB) — way/23937556.
// Signature: the undulating stainless-steel "wave" roof over a modern
// glass + metal body, plus a cylindrical glass drum at the south entrance
// plaza (the OSM footprint itself carries the curved drum bulge, so the
// cylinder is anchored to that bulge via bbox fractions).
//
// Wave roof construction: an inset perimeter ribbon whose top edge
// oscillates with arclength (sine-modulated heights), built as non-indexed
// triangles — outer + inner band faces plus a wavy horizontal cap strip so
// the undulation reads from aerial/3D views. Metallic 0xc9ced2.
import * as THREE from 'three';
import type { LandmarkModule } from '../types';

const WAVE_METAL = 0xc9ced2;

export const landmark: LandmarkModule = {
  id: 'way/23937556',
  spec: {
    name: 'Jeong H. Kim Engineering Building',
    color: 0x99a1a9,
    height: 17,
    roof: 'parapet',
    accent: 0x8fb7c9,
    nightGlow: 0.25,
  },
  // Wave apex ≈ baseHeight(17) + lift(0.4) + amp(4.2) = 21.6 — above the
  // parapet silhouette, so the highlight shell needs the true apex.
  maxHeight: 22,
  build(ctx) {
    const { pts, cx, cy, baseHeight, spec, helpers } = ctx;
    const body = helpers.withGlow(spec.color, spec.nightGlow);
    const metal = helpers.withGlow(WAVE_METAL, spec.nightGlow);
    const glass = helpers.withGlow(spec.accent ?? 0x8fb7c9, spec.nightGlow);

    // 1. Main mass — flat-roofed modern block on the real footprint.
    const parts: THREE.BufferGeometry[] = [
      helpers.withColor(helpers.extrudeFootprint(pts, baseHeight), body),
    ];

    // 2. The WAVE — ribbon hugging the roof edge, top profile oscillates.
    const ring = helpers.outsetRing(pts, -1.0);
    const n = ring.length;
    const segLen: number[] = [];
    let perimeter = 0;
    for (let i = 0; i < n; i++) {
      const a = ring[i];
      const b = ring[(i + 1) % n];
      const L = Math.hypot(b.x - a.x, b.y - a.y);
      segLen.push(L);
      perimeter += L;
    }
    const sAcc: number[] = [0];
    for (let i = 0; i < n; i++) sAcc.push(sAcc[i] + segLen[i]);
    const waves = 6;
    const amp = 4.2;
    const lift = 0.4;
    const phase = helpers.hash01(`${spec.name}:wavePhase`) * Math.PI * 2;
    const waveH = (i: number) =>
      baseHeight + lift + amp * (0.5 + 0.5 * Math.sin((2 * Math.PI * waves * sAcc[i]) / perimeter + phase));

    // Cap strip points: 3.0m inward (toward centroid) from each ring vertex.
    const inner = ring.map((p) => {
      const dx = cx - p.x;
      const dy = cy - p.y;
      const L = Math.hypot(dx, dy) || 1;
      return new THREE.Vector2(p.x + (dx / L) * 3.0, p.y + (dy / L) * 3.0);
    });

    const pos: number[] = [];
    const push = (p: THREE.Vector2, y: number) => pos.push(p.x, y, -p.y);
    const yb = baseHeight - 0.8; // tuck band bottom into the wall top — no gap
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const h0 = waveH(i);
      const h1 = waveH(j);
      const o0 = ring[i];
      const o1 = ring[j];
      const q0 = inner[i];
      const q1 = inner[j];
      // Outer face (outward-winding for a CCW ring).
      push(o0, yb); push(o1, yb); push(o1, h1);
      push(o0, yb); push(o1, h1); push(o0, h0);
      // Inner face (reversed) so the band reads solid from aerial views.
      push(o0, yb); push(o1, h1); push(o1, yb);
      push(o0, yb); push(o0, h0); push(o1, h1);
      // Wavy horizontal cap strip (upward-facing).
      push(o0, h0); push(o1, h1); push(q0, h0);
      push(o1, h1); push(q1, h1); push(q0, h0);
    }
    const waveGeom = new THREE.BufferGeometry();
    waveGeom.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    waveGeom.computeVertexNormals();
    parts.push(helpers.withColor(waveGeom, metal));

    // 3. Glass drum — cylinder anchored to the curved south-entrance bulge
    // (bbox fractions measured off the real OSM footprint arc).
    const bb = helpers.bboxOf(pts);
    const drumX = bb.minX + 0.632 * (bb.maxX - bb.minX);
    const drumY = bb.minY + 0.436 * (bb.maxY - bb.minY);
    const drumH = baseHeight * 0.8;
    const drum = new THREE.CylinderGeometry(6.5, 6.5, drumH, 28, 1, false);
    drum.translate(drumX, drumH / 2, -drumY);
    parts.push(helpers.withColor(drum, glass));

    return parts;
  },
};
