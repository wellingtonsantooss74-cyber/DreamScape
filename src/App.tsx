import React, { useState, useEffect } from "react";
import { BookForm } from "./components/BookForm";
import { BookReader } from "./components/BookReader";
import { StoryLibrary } from "./components/StoryLibrary";
import { Settings } from "./components/Settings";
import { Login } from "./components/Login";
import { Navigation } from "./components/Navigation";
import { PremiumLearning } from "./components/PremiumLearning";
import { PremiumWall } from "./components/PremiumWall";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { generateStory } from "./lib/gemini";
import { Story, BookParams } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Wand2, Library, Settings as SettingsIcon, LogOut, User as UserIcon, Loader2 } from "lucide-react";
import { Button } from "./components/ui/button";
import { db, collection, query, where, onSnapshot, doc, setDoc, deleteDoc, handleFirestoreError, OperationType } from "./lib/firebase";

type View = "form" | "reader" | "library" | "settings" | "login" | "learning";

function AppContent() {
  const { user, loading: authLoading, login, logout } = useAuth();
  const { setTheme, setColor, setNavColor } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [story, setStory] = useState<Story | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>("login");
  const [savedStories, setSavedStories] = useState<Story[]>([]);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Sync view with auth state
  useEffect(() => {
    if (!authLoading) {
      if (user) {
        if (view === "login") setView("library");
        
        // Sync preferences from user object (Firestore)
        const userData = user as any;
        if (userData.theme) setTheme(userData.theme);
        if (userData.color) setColor(userData.color);
        if (userData.navColor) setNavColor(userData.navColor);
      } else {
        setView("login");
      }
    }
  }, [user, authLoading]);

  // Load stories from Firestore
  useEffect(() => {
    if (!user) {
      setSavedStories([]);
      return;
    }

    const q = query(collection(db, "stories"), where("uid", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const stories = snapshot.docs.map(doc => doc.data() as Story);
      // Sort by createdAt descending
      setSavedStories(stories.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, "stories");
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogoutAction = () => {
    logout();
  };

  const handleGenerate = async (params: BookParams) => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const generatedStory = await generateStory(params);
      const storyId = crypto.randomUUID();
      const newStory: Story = {
        ...generatedStory,
        id: storyId,
        uid: user.uid,
        createdAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, "stories", storyId), newStory);
      setStory(newStory);
      setView("reader");
    } catch (err) {
      console.error(err);
      setError("Houve um erro ao criar sua história. Por favor, tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectStory = (selectedStory: Story) => {
    setStory(selectedStory);
    setView("reader");
  };

  const handleDeleteStory = async (id: string) => {
    if (confirm("Tem certeza que deseja apagar esta história mágica para sempre?")) {
      try {
        await deleteDoc(doc(db, "stories", id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `stories/${id}`);
      }
    }
  };

  const handleUpdateStory = async (updatedStory: Story) => {
    try {
      await setDoc(doc(db, "stories", updatedStory.id), updatedStory);
      setStory(updatedStory);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `stories/${updatedStory.id}`);
    }
  };

  const handleReset = () => {
    setStory(null);
    setView("library");
    setError(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {isGeneratingImage && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-primary z-[100] animate-pulse" />
      )}
      {/* Magical Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px]" />
      </div>

      <header className="relative z-10 py-8 px-4 text-center">
        <div className="flex justify-between items-center max-w-6xl mx-auto mb-8">
          <div className="flex gap-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 backdrop-blur border border-primary/10 text-primary text-sm font-medium"
            >
              <Wand2 className="h-4 w-4" />
              <span>IA Storyteller</span>
            </motion.div>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-foreground mb-2">
          Dream<span className="text-primary">Scape</span>
        </h1>
        {user && (view === "library" || view === "form" || view === "learning") && (
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-muted-foreground text-base max-w-md mx-auto flex items-center justify-center gap-2"
          >
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt="" 
                className="w-5 h-5 rounded-full" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <UserIcon className="h-4 w-4" />
            )}
            Olá, {user.displayName}!
          </motion.p>
        )}
      </header>

      <main className="relative z-10 container mx-auto px-4 pb-20">
        <AnimatePresence mode="wait">
          {view === "login" ? (
            <Login onLogin={login} />
          ) : view === "settings" ? (
            <div key="settings" className="mt-8">
              <Settings />
            </div>
          ) : view === "library" ? (
            <div key="library" className="mt-8">
              <StoryLibrary 
                stories={savedStories} 
                onSelect={handleSelectStory} 
                onDelete={handleDeleteStory}
              />
            </div>
          ) : view === "form" ? (
            <div key="form" className="mt-8">
              <BookForm onSubmit={handleGenerate} isLoading={isLoading} />
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-destructive mt-4 font-medium"
                >
                  {error}
                </motion.p>
              )}
            </div>
          ) : view === "learning" ? (
            <div key="learning" className="mt-8">
              {(user as any)?.isPremium ? <PremiumLearning /> : <PremiumWall />}
            </div>
          ) : story ? (
            <div key="reader" className="mt-4">
              <BookReader 
                story={story} 
                onReset={handleReset} 
                onUpdateStory={handleUpdateStory}
                isGeneratingImage={isGeneratingImage}
                setIsGeneratingImage={setIsGeneratingImage}
              />
            </div>
          ) : null}
        </AnimatePresence>
      </main>

      <footer className="relative z-10 py-8 text-center text-muted-foreground text-sm border-t border-border bg-white/50 backdrop-blur pb-32">
        <p>© 2026 DreamScape - Criado com magia e inteligência artificial</p>
      </footer>

      {user && view !== "reader" && (
        <Navigation 
          activeView={view} 
          onViewChange={setView} 
          onLogout={handleLogoutAction} 
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}
