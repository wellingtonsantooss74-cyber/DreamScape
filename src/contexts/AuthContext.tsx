import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

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
  updateUser: (data: Partial<User>) => Promise<void>;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      // Fallback local se o Supabase não estiver configurado
      const saved = localStorage.getItem("dreamscape_local_user");
      if (saved) {
        try {
          setUser(JSON.parse(saved));
        } catch (e) {}
      } else {
        setUser({
          uid: "local-user",
          displayName: "Explorador",
          email: null,
          photoURL: null,
          isPremium: true,
          theme: "light",
          color: "purple",
          navColor: "default",
          childrenProfiles: []
        });
      }
      setLoading(false);
      return;
    }

    // Supabase Auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user.id, session.user.email);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserProfile(session.user.id, session.user.email);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (uid: string, email: string | undefined) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Erro ao carregar perfil:", error);
      }

      setUser({
        uid,
        email: email || null,
        displayName: data?.display_name || "Explorador",
        photoURL: data?.photo_url || null,
        isPremium: data?.is_premium ?? true,
        theme: data?.theme || "light",
        color: data?.color || "purple",
        navColor: data?.nav_color || "default",
        parentPin: data?.parent_pin,
        childrenProfiles: data?.children_profiles || []
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;

    const updated = { ...user, ...data };
    setUser(updated);

    if (supabase) {
      // Salva no Supabase
      await supabase.from('profiles').upsert({
        id: user.uid,
        display_name: updated.displayName,
        theme: updated.theme,
        color: updated.color,
        nav_color: updated.navColor,
        is_premium: updated.isPremium,
        parent_pin: updated.parentPin,
        children_profiles: updated.childrenProfiles
      });
    } else {
      // Fallback local
      localStorage.setItem("dreamscape_local_user", JSON.stringify(updated));
    }
  };

  const signIn = async (email: string) => {
    if (!supabase) {
      alert("Supabase não configurado. Usando modo local.");
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) throw error;
    alert("Link mágico enviado para seu email!");
  };

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    } else {
      setUser(null);
      localStorage.removeItem("dreamscape_local_user");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, updateUser, signIn, signOut }}>
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
