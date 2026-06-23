import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'bikol-offline';
const STORE_NAME = 'history';

type HistoryEntry = Record<string, unknown> & { bikol: string; timestamp?: number };

async function withDB<T>(fn: (db: IDBPDatabase) => Promise<T>, fallback: T): Promise<T> {
  try {
    const db = await openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'bikol' });
        }
      },
    });
    return fn(db);
  } catch {
    return fallback;
  }
}

export const saveToHistory = (word: HistoryEntry) =>
  withDB((db) => db.put(STORE_NAME, { ...word, timestamp: Date.now() }), undefined);

export const getHistory = () =>
  withDB((db) => db.getAll(STORE_NAME), []);

export const getRecentHistory = async (limit?: number) => {
  const all = await getHistory();
  const sorted = all.sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0));
  return limit ? sorted.slice(0, limit) : sorted;
};

export const clearHistory = () =>
  withDB((db) => db.clear(STORE_NAME), undefined);
