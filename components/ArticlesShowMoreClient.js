// src/components/ArticlesShowMoreClient.js
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RealtimeViewCounter from "@/components/RealtimeViewCounter";

function MiniArticleCard({ a }) {
  return (
    <article className="article-card">
      <Link
        href={`/articles/${a.slug}`}
        className="mini-card-link"
        aria-label={`Buka artikel: ${a?.title ?? "Tanpa judul"}`}
      >
        <h3 style={{ margin: "0 0 .35rem", fontSize: "1rem", lineHeight: 1.35 }}>
          {a?.title ?? "Tanpa judul"}
        </h3>

        {a?.excerpt ? (
          <p
            className="muted"
            style={{
              margin: "0 0 .5rem",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              lineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              fontSize: ".9rem",
            }}
          >
            {a.excerpt}
          </p>
        ) : null}

        <div
          className="mini-meta"
          style={{ display: "flex", flexWrap: "wrap", gap: ".35rem", alignItems: "center" }}
        >
          {a?.category ? <span className="badge">{a.category}</span> : null}
          {Array.isArray(a?.tags)
            ? a.tags.slice(0, 2).map((t) => (
                <span className="tag" key={t}>
                  #{t}
                </span>
              ))
            : null}
          {a?.readTime ? <span className="tag">{a.readTime} min</span> : null}
          {/* Counter live (opsional, sudah kamu gunakan di tempat lain) */}
          {a?.slug ? <RealtimeViewCounter slug={a.slug} /> : null}
        </div>
      </Link>
    </article>
  );
}

export default function ArticlesShowMoreClient({
  allArticles = [],
  initialCount = 6,
  step = 6,
  listId = "articles-list",
}) {
  const total = allArticles.length;
  const safeInitial = Math.max(0, Math.min(initialCount, total || 0));

  const [visible, setVisible] = useState(safeInitial);

  // Reset ke awal jika daftar artikel berubah (misalnya ada filter/urut)
  useEffect(() => {
    setVisible(Math.max(0, Math.min(initialCount, allArticles.length || 0)));
  }, [allArticles, initialCount]);

  const items = useMemo(
    () => (Array.isArray(allArticles) ? allArticles.slice(0, visible) : []),
    [allArticles, visible]
  );

  const canShowMore = visible < total;
  const canShowLess = visible > safeInitial;

  const handleShowMore = () => setVisible((v) => Math.min(v + step, total));
  const handleShowLess = () => setVisible(safeInitial);

  if (!total) {
    return <p className="muted">Belum ada artikel.</p>;
  }

  return (
    <>
      {/* List/grid artikel — className disesuaikan agar kena override .articles-compact */}
      <div id={listId} className="articles-list" aria-live="polite">
        {items.map((a) => (
          <MiniArticleCard key={a.slug} a={a} />
        ))}
      </div>

      {/* Footer tombol “Lihat selengkapnya” */}
      <div className="list-footer" style={{ display: "flex", justifyContent: "center", marginTop: "1rem", gap: ".5rem" }}>
        {canShowMore ? (
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleShowMore}
            aria-controls={listId}
            aria-expanded={visible > safeInitial}
          >
            Lihat {Math.min(step, total - visible)} lagi
          </button>
        ) : null}

        {canShowLess ? (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleShowLess}
            aria-controls={listId}
            aria-expanded={visible > safeInitial}
          >
            Tampilkan lebih sedikit
          </button>
        ) : null}
      </div>

      {/* Hint opsional di bawah tombol */}
      <div className="list-hint">
        Menampilkan <strong>{visible}</strong> dari <strong>{total}</strong> artikel
      </div>
    </>
  );
}
