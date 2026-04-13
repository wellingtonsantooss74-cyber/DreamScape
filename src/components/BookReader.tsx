import React, { useState, useEffect } from "react";
import { Story, Page } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, BookOpen, Download, RefreshCw, Sparkles, Volume2, VolumeX, Loader2, MessageCircle, CheckCircle2, Library } from "lucide-react";
import { generateSpeech, playAudio } from "../lib/gemini";
import { Input } from "./ui/input";

interface BookReaderProps {
  story: Story;
  onReset: () => void;
  onUpdateStory: (story: Story) => void;
}

export function BookReader({ story, onReset, onUpdateStory }: BookReaderProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState<Page[]>(story.paginas);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [currentAudioSource, setCurrentAudioSource] = useState<AudioBufferSourceNode | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  const stopAllAudio = () => {
    try {
      currentAudioSource?.stop();
    } catch (e) {}
    setIsPlaying(false);
  };

  const handleRestartStory = () => {
    stopAllAudio();
    setCurrentPage(0);
    setShowQuiz(false);
    setCurrentQuestionIdx(0);
    setUserAnswer("");
    setQuizFeedback(null);
  };

  useEffect(() => {
    // Stop audio when component unmounts
    return () => {
      try {
        currentAudioSource?.stop();
      } catch (e) {}
    };
  }, [currentAudioSource]);

  useEffect(() => {
    // Stop narration when changing page
    try {
      currentAudioSource?.stop();
    } catch (e) {}
    setIsPlaying(false);
  }, [currentPage]);

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      const nextIdx = currentPage + 1;
      setCurrentPage(nextIdx);
      // loadPageImage(nextIdx) is now handled by the useEffect pre-generation
    } else if (currentPage === pages.length - 1) {
      setShowQuiz(true);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleReadPage = async () => {
    if (isPlaying) {
      currentAudioSource?.stop();
      setIsPlaying(false);
      return;
    }

    setIsLoadingAudio(true);
    try {
      const textToRead = showQuiz 
        ? story.interatividade.perguntas[currentQuestionIdx].pergunta 
        : pages[currentPage].texto;
      const base64 = await generateSpeech(textToRead);
      const source = await playAudio(base64);
      setCurrentAudioSource(source);
      setIsPlaying(true);
      source.onended = () => setIsPlaying(false);
    } catch (error) {
      console.error("Erro ao ler página:", error);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    const currentQuestion = story.interatividade.perguntas[currentQuestionIdx];
    setQuizFeedback(currentQuestion.feedback_positivo);
    
    // Auto advance after feedback
    setTimeout(() => {
      if (currentQuestionIdx < story.interatividade.perguntas.length - 1) {
        setCurrentQuestionIdx(prev => prev + 1);
        setUserAnswer("");
        setQuizFeedback(null);
      } else {
        // End of quiz
        setQuizFeedback("Parabéns! Você completou todas as perguntas mágicas!");
      }
    }, 3000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <BookOpen className="text-primary h-8 w-8" />
          <h1 className="text-3xl font-serif font-bold text-primary">{story.titulo}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRestartStory} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Reler
          </Button>
          <Button variant="default" onClick={onReset} className="gap-2 bg-primary hover:bg-primary/90">
            <Library className="h-4 w-4" />
            Sair da Leitura
          </Button>
        </div>
      </div>

      <div className="relative aspect-[16/9] bg-white rounded-3xl shadow-2xl overflow-hidden border-8 border-white">
        <AnimatePresence mode="wait">
          {!showQuiz ? (
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-orange-50/30 p-8 md:p-16"
            >
              <div className="max-w-3xl w-full space-y-8 text-center">
                <div className="flex justify-between items-center border-b border-primary/10 pb-4">
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-mono text-primary/60 uppercase tracking-widest">Página {currentPage + 1} de {pages.length}</span>
                    <span className="text-[10px] text-slate-400 italic mt-1">
                      ✨ {pages[currentPage].audio_metadata.efeito_gatilho}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReadPage}
                    disabled={isLoadingAudio}
                    className="rounded-full hover:bg-primary/10 text-primary"
                  >
                    {isLoadingAudio ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : isPlaying ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                    <span className="ml-2 hidden sm:inline">{isPlaying ? "Parar" : "Ouvir"}</span>
                  </Button>
                </div>
                <p className="text-3xl md:text-4xl font-serif leading-relaxed text-slate-800">
                  {pages[currentPage].texto}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-8"
            >
              <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 space-y-8 border-4 border-purple-100">
                <div className="flex items-center gap-3 text-purple-600">
                  <MessageCircle className="h-8 w-8" />
                  <h2 className="text-2xl font-serif font-bold">Momento de Reflexão</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-tighter text-slate-400">
                      Pergunta {currentQuestionIdx + 1} de {story.interatividade.perguntas.length}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleReadPage}
                      disabled={isLoadingAudio}
                      className="text-purple-600"
                    >
                      {isLoadingAudio ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  <p className="text-xl font-medium text-slate-700">
                    {story.interatividade.perguntas[currentQuestionIdx].pergunta}
                  </p>

                  <form onSubmit={handleQuizSubmit} className="space-y-4">
                    <Input
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Sua resposta mágica..."
                      className="h-12 text-lg border-2 focus:border-purple-400"
                      disabled={!!quizFeedback}
                    />
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-purple-600 hover:bg-purple-700"
                      disabled={!userAnswer.trim() || !!quizFeedback}
                    >
                      Enviar Resposta
                    </Button>
                  </form>

                  <AnimatePresence>
                    {quizFeedback && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3 text-green-700"
                      >
                        <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                        <p className="font-medium">{quizFeedback}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {quizFeedback && currentQuestionIdx === story.interatividade.perguntas.length - 1 && (
                  <Button onClick={onReset} variant="outline" className="w-full border-purple-200 text-purple-600">
                    Criar Outra Aventura
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Controls Overlay */}
        {!showQuiz && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-8 z-20">
            <Button
              variant="secondary"
              size="icon"
              onClick={prevPage}
              disabled={currentPage === 0}
              className="rounded-full shadow-lg h-12 w-12 bg-white/80 backdrop-blur hover:bg-white"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            
            <div className="flex gap-2">
              {pages.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 w-2 rounded-full transition-all duration-300 ${
                    idx === currentPage ? "bg-primary w-6" : "bg-primary/20"
                  }`}
                />
              ))}
            </div>

            <Button
              variant="secondary"
              size="icon"
              onClick={nextPage}
              className="rounded-full shadow-lg h-12 w-12 bg-white/80 backdrop-blur hover:bg-white"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        )}
      </div>

      <div className="mt-8 text-center">
        <p className="text-muted-foreground italic">
          Dica: Use as setas para navegar pela história mágica de {story.personagens_principais[0].nome}.
        </p>
      </div>
    </div>
  );
}
