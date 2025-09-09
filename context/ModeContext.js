// context/ModeContext.js
"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ModeContext = createContext({
  mode: "friendly",          // friendly | moderate
  theme: "light",            // light | dark
  setMode: () => {},
  setTheme: () => {},
});

export function ModeProvider({ children }) {
  const [mode, setMode] = useState("friendly");
  const [theme, setTheme] = useState("light");

  // bootstrap dari localStorage
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem("theme_mode");
      if (savedMode === "friendly" || savedMode === "moderate") setMode(savedMode);
      const savedTheme = localStorage.getItem("theme_color");
      if (savedTheme === "dark" || savedTheme === "light") setTheme(savedTheme);
    } catch {}
  }, []);

  // persist & apply ke <html> class
  useEffect(() => {
    try { localStorage.setItem("theme_mode", mode); } catch {}
    const root = document.documentElement;
    // bersihkan kelas lama
    root.classList.remove("mode-friendly", "mode-moderate");
    // terapkan kelas sesuai mode
    root.classList.add(mode === "moderate" ? "mode-moderate" : "mode-friendly");
  }, [mode]);

  useEffect(() => {
    try { localStorage.setItem("theme_color", theme); } catch {}
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const value = useMemo(() => ({ mode, theme, setMode, setTheme }), [mode, theme]);

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export function useMode() {
  return useContext(ModeContext);
}
