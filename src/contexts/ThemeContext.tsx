import React, { createContext, useContext, useState, useEffect } from "react";

export type ThemeType = "light" | "dark" | "sepia" | "ocean";
export type ColorType = "purple" | "blue" | "green" | "rose" | "orange";
export type NavColorType = "default" | "glass" | "primary" | "dark" | "colorful";

interface ThemeContextType {
  theme: ThemeType;
  color: ColorType;
  navColor: NavColorType;
  setTheme: (theme: ThemeType) => void;
  setColor: (color: ColorType) => void;
  setNavColor: (navColor: NavColorType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeType>(() => {
    return (localStorage.getItem("dreamscape_theme") as ThemeType) || "light";
  });
  const [color, setColor] = useState<ColorType>(() => {
    return (localStorage.getItem("dreamscape_color") as ColorType) || "purple";
  });
  const [navColor, setNavColor] = useState<NavColorType>(() => {
    return (localStorage.getItem("dreamscape_nav_color") as NavColorType) || "default";
  });

  useEffect(() => {
    localStorage.setItem("dreamscape_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("dreamscape_color", color);
    document.documentElement.setAttribute("data-color", color);
  }, [color]);

  useEffect(() => {
    localStorage.setItem("dreamscape_nav_color", navColor);
    document.documentElement.setAttribute("data-nav-color", navColor);
  }, [navColor]);

  return (
    <ThemeContext.Provider value={{ theme, color, navColor, setTheme, setColor, setNavColor }}>
      <div className={`theme-${theme} color-${color} nav-${navColor} min-h-screen transition-colors duration-500`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
