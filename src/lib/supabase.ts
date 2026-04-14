import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Inicializa o cliente do Supabase apenas se as chaves estiverem configuradas e forem válidas
const isValidSupabaseConfig = (url: string | undefined, key: string | undefined) => {
  if (!url || !key || url.includes("TODO") || key.includes("TODO")) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const supabase = isValidSupabaseConfig(supabaseUrl, supabaseAnonKey)
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;
