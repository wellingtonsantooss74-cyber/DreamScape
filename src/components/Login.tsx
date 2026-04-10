import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { motion } from "motion/react";
import { Lock, User, Sparkles, Loader2 } from "lucide-react";

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await onLogin();
    } catch (error) {
      console.error("Login failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-none shadow-2xl bg-white/90 backdrop-blur-lg overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500" />
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-purple-600" />
            </div>
            <CardTitle className="text-3xl font-serif font-bold text-slate-800">Bem-vindo ao DreamScape!</CardTitle>
            <CardDescription>
              Entre com sua conta Google para começar suas aventuras mágicas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleGoogleLogin}
              className="w-full h-12 text-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
              )}
              {isLoading ? "Entrando..." : "Entrar com Google"}
            </Button>
          </CardContent>
          <CardFooter className="text-center text-xs text-slate-400">
            Ao entrar, você concorda em criar histórias mágicas e seguras.
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
