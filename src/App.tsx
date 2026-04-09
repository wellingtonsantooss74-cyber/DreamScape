import React, { useState, useEffect } from "react";
import { BookForm } from "./components/BookForm";
import { BookReader } from "./components/BookReader";
import { StoryLibrary } from "./components/StoryLibrary";
import { generateStory } from "./lib/gemini";
import { Story, BookParams } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Wand2, Library, PlusCircle } from "lucide-react";
import { Button } from "./components/ui/button";

type View = "form" | "reader" | "library";

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [story, setStory] = useState<Story | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>("library");
  const [savedStories, setSavedStories] = useState<Story[]>([]);

  // Load stories from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("dreamscape_stories");
    if (stored) {
      try {
        setSavedStories(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored stories", e);
      }
    }
  }, []);

  // Save stories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("dreamscape_stories", JSON.stringify(savedStories));
  }, [savedStories]);

  const handleGenerate = async (params: BookParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const generatedStory = await generateStory(params);
      const newStory: Story = {
        ...generatedStory,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString()
      };
      setSavedStories(prev => [newStory, ...prev]);
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

  const handleDeleteStory = (id: string) => {
    if (confirm("Tem certeza que deseja apagar esta história mágica para sempre?")) {
      setSavedStories(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleReset = () => {
    setStory(null);
    setView("library");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-slate-900 selection:bg-purple-200">
      {/* Magical Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-200/30 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-blue-100/40 rounded-full blur-[80px]" />
      </div>

      <header className="relative z-10 py-8 px-4 text-center">
        <div className="flex justify-center gap-4 mb-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 backdrop-blur border border-purple-100 text-purple-600 text-sm font-medium"
          >
            <Wand2 className="h-4 w-4" />
            <span>IA Storyteller</span>
          </motion.div>
          
          {savedStories.length > 0 && view !== "library" && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setView("library")}
              className="rounded-full bg-white/50 backdrop-blur border border-slate-100 text-slate-600 text-sm font-medium h-auto py-1.5 px-4"
            >
              <Library className="h-4 w-4 mr-2" />
              Biblioteca
            </Button>
          )}
        </div>
        <h1 className="text-5xl md:text-6xl font-serif font-bold tracking-tight text-slate-900 mb-2">
          Dream<span className="text-purple-600">Scape</span>
        </h1>
        <p className="text-slate-500 text-lg max-w-md mx-auto">
          Onde a imaginação do seu filho se torna um livro de verdade.
        </p>
      </header>

      <main className="relative z-10 container mx-auto px-4 pb-20">
        <AnimatePresence mode="wait">
          {view === "library" ? (
            <div key="library" className="mt-8">
              <StoryLibrary 
                stories={savedStories} 
                onSelect={handleSelectStory} 
                onDelete={handleDeleteStory}
                onNewStory={() => setView("form")}
              />
            </div>
          ) : view === "form" ? (
            <div key="form" className="mt-8">
              <div className="flex justify-center mb-6">
                <Button variant="ghost" onClick={() => setView("library")} className="text-slate-500">
                  ← Voltar para Biblioteca
                </Button>
              </div>
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
          ) : story ? (
            <div key="reader" className="mt-4">
              <BookReader story={story} onReset={handleReset} />
            </div>
          ) : null}
        </AnimatePresence>
      </main>

      <footer className="relative z-10 py-8 text-center text-slate-400 text-sm border-t border-slate-100 bg-white/50 backdrop-blur">
        <p>© 2026 DreamScape - Criado com magia e inteligência artificial</p>
      </footer>
    </div>
  );
}
