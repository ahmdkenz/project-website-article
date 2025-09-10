"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

function TabButton({ id, active, label, count, onClick }) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`btn ${active ? "btn-primary" : "btn-ghost"}`}
      style={{ marginRight: ".5rem" }}
      aria-pressed={active}
    >
      {label} {typeof count === "number" ? `(${count})` : ""}
    </button>
  );
}

export default function SearchPageClient({ initialQuery, initialResults }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(initialQuery || "");
  const [activeTab, setActiveTab] = useState("all");
  const [results, setResults] = useState(initialResults);

  // ✅ Sync URL -> input
  useEffect(() => {
    const urlQ = params.get("q") || "";
    setQ(urlQ);
  }, [params]);

  // ✅ Update URL saat user ketik (debounced)
  useEffect(() => {
    const handle = setTimeout(() => {
      const current = new URLSearchParams(Array.from(params.entries()));
      if (q) current.set("q", q);
      else current.delete("q");
      router.replace(`/search?${current.toString()}`);
    }, 250);
    return () => clearTimeout(handle);
  }, [q, params, router]); // ✅ tambahkan dependencies

  // ✅ Hydrate hasil terbaru dari server
  useEffect(() => {
    setResults(initialResults);
  }, [initialResults]);

  const counts = useMemo(
    () => ({
      articles: results?.articles?.length || 0,
      terms: results?.terms?.length || 0,
      flashcards: results?.flashcards?.length || 0,
      all:
        (results?.articles?.length || 0) +
        (results?.terms?.length || 0) +
        (results?.flashcards?.length || 0),
    }),
    [results]
  );

  return (
    <>
      <section className="hero small">
        <h1>Cari Materi Keuangan</h1>
        <p className="muted">
          Telusuri artikel, istilah, dan flashcards dari satu tempat.
        </p>
      </section>

      <div className="search-area">
        <div className="search-wrapper">
          <input
            id="globalSearchInput"
            type="text"
            placeholder="Cari apa saja... (mis. inflasi, yield, rasio)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Ketik kata kunci pencarian"
          />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", margin: "1rem 0" }}>
        <TabButton
          id="all"
          active={activeTab === "all"}
          label="Semua"
          count={counts.all}
          onClick={setActiveTab}
        />
        <TabButton
          id="articles"
          active={activeTab === "articles"}
          label="Artikel"
          count={counts.articles}
          onClick={setActiveTab}
        />
        <TabButton
          id="terms"
          active={activeTab === "terms"}
          label="Kamus"
          count={counts.terms}
          onClick={setActiveTab}
        />
        <TabButton
          id="flashcards"
          active={activeTab === "flashcards"}
          label="Flashcards"
          count={counts.flashcards}
          onClick={setActiveTab}
        />
      </div>

      {(activeTab === "all" || activeTab === "articles") && (
        <section className="homepage-articles" style={{ marginTop: "1rem" }}>
          <h2>Artikel</h2>
          <div className="articles-list">
            {results?.articles?.length ? (
              results.articles.map((a) => (
                <article className="article-card" key={a.slug}>
                  <div className="article-content">
                    <h3>{a.title}</h3>
                    {a.excerpt ? <p className="muted">{a.excerpt}</p> : null}
                    <div className="meta">
                      {a.category ? <span className="badge">{a.category}</span> : null}
                      {Array.isArray(a.tags)
                        ? a.tags.slice(0, 4).map((t) => (
                            <span className="tag" key={t}>
                              {t}
                            </span>
                          ))
                        : null}
                    </div>
                    <div className="card-actions" style={{ marginTop: ".75rem" }}>
                      <Link href={`/articles/${a.slug}`} className="btn btn-ghost">
                        Baca Selengkapnya
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <p className="muted">Tidak ada artikel yang cocok.</p>
            )}
          </div>
        </section>
      )}

      {(activeTab === "all" || activeTab === "terms") && (
        <section className="homepage-articles" style={{ marginTop: "2rem" }}>
          <h2>Kamus</h2>
          <div className="articles-list">
            {results?.terms?.length ? (
              results.terms.map((t) => (
                <article className="article-card" key={t.id || t.term}>
                  <div className="article-content">
                    <h3>{t.term}</h3>
                    <p className="muted">
                      {t.definitionFriendly || t.definitionModerate || ""}
                    </p>
                    <div className="meta">
                      {t.category ? <span className="badge">{t.category}</span> : null}
                      {Array.isArray(t.aliases)
                        ? t.aliases.slice(0, 4).map((a) => (
                            <span className="tag" key={a}>
                              {a}
                            </span>
                          ))
                        : null}
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <p className="muted">Tidak ada istilah yang cocok.</p>
            )}
          </div>
        </section>
      )}

      {(activeTab === "all" || activeTab === "flashcards") && (
        <section className="homepage-articles" style={{ marginTop: "2rem" }}>
          <h2>Flashcards</h2>
          <div className="articles-list">
            {results?.flashcards?.length ? (
              results.flashcards.map((c) => (
                <article className="article-card" key={c.id || c.term}>
                  <div className="article-content">
                    <h3>{c.term}</h3>
                    <p className="muted">
                      {c.definitionFriendly || c.definitionModerate || c.back || ""}
                    </p>
                  </div>
                </article>
              ))
            ) : (
              <p className="muted">Tidak ada kartu yang cocok.</p>
            )}
          </div>
        </section>
      )}
    </>
  );
}
