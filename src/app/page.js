// app/page.js
"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
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

  // BRAND banner
  const bannerSrc = "/brand/hero-mudamelekfinansial.jpg";

  return (
    <main className="container" style={{ padding: "2rem 0" }}>
      {/* Toggle tema hanya ada di halaman ini (pojok kanan atas) */}
      <ThemeFloatToggleInline />

      {/* ===== HERO Brand (gambar saja) ===== */}
      <section
        className="hero hero--welcome small"
        style={{
          textAlign: "center",
          "--hero-h-min": "300px",  // tinggi minimum (mobile)
          "--hero-h-fluid": "20vw", // tinggi proporsional (tablet–desktop)
          "--hero-h-max": "480px",  // tinggi maksimum (desktop lebar)
          "--hero-ar": "16/9",      // ← rasio gambar (ubah jika gambar bukan 16:9)
        }}
      >
        <div className="hero-media" aria-hidden="true">
          <Image
            src={bannerSrc}
            alt=""
            fill
            sizes="100vw"
            priority
            className="hero-img"
          />
          <div className="hero-overlay" />
        </div>

        {/* Tetap ada wadahnya agar struktur konsisten (tanpa teks di dalam hero) */}
        <div className="hero-inner" aria-hidden="true">
          <span className="brand-badge">✨</span>
        </div>
      </section>

      {/* ===== Judul & subjudul di BAWAH banner ===== */}
      <section className="welcome-head" style={{ textAlign: "center", marginTop: "0.75rem" }}>
        <h1 className="welcome-title">Selamat Datang di Muda Melek Finansial</h1>
        <p className="welcome-subtitle muted">
          Pilih gaya belajar yang paling sesuai — <strong>Friendly</strong> yang ringan atau <strong>Moderate</strong> yang terstruktur. Preferensi bisa diubah kapan saja.
        </p>
      </section>

      {/* Grid opsi mode (asli)—dipertahankan */}
      <section
        className="options-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1.1rem",
          marginTop: "1.2rem",
        }}
      >
        {/* Friendly card */}
        <article
          className="article-card mode-card"
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
          className="article-card mode-card"
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

      {/* ===== CSS global khusus halaman ini (animasi + hero + welcome) ===== */}
      <style jsx global>{`
        /* HERO layout */
        .hero {
          position: relative;
          min-height: var(--hero-h-min, 220px);
          height: clamp(var(--hero-h-min, 220px), var(--hero-h-fluid, 30vw), var(--hero-h-max, 380px));
          display: grid;
          place-items: center;
          overflow: clip;
          margin-bottom: 0.25rem;
        }
        .hero-media { position: absolute; inset: 0; overflow: hidden; }
        .hero-img { object-fit: cover; object-position: center; filter: saturate(1.05) contrast(1.03); }
        .hero-overlay { position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(2,6,23,.55), rgba(2,6,23,.65) 40%, rgba(2,6,23,.75));
        }
        .hero-inner { position: relative; z-index: 1; width: min(1100px, 92%); height: 0; } /* kosong: hanya jaga struktur */

        /* Welcome heading di bawah banner */
        .welcome-head { width: min(1100px, 92%); margin-inline: auto; }
        .welcome-title { font-size: clamp(1.75rem, 1.2rem + 2vw, 2.6rem); line-height: 1.15; margin: 0 0 .25rem; }
        .welcome-subtitle { font-size: clamp(1rem, .9rem + .4vw, 1.125rem); margin: 0; }

        /* Animations (respect reduced motion) */
        @media (prefers-reduced-motion: no-preference) {
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes softPulse {
            0%,100% { transform: scale(1); opacity: 1; }
            50%     { transform: scale(1.06); opacity: .96; }
          }

          /* Animasi welcome text (bawah banner) */
          .welcome-title    { animation: fadeInUp .6s ease-out both; }
          .welcome-subtitle { animation: fadeInUp .6s ease-out .08s both; }

          /* Stagger masuk untuk kartu */
          .options-grid .mode-card {
            opacity: 0; transform: translateY(10px);
            animation: fadeInUp .5s ease-out both;
          }
          .options-grid .mode-card:nth-child(1) { animation-delay: .05s; }
          .options-grid .mode-card:nth-child(2) { animation-delay: .12s; }

          /* Badge kecil di hero (opsional, subtle) */
          .brand-badge { display: inline-flex; font-size: 1.25rem; animation: softPulse 2.2s ease-in-out .6s 2; }
        }

        /* Micro-interactions pada kartu */
        .mode-card {
          transition: transform .18s ease-out, box-shadow .18s ease-out;
          will-change: transform;
        }
        .mode-card:hover  { transform: translateY(-4px); }
        .mode-card:active { transform: translateY(-1px); }

        /* Fokus keyboard aksesibel */
        .mode-card:focus-visible,
        .mode-card:focus-within {
          outline: 2px solid var(--ring-color);
          outline-offset: 3px;
          border-radius: 12px;
        }

        /* Responsif kecil: grid lebih rapat sedikit */
        @media (max-width: 640px) {
          .options-grid { gap: 1rem !important; }
        }

        /* ===== Mobile hero: jangan terpotong, menyesuaikan box ===== */
        @media (max-width: 640px) {
          /* Box hero mengikuti aspect ratio gambar */
          .hero.hero--welcome {
            height: auto !important;
            min-height: 0 !important;
            aspect-ratio: var(--hero-ar, 16/9);
          }
          /* Tampilkan seluruh gambar (letterbox jika rasio beda) */
          .hero.hero--welcome .hero-img {
            object-fit: contain !important;
            object-position: center;
          }
          /* Warna dasar di balik gambar agar rapi saat contain */
          .hero.hero--welcome .hero-media { background: var(--surface-color); }
          /* Overlay sedikit lebih ringan agar gambar tetap terlihat */
          .hero.hero--welcome .hero-overlay {
            background: linear-gradient(180deg, rgba(2,6,23,.35), rgba(2,6,23,.45) 40%, rgba(2,6,23,.55));
          }
        }
      `}</style>
    </main>
  );
}
