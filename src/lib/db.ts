import { openDB, IDBPDatabase } from 'idb';
import { Story } from '../types';

const DB_NAME = 'dreamscape_db';
const STORE_NAME = 'stories';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export const db = {
  async getAllStories(): Promise<Story[]> {
    const database = await getDB();
    return database.getAll(STORE_NAME);
  },

  async saveStory(story: Story): Promise<void> {
    const database = await getDB();
    await database.put(STORE_NAME, story);
  },

  async deleteStory(id: string): Promise<void> {
    const database = await getDB();
    await database.delete(STORE_NAME, id);
  },

  async clearAll(): Promise<void> {
    const database = await getDB();
    await database.clear(STORE_NAME);
  }
};
