// src/components/HomeArticlesClient.js
"use client";

import Link from "next/link";
import RealtimeViewCounter from "@/components/RealtimeViewCounter";
import SavedListClient from "@/components/SavedListClient";
import { useEffect, useMemo, useRef, useState } from "react";

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

  const [active, setActive] = useState(defaultTab);

  useEffect(() => {
    const saved =
      typeof window !== "undefined" ? sessionStorage.getItem("homeTab") : null;
    if (saved && ["saved", "latest", "popular"].includes(saved)) setActive(saved);
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") sessionStorage.setItem("homeTab", active);
  }, [active]);

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
            {/* SavedListClient kemungkinan daftar vertikal; biarkan seperti ini */}
            <SavedListClient allArticles={allArticles} />
          </>
        )}

        {active === "latest" && (
          <>
            <h2>🆕 Terbaru</h2>
            <MiniScroller items={latest} ariaLabel="Artikel terbaru" />
          </>
        )}

        {active === "popular" && (
          <>
            <h2>🔥 Populer</h2>
            <MiniScroller items={popular} ariaLabel="Artikel populer" />
          </>
        )}
      </section>
    </>
  );
}
