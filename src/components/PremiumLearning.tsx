import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, GraduationCap, Calculator, Pencil, CheckCircle2, XCircle, Trophy, Star } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

type GameType = "literacy" | "math";

export function PremiumLearning() {
  const { user } = useAuth();
  const [game, setGame] = useState<GameType | null>(null);
  const [score, setScore] = useState(0);
  const [currentChallenge, setCurrentChallenge] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (user && supabase) {
      // Carrega a pontuação do banco de dados
      supabase.from('learning_scores')
        .select('score')
        .eq('uid', user.uid)
        .single()
        .then(({ data }) => {
          if (data) setScore(data.score);
        });
    }
  }, [user]);

  const updateScore = async (newScore: number) => {
    setScore(newScore);
    if (user && supabase) {
      await supabase.from('learning_scores').upsert({
        uid: user.uid,
        score: newScore,
        updated_at: new Date().toISOString()
      });
    }
  };

  const startLiteracy = () => {
    setGame("literacy");
    generateLiteracyChallenge();
  };

  const startMath = () => {
    setGame("math");
    generateMathChallenge();
  };

  const generateLiteracyChallenge = () => {
    const words = [
      { word: "CASA", missing: "C_SA", answer: "A" },
      { word: "BOLA", missing: "BO_A", answer: "L" },
      { word: "GATO", missing: "_ATO", answer: "G" },
      { word: "DADO", missing: "DA_O", answer: "D" },
      { word: "LUA", missing: "L_A", answer: "U" },
      { word: "SOL", missing: "S_L", answer: "O" },
      { word: "MACA", missing: "MA_A", answer: "C" },
      { word: "PATO", missing: "PA_O", answer: "T" },
      { word: "SAPO", missing: "S_PO", answer: "A" },
      { word: "MESA", missing: "M_SA", answer: "E" },
      { word: "BOLO", missing: "B_LO", answer: "O" },
      { word: "FADA", missing: "FA_A", answer: "D" },
      { word: "VACA", missing: "VA_A", answer: "C" },
      { word: "RATO", missing: "_ATO", answer: "R" },
      { word: "LEAO", missing: "LE_O", answer: "A" },
      { word: "URSO", missing: "UR_O", answer: "S" },
      { word: "FLOR", missing: "FL_R", answer: "O" },
      { word: "TREM", missing: "TR_M", answer: "E" },
      { word: "BOTA", missing: "BO_A", answer: "T" },
      { word: "FOGO", missing: "FO_O", answer: "G" },
      { word: "GELO", missing: "G_LO", answer: "E" },
      { word: "MALA", missing: "MA_A", answer: "L" },
      { word: "SINO", missing: "SI_O", answer: "N" },
      { word: "UVA", missing: "U_A", answer: "V" },
      { word: "ZEBRA", missing: "ZE_RA", answer: "B" },
      { word: "NAVIO", missing: "NA_IO", answer: "V" },
      { word: "PEIXE", missing: "PEI_E", answer: "X" }
    ];
    const challenge = words[Math.floor(Math.random() * words.length)];
    setCurrentChallenge(challenge);
    setUserAnswer("");
    setFeedback(null);
  };

  const generateMathChallenge = () => {
    const operations = ['+', '-'];
    const op = operations[Math.floor(Math.random() * operations.length)];
    let a, b, answer;

    if (op === '+') {
      a = Math.floor(Math.random() * 15) + 1;
      b = Math.floor(Math.random() * 10) + 1;
      answer = a + b;
    } else {
      a = Math.floor(Math.random() * 15) + 5; // Ensure a is at least 5
      b = Math.floor(Math.random() * a) + 1;  // Ensure b is smaller than or equal to a
      answer = a - b;
    }

    setCurrentChallenge({
      question: `${a} ${op} ${b} = ?`,
      answer: answer.toString()
    });
    setUserAnswer("");
    setFeedback(null);
  };

  const checkAnswer = () => {
    if (userAnswer.toUpperCase() === currentChallenge.answer.toUpperCase()) {
      setFeedback({ type: "success", message: "Incrível! Você acertou! ✨" });
      updateScore(score + 10);
      setTimeout(() => {
        if (game === "literacy") generateLiteracyChallenge();
        else generateMathChallenge();
      }, 2000);
    } else {
      setFeedback({ type: "error", message: "Quase lá! Tente de novo. 🌈" });
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {!game ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="h-full">
            <Card className="cursor-pointer border-none shadow-xl bg-gradient-to-br from-primary to-primary/60 text-white overflow-hidden relative group h-full flex flex-col" onClick={startLiteracy}>
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-125 transition-transform">
                <Pencil className="h-24 w-24" />
              </div>
              <CardHeader className="flex-grow">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <GraduationCap className="h-6 w-6" />
                  Alfabetização
                </CardTitle>
                <CardDescription className="text-white/80">
                  Brinque com as letras e descubra novas palavras mágicas!
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button className="w-full bg-white text-primary hover:bg-white/90">Começar a Escrever</Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="h-full">
            <Card className="cursor-pointer border-none shadow-xl bg-gradient-to-br from-primary to-primary/80 text-white overflow-hidden relative group h-full flex flex-col" onClick={startMath}>
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-125 transition-transform">
                <Calculator className="h-24 w-24" />
              </div>
              <CardHeader className="flex-grow">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Calculator className="h-6 w-6" />
                  Contas Básicas
                </CardTitle>
                <CardDescription className="text-white/80">
                  Desafios matemáticos divertidos para pequenos gênios!
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button className="w-full bg-white text-primary hover:bg-white/90">Começar a Somar</Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-none shadow-2xl bg-white/90 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-serif">
                  {game === "literacy" ? "Desafio de Letras" : "Desafio de Números"}
                </CardTitle>
                <CardDescription>Ganhe estrelas resolvendo os mistérios!</CardDescription>
              </div>
              <div className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full font-bold">
                <Star className="h-5 w-5 fill-yellow-500" />
                {score}
              </div>
            </CardHeader>
            <CardContent className="space-y-8 py-12 text-center">
              <div className="text-6xl md:text-8xl font-bold tracking-widest text-primary font-mono">
                {game === "literacy" ? currentChallenge?.missing : currentChallenge?.question}
              </div>

              <div className="max-w-xs mx-auto space-y-4">
                <Input
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Sua resposta..."
                  className="text-center text-3xl h-16 border-2 focus:border-primary"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
                />
                <Button className="w-full h-12 text-lg" onClick={checkAnswer}>Verificar</Button>
                <Button variant="ghost" className="w-full" onClick={() => setGame(null)}>Sair do Jogo</Button>
              </div>

              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className={`p-4 rounded-xl flex items-center justify-center gap-3 text-lg font-bold ${
                      feedback.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {feedback.type === "success" ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                    {feedback.message}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
