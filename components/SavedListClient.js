// components/SavedListClient.js
"use client";

import Link from "next/link";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useMemo } from "react";

export default function SavedListClient({ allArticles = [] }) {
  const { bookmarks } = useBookmarks();

  // Susun daftar artikel tersimpan mengikuti urutan bookmarks
  const savedArticles = useMemo(() => {
    const map = new Map(allArticles.map(a => [a.slug, a]));
    return bookmarks.map(slug => map.get(slug)).filter(Boolean);
  }, [allArticles, bookmarks]);

  if (!bookmarks.length) {
    return <p className="muted">Belum ada artikel tersimpan.</p>;
  }
  if (!savedArticles.length) {
    return <p className="muted">Artikel tersimpan tidak ditemukan.</p>;
  }

  return (
    <div className="articles-list">
      {savedArticles.map((a) => (
        <article
          key={a.slug}
          className="article-card"
          style={{ marginBottom: "1rem" }}
        >
          <div className="article-content">
            <h3>{a.title}</h3>
            {a.excerpt && <p className="muted">{a.excerpt}</p>}
            <div className="card-actions" style={{ marginTop: ".6rem" }}>
              <Link href={`/articles/${a.slug}`} className="btn btn-ghost btn-sm">
                📄 Baca Lagi
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
