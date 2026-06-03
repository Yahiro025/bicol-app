import { openDB } from 'idb';

const DB_NAME = 'bikol-offline';
const STORE_NAME = 'history';

export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'bikol' });
      }
    },
  });
};

export const saveToHistory = async (word: Record<string, unknown> & { bikol: string }) => {
  try {
    const db = await initDB();
    await db.put(STORE_NAME, { ...word, timestamp: Date.now() });
  } catch {
    // IndexedDB unavailable (SSR, private browsing, etc.) — silently skip
  }
};

export const getHistory = async () => {
  try {
    const db = await initDB();
    return db.getAll(STORE_NAME);
  } catch {
    return [];
  }
};

/** Return up to `limit` most recent history entries (newest first) */
export const getRecentHistory = async (limit?: number) => {
  try {
    const db = await initDB();
    const all = await db.getAll(STORE_NAME);
    const sorted = all.sort((a, b) => (b.timestamp as number) - (a.timestamp as number));
    return limit ? sorted.slice(0, limit) : sorted;
  } catch {
    return [];
  }
};

/** Clear all search history from IndexedDB */
export const clearHistory = async () => {
  try {
    const db = await initDB();
    await db.clear(STORE_NAME);
  } catch {
    // Silently skip if IndexedDB is unavailable
  }
};
