import { Story } from "../types";
import { db } from "./db";
import { supabase } from "./supabase";

const USER_KEY = "dreamscape_user";
const STORIES_MIGRATED_KEY = "dreamscape_stories_migrated";

export const storage = {
  getStories: async (uid?: string): Promise<Story[]> => {
    if (supabase && uid) {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('uid', uid)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Erro ao buscar histórias no Supabase:", error);
        return [];
      }
      
      return data.map(d => d.story_data as Story);
    }

    // Fallback local (IndexedDB)
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
    if (supabase) {
      const { error } = await supabase.from('stories').upsert({
        id: story.id,
        uid: story.uid,
        title: story.titulo,
        story_data: story,
        created_at: story.createdAt
      });
      if (error) console.error("Erro ao salvar história no Supabase:", error);
    }
    
    // Sempre salva localmente como backup/cache
    await db.saveStory(story);
  },
  
  deleteStory: async (id: string) => {
    if (supabase) {
      const { error } = await supabase.from('stories').delete().eq('id', id);
      if (error) console.error("Erro ao deletar história no Supabase:", error);
    }
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
