import React, { createContext, useContext, useState, useEffect } from "react";

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
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>({
    uid: "local-user",
    displayName: "Explorador",
    email: null,
    photoURL: null,
    isPremium: true, // Default to premium for local-only mode if desired, or false
    theme: "light",
    color: "purple",
    navColor: "default",
    childrenProfiles: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("dreamscape_local_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse local user", e);
      }
    }
  }, []);

  const updateUser = (data: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      localStorage.setItem("dreamscape_local_user", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, updateUser }}>
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
