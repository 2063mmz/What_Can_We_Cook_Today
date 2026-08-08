/**
 * A very small IndexedDB layer.
 *
 * There is no backend and no account: this file is the entire storage story.
 * If IndexedDB is unavailable — some private browsing modes, very old
 * browsers, blocked storage — everything transparently falls back to
 * localStorage so the app keeps working instead of showing an error page.
 */

const DB_NAME = 'what-i-eat-tonight';
const DB_VERSION = 1;
export const RECIPE_STORE = 'recipes';
export const META_STORE = 'meta';

const LS_PREFIX = 'wiet.fallback.';

let dbPromise: Promise<IDBDatabase | null> | null = null;
/** Set once we know IndexedDB cannot be used, so we stop retrying. */
let useFallback = false;

function openDatabase(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') {
    useFallback = true;
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    let request: IDBOpenDBRequest;
    try {
      request = indexedDB.open(DB_NAME, DB_VERSION);
    } catch {
      useFallback = true;
      resolve(null);
      return;
    }

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(RECIPE_STORE)) {
        db.createObjectStore(RECIPE_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      useFallback = true;
      resolve(null);
    };
    request.onblocked = () => {
      useFallback = true;
      resolve(null);
    };
  });
}

function getDb(): Promise<IDBDatabase | null> {
  if (useFallback) return Promise.resolve(null);
  dbPromise ??= openDatabase();
  return dbPromise;
}

/** True when records are being kept in localStorage rather than IndexedDB. */
export function isUsingFallback(): boolean {
  return useFallback;
}

/* --- localStorage fallback ------------------------------------------------ */

function lsRead<T>(store: string): Record<string, T> {
  try {
    const raw = localStorage.getItem(LS_PREFIX + store);
    return raw ? (JSON.parse(raw) as Record<string, T>) : {};
  } catch {
    return {};
  }
}

function lsWrite<T>(store: string, data: Record<string, T>): void {
  localStorage.setItem(LS_PREFIX + store, JSON.stringify(data));
}

/* --- Public operations ---------------------------------------------------- */

function run<T>(
  store: string,
  mode: IDBTransactionMode,
  action: (objectStore: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return getDb().then((db) => {
    if (!db) throw new FallbackNeeded();
    return new Promise<T>((resolve, reject) => {
      const tx = db.transaction(store, mode);
      const request = action(tx.objectStore(store));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error('idb error'));
      tx.onabort = () => reject(tx.error ?? new Error('idb aborted'));
    });
  });
}

class FallbackNeeded extends Error {}

export async function getAll<T>(store: string): Promise<T[]> {
  try {
    return await run<T[]>(store, 'readonly', (s) => s.getAll() as IDBRequest<T[]>);
  } catch (error) {
    if (!(error instanceof FallbackNeeded)) throw error;
    return Object.values(lsRead<T>(store));
  }
}

export async function get<T>(store: string, key: string): Promise<T | undefined> {
  try {
    return await run<T | undefined>(store, 'readonly', (s) => s.get(key));
  } catch (error) {
    if (!(error instanceof FallbackNeeded)) throw error;
    return lsRead<T>(store)[key];
  }
}

export async function put<T>(store: string, value: T, key?: string): Promise<void> {
  try {
    await run(store, 'readwrite', (s) => (key === undefined ? s.put(value) : s.put(value, key)));
  } catch (error) {
    if (!(error instanceof FallbackNeeded)) throw error;
    const data = lsRead<T>(store);
    const id = key ?? (value as { id?: string }).id;
    if (!id) throw new Error('missing key');
    data[id] = value;
    lsWrite(store, data);
  }
}

export async function putMany<T extends { id: string }>(
  store: string,
  values: T[],
): Promise<void> {
  if (values.length === 0) return;
  const db = await getDb();
  if (!db) {
    const data = lsRead<T>(store);
    for (const value of values) data[value.id] = value;
    lsWrite(store, data);
    return;
  }
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    const objectStore = tx.objectStore(store);
    for (const value of values) objectStore.put(value);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('idb error'));
    tx.onabort = () => reject(tx.error ?? new Error('idb aborted'));
  });
}

export async function remove(store: string, key: string): Promise<void> {
  try {
    await run(store, 'readwrite', (s) => s.delete(key));
  } catch (error) {
    if (!(error instanceof FallbackNeeded)) throw error;
    const data = lsRead<unknown>(store);
    delete data[key];
    lsWrite(store, data);
  }
}
