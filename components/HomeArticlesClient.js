// src/components/HomeArticlesClient.js
"use client";

import Link from "next/link";
import RealtimeViewCounter from "@/components/RealtimeViewCounter";
import SavedListClient from "@/components/SavedListClient";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMode } from "@/context/ModeContext";

/* MiniArticleCard */
function MiniArticleCard({ a }) {
  return (
    <article className="article-card mini">
      <Link
        href={`/articles/${a.slug}`}
        className="mini-card-link"
        aria-label={`Buka ${a.title}`}
      >
        <h3 className="mini-title">{a.title}</h3>
        <div className="mini-meta">
          {a.category ? <span className="badge">{a.category}</span> : null}
          {Array.isArray(a.tags) &&
            a.tags.slice(0, 2).map((t) => (
              <span className="tag" key={t}>#{t}</span>
            ))}
          {a.readTime ? <span className="tag">{a.readTime} min</span> : null}
          <RealtimeViewCounter slug={a.slug} />
        </div>
      </Link>
    </article>
  );
}

/* MiniScroller */
function MiniScroller({ items, ariaLabel }) {
  const ref = useRef(null);
  const [showNav, setShowNav] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setShowNav(el.scrollWidth > el.clientWidth + 4);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    window.addEventListener("resize", check);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", check);
    };
  }, []);

  const scrollByAmount = (dir) => {
    const el = ref.current;
    if (!el) return;
    const amt = Math.round(el.clientWidth * 0.9);
    el.scrollBy({ left: dir * amt, behavior: "smooth" });
  };

  if (!items?.length) return <p className="muted">Belum ada artikel.</p>;

  return (
    <div className="hscroll-wrap">
      {showNav && (
        <button
          type="button"
          className="hscroll-btn hscroll-btn--left"
          aria-label="Geser ke kiri"
          onClick={() => scrollByAmount(-1)}
        >
          ‹
        </button>
      )}

      <div
        ref={ref}
        className="hscroll"
        role="region"
        aria-label={ariaLabel || "Daftar artikel"}
      >
        {items.map((a) => (
          <MiniArticleCard key={a.slug} a={a} />
        ))}
      </div>

      {showNav && (
        <button
          type="button"
          className="hscroll-btn hscroll-btn--right"
          aria-label="Geser ke kanan"
          onClick={() => scrollByAmount(1)}
        >
          ›
        </button>
      )}
    </div>
  );
}

/* helpers client */
function norm(s) {
  return (s || "").toString().toLowerCase().trim();
}
function normMode(m) {
  if (!m) return "moderate";
  const v = String(m).toLowerCase().trim();
  if (v === "friendly" || v === "moderate" || v === "both") return v;
  return "moderate";
}

/* MAIN */
export default function HomeArticlesClient({
  latest = [],
  popular = [],
  allArticles = [],
  defaultTab = "latest", // "saved" | "latest" | "popular"
}) {
  const tabs = useMemo(
    () => [
      { key: "saved", label: "⭐ Disimpan" },
      { key: "latest", label: "🆕 Terbaru" },
      { key: "popular", label: "🔥 Populer" },
    ],
    []
  );

  const { mode } = useMode();
  const [active, setActive] = useState(defaultTab);

  useEffect(() => {
    const saved =
      typeof window !== "undefined" ? sessionStorage.getItem("homeTab") : null;
    if (saved && ["saved", "latest", "popular"].includes(saved)) setActive(saved);
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") sessionStorage.setItem("homeTab", active);
  }, [active]);

  // --- Compute fallback latest/popular from allArticles when server props empty or not matching mode
  const modeNorm = normMode(mode);

  // filter helper for arrays
  const filterByModeArray = (items, m) => {
    return (Array.isArray(items) ? items : []).filter((a) => {
      const aMode = normMode(a?.mode);
      if (aMode === "both") return true;
      return aMode === m;
    });
  };

  // If server-provided latest has items that match current mode, use it.
  // Otherwise compute from allArticles.
  const latestFiltered = useMemo(() => {
    const srv = Array.isArray(latest) ? latest : [];
    const srvMatch = srv.filter(a => {
      const am = normMode(a?.mode);
      return (am === "both") || (am === modeNorm);
    });
    if (srvMatch.length > 0) return srvMatch;

    // fallback: compute from allArticles
    const list = (Array.isArray(allArticles) ? [...allArticles] : []);
    const filtered = list.filter(a => {
      const am = normMode(a?.mode);
      if (am === "both") return true;
      return am === modeNorm;
    });
    filtered.sort((a,b) => new Date(b.date || 0) - new Date(a.date || 0));
    return filtered.slice(0, 6);
  }, [latest, allArticles, modeNorm]);

  const popularFiltered = useMemo(() => {
    const srv = Array.isArray(popular) ? popular : [];
    const srvMatch = srv.filter(a => {
      const am = normMode(a?.mode);
      return (am === "both") || (am === modeNorm);
    });
    if (srvMatch.length > 0) return srvMatch;

    // fallback: compute top by views from allArticles
    const list = (Array.isArray(allArticles) ? [...allArticles] : []);
    const filtered = list.filter(a => {
      const am = normMode(a?.mode);
      if (am === "both") return true;
      return am === modeNorm;
    });
    filtered.sort((a, b) => (Number(b.views || 0) - Number(a.views || 0)) || (new Date(b.date || 0) - new Date(a.date || 0)));
    return filtered.slice(0, 6);
  }, [popular, allArticles, modeNorm]);

  // saved uses allArticles (filtered)
  const savedFiltered = useMemo(() => {
    const list = (Array.isArray(allArticles) ? [...allArticles] : []);
    return list.filter(a => {
      const am = normMode(a?.mode);
      if (am === "both") return true;
      return am === modeNorm;
    });
  }, [allArticles, modeNorm]);

  return (
    <>
      {/* Tab minimalis */}
      <div className="homepage-articles" style={{ padding: "1rem" }}>
        <div
          role="tablist"
          aria-label="Navigasi artikel"
          style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}
        >
          {tabs.map((t) => {
            const isActive = active === t.key;
            return (
              <button
                key={t.key}
                role="tab"
                aria-selected={isActive}
                className={isActive ? "btn btn-primary btn-sm" : "btn btn-ghost btn-sm"}
                onClick={() => setActive(t.key)}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Konten */}
      <section className="homepage-articles" style={{ marginTop: "1rem" }}>
        {active === "saved" && (
          <>
            <h2>⭐ Disimpan</h2>
            <SavedListClient allArticles={savedFiltered} />
          </>
        )}

        {active === "latest" && (
          <>
            <h2>🆕 Terbaru</h2>
            <MiniScroller items={latestFiltered} ariaLabel="Artikel terbaru" />
          </>
        )}

        {active === "popular" && (
          <>
            <h2>🔥 Populer</h2>
            <MiniScroller items={popularFiltered} ariaLabel="Artikel populer" />
          </>
        )}
      </section>
    </>
  );
}
