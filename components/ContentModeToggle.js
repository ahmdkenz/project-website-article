"use client";

import { useMode } from "@/context/ModeContext";

export default function ContentModeToggle() {
  const { mode, setMode } = useMode();

  // Handler khusus untuk perubahan mode dengan reload
  const handleModeChange = (newMode) => {
    if (newMode === mode) return; // Tidak perlu melakukan apa-apa jika mode sama
    
    console.log(`[ModeToggle] Changing mode from ${mode} to ${newMode}`);
    setMode(newMode);
    
    // Simpan mode baru ke localStorage dan cookie
    localStorage.setItem("theme_mode", newMode);
    document.cookie = `theme_mode=${newMode}; path=/; max-age=${60*60*24*30}`;
    
    // Reload halaman untuk memastikan konten yang ditampilkan sesuai mode
    // Ini memastikan bahwa API routes juga mendapatkan mode yang baru
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <div className="inline-flex items-center gap-1 rounded-xl border px-1 py-1">
      <button
        type="button"
        onClick={() => handleModeChange("friendly")}
        className={`px-3 py-1 rounded-lg ${mode === "friendly" ? "bg-black text-white" : ""}`}
        aria-pressed={mode === "friendly"}
      >
        Friendly
      </button>
      <button
        type="button"
        onClick={() => handleModeChange("moderate")}
        className={`px-3 py-1 rounded-lg ${mode === "moderate" ? "bg-black text-white" : ""}`}
        aria-pressed={mode === "moderate"}
      >
        Moderate
      </button>
    </div>
  );
}
