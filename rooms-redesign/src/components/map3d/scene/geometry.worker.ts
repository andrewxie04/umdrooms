/// <reference lib="webworker" />
import { buildSceneGeometries } from './geometry';
import { packCampusGeometries } from './geometry-transfer';
import { createProjection } from './projection';
import type { CampusData } from './types';

// The projection is derived from the data alone, so it matches the main thread's.
self.onmessage = (event: MessageEvent<CampusData>) => {
  try {
    const data = event.data;
    const { packed, transfer } = packCampusGeometries(buildSceneGeometries(data, createProjection(data)));
    (self as unknown as DedicatedWorkerGlobalScope).postMessage({ ok: true, packed }, transfer);
  } catch (error) {
    (self as unknown as DedicatedWorkerGlobalScope).postMessage({ ok: false, error: String(error) });
  }
};
