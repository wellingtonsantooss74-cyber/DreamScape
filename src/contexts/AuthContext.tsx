import React, { createContext, useContext, useState, useEffect } from "react";
import { getSupabase } from "../lib/supabase";
import { storage } from "../lib/storage";

interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isPremium?: boolean;
  theme?: string;
  color?: string;
  navColor?: string;
  parentPin?: string;
  childrenProfiles?: any[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    const checkSession = async () => {
      try {
        const supabase = getSupabase();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          setUser({
            uid: session.user.id,
            email: session.user.email || null,
            displayName: profile?.display_name || session.user.user_metadata?.display_name || "Explorador",
            photoURL: session.user.user_metadata?.avatar_url || null,
            isPremium: profile?.is_premium || false,
            theme: profile?.theme || "light",
            color: profile?.color || "purple",
            navColor: profile?.nav_color || "default",
            parentPin: profile?.parent_pin || null,
            childrenProfiles: profile?.children_profiles || []
          });
        }
      } catch (err) {
        console.error("Supabase session check failed:", err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for changes on auth state (logged in, signed out, etc.)
    let subscription: any = null;
    try {
      const supabase = getSupabase();
      const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          setUser({
            uid: session.user.id,
            email: session.user.email || null,
            displayName: profile?.display_name || session.user.user_metadata?.display_name || "Explorador",
            photoURL: session.user.user_metadata?.avatar_url || null,
            isPremium: profile?.is_premium || false,
            theme: profile?.theme || "light",
            color: profile?.color || "purple",
            navColor: profile?.nav_color || "default",
            parentPin: profile?.parent_pin || null,
            childrenProfiles: profile?.children_profiles || []
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      subscription = data.subscription;
    } catch (err) {
      console.error("Supabase auth listener failed:", err);
      setLoading(false);
    }

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await getSupabase().auth.signInWithPassword({ email, password });
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const { error } = await getSupabase().auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  const logout = async () => {
    try {
      await getSupabase().auth.signOut();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;
    
    try {
      const supabase = getSupabase();
      const updates: any = {};
      if (data.displayName !== undefined) updates.display_name = data.displayName;
      if (data.isPremium !== undefined) updates.is_premium = data.isPremium;
      if (data.theme !== undefined) updates.theme = data.theme;
      if (data.color !== undefined) updates.color = data.color;
      if (data.navColor !== undefined) updates.nav_color = data.navColor;
      if (data.parentPin !== undefined) updates.parent_pin = data.parentPin;
      if (data.childrenProfiles !== undefined) updates.children_profiles = data.childrenProfiles;

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.uid,
          ...updates,
          updated_at: new Date().toISOString(),
        });

      if (!error) {
        setUser(prev => prev ? { ...prev, ...data } : null);
      } else {
        console.error("Error updating profile:", error);
      }
    } catch (err) {
      console.error("Update user failed:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signUp, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
