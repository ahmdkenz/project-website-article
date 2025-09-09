// app/page.js
"use client";

import { useRouter } from "next/navigation";
import { useMode } from "@/context/ModeContext";

/** Toggle tema melayang (khusus halaman ini saja) */
function ThemeFloatToggleInline() {
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
        background: "rgba(0,0,0,0.02)",
        backdropFilter: "saturate(140%) blur(6px)",
        border: "1px solid var(--border-color)",
      }}
    >
      <span style={{ fontSize: "1.2rem" }}>{theme === "dark" ? "☀️" : "🌙"}</span>
    </button>
  );
}

export default function SelectModePage() {
  const router = useRouter();
  const { setMode } = useMode();

  const handleModeSelect = (m) => {
    setMode(m);
    try { localStorage.setItem("theme_mode", m); } catch {}
    router.push("/home");
  };

  return (
    <main className="container" style={{ padding: "2rem 0" }}>
      {/* Toggle tema hanya ada di halaman ini (pojok kanan atas) */}
      <ThemeFloatToggleInline />

      <section className="hero small" style={{ textAlign: "center" }}>
        <h1>Pilih Gaya Belajar</h1>
        <p className="muted">Sesuaikan pengalaman: lebih santai atau lebih mendalam.</p>
      </section>

      <section
        className="options-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1.1rem",
          marginTop: "1.6rem",
        }}
      >
        {/* Friendly card */}
        <article
          className="article-card"
          style={{
            background: "var(--surface-color)",
            border: "1px solid var(--border-color)",
            borderRadius: "16px",
            padding: "1.25rem",
            boxShadow: "var(--shadow)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "grid", gap: ".35rem" }}>
            <h2>🎈 Friendly Mode</h2>
            <p className="muted">Bahasa santai, analogi ringan, cepat dipahami.</p>
          </div>
          <div style={{ marginTop: "auto", paddingTop: "1rem" }}>
            <button
              className="btn-primary btn-lg"
              onClick={() => handleModeSelect("friendly")}
              aria-label="Pilih Friendly Mode"
              title="Pilih Friendly Mode"
            >
              <span className="icon">✨</span>
              Pilih Friendly
            </button>
          </div>
        </article>

        {/* Moderate card */}
        <article
          className="article-card"
          style={{
            background: "var(--surface-color)",
            border: "1px solid var(--border-color)",
            borderRadius: "16px",
            padding: "1.25rem",
            boxShadow: "var(--shadow)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "grid", gap: ".35rem" }}>
            <h2>📘 Moderate Mode</h2>
            <p className="muted">Bahasa formal, data lebih lengkap untuk pendalaman.</p>
          </div>
          <div style={{ marginTop: "auto", paddingTop: "1rem" }}>
            <button
              className="btn-primary btn-lg"
              onClick={() => handleModeSelect("moderate")}
              aria-label="Pilih Moderate Mode"
              title="Pilih Moderate Mode"
            >
              <span className="icon">🚀</span>
              Pilih Moderate
            </button>
          </div>
        </article>
      </section>
    </main>
  );
}
