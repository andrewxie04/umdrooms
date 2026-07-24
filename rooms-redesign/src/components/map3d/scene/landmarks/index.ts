// src/components/map3d/scene/landmarks/index.ts
//
// Landmark registry + builder-context factory. Per-building modules live in
// ./buildings/<slug>.ts and are collected AUTOMATICALLY via Vite's
// import.meta.glob (eager) — adding a landmark is: drop one file in
// ./buildings/, export `const landmark: LandmarkModule`, done. NO central
// index to edit, no shared file to touch.
//
// geometry.ts consumes:
//   LANDMARK_MODULES[id]   — full module (spec + optional custom build)
//   makeLandmarkCtx(...)   — assembles the LandmarkBuildContext for builders
//   landmarkPresetParts    — re-exported preset fallback (from ./presets)
//
// Duplicate ids: last registration wins (glob order is stable/sorted) with a
// console warning — two modules for the same OSM way id is always a mistake.

import type * as THREE from 'three';
import {
  bboxOf,
  centroidOf,
  extrudeFootprint,
  extrudeWithHoles,
  hash01,
  outsetRing,
  scaleAbout,
  withColor,
} from '../geom-utils';
import { buildHippedRoof, darkerShade, landmarkPresetParts, withGlow } from './presets';
import type {
  LandmarkBuildContext,
  LandmarkHelpers,
  LandmarkModule,
  LandmarkSpec,
} from './types';

export type { LandmarkBuildContext, LandmarkBuilder, LandmarkHelpers, LandmarkModule, LandmarkRoof, LandmarkSpec } from './types';
export { landmarkPresetParts };

/** The registry: OSM way id -> module. Plain (mutable) object on purpose —
 * scripts/check-landmarks.ts empties it at runtime for its baseline diff. */
const registry: Record<string, LandmarkModule> = {};

export function registerLandmark(mod: LandmarkModule): void {
  if (!mod || typeof mod.id !== 'string' || !mod.id) {
    console.warn('[landmarks] module missing a valid `id` — skipped', mod);
    return;
  }
  if (registry[mod.id]) {
    console.warn(`[landmarks] duplicate module for ${mod.id} (${mod.spec?.name}) — last one wins`);
  }
  registry[mod.id] = mod;
}

// Auto-registration. import.meta.glob is a Vite COMPILE-TIME feature: Vite
// rewrites the *call*, but the bare property is undefined in the browser, so
// `typeof import.meta.glob === 'function'` is always false at runtime and
// silently registers NOTHING. The call must run unconditionally under Vite;
// the try/catch keeps node/esbuild (scripts/check-landmarks.ts, which
// registers modules manually) from crashing on the undefined call.
try {
  const modules = import.meta.glob<{ landmark?: LandmarkModule }>('./buildings/*.ts', {
    eager: true,
  });
  for (const path of Object.keys(modules)) {
    const mod = modules[path].landmark;
    if (!mod) {
      console.warn(`[landmarks] ${path} exports no \`landmark\` const — skipped`);
      continue;
    }
    registerLandmark(mod);
  }
} catch {
  // Not running under Vite (node/esbuild harness) — manual registration path.
}

export const LANDMARK_MODULES: Readonly<Record<string, LandmarkModule>> = registry;

/** Shared helper bundle handed to every custom builder via the ctx. These
 * are the exact implementations geometry.ts uses, so builder output is
 * merge-compatible by construction. */
const HELPERS: LandmarkHelpers = {
  extrudeFootprint,
  extrudeWithHoles,
  withColor,
  centroidOf,
  hash01,
  scaleAbout,
  outsetRing,
  bboxOf,
  withGlow,
  darkerShade,
  buildHippedRoof,
};

/** Assembles the builder context. `baseHeight` is resolved by the caller
 * (geometry.ts buildingBaseHeight: spec.height ?? tagged ?? 11, floored at
 * 1.5, no jitter) so the highlight shell, lit windows, and the builder all
 * agree on the main-mass height. */
export function makeLandmarkCtx(
  pts: THREE.Vector2[],
  baseHeight: number,
  spec: LandmarkSpec,
): LandmarkBuildContext {
  const { cx, cy } = centroidOf(pts);
  return { pts, cx, cy, baseHeight, spec, helpers: HELPERS };
}
