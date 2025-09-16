// lib/data.js
import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import { listArticles, getArticleMDX } from "@/lib/github";
import { serialize } from "next-mdx-remote/serialize";
import Only from "@/components/mdx/Only";

// ====== Articles (pakai MDX / GitHub) ======

export async function getAllArticles() {
  const articles = await listArticles();
  return Array.isArray(articles) ? articles : [];
}

export async function getArticleBySlug(slug) {
  const article = await getArticleMDX(slug);
  return article || null;
}

// ====== Mode helpers ======

function norm(str = "") {
  return (str || "").toString().toLowerCase().trim();
}

/**
 * Normalisasi nilai mode. Jika kosong/invalid -> 'moderate' (konservatif).
 * Hanya mengizinkan 'friendly' | 'moderate'.
 */
export function normMode(v) {
  if (!v) return "moderate";
  const s = String(v).toLowerCase().trim();
  if (s === "friendly" || s === "moderate") return s;
  return "moderate";
}

/**
 * Filter artikel berdasarkan mode:
 * - HANYA artikel dengan mode yang sama persis yang ditampilkan
 * - jika article.mode missing -> treat as 'moderate' (konfigurasi konservatif)
 * 
 * STRICT MODE: Tidak lagi menampilkan mode 'both' di kedua mode.
 * Hanya mode yang sama persis yang akan ditampilkan.
 */
export function filterByMode(articles = [], mode = "moderate") {
  const m = normMode(mode);
  return (articles || []).filter((a) => {
    // Normalize mode atau gunakan default 'moderate'
    let aMode = a?.mode;
    if (!aMode) aMode = "moderate";
    aMode = aMode.toLowerCase().trim();
    
    // STRICT: hanya tampilkan artikel dengan mode yang sama persis
    return aMode === m;
  });
}

// ====== Flashcards (masih dari JSON) ======

const mdxComponents = {
  Only,
};

// Fungsi untuk membaca file MDX dan mengembalikan metadata serta konten
async function readMdxFilesWithContent(dir) {
  const directoryPath = path.join(process.cwd(), dir);
  const files = await fs.readdir(directoryPath);

  const data = await Promise.all(
    files.map(async (file) => {
      const filePath = path.join(directoryPath, file);
      const content = await fs.readFile(filePath, "utf8");
      const { data: metadata, content: mdxContent } = matter(content);
      const serializedContent = await serialize(mdxContent, { components: mdxComponents });
      return { ...metadata, content: serializedContent };
    })
  );

  return data;
}

export async function getAllFlashcards() {
  const flashcards = await readMdxFilesWithContent("data/flashcards");
  return Array.isArray(flashcards) ? flashcards : [];
}

// ====== Terms (masih dari JSON) ======

export async function getAllTerms() {
  const terms = await readMdxFilesWithContent("data/terms");
  return Array.isArray(terms) ? terms : [];
}

// ===== Helpers =====

export function filterArticles(articles, { category = null, tags = [] } = {}) {
  const cat = category ? norm(category) : null;
  const tagSet = new Set(tags.map(norm));
  return (articles || []).filter((a) => {
    const matchCat = cat ? norm(a.category) === cat : true;
    const aTags = Array.isArray(a.tags) ? a.tags.map(norm) : [];
    const matchTags =
      tagSet.size > 0
        ? Array.from(tagSet).every((t) => aTags.includes(t))
        : true;
    return matchCat && matchTags;
  });
}

/**
 * Ambil latest N artikel dari array (urut berdasarkan tanggal desc).
 * Opsi: mode -> jika diberikan, akan mem-filter hasil berdasarkan mode.
 */
export function getLatest(articles = [], count = 6, { mode = null } = {}) {
  const list = Array.isArray(articles) ? [...articles] : [];
  if (mode) {
    return filterByMode(list, mode)
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      .slice(0, count);
  }
  return list
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0, count);
}

/**
 * Ambil popular N artikel berdasarkan views map (object slug -> views).
 * Jika viewsMap tidak ada, fallback ke tanggal terbaru.
 * Opsi: mode -> jika diberikan, akan mem-filter hasil berdasarkan mode.
 */
export function getPopular(articles = [], viewsMap = {}, count = 6, { mode = null } = {}) {
  const list = Array.isArray(articles) ? [...articles] : [];
  let scored = list.map((a) => {
    const v = viewsMap && typeof viewsMap[a.slug] !== "undefined" ? Number(viewsMap[a.slug]) : 0;
    return { a, v };
  });

  // kalau mode, filter dulu
  if (mode) {
    const allowed = new Set(filterByMode(list, mode).map((x) => x.slug));
    scored = scored.filter(({ a }) => allowed.has(a.slug));
  }

  scored.sort((x, y) => {
    if (y.v !== x.v) return y.v - x.v;
    // tie-breaker: tanggal terbaru dulu
    return new Date(y.a.date || 0) - new Date(x.a.date || 0);
  });

  return scored.slice(0, count).map((x) => x.a);
}

export function relatedArticles(allArticles, article, limit = 3) {
  if (!article) return [];
  const baseTags = new Set((article.tags || []).map(norm));
  const sameCategory = norm(article.category);
  const scored = (allArticles || [])
    .filter((a) => a.slug !== article.slug)
    .map((a) => {
      const aTags = new Set((a.tags || []).map(norm));
      let score = 0;
      for (const t of baseTags) {
        if (aTags.has(t)) score += 2;
      }
      if (norm(a.category) === sameCategory) score += 1;
      return { item: a, score };
    });
  return scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.item);
}
