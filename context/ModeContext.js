"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

// Context untuk menyimpan dan mengubah mode konten dan tema
export const ModeContext = createContext({
  mode: "friendly",   // friendly | moderate
  theme: "light",     // light | dark
  setMode: () => {},
  setTheme: () => {},
});

// Normalisasi mode untuk mencegah nilai yang tidak valid
function normalizeMode(mode) {
  if (!mode) return "friendly"; // default ke friendly jika null/undefined
  const normalized = mode.toString().toLowerCase().trim();
  return normalized === "moderate" ? "moderate" : "friendly"; // hanya terima "friendly" atau "moderate"
}

// Provider komponen untuk ModeContext
export function ModeProvider({ children }) {
  const [mode, setModeInternal] = useState("friendly");
  const [theme, setThemeInternal] = useState("light");
  const [isInitialized, setIsInitialized] = useState(false);

  // Inisialisasi dari localStorage atau cookie
  useEffect(() => {
    try {
      // Coba ambil dari localStorage
      const savedMode = localStorage.getItem("theme_mode");
      console.log(`[ModeContext] Reading theme_mode from localStorage: "${savedMode}"`);
      
      // Coba ambil dari cookie sebagai fallback
      const cookieMode = document.cookie
        .split('; ')
        .find(row => row.startsWith('theme_mode='))
        ?.split('=')[1];
      
      console.log(`[ModeContext] Reading theme_mode from cookie: "${cookieMode}"`);
      
      // Gunakan localStorage, kemudian cookie, kemudian default
      const modeToUse = 
        (savedMode === "friendly" || savedMode === "moderate") ? savedMode :
        (cookieMode === "friendly" || cookieMode === "moderate") ? cookieMode :
        "friendly"; // Default ke friendly mode
      
      console.log(`[ModeContext] Setting mode to: ${modeToUse}`);
      setModeInternal(modeToUse);
      
      // Tema gelap/terang
      const savedTheme = localStorage.getItem("theme_color");
      if (savedTheme === "dark" || savedTheme === "light") {
        setThemeInternal(savedTheme);
      }
      
      setIsInitialized(true);
    } catch (err) {
      console.error(`[ModeContext] Error loading from localStorage/cookie:`, err);
      // Default ke friendly mode jika terjadi error
      setModeInternal("friendly");
      setIsInitialized(true);
    }
  }, []);

  // Simpan perubahan mode ke localStorage dan cookie
  useEffect(() => {
    // Skip jika belum diinisialisasi
    if (!isInitialized) return;
    
    console.log(`[ModeContext] Mode changed to: ${mode}`);
    try {
      localStorage.setItem("theme_mode", mode);
      console.log(`[ModeContext] Saved theme_mode to localStorage: ${mode}`);
      
      // Juga set cookie untuk konsistensi dengan server-side
      document.cookie = `theme_mode=${mode}; path=/; max-age=${60*60*24*30}; SameSite=Lax`;
      console.log(`[ModeContext] Set theme_mode cookie: ${mode}`);
      
      // Broadcast event untuk komponen lain yang mungkin perlu tahu perubahan mode
      const modeChangeEvent = new CustomEvent("modechange", { detail: { mode } });
      window.dispatchEvent(modeChangeEvent);
    } catch (err) {
      console.error(`[ModeContext] Error saving mode:`, err);
    }
    
    // Terapkan kelas CSS untuk mode konten
    const root = document.documentElement;
    root.classList.remove("mode-friendly", "mode-moderate");
    root.classList.add(`mode-${mode}`);
    console.log(`[ModeContext] Applied CSS class: mode-${mode}`);
    
    // Tambahkan data attribute untuk membantu debugging
    document.body.setAttribute('data-theme-mode', mode);
  }, [mode, isInitialized]);

  // Simpan perubahan tema ke localStorage dan terapkan kelas CSS
  useEffect(() => {
    // Skip jika belum diinisialisasi
    if (!isInitialized) return;
    
    try {
      localStorage.setItem("theme_color", theme);
      console.log(`[ModeContext] Saved theme_color to localStorage: ${theme}`);
    } catch (err) {
      console.error(`[ModeContext] Error saving theme:`, err);
    }
    
    // Terapkan kelas CSS untuk tema
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    console.log(`[ModeContext] Applied dark theme: ${theme === "dark"}`);
    
    // Tambahkan data attribute untuk membantu debugging
    document.body.setAttribute('data-theme-color', theme);
  }, [theme, isInitialized]);

  // Add logging to verify theme application
  useEffect(() => {
    if (!isInitialized) return;

    console.log(`[ModeContext] Current theme: ${theme}`);
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    console.log(`[ModeContext] Applied class 'dark': ${theme === "dark"}`);

    document.body.setAttribute('data-theme-color', theme);
  }, [theme, isInitialized]);

  // Wrapper untuk setMode dengan validasi
  const setMode = (newMode) => {
    const validatedMode = normalizeMode(newMode);
    console.log(`[ModeContext] Setting mode from ${mode} to ${validatedMode}`);
    setModeInternal(validatedMode);
  };

  // Wrapper untuk setTheme dengan validasi
  const setTheme = (newTheme) => {
    const validatedTheme = newTheme === "dark" ? "dark" : "light";
    console.log(`[ModeContext] Setting theme from ${theme} to ${validatedTheme}`);
    setThemeInternal(validatedTheme);
  };

  // Memoize value untuk mencegah render yang tidak perlu
  const value = useMemo(() => ({ 
    mode, 
    theme, 
    setMode, 
    setTheme,
    isInitialized
  }), [mode, theme, isInitialized]);

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

// Hook untuk menggunakan ModeContext di komponen lain
export function useMode() {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error("useMode must be used within a ModeProvider");
  }
  return context;
}