import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Sparkles, LogIn, Loader2, Wand2 } from "lucide-react";
import { motion } from "motion/react";
import { supabase } from "../lib/supabase";

export function Login() {
  const { signIn, signInWithPassword, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [mode, setMode] = useState<"magic" | "password" | "register">("magic");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    try {
      if (mode === "magic") {
        await signIn(email);
        setSent(true);
      } else if (mode === "password") {
        await signInWithPassword(email, password);
      } else if (mode === "register") {
        await signUp(email, password);
        alert("Conta criada! Verifique seu e-mail para confirmar (se necessário) ou faça login.");
        setMode("password");
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Erro ao processar login.");
    } finally {
      setLoading(false);
    }
  };

  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <Card className="max-w-md w-full border-none shadow-2xl bg-white/80 backdrop-blur-md text-center p-8">
          <Wand2 className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-2xl mb-2">Configuração Necessária</CardTitle>
          <CardDescription>
            O Supabase não foi configurado. Por favor, adicione as chaves VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para habilitar o login.
          </CardDescription>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-md overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary via-secondary to-primary" />
          <CardHeader className="text-center pt-8">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 text-primary mb-4">
              <Sparkles className="h-8 w-8" />
            </div>
            <CardTitle className="text-3xl font-serif font-bold text-slate-800">DreamScape</CardTitle>
            <CardDescription className="text-lg">
              {mode === "magic" ? "Entre com Link Mágico" : mode === "password" ? "Entre com Senha" : "Crie sua Conta"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            {sent ? (
              <div className="text-center space-y-4 py-4">
                <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <LogIn className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Verifique seu E-mail</h3>
                <p className="text-slate-600">
                  Enviamos um link mágico para <strong>{email}</strong>. Clique no link para entrar no app.
                </p>
                <Button variant="outline" onClick={() => setSent(false)} className="mt-4">
                  Tentar outro e-mail
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Seu E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="exemplo@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 text-lg"
                      disabled={loading}
                    />
                  </div>
                  
                  {mode !== "magic" && (
                    <div className="space-y-2">
                      <Label htmlFor="password">Sua Senha</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-12 text-lg"
                        disabled={loading}
                      />
                    </div>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg font-bold gap-2" 
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
                  {mode === "magic" ? "Enviar Link Mágico" : mode === "password" ? "Entrar" : "Cadastrar"}
                </Button>

                <div className="space-y-2 pt-2">
                  {mode === "magic" ? (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      className="w-full text-xs" 
                      onClick={() => setMode("password")}
                    >
                      Prefiro usar e-mail e senha
                    </Button>
                  ) : (
                    <>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        className="w-full text-xs" 
                        onClick={() => setMode("magic")}
                      >
                        Usar Link Mágico (sem senha)
                      </Button>
                      <Button 
                        type="button" 
                        variant="link" 
                        className="w-full text-xs" 
                        onClick={() => setMode(mode === "password" ? "register" : "password")}
                      >
                        {mode === "password" ? "Não tem conta? Cadastre-se" : "Já tem conta? Faça login"}
                      </Button>
                    </>
                  )}
                </div>
              </form>
            )}
          </CardContent>
        </Card>
        <p className="text-center mt-8 text-slate-500 text-sm">
          Ao entrar, você concorda em criar histórias incríveis. ✨
        </p>
      </motion.div>
    </div>
  );
}
