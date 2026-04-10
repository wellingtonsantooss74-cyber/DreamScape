import React, { useState } from "react";
import { Story } from "../types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { BookOpen, Trash2, Calendar, User, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface StoryLibraryProps {
  stories: Story[];
  onSelect: (story: Story) => void;
  onDelete: (id: string) => void;
}

export function StoryLibrary({ stories, onSelect, onDelete }: StoryLibraryProps) {
  const [selectingId, setSelectingId] = useState<string | null>(null);

  const handleSelect = (story: Story) => {
    setSelectingId(story.id);
    // Small delay to let the user see the feedback
    setTimeout(() => {
      onSelect(story);
    }, 400);
  };

  if (stories.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-purple-200"
      >
        <BookOpen className="h-16 w-16 text-purple-200 mx-auto mb-4" />
        <h2 className="text-2xl font-serif font-bold text-slate-700 mb-2">Sua biblioteca está vazia</h2>
        <p className="text-slate-500 mb-8 max-w-xs mx-auto">
          Crie sua primeira história mágica usando o botão <b>Criar</b> abaixo!
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif font-bold text-slate-800">Minha Estante Mágica</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story, index) => (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card 
              className={`group transition-all duration-500 border-2 bg-white/80 backdrop-blur-sm overflow-hidden h-full flex flex-col relative ${
                selectingId === story.id 
                  ? "border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]" 
                  : "border-transparent hover:shadow-2xl"
              }`}
            >
              <AnimatePresence>
                {selectingId === story.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-purple-500/10 z-10 pointer-events-none"
                  >
                    <motion.div
                      animate={{ 
                        opacity: [0.5, 1, 0.5],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="absolute inset-0 border-4 border-purple-500/30"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="h-32 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center relative overflow-hidden">
                {story.paginas[0]?.imageUrl ? (
                  <img 
                    src={story.paginas[0].imageUrl} 
                    alt={story.titulo} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <BookOpen className="h-12 w-12 text-purple-300 relative z-10" />
                )}
                <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors" />
              </div>
              <CardHeader>
                <CardTitle className="text-xl font-serif text-slate-800 line-clamp-1">{story.titulo}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  {new Date(story.createdAt).toLocaleDateString('pt-BR')}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    <span>Para: {story.personagens_principais[0]?.nome || "Criança"}</span>
                  </div>
                  <p className="line-clamp-2 italic">
                    "{story.paginas[0]?.texto.substring(0, 60)}..."
                  </p>
                </div>
              </CardContent>
              <CardFooter className="grid grid-cols-2 gap-2 pt-0">
                <Button 
                  onClick={() => handleSelect(story)}
                  disabled={selectingId !== null}
                  className={`gap-2 transition-all duration-300 ${
                    selectingId === story.id 
                      ? "bg-purple-700 scale-105" 
                      : "bg-purple-600 hover:bg-purple-700"
                  }`}
                >
                  {selectingId === story.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <BookOpen className="h-4 w-4" />
                  )}
                  {selectingId === story.id ? "Abrindo..." : "Ler"}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => onDelete(story.id)}
                  disabled={selectingId !== null}
                  className="text-slate-400 hover:text-red-500 hover:bg-red-50 gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Apagar
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
