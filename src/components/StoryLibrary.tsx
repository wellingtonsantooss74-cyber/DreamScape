import React from "react";
import { Story } from "../types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { BookOpen, Trash2, Calendar, User } from "lucide-react";
import { motion } from "motion/react";

interface StoryLibraryProps {
  stories: Story[];
  onSelect: (story: Story) => void;
  onDelete: (id: string) => void;
  onNewStory: () => void;
}

export function StoryLibrary({ stories, onSelect, onDelete, onNewStory }: StoryLibraryProps) {
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
          Crie sua primeira história mágica para começar a preencher sua estante!
        </p>
        <Button onClick={onNewStory} className="bg-purple-600 hover:bg-purple-700">
          Criar Minha Primeira História
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif font-bold text-slate-800">Minha Estante Mágica</h2>
        <Button onClick={onNewStory} variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
          + Nova História
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story, index) => (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="group hover:shadow-2xl transition-all duration-300 border-none bg-white/80 backdrop-blur-sm overflow-hidden h-full flex flex-col">
              <div className="h-32 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center relative overflow-hidden">
                <BookOpen className="h-12 w-12 text-purple-300 relative z-10" />
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
                  onClick={() => onSelect(story)}
                  className="bg-purple-600 hover:bg-purple-700 gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Ler
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => onDelete(story.id)}
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
