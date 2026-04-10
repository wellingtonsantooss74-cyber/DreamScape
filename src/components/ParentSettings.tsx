import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db, doc, updateDoc, handleFirestoreError, OperationType, onSnapshot } from "../lib/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Plus, Trash2, ShieldCheck, Baby, Save, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ChildProfile {
  name: string;
  age: number;
  interests: string[];
}

export function ParentSettings() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [pin, setPin] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (doc) => {
      const data = doc.data();
      if (data) {
        setProfiles(data.childrenProfiles || []);
        setPin(data.parentPin || "");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleAddProfile = () => {
    setProfiles([...profiles, { name: "", age: 5, interests: [] }]);
  };

  const handleRemoveProfile = (index: number) => {
    setProfiles(profiles.filter((_, i) => i !== index));
  };

  const handleUpdateProfile = (index: number, field: keyof ChildProfile, value: any) => {
    const newProfiles = [...profiles];
    newProfiles[index] = { ...newProfiles[index], [field]: value };
    setProfiles(newProfiles);
  };

  const saveSettings = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        childrenProfiles: profiles,
        parentPin: pin,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-lg bg-white/80 backdrop-blur-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl font-serif">Controle dos Pais</CardTitle>
          </div>
          <CardDescription>
            Proteja o acesso às configurações e gerencie os perfis dos seus filhos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="pin">PIN de Segurança (4 dígitos)</Label>
            <Input
              id="pin"
              type="password"
              maxLength={4}
              placeholder="Ex: 1234"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              className="max-w-[150px] text-center text-2xl tracking-[1em]"
            />
            <p className="text-xs text-muted-foreground">
              Este PIN será solicitado para acessar áreas restritas do app.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-medium flex items-center gap-2">
                <Baby className="h-5 w-5" />
                Perfis das Crianças
              </Label>
              <Button variant="outline" size="sm" onClick={handleAddProfile} className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {profiles.map((profile, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-end gap-3 p-4 rounded-lg bg-slate-50 border border-slate-100"
                  >
                    <div className="flex-1 space-y-2">
                      <Label className="text-xs text-slate-500">Nome</Label>
                      <Input
                        placeholder="Nome da criança"
                        value={profile.name}
                        onChange={(e) => handleUpdateProfile(index, "name", e.target.value)}
                      />
                    </div>
                    <div className="w-20 space-y-2">
                      <Label className="text-xs text-slate-500">Idade</Label>
                      <Input
                        type="number"
                        min={1}
                        max={15}
                        value={profile.age}
                        onChange={(e) => handleUpdateProfile(index, "age", parseInt(e.target.value))}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveProfile(index)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {profiles.length === 0 && (
                <p className="text-center py-8 text-muted-foreground italic">
                  Nenhum perfil cadastrado. Adicione um para personalizar as histórias!
                </p>
              )}
            </div>
          </div>

          <Button 
            className="w-full gap-2 h-12 text-lg" 
            onClick={saveSettings}
            disabled={isSaving}
          >
            {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            Salvar Configurações
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
