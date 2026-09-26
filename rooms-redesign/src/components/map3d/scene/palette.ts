// src/components/map3d/scene/palette.ts
//
// Sun-elevation-driven scene palettes. Three stops keyed by sun elevation:
//   night  (fully reached at NIGHT_ELEV and below)
//   golden (dawn/dusk golden hour, peak at GOLDEN_ELEV — warm orange-pink
//           horizon tones, windows beginning to glow)
//   day    (fully reached at DAY_ELEV and above — airy warm-gray/sage look)
// The controller blends continuously between stops as the elevation changes,
// so a real solar day/night cycle (or an eased forced mode) never jumps.
// Surface colors remain in geometry.ts; this controller owns atmosphere,
// light color, and exposure so the same campus stays legible at every hour.

import * as THREE from 'three';

export interface PaletteRefs {
  scene: THREE.Scene;
  fog: THREE.Fog;
  hemi: THREE.HemisphereLight;
  sun: THREE.DirectionalLight;
  renderer: THREE.WebGLRenderer;
  buildingMaterial: THREE.MeshStandardMaterial;
  surfaceMaterial: THREE.MeshStandardMaterial;
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
  exposure: number;
  buildingEmissive: THREE.Color;
  buildingEmissiveIntensity: number;
  surfaceTint: THREE.Color;
}

/** Elevation (degrees) at which each stop is fully reached. Between pivots
 * the stops lerp linearly; outside the range the nearest stop holds. */
export const NIGHT_ELEV = -11;
export const GOLDEN_ELEV = -2.5;
export const DAY_ELEV = 8;

const DAY: PaletteStop = {
  background: new THREE.Color(0xd8e1e3), // hazy blue-gray Mid-Atlantic sky
  fog: new THREE.Color(0xd8e1e3),
  fogNear: 2600,
  fogFar: 8300,
  hemiSky: new THREE.Color(0xe3eef3), // cool skylight against warm direct sun
  hemiGround: new THREE.Color(0xa2a99b), // reflected light from lawns and paths
  hemiIntensity: 0.78,
  sunColor: new THREE.Color(0xfff6e9),
  sunIntensity: 1.85,
  sunShadowIntensity: 0.74,
  exposure: 0.94,
  buildingEmissive: new THREE.Color(0x000000),
  buildingEmissiveIntensity: 0,
  surfaceTint: new THREE.Color(0xffffff),
};

const GOLDEN: PaletteStop = {
  background: new THREE.Color(0xcdb8ae), // warm haze rather than saturated orange
  fog: new THREE.Color(0xcdb8ae),
  fogNear: 2050,
  fogFar: 7100,
  hemiSky: new THREE.Color(0xdaccc3),
  hemiGround: new THREE.Color(0x80776e),
  hemiIntensity: 0.7,
  sunColor: new THREE.Color(0xffbf85),
  sunIntensity: 1.72,
  sunShadowIntensity: 0.7,
  exposure: 1.08,
  buildingEmissive: new THREE.Color(0xffad69),
  buildingEmissiveIntensity: 0.07,
  surfaceTint: new THREE.Color(0xf6ebe1),
};

const NIGHT: PaletteStop = {
  background: new THREE.Color(0x101a29), // deep blue night haze
  fog: new THREE.Color(0x101a29),
  fogNear: 1750,
  fogFar: 6200,
  hemiSky: new THREE.Color(0x71839e), // enough cool fill to identify buildings
  hemiGround: new THREE.Color(0x343e3a),
  hemiIntensity: 0.77,
  sunColor: new THREE.Color(0xb5c9e9),
  sunIntensity: 0.7,
  sunShadowIntensity: 0.46,
  exposure: 1.62,
  buildingEmissive: new THREE.Color(0x8fa7ca),
  buildingEmissiveIntensity: 0.06,
  surfaceTint: new THREE.Color(0xd5deea),
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

    const { scene, fog, hemi, sun, renderer, buildingMaterial, surfaceMaterial } = this.refs;
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
    renderer.toneMappingExposure = THREE.MathUtils.lerp(a.exposure, b.exposure, t);
    buildingMaterial.emissive.lerpColors(a.buildingEmissive, b.buildingEmissive, t);
    buildingMaterial.emissiveIntensity = THREE.MathUtils.lerp(
      a.buildingEmissiveIntensity,
      b.buildingEmissiveIntensity,
      t,
    );
    surfaceMaterial.color.lerpColors(a.surfaceTint, b.surfaceTint, t);
  }
}
