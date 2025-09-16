// lib/search.js
// Utility pencarian terpadu (Articles, Terms, Flashcards)
// Diupdate: tidak lagi membaca data/articles.json, melainkan memakai lib/data.

import { getAllArticles, getAllFlashcards, getAllTerms, filterByMode } from "@/lib/data";

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
    if (t.includes(q)) score += 2; // substring
    if (new RegExp(`\\b${escapeRegExp(q)}\\b`, "i").test(t)) score += 5; // whole word
    if (t.startsWith(q)) score += 1; // prefix
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
    const a = await getAllArticles();
    articles = Array.isArray(a) ? a : [];
  } catch (err) {
    console.warn("loadAll: getAllArticles failed:", err?.message || err);
    articles = [];
  }

  try {
    const f = await getAllFlashcards();
    flashcards = Array.isArray(f) ? f : [];
  } catch (err) {
    console.warn("loadAll: getAllFlashcards failed:", err?.message || err);
    flashcards = [];
  }

  try {
    const t = await getAllTerms();
    termsObj = t && typeof t === "object" ? t : {};
  } catch (err) {
    console.warn("loadAll: getAllTerms failed:", err?.message || err);
    termsObj = {};
  }

  const terms = Object.values(termsObj || {}).flat();
  return { articles, flashcards, terms };
}

/* -------------------------
   Main search function
   ------------------------- */
export async function searchAll(query, mode) {
  const q = normalize(query || "");
  const tokens = tokenize(q);

  const { articles, flashcards, terms } = await loadAll();

  // Filter articles by mode: show articles with mode === current mode
  // Legacy: articles with mode === 'both' are shown in all modes
  let filteredArticles = articles || [];
  if (mode === "friendly" || mode === "moderate") {
    filteredArticles = (articles || []).filter(a => {
      const m = (a.mode || "moderate").toLowerCase().trim();
      return m === mode || m === "both"; // 'both' is for legacy support
    });
  }

  // default top lists when no query
  if (!q || tokens.length === 0) {
    return {
      articles: (filteredArticles || []).slice(0, 20),
      terms: (terms || []).slice(0, 20),
      flashcards: (flashcards || []).slice(0, 20),
    };
  }

  const rankedArticles = (filteredArticles || [])
    .map((a) => {
      // source text: title, excerpt, any raw content if present, category, tags
      const title = a.title || "";
      const excerpt = a.excerpt || "";
      // some article sources may include a 'content' property or contentFriendly/contentModerate
      const content =
        (a.content || "") +
        " " +
        (a.contentFriendly || "") +
        " " +
        (a.contentModerate || "");
      const meta = (a.category || "") + " " + (Array.isArray(a.tags) ? a.tags.join(" ") : "");
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

  const rankedTerms = (terms || [])
    .map((t) => {
      const name = t.term || "";
      const aliases = Array.isArray(t.aliases) ? t.aliases.join(" ") : "";
      const defs = (t.definition || "") + " " + (t.definitionFriendly || "") + " " + (t.definitionModerate || "");
      const score =
        scoreMatch(name, tokens) * 3 +
        scoreMatch(aliases, tokens) * 2 +
        scoreMatch(defs, tokens);
      return { item: t, score };
    })
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score)
    .map((x) => x.item);

  const rankedFlashcards = (flashcards || [])
    .map((c) => {
      const term = c.term || c.front || "";
      const back = (c.back || "") + " " + (c.definitionFriendly || "") + " " + (c.definitionModerate || "");
      const score = scoreMatch(term, tokens) * 3 + scoreMatch(back, tokens);
      return { item: c, score };
    })
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score)
    .map((x) => x.item);

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
    id: c.id || c.term || c.front,
    term: c.term || c.front || "",
    back: c.back || "",
    definitionFriendly: c.definitionFriendly || "",
    definitionModerate: c.definitionModerate || "",
    topic: c.topic || null,
  };
}
