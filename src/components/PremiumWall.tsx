import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Sparkles, Crown, Check, Star, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../contexts/AuthContext";
import { db, doc, updateDoc, handleFirestoreError, OperationType } from "../lib/firebase";

export function PremiumWall() {
  const { user } = useAuth();

  const handleUpgrade = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid), {
        isPremium: true,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const benefits = [
    "Alfabetização Divertida",
    "Matemática para Crianças",
    "Histórias Ilimitadas",
    "Narração com Vozes Mágicas",
    "Sem Anúncios (Sempre)",
  ];

  return (
    <div className="max-w-2xl mx-auto px-4">
      <Card className="border-none shadow-2xl bg-gradient-to-br from-primary/90 via-primary to-primary/80 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Crown className="h-32 w-32 rotate-12" />
        </div>
        
        <CardHeader className="text-center pt-12 pb-8 relative z-10">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/20 text-white mb-4 backdrop-blur-sm"
          >
            <Crown className="h-8 w-8" />
          </motion.div>
          <CardTitle className="text-4xl font-serif font-bold mb-2">DreamScape Premium</CardTitle>
          <CardDescription className="text-white/70 text-lg">
            Desbloqueie o potencial máximo da imaginação do seu filho.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8 px-8 pb-12 relative z-10">
          <div className="grid grid-cols-1 gap-4">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 text-white/90"
              >
                <div className="h-6 w-6 rounded-full bg-white/20 text-white flex items-center justify-center shrink-0">
                  <Check className="h-4 w-4" />
                </div>
                <span className="text-lg font-medium">{benefit}</span>
              </motion.div>
            ))}
          </div>

          <div className="pt-4 text-center">
            <div className="mb-6">
              <span className="text-5xl font-bold">R$ 15</span>
              <span className="text-xl text-white/70">,00</span>
              <span className="text-sm text-white/50 block mt-1">Pagamento único</span>
            </div>
            <Button 
              onClick={handleUpgrade}
              className="w-full h-16 text-xl font-bold bg-white text-primary hover:bg-white/90 border-none shadow-xl group"
            >
              <Zap className="mr-2 h-6 w-6 fill-primary group-hover:animate-pulse" />
              Seja Premium Agora
            </Button>
            <p className="text-center text-white/50 text-xs mt-4 italic">
              * Demonstração: Clique no botão acima para simular a ativação do Premium.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
