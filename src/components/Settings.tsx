import React, { useEffect, useState } from "react";
import { useTheme, ThemeType, ColorType, NavColorType } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Moon, Sun, Coffee, Waves, Check, Loader2, ShieldCheck, Layout, Palette, Sparkles } from "lucide-react";
import { Input } from "./ui/input";

import { ParentSettings } from "./ParentSettings";

export function Settings() {
  const { theme, color, navColor, setTheme, setColor, setNavColor } = useTheme();
  const { user, updateUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "parents">("general");
  const [showPinEntry, setShowPinEntry] = useState(false);
  const [enteredPin, setEnteredPin] = useState("");
  const [pinError, setPinError] = useState(false);

  const handleParentTabClick = () => {
    // If user has a PIN, ask for it
    if (user && (user as any).parentPin) {
      setShowPinEntry(true);
    } else {
      setActiveTab("parents");
    }
  };

  const handlePinSubmit = () => {
    if (user && (user as any).parentPin === enteredPin) {
      setActiveTab("parents");
      setShowPinEntry(false);
      setEnteredPin("");
      setPinError(false);
    } else {
      setPinError(true);
      setEnteredPin("");
    }
  };

  const updatePreferences = async (newTheme?: ThemeType, newColor?: ColorType, newNavColor?: NavColorType) => {
    if (!user) return;
    setIsSaving(true);
    
    const updates: any = {
      updatedAt: new Date().toISOString()
    };
    
    if (newTheme) {
      updates.theme = newTheme;
      setTheme(newTheme);
    }
    if (newColor) {
      updates.color = newColor;
      setColor(newColor);
    }
    if (newNavColor) {
      updates.navColor = newNavColor;
      setNavColor(newNavColor);
    }
    
    updateUser(updates);
    setIsSaving(false);
  };

  const themes: { id: ThemeType; label: string; icon: React.ReactNode }[] = [
    { id: "light", label: "Claro", icon: <Sun className="h-4 w-4" /> },
    { id: "dark", label: "Escuro", icon: <Moon className="h-4 w-4" /> },
    { id: "sepia", label: "Sépia", icon: <Coffee className="h-4 w-4" /> },
    { id: "ocean", label: "Oceano", icon: <Waves className="h-4 w-4" /> },
  ];

  const colors: { id: ColorType; label: string; class: string }[] = [
    { id: "purple", label: "Roxo", class: "bg-purple-500" },
    { id: "blue", label: "Azul", class: "bg-blue-500" },
    { id: "green", label: "Verde", class: "bg-green-500" },
    { id: "rose", label: "Rosa", class: "bg-rose-500" },
    { id: "orange", label: "Laranja", class: "bg-orange-500" },
  ];

  const navColors: { id: NavColorType; label: string; icon: React.ReactNode }[] = [
    { id: "default", label: "Padrão", icon: <Layout className="h-4 w-4" /> },
    { id: "glass", label: "Vidro", icon: <Sparkles className="h-4 w-4" /> },
    { id: "primary", label: "Destaque", icon: <Palette className="h-4 w-4" /> },
    { id: "dark", label: "Sombrio", icon: <Moon className="h-4 w-4" /> },
    { id: "colorful", label: "Mágico", icon: <Palette className="h-4 w-4" /> },
  ];

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <div className="flex p-1 bg-slate-100 rounded-lg">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === "general" ? "bg-white shadow-sm text-primary" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Geral
        </button>
        <button
          onClick={handleParentTabClick}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === "parents" ? "bg-white shadow-sm text-primary" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Área dos Pais
        </button>
      </div>

      {showPinEntry ? (
        <Card className="border-none shadow-xl bg-white/90 backdrop-blur-md p-6 text-center space-y-4">
          <ShieldCheck className="h-12 w-12 text-primary mx-auto" />
          <CardTitle>Acesso Restrito</CardTitle>
          <p className="text-sm text-muted-foreground">Insira seu PIN de 4 dígitos para continuar.</p>
          <div className="flex justify-center gap-2">
            <Input
              type="password"
              maxLength={4}
              value={enteredPin}
              onChange={(e) => setEnteredPin(e.target.value.replace(/\D/g, ""))}
              className={`max-w-[120px] text-center text-2xl tracking-[0.5em] ${pinError ? "border-red-500" : ""}`}
              autoFocus
            />
          </div>
          {pinError && <p className="text-xs text-red-500">PIN incorreto. Tente novamente.</p>}
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => setShowPinEntry(false)}>Cancelar</Button>
            <Button className="flex-1" onClick={handlePinSubmit}>Entrar</Button>
          </div>
        </Card>
      ) : activeTab === "general" ? (
        <Card className="w-full bg-white/80 backdrop-blur-md border-none shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-serif text-slate-800">Personalização</CardTitle>
            {isSaving && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <Label className="text-slate-600 font-medium">Tema do App</Label>
              <div className="grid grid-cols-2 gap-3">
                {themes.map((t) => (
                  <Button
                    key={t.id}
                    variant={theme === t.id ? "default" : "outline"}
                    onClick={() => updatePreferences(t.id, undefined)}
                    disabled={isSaving}
                    className="justify-start gap-2 h-12"
                  >
                    {t.icon}
                    {t.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-slate-600 font-medium">Cor de Destaque</Label>
              <div className="flex flex-wrap gap-4">
                {colors.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => updatePreferences(undefined, c.id)}
                    disabled={isSaving}
                    className={`w-10 h-10 rounded-full ${c.class} flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-md disabled:opacity-50`}
                    title={c.label}
                  >
                    {color === c.id && <Check className="text-white h-5 w-5" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-slate-600 font-medium">Estilo da Barra de Navegação</Label>
              <div className="grid grid-cols-2 gap-3">
                {navColors.map((n) => (
                  <Button
                    key={n.id}
                    variant={navColor === n.id ? "default" : "outline"}
                    onClick={() => updatePreferences(undefined, undefined, n.id)}
                    disabled={isSaving}
                    className="justify-start gap-2 h-12"
                  >
                    {n.icon}
                    {n.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <ParentSettings />
      )}
    </div>
  );
}
