// lib/search.js
// Utility pencarian terpadu (Articles, Terms, Flashcards)
// Mendukung pencarian berdasarkan mode (friendly/moderate)

import { getAllArticles, getAllFlashcards, getAllTerms, filterByMode, normMode } from "@/lib/data";

/* -------------------------
   Normalization & tokenizing
   ------------------------- */
function normalize(str) {
  return (str || "")
    .toString()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // hapus diakritik
    .replace(/[^\w\s-]/g, " ") // hilangkan simbol
    .replace(/\s+/g, " ") // normalisasi spasi
    .trim();
}

function tokenize(str) {
  return normalize(str).split(" ").filter(Boolean);
}

/* -------------------------
   Scoring helper
   ------------------------- */
function scoreMatch(text, queryTokens) {
  const t = normalize(text || "");
  let score = 0;
  for (const q of queryTokens) {
    if (!q) continue;
    if (t.includes(q)) score += 2; // substring match
    if (new RegExp(`\\b${escapeRegExp(q)}\\b`, "i").test(t)) score += 5; // whole word match
    if (t.startsWith(q)) score += 1; // prefix match
  }
  return score;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/* -------------------------
   Load data (dari lib/data) — robust
   ------------------------- */
export async function loadAll() {
  let articles = [];
  let flashcards = [];
  let termsObj = {};
  
  try {
    console.log('[search.js] Loading articles...');
    const a = await getAllArticles();
    articles = Array.isArray(a) ? a : [];
    console.log(`[search.js] Loaded ${articles.length} articles`);
  } catch (err) {
    console.error("[search.js] Error loading articles:", err?.message || err);
    articles = [];
  }

  try {
    console.log('[search.js] Loading flashcards...');
    const f = await getAllFlashcards();
    flashcards = Array.isArray(f) ? f : [];
    console.log(`[search.js] Loaded ${flashcards.length} flashcards`);
  } catch (err) {
    console.error("[search.js] Error loading flashcards:", err?.message || err);
    flashcards = [];
  }

  try {
    console.log('[search.js] Loading terms...');
    const t = await getAllTerms();
    termsObj = t && typeof t === "object" ? t : {};
    console.log(`[search.js] Loaded terms from ${Object.keys(termsObj).length} categories`);
  } catch (err) {
    console.error("[search.js] Error loading terms:", err?.message || err);
    termsObj = {};
  }

  // Flatten terms object untuk pencarian
  const terms = [];
  Object.entries(termsObj || {}).forEach(([category, categoryTerms]) => {
    if (Array.isArray(categoryTerms)) {
      categoryTerms.forEach(term => {
        terms.push({
          ...term,
          category
        });
      });
    }
  });
  
  console.log(`[search.js] Total flattened terms: ${terms.length}`);
  return { articles, flashcards, terms };
}

/* -------------------------
   Main search function
   ------------------------- */
export async function searchAll(query, mode) {
  const normalizedMode = normMode(mode);
  console.log(`[searchAll] Starting search with query: "${query}" and mode: "${normalizedMode}"`);
  
  const q = normalize(query || "");
  const tokens = tokenize(q);

  const { articles, flashcards, terms } = await loadAll();

  // Filter articles berdasarkan mode
  let filteredArticles = articles || [];
  if (normalizedMode) {
    console.log(`[searchAll] Filtering ${filteredArticles.length} articles by mode: ${normalizedMode}`);
    
    filteredArticles = filteredArticles.filter(a => {
      const articleMode = normMode(a.mode);
      // Tampilkan artikel dengan mode yang sama atau artikel "both" 
      return articleMode === normalizedMode || articleMode === 'both';
    });
    
    console.log(`[searchAll] After mode filtering: ${filteredArticles.length} articles`);
  }

  // Jika tidak ada query, tampilkan hasil default
  if (!q || tokens.length === 0) {
    console.log('[searchAll] Empty query, returning default results');
    return {
      articles: filteredArticles.slice(0, 20),
      terms: terms.slice(0, 20),
      flashcards: flashcards.slice(0, 20),
    };
  }

  console.log(`[searchAll] Searching with ${tokens.length} tokens: [${tokens.join(', ')}]`);

  // Ranking artikel
  const rankedArticles = filteredArticles
    .map((a) => {
      // Source text: title, excerpt, dan konten lainnya
      const title = a.title || "";
      const excerpt = a.excerpt || "";
      // Mungkin artikel memiliki property content atau contentFriendly/contentModerate
      let content = a.content || "";
      
      // Gunakan konten sesuai mode jika tersedia
      if (normalizedMode === 'friendly' && a.contentFriendly) {
        content = a.contentFriendly;
      } else if (normalizedMode === 'moderate' && a.contentModerate) {
        content = a.contentModerate;
      }
      
      // Metadata artikel (kategori, tags)
      const meta = (a.category || "") + " " + (Array.isArray(a.tags) ? a.tags.join(" ") : "");
      
      // Hitung skor dengan bobot berbeda untuk tiap bagian
      const score =
        scoreMatch(title, tokens) * 3 +
        scoreMatch(excerpt, tokens) * 2 +
        scoreMatch(content, tokens) +
        scoreMatch(meta, tokens);
      
      return { item: a, score };
    })
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score)
    .map((x) => x.item);

  // Ranking terms (glosarium)
  const rankedTerms = terms
    .map((t) => {
      // Pilih definisi berdasarkan mode
      const definition = normalizedMode === 'friendly' ? t.definitionFriendly : t.definitionModerate;
      
      const name = t.term || "";
      const aliases = Array.isArray(t.aliases) ? t.aliases.join(" ") : "";
      
      // Hitung skor
      const score =
        scoreMatch(name, tokens) * 3 +
        scoreMatch(aliases, tokens) * 2 +
        scoreMatch(definition, tokens) * 2 +
        scoreMatch(t.category || "", tokens);
      
      return { item: t, score };
    })
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score)
    .map((x) => x.item);

  // Ranking flashcards
  const rankedFlashcards = flashcards
    .map((c) => {
      // Pilih definisi berdasarkan mode
      const definition = normalizedMode === 'friendly' ? c.definitionFriendly : c.definitionModerate;
      
      const term = c.term || "";
      const category = c.category || "";
      
      // Hitung skor
      const score = 
        scoreMatch(term, tokens) * 3 + 
        scoreMatch(definition, tokens) * 2 + 
        scoreMatch(category, tokens);
      
      return { item: c, score };
    })
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score)
    .map((x) => x.item);

  console.log(`[searchAll] Search results: ${rankedArticles.length} articles, ${rankedTerms.length} terms, ${rankedFlashcards.length} flashcards`);
  
  return {
    articles: rankedArticles.slice(0, 50),
    terms: rankedTerms.slice(0, 50),
    flashcards: rankedFlashcards.slice(0, 50),
  };
}

/* -------------------------
   Summaries untuk client
   ------------------------- */
export function buildSummaryForArticle(a) {
  if (!a) return null;
  return {
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt || "",
    date: a.date || "",
    category: a.category || null,
    tags: Array.isArray(a.tags) ? a.tags : [],
    readTime: a.readTime || null,
    mode: a.mode || "moderate", // Mode artikel untuk filter di client
    views: a.views || 0, // Jumlah tampilan jika ada
  };
}

export function buildSummaryForTerm(t) {
  if (!t) return null;
  return {
    id: t.id || t.term,
    term: t.term,
    aliases: Array.isArray(t.aliases) ? t.aliases : [],
    category: t.category || null,
    definitionFriendly: t.definitionFriendly || t.definition || "",
    definitionModerate: t.definitionModerate || t.definition || "",
  };
}

export function buildSummaryForCard(c) {
  if (!c) return null;
  return {
    id: c.id || c.term,
    term: c.term || "",
    category: c.category || null,
    definitionFriendly: c.definitionFriendly || "",
    definitionModerate: c.definitionModerate || "",
  };
}
