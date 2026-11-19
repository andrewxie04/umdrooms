import * as THREE from 'three';
import { buildSceneGeometries, type CampusGeometries } from './geometry';
import type { Projection } from './projection';
import type { CampusData } from './types';

/** A BufferGeometry reduced to typed arrays, which postMessage can transfer. */
export interface PackedGeometry {
  index: THREE.TypedArray | null;
  attributes: Record<string, { array: THREE.TypedArray; itemSize: number; normalized: boolean }>;
}

type Packed<T> = {
  [K in keyof T]: T[K] extends THREE.BufferGeometry
    ? PackedGeometry
    : T[K] extends THREE.BufferGeometry[]
      ? PackedGeometry[]
      : T[K];
};
export type PackedCampusGeometries = Packed<CampusGeometries>;

function packGeometry(geometry: THREE.BufferGeometry, transfer: Set<ArrayBuffer>): PackedGeometry {
  const attributes: PackedGeometry['attributes'] = {};
  for (const [name, attribute] of Object.entries(geometry.attributes)) {
    const { array, itemSize, normalized } = attribute as THREE.BufferAttribute;
    attributes[name] = { array, itemSize, normalized };
    transfer.add(array.buffer as ArrayBuffer);
  }
  const index = geometry.index?.array ?? null;
  if (index) transfer.add(index.buffer as ArrayBuffer);
  geometry.dispose();
  return { index, attributes };
}

function unpackGeometry(packed: PackedGeometry): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  for (const [name, { array, itemSize, normalized }] of Object.entries(packed.attributes)) {
    geometry.setAttribute(name, new THREE.BufferAttribute(array, itemSize, normalized));
  }
  if (packed.index) geometry.setIndex(new THREE.BufferAttribute(packed.index, 1));
  return geometry;
}

export function packCampusGeometries(geoms: CampusGeometries): { packed: PackedCampusGeometries; transfer: ArrayBuffer[] } {
  const transfer = new Set<ArrayBuffer>();
  const packed = Object.fromEntries(Object.entries(geoms).map(([key, value]) => [
    key,
    value instanceof THREE.BufferGeometry
      ? packGeometry(value, transfer)
      : Array.isArray(value) && value[0] instanceof THREE.BufferGeometry
        ? (value as THREE.BufferGeometry[]).map((g) => packGeometry(g, transfer))
        : value,
  ])) as PackedCampusGeometries;
  return { packed, transfer: [...transfer] };
}

export function unpackCampusGeometries(packed: PackedCampusGeometries): CampusGeometries {
  return Object.fromEntries(Object.entries(packed).map(([key, value]) => [
    key,
    value && typeof value === 'object' && 'attributes' in value
      ? unpackGeometry(value as PackedGeometry)
      : Array.isArray(value) && value[0] && typeof value[0] === 'object' && 'attributes' in value[0]
        ? (value as PackedGeometry[]).map(unpackGeometry)
        : value,
  ])) as unknown as CampusGeometries;
}

/**
 * Builds the merged campus geometry in a Web Worker: ~0.6 s of work on a fast
 * laptop (several seconds on a phone) that otherwise freezes the page and
 * delays the room data behind it. Falls back to the main thread when workers
 * are unavailable (tests, old browsers) or the worker fails.
 */
export function startGeometryWorker(): Worker | null {
  if (typeof Worker === 'undefined') return null;
  try {
    return new Worker(new URL('./geometry.worker.ts', import.meta.url), { type: 'module' });
  } catch {
    return null;
  }
}

/** `worker` may be created early (startGeometryWorker) so its script loads
 *  while the campus data downloads; it is always terminated here. */
export async function buildSceneGeometriesOffThread(
  data: CampusData,
  proj: Projection,
  worker: Worker | null = startGeometryWorker(),
): Promise<CampusGeometries> {
  if (!worker) return buildSceneGeometries(data, proj);
  try {
    try {
      const packed = await new Promise<PackedCampusGeometries>((resolve, reject) => {
        worker.onmessage = (event: MessageEvent<{ ok: true; packed: PackedCampusGeometries } | { ok: false; error: string }>) => {
          if (event.data.ok) resolve(event.data.packed);
          else reject(new Error(event.data.error));
        };
        worker.onerror = (event) => reject(new Error(event.message || 'Geometry worker failed'));
        worker.postMessage(data);
      });
      return unpackCampusGeometries(packed);
    } finally {
      worker.terminate();
    }
  } catch (error) {
    console.warn('Building campus geometry on the main thread:', error);
    return buildSceneGeometries(data, proj);
  }
}
