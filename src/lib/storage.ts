import { Story } from "../types";
import { db } from "./db";

const USER_KEY = "dreamscape_user";
const STORIES_MIGRATED_KEY = "dreamscape_stories_migrated";

export const storage = {
  getStories: async (): Promise<Story[]> => {
    // Migration check
    const migrated = localStorage.getItem(STORIES_MIGRATED_KEY);
    if (!migrated) {
      const oldData = localStorage.getItem("dreamscape_stories");
      if (oldData) {
        try {
          const oldStories: Story[] = JSON.parse(oldData);
          for (const s of oldStories) {
            await db.saveStory(s);
          }
          localStorage.removeItem("dreamscape_stories");
        } catch (e) {
          console.error("Migration failed", e);
        }
      }
      localStorage.setItem(STORIES_MIGRATED_KEY, "true");
    }

    return db.getAllStories();
  },
  
  saveStory: async (story: Story) => {
    await db.saveStory(story);
  },
  
  deleteStory: async (id: string) => {
    await db.deleteStory(id);
  },
  
  getUser: () => {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  },
  
  saveUser: (user: any) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};
