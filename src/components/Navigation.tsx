import React from "react";
import { Library, Wand2, Settings, LogOut, GraduationCap } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "../contexts/ThemeContext";

interface NavigationProps {
  activeView: string;
  onViewChange: (view: any) => void;
}

export function Navigation({ activeView, onViewChange }: NavigationProps) {
  const { navColor } = useTheme();
  const tabs = [
    { id: "library", label: "Biblioteca", icon: Library },
    { id: "form", label: "Criar", icon: Wand2 },
    { id: "learning", label: "Aprender", icon: GraduationCap },
    { id: "settings", label: "Ajustes", icon: Settings },
  ];

  const getNavClasses = () => {
    switch (navColor) {
      case "glass":
        return "bg-white/40 backdrop-blur-md border-white/30 shadow-xl";
      case "primary":
        return "bg-primary text-white border-primary/20 shadow-primary/20 shadow-2xl";
      case "dark":
        return "bg-slate-900 text-slate-100 border-slate-800 shadow-2xl";
      case "colorful":
        return "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white border-transparent shadow-xl";
      default:
        return "bg-white/80 backdrop-blur-xl border-white/20 shadow-2xl";
    }
  };

  const getTabClasses = (isActive: boolean) => {
    if (navColor === "primary" || navColor === "dark" || navColor === "colorful") {
      return isActive 
        ? "text-white bg-white/20" 
        : "text-white/70 hover:text-white hover:bg-white/10";
    }
    return isActive 
      ? "text-primary bg-primary/5" 
      : "text-muted-foreground hover:text-foreground hover:bg-slate-50";
  };

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md">
      <div className={`${getNavClasses()} rounded-2xl p-2 flex items-center justify-between gap-1 border transition-all duration-500`}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeView === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id)}
              className={`relative flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all ${getTabClasses(isActive)}`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className={`absolute inset-0 rounded-xl ${
                    (navColor === "primary" || navColor === "dark" || navColor === "colorful")
                      ? "bg-white/20"
                      : "bg-primary/10"
                  }`}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon className={`h-5 w-5 ${isActive ? "scale-110" : ""} transition-transform relative z-10`} />
              <span className="text-[10px] font-medium uppercase tracking-wider relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
