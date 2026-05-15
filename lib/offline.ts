import { openDB } from 'idb';

const DB_NAME = 'bikoldict-offline';
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

export const saveToHistory = async (word: any) => {
  const db = await initDB();
  await db.put(STORE_NAME, { ...word, timestamp: Date.now() });
};

export const getHistory = async () => {
  const db = await initDB();
  return db.getAll(STORE_NAME);
};
