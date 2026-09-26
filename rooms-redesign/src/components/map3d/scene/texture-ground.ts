import * as THREE from 'three';

/** A broad tile keeps the lawn from forming a visible grid across campus.
 * 1.25 m texels still show a little grain when the camera is near ground. */
const TILE_METRES = 640;
const SIZE = 512;
const SURFACE_TILE_METRES = 128;
const SURFACE_SIZE = 256;
const BUILDING_TILE_METRES = 24;

function smoothstep(min: number, max: number, value: number): number {
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return t * t * (3 - 2 * t);
}

function byte(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function makeLattice(cells: number, seed: number): Float32Array {
  const values = new Float32Array(cells * cells);
  let state = seed >>> 0;
  for (let i = 0; i < values.length; i++) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    values[i] = (state / 0xffffffff) * 2 - 1;
  }
  return values;
}

/** Periodic, smoothly interpolated noise. Repeating the CanvasTexture has no
 * abrupt edge, and no browser-dependent randomness is involved. */
function sample(lattice: Float32Array, cells: number, u: number, v: number): number {
  const x = u * cells;
  const y = v * cells;
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = (x - ix) ** 2 * (3 - 2 * (x - ix));
  const fy = (y - iy) ** 2 * (3 - 2 * (y - iy));
  const nextX = ix + 1 === cells ? 0 : ix + 1;
  const row = iy * cells;
  const nextRow = (iy + 1 === cells ? 0 : iy + 1) * cells;
  const a = lattice[row + ix] * (1 - fx) + lattice[row + nextX] * fx;
  const b = lattice[nextRow + ix] * (1 - fx) + lattice[nextRow + nextX] * fx;
  return a * (1 - fy) + b * fy;
}

/** Muted lawn and occasional dry-earth variation multiply the existing
 * season-controlled material color. No geographic imagery is used here. */
export function makeGroundTexture(groundSizeMetres: number, anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const context = canvas.getContext('2d');
  if (context) {
    const pixels = context.createImageData(SIZE, SIZE);
    const broad = makeLattice(5, 0x125984aa); // ~128 m lawn variation
    const medium = makeLattice(19, 0x6e63a102); // ~34 m worn/dry patches
    const detail = makeLattice(67, 0xa2bd3931); // ~10 m mottling
    const grain = makeLattice(181, 0x7b1e8c45); // ~3.5 m fine grain
    for (let y = 0; y < SIZE; y++) {
      for (let x = 0; x < SIZE; x++) {
        const u = x / SIZE;
        const v = y / SIZE;
        const large = sample(broad, 5, u, v);
        const mid = sample(medium, 19, u, v);
        const small = sample(detail, 67, u, v);
        const fine = sample(grain, 181, u, v);
        const tone = 239 + large * 8 + mid * 5 + small * 2.5 + fine * 1.5;

        // Warm, thin turf and worn earth are irregular and sparse. Keeping
        // their colour shift modest lets the season palette still lead.
        const dry = smoothstep(0.24, 0.52, large * 0.55 + mid * 0.35 + small * 0.1);
        const earth = smoothstep(0.36, 0.62, large * 0.15 - mid * 0.65 + small * 0.2);
        const index = (y * SIZE + x) * 4;
        pixels.data[index] = byte(tone + 4 + dry * 7 + earth * 10);
        pixels.data[index + 1] = byte(tone + 6 - dry * 8 - earth * 17);
        pixels.data[index + 2] = byte(tone - 5 - dry * 11 - earth * 23);
        pixels.data[index + 3] = 255;
      }
    }
    context.putImageData(pixels, 0, 0);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(groundSizeMetres / TILE_METRES, groundSizeMetres / TILE_METRES);
  texture.anisotropy = Math.min(8, anisotropy);
  return texture;
}

/** Fine, neutral variation for the mapped lawn, asphalt, and paved polygons.
 * Vertex colors still determine each surface's actual material and season;
 * this tile only breaks up otherwise perfectly flat fills. */
export function makeSurfaceTexture(anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = SURFACE_SIZE;
  canvas.height = SURFACE_SIZE;
  const context = canvas.getContext('2d');
  if (context) {
    const pixels = context.createImageData(SURFACE_SIZE, SURFACE_SIZE);
    const broad = makeLattice(8, 0x62e5b941);
    const fine = makeLattice(48, 0x39a7f2c4);
    for (let y = 0; y < SURFACE_SIZE; y++) {
      for (let x = 0; x < SURFACE_SIZE; x++) {
        const u = x / SURFACE_SIZE;
        const v = y / SURFACE_SIZE;
        const tone = byte(248 + sample(broad, 8, u, v) * 7 + sample(fine, 48, u, v) * 4);
        const index = (y * SURFACE_SIZE + x) * 4;
        pixels.data[index] = tone;
        pixels.data[index + 1] = tone;
        pixels.data[index + 2] = tone;
        pixels.data[index + 3] = 255;
      }
    }
    context.putImageData(pixels, 0, 0);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = Math.min(8, anisotropy);
  return texture;
}

/** All map geometry is already in campus metres, so shared x/z UVs line up
 * across separate polygons and roads without a visible seam at their edges. */
export function addWorldSurfaceUV(geometry: THREE.BufferGeometry): void {
  const position = geometry.getAttribute('position');
  if (!position) return;
  const uv = new Float32Array(position.count * 2);
  for (let i = 0; i < position.count; i++) {
    uv[i * 2] = position.getX(i) / SURFACE_TILE_METRES;
    uv[i * 2 + 1] = position.getZ(i) / SURFACE_TILE_METRES;
  }
  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}

/** Fine, neutral masonry and roof grain. The researched vertex colours keep
 * each building's brick, glass, stone and slate identity; this near-white
 * texture only prevents large walls and roofs from looking like flat paint. */
export function makeBuildingTexture(anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = SURFACE_SIZE;
  canvas.height = SURFACE_SIZE;
  const context = canvas.getContext('2d');
  if (context) {
    const pixels = context.createImageData(SURFACE_SIZE, SURFACE_SIZE);
    const broad = makeLattice(7, 0x40f4c821);
    const fine = makeLattice(43, 0x98a7e112);
    for (let y = 0; y < SURFACE_SIZE; y++) {
      for (let x = 0; x < SURFACE_SIZE; x++) {
        const u = x / SURFACE_SIZE;
        const v = y / SURFACE_SIZE;
        const tone = byte(247 + sample(broad, 7, u, v) * 5
          + sample(fine, 43, u, v) * 4);
        const index = (y * SURFACE_SIZE + x) * 4;
        pixels.data[index] = tone;
        pixels.data[index + 1] = tone;
        pixels.data[index + 2] = tone;
        pixels.data[index + 3] = 255;
      }
    }
    context.putImageData(pixels, 0, 0);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = Math.min(8, anisotropy);
  return texture;
}

/** Project the same tile across merged geometry without per-building UV data.
 * Vertical facades use their dominant horizontal axis; roofs use the map's
 * x/z plane. This keeps the grain at a stable real-world scale while zooming. */
export function addWorldBuildingUV(geometry: THREE.BufferGeometry): void {
  const position = geometry.getAttribute('position');
  const normal = geometry.getAttribute('normal');
  if (!position || !normal) return;
  const uv = new Float32Array(position.count * 2);
  for (let i = 0; i < position.count; i++) {
    const nx = normal.getX(i);
    const ny = normal.getY(i);
    const nz = normal.getZ(i);
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);
    uv[i * 2] = (Math.abs(ny) > 0.65 ? x : Math.abs(nx) > Math.abs(nz) ? z : x)
      / BUILDING_TILE_METRES;
    uv[i * 2 + 1] = (Math.abs(ny) > 0.65 ? z : y) / BUILDING_TILE_METRES;
  }
  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}
