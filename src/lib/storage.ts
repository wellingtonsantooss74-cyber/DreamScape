import { Story } from "../types";

const STORIES_KEY = "dreamscape_stories";
const USER_KEY = "dreamscape_user";

export const storage = {
  getStories: (): Story[] => {
    const data = localStorage.getItem(STORIES_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  saveStory: (story: Story) => {
    const stories = storage.getStories();
    const index = stories.findIndex(s => s.id === story.id);
    if (index >= 0) {
      stories[index] = story;
    } else {
      stories.push(story);
    }
    localStorage.setItem(STORIES_KEY, JSON.stringify(stories));
  },
  
  deleteStory: (id: string) => {
    const stories = storage.getStories();
    const filtered = stories.filter(s => s.id !== id);
    localStorage.setItem(STORIES_KEY, JSON.stringify(filtered));
  },
  
  getUser: () => {
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  },
  
  saveUser: (user: any) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};
