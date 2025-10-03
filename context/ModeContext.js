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

  // Fungsi aman untuk mengakses localStorage
  const safeGetItem = (key, defaultValue) => {
    try {
      // Periksa apakah localStorage tersedia dan dapat diakses
      if (typeof localStorage !== 'undefined' && localStorage !== null) {
        const value = localStorage.getItem(key);
        return value !== null ? value : defaultValue;
      }
    } catch (e) {
      console.warn(`[ModeContext] localStorage access failed for ${key}:`, e);
    }
    return defaultValue;
  };

  // Fungsi aman untuk menyimpan ke localStorage
  const safeSetItem = (key, value) => {
    try {
      if (typeof localStorage !== 'undefined' && localStorage !== null) {
        localStorage.setItem(key, value);
        return true;
      }
    } catch (e) {
      console.warn(`[ModeContext] localStorage set failed for ${key}:`, e);
    }
    return false;
  };

  // Inisialisasi dari localStorage atau cookie
  useEffect(() => {
    // Gunakan setTimeout untuk menunda pembacaan localStorage/cookie hingga setelah hidratasi
    // Ini membantu menghindari masalah hidratasi di Safari
    const initTimer = setTimeout(() => {
      try {
        // Coba ambil dari localStorage dengan cara yang lebih aman
        const savedMode = safeGetItem("theme_mode", null);
        console.log(`[ModeContext] Reading theme_mode from localStorage: "${savedMode}"`);
        
        // Coba ambil dari cookie sebagai fallback
        let cookieMode = null;
        try {
          cookieMode = document.cookie
            .split('; ')
            .find(row => row.startsWith('theme_mode='))
            ?.split('=')[1];
        } catch (cookieErr) {
          console.warn("[ModeContext] Error reading cookie:", cookieErr);
        }
        
        console.log(`[ModeContext] Reading theme_mode from cookie: "${cookieMode}"`);
        
        // Gunakan localStorage, kemudian cookie, kemudian default
        const modeToUse = 
          (savedMode === "friendly" || savedMode === "moderate") ? savedMode :
          (cookieMode === "friendly" || cookieMode === "moderate") ? cookieMode :
          "friendly"; // Default ke friendly mode
        
        console.log(`[ModeContext] Setting mode to: ${modeToUse}`);
        setModeInternal(modeToUse);
        
        // Tema gelap/terang
        const savedTheme = safeGetItem("theme_color", "light");
        if (savedTheme === "dark" || savedTheme === "light") {
          setThemeInternal(savedTheme);
        }
        
      } catch (err) {
        console.error(`[ModeContext] Error during initialization:`, err);
        // Default ke friendly mode jika terjadi error
        setModeInternal("friendly");
      } finally {
        // Pastikan isInitialized diset meskipun ada error
        setIsInitialized(true);
      }
    }, 0); // setTimeout dengan delay 0 untuk menjalankan setelah hidratasi

    return () => clearTimeout(initTimer);
  }, []);

  // Simpan perubahan mode ke localStorage dan cookie
  useEffect(() => {
    // Skip jika belum diinisialisasi
    if (!isInitialized) return;
    
    console.log(`[ModeContext] Mode changed to: ${mode}`);
    
    // Simpan ke localStorage dengan cara yang aman
    safeSetItem("theme_mode", mode);
    console.log(`[ModeContext] Saved theme_mode to localStorage: ${mode}`);
    
    try {
      // Juga set cookie untuk konsistensi dengan server-side
      document.cookie = `theme_mode=${mode}; path=/; max-age=${60*60*24*30}; SameSite=Lax`;
      console.log(`[ModeContext] Set theme_mode cookie: ${mode}`);
    } catch (cookieErr) {
      console.warn(`[ModeContext] Error setting cookie:`, cookieErr);
    }
    
    try {
      // Broadcast event untuk komponen lain yang mungkin perlu tahu perubahan mode
      const modeChangeEvent = new CustomEvent("modechange", { detail: { mode } });
      window.dispatchEvent(modeChangeEvent);
    } catch (eventErr) {
      console.warn(`[ModeContext] Error dispatching event:`, eventErr);
    }
    
    try {
      // Terapkan kelas CSS untuk mode konten
      const root = document.documentElement;
      if (root) {
        root.classList.remove("mode-friendly", "mode-moderate");
        root.classList.add(`mode-${mode}`);
        console.log(`[ModeContext] Applied CSS class: mode-${mode}`);
      }
      
      // Tambahkan data attribute untuk membantu debugging
      if (document.body) {
        document.body.setAttribute('data-theme-mode', mode);
      }
    } catch (domErr) {
      console.warn(`[ModeContext] Error manipulating DOM:`, domErr);
    }
  }, [mode, isInitialized]);

  // Simpan perubahan tema ke localStorage dan terapkan kelas CSS
  useEffect(() => {
    // Skip jika belum diinisialisasi
    if (!isInitialized) return;
    
    // Simpan tema ke localStorage dengan cara yang aman
    safeSetItem("theme_color", theme);
    console.log(`[ModeContext] Saved theme_color to localStorage: ${theme}`);
    
    try {
      // Terapkan kelas CSS untuk tema
      const root = document.documentElement;
      if (root) {
        root.classList.toggle("dark", theme === "dark");
        console.log(`[ModeContext] Applied dark theme: ${theme === "dark"}`);
      }
      
      // Tambahkan data attribute untuk membantu debugging
      if (document.body) {
        document.body.setAttribute('data-theme-color', theme);
      }
    } catch (domErr) {
      console.warn(`[ModeContext] Error applying theme to DOM:`, domErr);
    }
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