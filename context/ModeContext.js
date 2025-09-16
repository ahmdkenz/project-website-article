"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

// [UPDATE] Tambahkan kata kunci 'export' di sini.
// Ini membuat 'ModeContext' bisa diimpor oleh komponen lain.
export const ModeContext = createContext({
  mode: "friendly",   // friendly | moderate
  theme: "light",     // light | dark
  setMode: () => {},
  setTheme: () => {},
});

export function ModeProvider({ children }) {
  const [mode, setMode] = useState("friendly");
  const [theme, setTheme] = useState("light");

  // bootstrap dari localStorage atau cookie
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
        "friendly"; // Default ke friendly mode untuk keamanan
      
      console.log(`[ModeContext] Setting mode to: ${modeToUse}`);
      setMode(modeToUse);
      
      // Tema gelap/terang
      const savedTheme = localStorage.getItem("theme_color");
      if (savedTheme === "dark" || savedTheme === "light") {
        setTheme(savedTheme);
      }
    } catch (err) {
      console.error(`[ModeContext] Error loading from localStorage/cookie:`, err);
      // Default ke friendly mode jika terjadi error
      setMode("friendly");
    }
  }, []);

  // persist + apply kelas <html> untuk mode konten
  useEffect(() => {
    console.log(`[ModeContext] Mode changed to: ${mode}`);
    try {
      localStorage.setItem("theme_mode", mode);
      console.log(`[ModeContext] Saved theme_mode to localStorage: ${mode}`);
      
      // Juga set cookie untuk konsistensi dengan server-side
      document.cookie = `theme_mode=${mode}; path=/; max-age=${60*60*24*30}`;
      console.log(`[ModeContext] Set theme_mode cookie: ${mode}`);
      
      // Debug mode status
      const allCookies = document.cookie;
      console.log(`[ModeContext] All cookies: ${allCookies}`);
      
      // Verifikasi cookie yang di-set
      setTimeout(() => {
        const cookieMode = document.cookie
          .split('; ')
          .find(row => row.startsWith('theme_mode='))
          ?.split('=')[1];
        console.log(`[ModeContext] Verifikasi cookie theme_mode: ${cookieMode}`);
      }, 100);
    } catch (err) {
      console.error(`[ModeContext] Error saving mode:`, err);
    }
    
    const root = document.documentElement;
    root.classList.remove("mode-friendly", "mode-moderate");
    root.classList.add(mode === "moderate" ? "mode-moderate" : "mode-friendly");
    console.log(`[ModeContext] Applied CSS class: ${mode === "moderate" ? "mode-moderate" : "mode-friendly"}`);
    
    // Tambahkan data attribute untuk membantu debugging
    document.body.setAttribute('data-theme-mode', mode);
  }, [mode]);

  // persist + apply kelas <html> untuk tema (light/dark)
  useEffect(() => {
    try {
      localStorage.setItem("theme_color", theme);
    } catch {}
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const value = useMemo(() => ({ mode, theme, setMode, setTheme }), [mode, theme]);

  return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>;
}

export function useMode() {
  return useContext(ModeContext);
}