import { Story } from "../types";

const STORIES_KEY = "dreamscape_stories";
const USER_KEY = "dreamscape_user";

export const storage = {
  getStories: (): Story[] => {
    const data = localStorage.getItem(STORIES_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  saveStory: (story: Story) => {
    let stories = storage.getStories();
    const index = stories.findIndex(s => s.id === story.id);
    if (index >= 0) {
      stories[index] = story;
    } else {
      stories.push(story);
    }
    
    // Sort by date to keep newest first
    stories.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Try saving, and if it fails due to quota, remove the oldest story and try again
    const maxAttempts = 10;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        localStorage.setItem(STORIES_KEY, JSON.stringify(stories));
        break;
      } catch (e) {
        if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
          if (stories.length > 1) {
            // Remove the oldest story to free up space
            stories.pop();
            attempts++;
            console.warn(`Storage quota exceeded. Removing oldest story to free space. Attempt ${attempts}`);
          } else {
            console.error("Storage quota exceeded even with a single story. Story might be too large.");
            break;
          }
        } else {
          throw e;
        }
      }
    }
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
