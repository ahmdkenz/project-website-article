"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useSearch } from "@/hooks/useSearch";
import { useMode } from "@/context/ModeContext";
import SearchResultsList from "@/components/SearchResultsList";

// Komponen TabButton tidak berubah, sudah bagus.
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

// Komponen generik untuk menampilkan setiap bagian hasil.
function ResultsSection({ title, items, renderItem, noResultsMessage, style }) {
  if (!items || items.length === 0) {
    return (
      <section style={style}>
        <h2>{title}</h2>
        <p className="muted">{noResultsMessage}</p>
      </section>
    );
  }
  return (
    <section className="homepage-articles" style={style}>
      <h2>{title}</h2>
      <div className="articles-list">{items.map(renderItem)}</div>
    </section>
  );
}

export default function SearchPageClient({ initialQuery, initialResults }) {
  const router = useRouter();
  const params = useSearchParams();
  const inputRef = useRef(null);

  // State utama untuk query dan tab
  const [q, setQ] = useState(initialQuery || "");
  const [activeTab, setActiveTab] = useState("all");
  const [results, setResults] = useState(initialResults);
  // State untuk kontrol hint/saran
  const [showHint, setShowHint] = useState(false);

  // Ambil mode aktif dari context
  const { mode } = useMode();

  // Hook pencarian real-time (hint) dengan mode
  const { query: hintQuery, setQuery: setHintQuery, results: hintResults, loading: hintLoading, canSearch: canHint } = useSearch({ minLen: 2, limit: 8, debounceMs: 200, mode });
  
  // Log mode aktif untuk debugging
  useEffect(() => {
    console.log(`[SearchPageClient] Active mode: ${mode}`);
  }, [mode]);

  // Sinkronisasi input dengan URL params
  useEffect(() => {
    const urlQ = params.get("q") || "";
    setQ(urlQ);
    setHintQuery(urlQ);
  }, [params, setHintQuery]);

  // Update URL saat q berubah
  useEffect(() => {
    const handle = setTimeout(() => {
      const current = new URLSearchParams(Array.from(params.entries()));
      if (q) current.set("q", q);
      else current.delete("q");
      router.replace(`/search?${current.toString()}`);
    }, 250);
    return () => clearTimeout(handle);
  }, [q, params, router]);

  // Reset hasil jika initialResults berubah
  useEffect(() => {
    setResults(initialResults);
  }, [initialResults]);

  // Reset hasil jika mode berubah (untuk memastikan pencarian selalu menggunakan mode yang tepat)
  useEffect(() => {
    if (q.trim().length >= 2) {
      // Jika ada query aktif, kita perlu memperbarui pencarian dengan mode baru
      const fetchResults = async () => {
        try {
          console.log(`[Client Search] Fetching results for mode: ${mode}, query: "${q}"`);
          const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&mode=${encodeURIComponent(mode)}`);
          if (res.ok) {
            const data = await res.json();
            // Tambahkan filter client-side untuk memastikan hanya artikel dengan mode yang tepat
            const results = Array.isArray(data.results) ? data.results : [];
            
            // Check mode of all results
            const modeMap = {};
            results.forEach(article => {
              const articleMode = (article.mode || "moderate").toLowerCase().trim();
              modeMap[articleMode] = (modeMap[articleMode] || 0) + 1;
            });
            console.log(`[Client Search] Results by mode before filtering:`, modeMap);
            
            const filteredResults = results.filter(article => {
              // Pastikan hanya artikel dengan mode yang sama persis yang ditampilkan
              const articleMode = (article.mode || "moderate").toLowerCase().trim();
              const isMatch = articleMode === mode;
              
              // Log info untuk artikel friendly mode
              if (articleMode === "friendly" && mode === "friendly") {
                console.log(`[Client Search] Found friendly article: ${article.title}`);
              }
              
              return isMatch;
            });
            
            console.log(`[Client Search] Mode: ${mode}, Found: ${filteredResults.length} articles after client filtering`);
            
            setResults({
              articles: filteredResults,
              terms: [], // Tetap kosong karena API hanya mengembalikan artikel
              flashcards: [] // Tetap kosong karena API hanya mengembalikan artikel
            });
          }
        } catch (err) {
          console.error("Gagal memperbarui hasil pencarian:", err);
        }
      };
      fetchResults();
    }
  }, [mode, q]);

  // Tab counts
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

  // Konfigurasi untuk setiap bagian hasil.
  const resultSections = [
    {
      id: "articles",
      title: "Artikel",
      items: results?.articles,
      noResultsMessage: "Tidak ada artikel yang cocok.",
      renderItem: (a) => (
        <article className="article-card" key={a.slug}>
          <div className="article-content">
            <h3>{a.title}</h3>
            {/* Mode badge */}
            {a.mode && (
              <span
                className={`badge badge-mode badge-mode-${a.mode}`}
                style={{
                  marginRight: 8,
                  background: a.mode === "friendly" ? "#ff9800" : "#8e24aa",
                  color: "#fff",
                  fontSize: ".85em",
                  fontWeight: 500,
                  padding: "2px 8px",
                  borderRadius: 8,
                  display: "inline-block"
                }}
              >
                {a.mode === "friendly"
                  ? "Friendly Mode"
                  : "Moderate Mode"}
              </span>
            )}
            {a.excerpt ? <p className="muted">{a.excerpt}</p> : null}
            <div className="meta">
              {a.category ? <span className="badge">{a.category}</span> : null}
              {Array.isArray(a.tags)
                ? a.tags.slice(0, 4).map((t) => (
                    <span className="tag" key={t}>{t}</span>
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
      ),
    },
    {
      id: "terms",
      title: "Kamus",
      items: results?.terms,
      noResultsMessage: "Tidak ada istilah yang cocok.",
      renderItem: (t) => (
        <article className="article-card" key={t.id || t.term}>
          <div className="article-content">
            <h3>{t.term}</h3>
            <p className="muted">{t.definitionFriendly || t.definitionModerate || ""}</p>
            <div className="meta">
              {t.category ? <span className="badge">{t.category}</span> : null}
              {Array.isArray(t.aliases)
                ? t.aliases.slice(0, 4).map((a) => (
                    <span className="tag" key={a}>{a}</span>
                  ))
                : null}
            </div>
          </div>
        </article>
      ),
    },
    {
      id: "flashcards",
      title: "Flashcards",
      items: results?.flashcards,
      noResultsMessage: "Tidak ada kartu yang cocok.",
      renderItem: (c) => (
        <article className="article-card" key={c.id || c.term}>
          <div className="article-content">
            <h3>{c.term}</h3>
            <p className="muted">{c.definitionFriendly || c.definitionModerate || c.back || ""}</p>
          </div>
        </article>
      ),
    },
  ];

  // Handler submit pencarian (tampilkan hasil penuh)
  function handleSubmit(e) {
    e.preventDefault();
    const val = inputRef.current?.value?.trim();
    if (!val) return;
    setQ(val);
    setShowHint(false);
    // URL akan diupdate oleh useEffect
  }

  // Handler klik pada hint
  function handleHintClick(item) {
    setShowHint(false);
    setQ(item.title || item.term || "");
    router.push(`/articles/${item.slug}`);
  }

  return (
    <>
      <div className="search-area">
        <form className="search-wrapper" onSubmit={handleSubmit} autoComplete="off" style={{ position: "relative" }}>
          <input
            id="globalSearchInput"
            ref={inputRef}
            type="text"
            placeholder="Cari apa saja... (mis. inflasi, field, rasio)"
            value={q}
            onChange={e => {
              setQ(e.target.value);
              setHintQuery(e.target.value);
              setShowHint(true);
            }}
            aria-label="Ketik kata kunci pencarian"
            onFocus={() => { if (hintQuery.length >= 2) setShowHint(true); }}
            autoComplete="off"
          />
          <button
            type="submit"
            className="btn btn-ghost btn-cari-search"
            aria-label="Cari"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              background: 'none',
              border: 'none',
              boxShadow: 'none',
              minWidth: 44,
              minHeight: 44,
              height: '100%',
              width: 44,
              marginLeft: 4,
              color: mode === 'friendly' ? '#ffffffff' : '#ffffffff',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ display: 'block' }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
      <style jsx global>{`
        .search-wrapper {
          display: flex;
          align-items: center;
          position: relative;
          gap: 0.5rem;
        }
        .search-wrapper input[type="text"] {
          flex: 1 1 0%;
          min-width: 0;
          font-size: 1rem;
          padding-right: 0.5rem;
        }
        .btn-cari-search {
          min-width: 44px;
          min-height: 44px;
          width: 44px;
          height: 44px;
          padding: 0;
          margin-left: 4px;
          background: none !important;
          border: none !important;
          box-shadow: none !important;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
          {/* Dropdown hint/saran */}
          {showHint && canHint && (q.trim().length >= 2) && (
            <div className="search-suggest" role="listbox" aria-label="Saran pencarian" style={{ position: "absolute", left: 0, right: 0, top: "100%", zIndex: 10, background: "var(--bg, #fff)", border: "1px solid #eee", borderTop: "none", maxHeight: 320, overflowY: "auto" }}>
              {hintLoading ? (
                <p className="muted" style={{ margin: 8 }}>Mencari…</p>
              ) : (
                <SearchResultsList results={hintResults} onItemClick={() => setShowHint(false)} />
              )}
              {hintResults?.length > 0 && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => { setShowHint(false); }}
                  style={{ margin: 8, width: "100%" }}
                >
                  Lihat semua hasil untuk “{q}”
                </button>
              )}
            </div>
          )}
        </form>
      </div>

      <div style={{ display: "flex", alignItems: "center", margin: "1rem 0" }}>
        <TabButton id="all" active={activeTab === "all"} label="Semua" count={counts.all} onClick={setActiveTab} />
        <TabButton id="articles" active={activeTab === "articles"} label="Artikel" count={counts.articles} onClick={setActiveTab} />
        <TabButton id="terms" active={activeTab === "terms"} label="Kamus" count={counts.terms} onClick={setActiveTab} />
        <TabButton id="flashcards" active={activeTab === "flashcards"} label="Flashcards" count={counts.flashcards} onClick={setActiveTab} />
      </div>

      {resultSections
        .filter((section) => activeTab === "all" || activeTab === section.id)
        .map((section, index) => (
          <ResultsSection
            key={section.id}
            title={section.title}
            items={section.items}
            renderItem={section.renderItem}
            noResultsMessage={section.noResultsMessage}
            style={{ marginTop: "2rem" }}
          />
        ))}
    </>
  );
}