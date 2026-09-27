import * as THREE from 'three';

/** World-aligned UVs keep ripples the same physical size on every water body. */
export function setWaterUVs(geometry: THREE.BufferGeometry): void {
  const positions = geometry.getAttribute('position');
  if (!positions) return;
  const uv = new Float32Array(positions.count * 2);
  for (let i = 0; i < positions.count; i++) {
    uv[i * 2] = positions.getX(i) / 12;
    uv[i * 2 + 1] = positions.getZ(i) / 12;
  }
  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}

/** Small, seamless, mipmapped wind ripples; generated once, no frame work. */
export function createWaterNormalMap(): THREE.DataTexture {
  const size = 128;
  const pixels = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = (x / size) * Math.PI * 2;
      const v = (y / size) * Math.PI * 2;
      const a = 3 * u + 7 * v + 0.8 * Math.sin(2 * u - v);
      const b = 9 * u - 4 * v + 0.6 * Math.sin(u + 3 * v);
      const c = 15 * u + 11 * v;
      const dx = 0.11 * Math.cos(a) + 0.07 * Math.cos(b) + 0.025 * Math.cos(c);
      const dy = 0.24 * Math.cos(a) - 0.03 * Math.cos(b) + 0.02 * Math.cos(c);
      const normal = new THREE.Vector3(-dx, -dy, 1).normalize();
      const offset = (y * size + x) * 4;
      pixels[offset] = Math.round((normal.x * 0.5 + 0.5) * 255);
      pixels[offset + 1] = Math.round((normal.y * 0.5 + 0.5) * 255);
      pixels[offset + 2] = Math.round((normal.z * 0.5 + 0.5) * 255);
      pixels[offset + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(pixels, size, size);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}
