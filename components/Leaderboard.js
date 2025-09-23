"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMode } from '@/context/ModeContext';
// CSS now loaded through layout.js in proper order

export default function Leaderboard({ quizId, pageSize = 10, autoRotateMs = 5000, title = "Leaderboard", refreshToken = 0 }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const timerRef = useRef(null);
  const { theme } = useMode(); // Access theme from ModeContext

  const pages = useMemo(() => {
    if (!Array.isArray(items) || items.length === 0) return [];
    const chunks = [];
    for (let i = 0; i < items.length; i += pageSize) {
      chunks.push(items.slice(i, i + pageSize));
    }
    return chunks;
  }, [items, pageSize]);

  const totalPages = pages.length;
  const currentItems = pages[page] || [];

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!quizId) return;
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/leaderboard?quizId=${encodeURIComponent(quizId)}&limit=100&_=${Date.now()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setItems(Array.isArray(data.items) ? data.items : []);
      } catch (e) {
        if (!cancelled) setError("Gagal memuat leaderboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [quizId, refreshToken]);

  // Auto-rotate when more than one page
  useEffect(() => {
    if (totalPages <= 1) return;
    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setPage((p) => (p + 1) % totalPages);
    }, autoRotateMs);
    return () => timerRef.current && clearInterval(timerRef.current);
  }, [totalPages, autoRotateMs]);

  if (!quizId) return null;

  const renderBadge = (b) => {
    if (!b) return "-";
    
    // Convert old badge names to new format
    let newBadge;
    let icon;
    
    if (b === "Master" || b === "Pro") {
      newBadge = "Pro";
      icon = "🏅";
    } else if (b === "Ahli" || b === "Expert") {
      newBadge = "Expert";
      icon = "🎖️";
    } else if (b === "Pemula" || b === "Amatir") {
      newBadge = "Amatir";
      icon = "🥉";
    } else if (b === "Coba Lagi" || b === "Newbie") {
      newBadge = "Newbie";
      icon = "🔁";
    } else {
      newBadge = b;
      icon = "🔹";
    }
    
    return (
      <span className="badge-pill"><span className="emoji">{icon}</span>{newBadge}</span>
    );
  };

  return (
    <section aria-label={`${title} untuk ${quizId}`} style={{ marginTop: "1rem" }} className="leaderboard-container">
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: ".5rem" }}>
        <h3 style={{ margin: 0, fontSize: "1.1rem" }}>🏆 {title}</h3>
        {totalPages > 1 && (
          <div style={{ display: "flex", gap: ".25rem" }}>
            <button className="btn btn-sm" onClick={() => setPage((p) => (p - 1 + totalPages) % totalPages)} aria-label="Sebelumnya">‹</button>
            <div className="muted" style={{ minWidth: 48, textAlign: "center" }}>{page + 1}/{totalPages}</div>
            <button className="btn btn-sm" onClick={() => setPage((p) => (p + 1) % totalPages)} aria-label="Berikutnya">›</button>
          </div>
        )}
      </header>

      {loading && <p className="muted">Memuat...</p>}
      {error && <p className="muted" role="alert">{error}</p>}

      {!loading && !error && (
        <div className="leaderboard">
          {/* Header Section: 5 columns (No., Nama, Level, Badge, Skor) */}
          <div className="leaderboard-header">
            <span className="col-rank">No.</span>
            <span className="col-name">Nama</span>
            <span className="col-level">Level</span>
            <span className="col-badge">Badge</span>
            <span className="col-score">Skor</span>
          </div>
          {/* Leaderboard Entries */}
          <div className="leaderboard-entries">
            {currentItems.length === 0 ? (
              <div className="muted">Belum ada peserta.</div>
            ) : (
              currentItems.map((it, idx) => (
                <div key={it.id || idx} className="leaderboard-row">
                  <span className="col-rank">{page * pageSize + idx + 1}.</span>
                  <span className="col-name" title={it.name || "Anon"}>
                    {it.name || "Anon"}
                  </span>
                  <span className="col-level" title={it.level || "Unknown"}>
                    {it.level || "Unknown"}
                  </span>
                  <span className="col-badge">{renderBadge(it.badge)}</span>
                  <span className="col-score">{it.score}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </section>
  );
}
