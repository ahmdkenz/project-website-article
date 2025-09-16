// src/app/api/search/route.js
import { NextResponse } from "next/server";
import { getAllArticles } from "@/lib/data";

// (opsional) atur runtime sesuai deploy target
export const runtime = "nodejs";

/**
 * GET /api/search?q=...&limit=20
 * Mengembalikan hasil pencarian artikel ringan untuk UI realtime.
 * Sorting: skor kecocokan > tanggal terbaru.
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const qRaw = (searchParams.get("q") || "").trim();
    const limit = Math.min(
      50,
      Math.max(1, parseInt(searchParams.get("limit") || "20", 10))
    );
    const mode = searchParams.get("mode"); // 'friendly' | 'moderate' | null

    // Jika query kosong, kembalikan kosong (biar UI tidak “banjir”)
    if (!qRaw) {
      return withCache(
        NextResponse.json({ q: "", total: 0, results: [] })
      );
    }

    const q = qRaw.toLowerCase();
    const terms = q.split(/\s+/).filter(Boolean);

    // Ambil semua artikel (boleh kamu ganti ke sumber lain juga nanti)
    const all = await getAllArticles();

    // Filter by mode jika ada - STRICT MODE
    let filteredAll = Array.isArray(all) ? all : [];
    console.log(`[API Search] Total articles before filtering: ${filteredAll.length}`);
    
    // Debug check for all mode values
    const modeValues = {};
    filteredAll.forEach(a => {
      const articleMode = (a.mode || "moderate").toLowerCase().trim();
      modeValues[articleMode] = (modeValues[articleMode] || 0) + 1;
    });
    console.log(`[API Search] Article mode distribution:`, modeValues);
    
    // Debug check for friendly mode articles
    const friendlyArticles = filteredAll.filter(a => 
      (a.mode || "moderate").toLowerCase().trim() === "friendly"
    );
    console.log(`[API Search] Found ${friendlyArticles.length} friendly mode articles`);
    if (friendlyArticles.length > 0) {
      console.log(`[API Search] Sample friendly articles: ${friendlyArticles.slice(0, 3).map(a => a.slug).join(', ')}`);
    }
    
    // Debug cookie dan query parameters
    console.log(`[API Search] Requested mode: ${mode || 'not specified'}`);
    if (req.cookies) {
      const themeModeFromCookie = req.cookies.get('theme_mode')?.value;
      console.log(`[API Search] Cookie theme_mode: ${themeModeFromCookie || 'not found'}`);
    }
    
    if (mode === "friendly" || mode === "moderate") {
      console.log(`[API Search] Filtering for mode: ${mode}`);
      filteredAll = filteredAll.filter(a => {
        const articleMode = (a.mode || "moderate").toLowerCase().trim();
        
        // Jika dalam friendly mode, hanya tampilkan artikel friendly
        if (mode === "friendly") {
          return articleMode === "friendly";
        }
        
        // Jika dalam moderate mode, tampilkan semua artikel
        return true;
      });
      
      console.log(`[API Search] After filtering: ${filteredAll.length} articles for mode ${mode}`);
      
      // Tampilkan sampel artikel yang tersisa setelah filtering
      if (filteredAll.length > 0) {
        console.log(`[API Search] Sample filtered articles: ${filteredAll.slice(0, 3).map(a => `${a.slug} (${a.mode || 'moderate'})`).join(', ')}`);
      }
    }

    // Proyeksi ringan: hindari payload besar
    const docs = filteredAll.map((a) => ({
      slug: a.slug,
      title: a.title || "",
      excerpt: a.excerpt || "",
      tags: Array.isArray(a.tags) ? a.tags : [],
      category: a.category || "",
      date: a.date || null,
      readTime: typeof a.readTime === "number" ? a.readTime : null,
      views: typeof a.views === "number" ? a.views : null,
      mode: a.mode || "moderate", // Penting: sertakan mode untuk filter client-side
    }));

    // Skoring sederhana namun efektif
    const scored = docs.map((d) => ({
      ...d,
      _score: scoreDoc(d, q, terms),
    }));

    // Ambil yang relevan saja
    const filtered = scored
      .filter((r) => r._score > 0)
      .sort(
        (a, b) =>
          b._score - a._score ||
          (new Date(b.date || 0) - new Date(a.date || 0))
      )
      .slice(0, limit)
      .map(({ _score, ...rest }) => rest);

    return withCache(
      NextResponse.json({
        q: qRaw,
        total: filtered.length,
        results: filtered,
      })
    );
  } catch (err) {
    // Jangan bocorkan error internal
    return NextResponse.json(
      { error: "Search error" },
      { status: 500 }
    );
  }
}

/* ===================== Helpers ===================== */

function withCache(res) {
  // Cache di edge/Vercel demi performa, tapi tetap segar
  res.headers.set(
    "Cache-Control",
    // 60 detik fresh, 5 menit stale-while-revalidate
    "public, s-maxage=60, stale-while-revalidate=300"
  );
  return res;
}

function scoreDoc(d, q, terms) {
  let s = 0;

  const title = d.title.toLowerCase();
  const excerpt = d.excerpt.toLowerCase();
  const category = (d.category || "").toLowerCase();
  const tags = (d.tags || []).map((t) => String(t).toLowerCase());

  // Cocokkan frasa penuh
  if (title.includes(q)) s += 50;
  if (excerpt.includes(q)) s += 15;

  // Cocokkan per-kata (memberi bobot tiap term)
  for (const t of terms) {
    if (title.includes(t)) s += 10;
    if (excerpt.includes(t)) s += 3;
    if (category.includes(t)) s += 2;
    if (tags.some((tg) => tg.includes(t))) s += 4;
  }

  // Bonus kecil untuk tag/category match penuh
  if (tags.some((tg) => tg.includes(q))) s += 8;
  if (category.includes(q)) s += 5;

  // Bonus recency
  const dt = d.date ? new Date(d.date) : null;
  if (dt && !isNaN(dt)) {
    const ageDays = (Date.now() - dt.getTime()) / 86_400_000;
    if (ageDays <= 7) s += 6;
    else if (ageDays <= 30) s += 4;
    else if (ageDays <= 180) s += 2;
  }

  // Bonus kecil untuk popularitas (views) — log scale
  if (typeof d.views === "number" && d.views > 0) {
    s += Math.min(5, Math.floor(Math.log10(1 + d.views)));
  }

  return s;
}
