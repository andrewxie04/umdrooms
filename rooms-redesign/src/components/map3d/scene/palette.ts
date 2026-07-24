// src/components/map3d/scene/palette.ts
//
// Sun-elevation-driven scene palettes. Three stops keyed by sun elevation:
//   night  (fully reached at NIGHT_ELEV and below)
//   golden (dawn/dusk golden hour, peak at GOLDEN_ELEV — warm orange-pink
//           horizon tones, windows beginning to glow)
//   day    (fully reached at DAY_ELEV and above — airy warm-gray/sage look)
// The controller blends continuously between stops as the elevation changes,
// so a real solar day/night cycle (or an eased forced mode) never jumps.
// Warm low-saturation look throughout; material/vertex colors live in
// geometry.ts and are intentionally NOT touched here.

import * as THREE from 'three';

export interface PaletteRefs {
  scene: THREE.Scene;
  fog: THREE.Fog;
  hemi: THREE.HemisphereLight;
  sun: THREE.DirectionalLight;
  buildingMaterial: THREE.MeshLambertMaterial;
}

interface PaletteStop {
  background: THREE.Color;
  fog: THREE.Color;
  fogNear: number;
  fogFar: number;
  hemiSky: THREE.Color;
  hemiGround: THREE.Color;
  hemiIntensity: number;
  sunColor: THREE.Color;
  sunIntensity: number;
  sunShadowIntensity: number;
  buildingEmissive: THREE.Color;
  buildingEmissiveIntensity: number;
}

/** Elevation (degrees) at which each stop is fully reached. Between pivots
 * the stops lerp linearly; outside the range the nearest stop holds. */
export const NIGHT_ELEV = -11;
export const GOLDEN_ELEV = -2.5;
export const DAY_ELEV = 8;

const DAY: PaletteStop = {
  background: new THREE.Color(0xe9e9df), // pale warm-gray sky with a hint of green air
  fog: new THREE.Color(0xe9e9df),
  fogNear: 3400,
  fogFar: 10000,
  hemiSky: new THREE.Color(0xfdf3e4), // neutral warm white — de-oranged
  hemiGround: new THREE.Color(0xb9bda4), // sage lawn bounce (base ground is green now)
  hemiIntensity: 0.62,
  sunColor: new THREE.Color(0xfff0dc), // neutral warm white — kills the orange/beige cast
  sunIntensity: 2.7,
  sunShadowIntensity: 1,
  buildingEmissive: new THREE.Color(0x000000),
  buildingEmissiveIntensity: 0,
};

const GOLDEN: PaletteStop = {
  background: new THREE.Color(0xeec9a4), // warm orange-pink horizon glow
  fog: new THREE.Color(0xeec19c),
  fogNear: 3000,
  fogFar: 9000,
  hemiSky: new THREE.Color(0xffd3a0), // slightly warmer dusk sky bounce
  hemiGround: new THREE.Color(0x93776a), // dusky warm ground bounce
  hemiIntensity: 0.55,
  sunColor: new THREE.Color(0xff9d5c), // low warm orange sun
  sunIntensity: 1.9,
  sunShadowIntensity: 0.9,
  buildingEmissive: new THREE.Color(0xff9d4e), // windows starting to glow
  buildingEmissiveIntensity: 0.18,
};

const NIGHT: PaletteStop = {
  background: new THREE.Color(0x171b25), // dark warm navy
  fog: new THREE.Color(0x171b25),
  fogNear: 2600,
  fogFar: 8000,
  hemiSky: new THREE.Color(0x566080), // moonlit blue, lifted & de-saturated so vertex-color tints survive on roofs
  hemiGround: new THREE.Color(0x241e15), // warm dark earth bounce, slightly lifted (was green-navy)
  hemiIntensity: 0.9, // stronger sky/ground bounce: multiplies vertex colors, preserving per-building hue
  sunColor: new THREE.Color(0xa4b8e0), // cool moonlight, paler so it tints without over-blueing warm materials
  sunIntensity: 1.15, // real directional moonlight does the visibility work now (was 0.32)
  sunShadowIntensity: 0.55,
  buildingEmissive: new THREE.Color(0xa8b8d9), // cool moonlit windows (was orange 0xffab54)
  buildingEmissiveIntensity: 0.13, // thin 'windows glow' carrier only — was 0.42, a flat wash that flattened every building to the same pale blue-gray
};

/** Applied-state epsilon in degrees of elevation. Solar drift is ~0.004°/s
 * at its fastest, so this re-applies roughly once per second in auto mode —
 * continuous to the eye, cheap enough for the dirty-checked render loop. */
const APPLY_EPSILON = 0.0005;

export class PaletteController {
  private refs: PaletteRefs;
  private lastApplied = NaN;

  constructor(refs: PaletteRefs) {
    this.refs = refs;
  }

  /** Applies the palette for a sun elevation (degrees). Returns true when
   * the applied state changed enough that a re-render is warranted. */
  setElevation(elevDeg: number): boolean {
    if (Number.isFinite(this.lastApplied) && Math.abs(elevDeg - this.lastApplied) < APPLY_EPSILON) {
      return false;
    }
    this.lastApplied = elevDeg;
    this.apply(elevDeg);
    return true;
  }

  private apply(elev: number): void {
    let a: PaletteStop;
    let b: PaletteStop;
    let t: number;
    if (elev <= NIGHT_ELEV) {
      a = b = NIGHT;
      t = 0;
    } else if (elev < GOLDEN_ELEV) {
      a = NIGHT;
      b = GOLDEN;
      t = (elev - NIGHT_ELEV) / (GOLDEN_ELEV - NIGHT_ELEV);
    } else if (elev < DAY_ELEV) {
      a = GOLDEN;
      b = DAY;
      t = (elev - GOLDEN_ELEV) / (DAY_ELEV - GOLDEN_ELEV);
    } else {
      a = b = DAY;
      t = 0;
    }

    const { scene, fog, hemi, sun, buildingMaterial } = this.refs;
    (scene.background as THREE.Color).lerpColors(a.background, b.background, t);
    fog.color.lerpColors(a.fog, b.fog, t);
    fog.near = THREE.MathUtils.lerp(a.fogNear, b.fogNear, t);
    fog.far = THREE.MathUtils.lerp(a.fogFar, b.fogFar, t);
    hemi.color.lerpColors(a.hemiSky, b.hemiSky, t);
    hemi.groundColor.lerpColors(a.hemiGround, b.hemiGround, t);
    hemi.intensity = THREE.MathUtils.lerp(a.hemiIntensity, b.hemiIntensity, t);
    sun.color.lerpColors(a.sunColor, b.sunColor, t);
    sun.intensity = THREE.MathUtils.lerp(a.sunIntensity, b.sunIntensity, t);
    sun.shadow.intensity = THREE.MathUtils.lerp(a.sunShadowIntensity, b.sunShadowIntensity, t);
    buildingMaterial.emissive.lerpColors(a.buildingEmissive, b.buildingEmissive, t);
    buildingMaterial.emissiveIntensity = THREE.MathUtils.lerp(
      a.buildingEmissiveIntensity,
      b.buildingEmissiveIntensity,
      t,
    );
  }
}
