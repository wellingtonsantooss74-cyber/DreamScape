import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { BookParams } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Sparkles, Baby } from "lucide-react";
import { motion } from "motion/react";

interface BookFormProps {
  onSubmit: (data: BookParams) => void;
  isLoading: boolean;
}

export function BookForm({ onSubmit, isLoading }: BookFormProps) {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<BookParams>({
    defaultValues: {
      nomeCrianca: "",
      idade: 5,
      tema: "",
      companheiro: ""
    }
  });

  useEffect(() => {
    if (user) {
      setProfiles((user as any).childrenProfiles || []);
    }
  }, [user]);

  const selectProfile = (profile: any) => {
    setValue("nomeCrianca", profile.name);
    setValue("idade", profile.age);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-2xl mx-auto border-none shadow-xl bg-white/80 backdrop-blur-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-serif text-primary">Crie sua Aventura</CardTitle>
          <CardDescription className="text-lg">
            Preencha os detalhes abaixo para gerar um livro mágico personalizado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {profiles.length > 0 && (
            <div className="mb-8 p-4 bg-primary/5 rounded-xl border border-primary/10">
              <Label className="text-sm text-primary font-medium mb-3 block flex items-center gap-2">
                <Baby className="h-4 w-4" />
                Escolha um perfil salvo:
              </Label>
              <div className="flex flex-wrap gap-2">
                {profiles.map((p, i) => (
                  <Button
                    key={i}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => selectProfile(p)}
                    className="rounded-full hover:bg-primary hover:text-white transition-colors"
                  >
                    {p.name} ({p.age} anos)
                  </Button>
                ))}
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nomeCrianca">Nome da Criança</Label>
                <Input
                  id="nomeCrianca"
                  placeholder="Ex: Alice"
                  {...register("nomeCrianca", { required: "O nome é obrigatório" })}
                  className="bg-white/50"
                />
                {errors.nomeCrianca && <p className="text-sm text-destructive">{errors.nomeCrianca.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="idade">Idade</Label>
                <Input
                  id="idade"
                  type="number"
                  min={1}
                  max={12}
                  {...register("idade", { required: true, min: 1, max: 12 })}
                  className="bg-white/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tema">Tema da Aventura</Label>
              <Textarea
                id="tema"
                placeholder="Ex: Uma viagem à lua de queijo ou uma floresta de doces"
                {...register("tema", { required: "O tema é obrigatório" })}
                className="bg-white/50 min-h-[100px]"
              />
              {errors.tema && <p className="text-sm text-destructive">{errors.tema.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="companheiro">Companheiro de Aventura</Label>
              <Input
                id="companheiro"
                placeholder="Ex: Um dragão azul amigável ou um gatinho robô"
                {...register("companheiro", { required: "O companheiro é obrigatório" })}
                className="bg-white/50"
              />
              {errors.companheiro && <p className="text-sm text-destructive">{errors.companheiro.message}</p>}
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-medium bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                </motion.div>
              ) : (
                <Sparkles className="mr-2 h-5 w-5" />
              )}
              {isLoading ? "Criando Magia..." : "Gerar Livro Mágico"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
