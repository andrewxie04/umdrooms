// Live classroom schedules are much larger than localStorage's small quota.
// IndexedDB keeps a bounded, best-effort snapshot for quick same-day reloads.
const DB_NAME = 'rooms-availability';
const STORE_NAME = 'days';
const LEGACY_PREFIX = 'dayCache.v1.';
const TTL_MS = 60 * 60 * 1000;

export interface DayRecord<T> {
  at: number;
  buildings: T[];
}

let databasePromise: Promise<IDBDatabase | null> | null = null;

function database(): Promise<IDBDatabase | null> {
  if (databasePromise) return databasePromise;
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  databasePromise = new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE_NAME)) {
          request.result.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return databasePromise;
}

function clearLegacyEntries(): void {
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith(LEGACY_PREFIX)) localStorage.removeItem(key);
    }
  } catch {
    // Storage may be disabled; the IndexedDB cache remains independent.
  }
}

export async function readPersistedDay<T>(dateKey: string): Promise<DayRecord<T> | null> {
  const db = await database();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(dateKey);
      request.onsuccess = () => {
        const record = request.result as DayRecord<T> | undefined;
        resolve(record && Array.isArray(record.buildings) &&
          Date.now() - record.at < TTL_MS ? record : null);
      };
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function invalidatePersistedDay(dateKey: string): Promise<void> {
  const db = await database();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(dateKey);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function persistDay<T>(dateKey: string, buildings: T[]): Promise<void> {
  const db = await database();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const now = Date.now();
      store.put({ at: now, buildings } satisfies DayRecord<T>, dateKey);
      const cursor = store.openCursor();
      cursor.onsuccess = () => {
        const row = cursor.result;
        if (!row) return;
        const record = row.value as DayRecord<T>;
        if (row.key !== dateKey && now - record.at > TTL_MS) row.delete();
        row.continue();
      };
      tx.oncomplete = () => { clearLegacyEntries(); resolve(); };
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    } catch {
      resolve();
    }
  });
}
