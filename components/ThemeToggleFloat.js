// components/ThemeFloatToggle.js
"use client";

import { useMode } from "@/context/ModeContext";

export default function ThemeFloatToggle() {
  const { theme, setTheme } = useMode();
  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      aria-label={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      onClick={() => setTheme(next)}
      className="btn-ghost btn-sm"
      style={{
        position: "fixed",
        top: "12px",
        right: "16px",
        zIndex: 1000,
        borderRadius: "999px",
        padding: ".55rem .65rem",
        lineHeight: 1,
        // tampilan transparan agar menyatu dengan apapun di bawahnya
        background: "rgba(0,0,0,0.02)",
        backdropFilter: "saturate(140%) blur(6px)",
        border: "1px solid var(--border-color)",
      }}
    >
      <span style={{ fontSize: "1.2rem" }}>{theme === "dark" ? "☀️" : "🌙"}</span>
    </button>
  );
}
