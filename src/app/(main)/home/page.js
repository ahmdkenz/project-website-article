// src/app/(main)/home/page.js
export const revalidate = 60; // ISR: refresh max tiap 60 detik

import "@/styles/home.css";

import { cookies } from "next/headers";
import { getAllArticles, getLatest, getPopular, filterByMode, normMode } from "@/lib/data";
import { getAllViews } from "@/lib/views";
import HomeHeroClient from "@/components/HomeHeroClient";
import HomeArticlesTabsClient from "@/components/HomeArticlesClient"; // default export
import Link from "next/link";
import React from "react";

// Ubah limit dengan mudah (null = tanpa batas)
const LATEST_LIMIT  = 5;   // set ke null jika ingin semua
const POPULAR_LIMIT = 5;   // set ke null jika ingin semua

/* -------------------------
   MiniScroller (inline)
   - Lightweight horizontal scroller for the homepage.
   ------------------------- */
function MiniScrollerClient({ items = [], ariaLabel = "Daftar artikel", id }) {
  return (
    <div style={{ marginTop: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: ".5rem" }}>
        <h3 style={{ margin: 0 }}>Terbaru</h3>
        {Array.isArray(items) && items.length > 0 && (
          <Link href="/articles" className="btn btn-ghost btn-sm">Lihat Semua</Link>
        )}
      </div>

      {(!items || items.length === 0) ? (
        <p className="muted">Belum ada artikel terbaru untuk mode ini.</p>
      ) : (
        <div className="hscroll-wrap" style={{ position: "relative" }}>
          <div
            className="hscroll"
            role="region"
            aria-label={ariaLabel}
            id={id || "mini-scroller"}
            style={{
              display: "flex",
              gap: ".75rem",
              overflowX: "auto",
              padding: ".25rem",
              scrollBehavior: "smooth",
            }}
          >
            {items.map((a) => (
              <article key={a.slug} className="article-card mini" style={{ minWidth: 220 }}>
                <Link href={`/articles/${a.slug}`} className="mini-card-link" aria-label={`Buka ${a.title}`}>
                  <h4 className="mini-title" style={{ margin: 0 }}>{a.title}</h4>
                  {a.excerpt ? <p className="muted" style={{ margin: ".5rem 0 0", fontSize: ".9rem" }}>{a.excerpt}</p> : null}
                  <div style={{ marginTop: ".5rem", display: "flex", gap: ".5rem", alignItems: "center", flexWrap: "wrap" }}>
                    {a.category ? <span className="badge">{a.category}</span> : null}
                    {Array.isArray(a.tags) && a.tags.slice(0,2).map(t => <span key={t} className="tag">#{t}</span>)}
                    {a.readTime ? <span className="tag">{a.readTime} min</span> : null}
                    {a.slug ? <span className="tag" aria-hidden>👁 {a.views ?? 0}</span> : null}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------
   Page (FINAL)
   ------------------------- */
export default async function HomePage() {
  // ambil semua artikel + views
  const all = await getAllArticles();
  const viewsMap = await getAllViews();

  // baca cookie secara async (penting)
  const cookieStore = await cookies();
  const cookieMode = cookieStore.get("site_mode")?.value;
  const activeMode = normMode(cookieMode);

  // enriched = sumber data lengkap yang akan dikirim ke client (UNFILTERED)
  const enriched = (Array.isArray(all) ? all : []).map((a) => ({
    ...a,
    views: Number((viewsMap && viewsMap[a.slug]) || 0),
    mode: a?.mode ?? null,
  }));

  // server-side filtered lists (untuk initial render tanpa FOUC)
  const latest = getLatest(enriched, LATEST_LIMIT || undefined, { mode: activeMode });
  const popular = getPopular(enriched, viewsMap || {}, POPULAR_LIMIT || undefined, { mode: activeMode });

  // allArticlesFiltered hanya dipakai server-side logic if needed (not sent as allArticles)
  const allArticlesFiltered = filterByMode(enriched, activeMode);

  return (
    <>
      <HomeHeroClient />
      <div className="homepage-articles-wrapper" style={{ display: "block", marginTop: "3rem" }}>
        {/* KIRIM enriched (full list) ke komponen client agar dapat melakukan fallback ketika mode berubah di client */}
        <HomeArticlesTabsClient
          latest={latest}                 // server-filtered initial latest
          popular={popular}               // server-filtered initial popular
          allArticles={enriched}          // full list for client-side fallback & saved list
        />
      </div>
    </>
  );
}
