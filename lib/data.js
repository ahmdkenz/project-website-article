// lib/data.js
import fs from "fs/promises";
import path from "path";
import { listArticles, getArticleMDX } from "@/lib/github";

// ====== Articles (pakai MDX / GitHub) ======

export async function getAllArticles() {
  const articles = await listArticles();
  return Array.isArray(articles) ? articles : [];
}

export async function getArticleBySlug(slug) {
  const article = await getArticleMDX(slug);
  return article || null;
}

// ====== Flashcards (masih dari JSON) ======

async function readJsonFile(fileName) {
  const filePath = path.join(process.cwd(), "data", fileName);
  const fileData = await fs.readFile(filePath, "utf8");
  return JSON.parse(fileData);
}

export async function getAllFlashcards() {
  const flashcards = await readJsonFile("flashcards.json");
  return Array.isArray(flashcards) ? flashcards : [];
}

// ====== Terms (masih dari JSON) ======

export async function getAllTerms() {
  // terms.json biasanya per-kategori: { "Obligasi": [ ... ], "Saham": [ ... ] }
  const termsObj = await readJsonFile("terms.json");
  return termsObj || {};
}

// ===== Helpers =====

function normalize(str) {
  return (str || "").toString().toLowerCase().trim();
}

export function filterArticles(articles, { category = null, tags = [] } = {}) {
  const cat = category ? normalize(category) : null;
  const tagSet = new Set(tags.map(normalize));
  return (articles || []).filter((a) => {
    const matchCat = cat ? normalize(a.category) === cat : true;
    const aTags = Array.isArray(a.tags) ? a.tags.map(normalize) : [];
    const matchTags =
      tagSet.size > 0
        ? Array.from(tagSet).every((t) => aTags.includes(t))
        : true;
    return matchCat && matchTags;
  });
}

export function relatedArticles(allArticles, article, limit = 3) {
  if (!article) return [];
  const baseTags = new Set((article.tags || []).map(normalize));
  const sameCategory = normalize(article.category);
  const scored = (allArticles || [])
    .filter((a) => a.slug !== article.slug)
    .map((a) => {
      const aTags = new Set((a.tags || []).map(normalize));
      let score = 0;
      for (const t of baseTags) if (aTags.has(t)) score += 2;
      if (normalize(a.category) === sameCategory) score += 1;
      return { item: a, score };
    });
  return scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.item);
}
