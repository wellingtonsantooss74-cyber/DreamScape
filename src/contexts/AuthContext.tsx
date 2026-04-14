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
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
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
    }).catch(err => {
      console.error("Erro ao iniciar sessão:", err);
      setUser(null);
      setLoading(false);
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
        isPremium: true,
        theme: data?.theme || "light",
        color: data?.color || "purple",
        navColor: data?.nav_color || "default",
        parentPin: data?.parent_pin,
        childrenProfiles: data?.children_profiles || []
      });
    } catch (e: any) {
      console.error("Erro fatal ao carregar perfil:", e);
      if (e.message?.includes("fetch")) {
        alert("Erro de conexão com o Supabase. Verifique se a URL do projeto está correta.");
      }
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;

    const updated = { ...user, ...data };
    setUser(updated);

    if (supabase) {
      try {
        // Salva no Supabase
        const { error } = await supabase.from('profiles').upsert({
          id: user.uid,
          display_name: updated.displayName,
          theme: updated.theme,
          color: updated.color,
          nav_color: updated.navColor,
          is_premium: true,
          parent_pin: updated.parentPin,
          children_profiles: updated.childrenProfiles
        });
        if (error) throw error;
      } catch (e: any) {
        console.error("Erro ao salvar perfil no Supabase:", e);
        if (e.message?.includes("fetch")) {
          alert("Erro de conexão com o banco de dados. Verifique sua internet.");
        }
      }
    } else {
      // Fallback local
      localStorage.setItem("dreamscape_local_user", JSON.stringify(updated));
    }
  };

  const signInWithPassword = async (email: string, password: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (e: any) {
      console.error("Erro no login com senha:", e);
      if (e.message?.includes("fetch")) {
        throw new Error("Erro de conexão. Verifique se o endereço do Supabase está correto ou se há internet.");
      }
      throw e;
    }
  };

  const signUp = async (email: string, password: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
    } catch (e: any) {
      console.error("Erro no cadastro:", e);
      if (e.message?.includes("fetch")) {
        throw new Error("Erro de conexão ao criar conta. Verifique sua internet.");
      }
      throw e;
    }
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
    <AuthContext.Provider value={{ user, loading, updateUser, signInWithPassword, signUp, signOut }}>
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
