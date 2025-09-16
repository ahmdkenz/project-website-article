// lib/github.js
import matter from "gray-matter";

/* =========================
   ENV & Konstanta
   ========================= */
const REPO = (process.env.GITHUB_REPO || "").trim();            // "owner/repo"
const BRANCH = (process.env.GITHUB_BRANCH || "main").trim();
const TOKEN = (process.env.GITHUB_TOKEN || "").trim();
const USE_LOCAL = String(process.env.USE_LOCAL_CONTENT || "").toLowerCase() === "true";
const CONTENT_BASE_RAW = (process.env.CONTENT_BASE || "").trim(); // opsional (monorepo)
const GH_HEADERS = TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {};
const RAW_BASE = REPO ? `https://raw.githubusercontent.com/${REPO}/${BRANCH}` : "";

/* =========================
   Helpers path + utils
   ========================= */
function normalizeSlashes(s) {
  return (s || "").toString().replace(/^\/+|\/+$/g, "");
}

function norm(str = "") {
  return (str || "").toString().toLowerCase().trim();
}

/** Normalisasi nilai mode dari frontmatter */
function normMode(v) {
  if (v === undefined || v === null) return null;
  const s = String(v).toLowerCase().trim();
  if (s === "friendly" || s === "moderate") return s;
  // Legacy support: konversi 'both' ke 'moderate'
  if (s === "both") return "moderate";
  return null;
}

/**
 * Hitung direktori "content/articles" dengan aman.
 */
function computeArticlesDir(base) {
  const b = normalizeSlashes(base || "");
  if (!b) return "content/articles";

  if (/(^|\/)content\/articles(\/|$)/.test(b)) return b;
  if (/(^|\/)content(\/|$)/.test(b)) {
    const idx = b.indexOf("content");
    const prefix = b.slice(0, idx + "content".length);
    return `${prefix}/articles`;
  }
  return `${b}/content/articles`;
}

const ARTICLES_DIR = computeArticlesDir(CONTENT_BASE_RAW);

/* =========================
   Normalisasi meta helper
   ========================= */
function normalizeMeta(meta = {}, folderName = null) {
  const slugFromMeta = meta?.slug ? String(meta.slug).trim() : null;
  const rawSlug = slugFromMeta || (folderName || "").replace(/^\d{4}-\d{2}-\d{2}-/, "");
  const slug = rawSlug ? String(rawSlug).trim() : null;

  // tags: accept array or single-line bracket style; ensure array of strings
  let tags = [];
  if (Array.isArray(meta?.tags)) {
    tags = meta.tags.map((t) => (t === undefined || t === null ? "" : String(t).trim())).filter(Boolean);
  } else if (typeof meta?.tags === "string") {
    // try to parse comma-separated or bracket-styled "[a, b]"
    const cleaned = meta.tags.replace(/[\[\]]/g, "");
    tags = cleaned.split(",").map((t) => t.trim()).filter(Boolean);
  } else {
    tags = [];
  }

  // excerpt: ensure string (trim) and no embedded nulls
  let excerpt = meta?.excerpt ?? "";
  if (typeof excerpt !== "string") excerpt = String(excerpt || "");
  excerpt = excerpt.replace(/\0/g, "").trim();

  // category, title, date
  const title = meta?.title ? String(meta.title).trim() : (slug || "");
  const date = meta?.date ? String(meta.date).trim() : null;
  const category = meta?.category ? String(meta.category).trim() : null;

  // mode: normalized to 'friendly' or 'moderate', default to 'moderate'
  let mode = normMode(meta?.mode);
  if (!mode) mode = "moderate";

  // cover will be handled by caller (local/remote)
  const cover = meta?.cover ?? null;

  return { slug, title, date, tags, excerpt, category, mode, cover };
}

/* =========================
   Local FS helpers
   ========================= */
async function listLocalArticles() {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const baseAbs = path.join(process.cwd(), normalizeSlashes(ARTICLES_DIR));

  let entries = [];
  try {
    entries = await fs.readdir(baseAbs, { withFileTypes: true });
  } catch {
    return [];
  }

  const folders = entries.filter((e) => e.isDirectory()).map((e) => e.name);
  const items = [];

  for (const folder of folders) {
    const filePath = path.join(baseAbs, folder, "index.mdx");
    try {
      const source = await fs.readFile(filePath, "utf-8");
      const { data: meta } = matter(source);

      const nm = normalizeMeta(meta, folder);

      // Cover lokal: jangan ubah relatif menjadi absolute; biarkan apa adanya (frontend tahu base)
      const cover = nm.cover && !/^https?:\/\//i.test(nm.cover) ? nm.cover.replace(/\\/g, "/") : nm.cover || null;

      items.push({
        folderName: folder,
        slug: nm.slug,
        title: nm.title,
        date: nm.date,
        tags: nm.tags,
        excerpt: nm.excerpt,
        cover,
        category: nm.category,
        mode: nm.mode, // null jika tidak ada / invalid
      });
    } catch (err) {
      // skip folder tanpa index.mdx atau parse error
      // optionally log in dev
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.warn(`[listLocalArticles] skip ${folder}: ${err?.message || err}`);
      }
    }
  }

  items.sort((a, b) => new Date(b.date || "1970-01-01") - new Date(a.date || "1970-01-01"));
  return items;
}

async function getLocalArticleMDX(slug) {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const all = await listLocalArticles();
  const found = all.find((a) => a.slug === slug);
  if (!found) return null;

  const filePath = path.join(process.cwd(), normalizeSlashes(ARTICLES_DIR), found.folderName, "index.mdx");
  try {
    const source = await fs.readFile(filePath, "utf-8");
    const { data: meta, content } = matter(source);

    const nm = normalizeMeta(meta, found.folderName);
    let cover = nm.cover || found.cover || null;
    if (cover && !/^https?:\/\//i.test(cover)) cover = cover.replace(/\\/g, "/");

    return { meta: { ...meta, slug: nm.slug, cover }, content };
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(`[getLocalArticleMDX] failed ${slug}: ${err?.message || err}`);
    }
    return null;
  }
}

/* =========================
   Remote (GitHub) helpers
   ========================= */
async function listRemoteFolders() {
  if (!REPO) throw new Error("Missing GITHUB_REPO");
  const url = `https://api.github.com/repos/${REPO}/contents/${normalizeSlashes(ARTICLES_DIR)}?ref=${encodeURIComponent(BRANCH)}`;
  const res = await fetch(url, { headers: GH_HEADERS, next: { tags: ["articles"] } });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`[GitHub] listRemoteFolders failed: ${res.status} ${body}`);
  }
  const json = await res.json();
  return (json || []).filter((x) => x?.type === "dir").map((d) => d.name);
}

async function listRemoteArticles() {
  if (!REPO) throw new Error("Missing GITHUB_REPO");
  const folders = await listRemoteFolders();
  const items = [];

  for (const folder of folders) {
    const rawUrl = `${RAW_BASE}/${normalizeSlashes(ARTICLES_DIR)}/${folder}/index.mdx`;
    const r = await fetch(rawUrl, { headers: GH_HEADERS, next: { tags: ["articles"] } });
    if (!r.ok) {
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.warn(`[listRemoteArticles] skip ${rawUrl}: ${r.status}`);
      }
      continue;
    }
    const source = await r.text();
    const { data: meta } = matter(source);

    const nm = normalizeMeta(meta, folder);

    // Cover remote: jika relatif, jadikan absolut ke RAW_BASE (root repo)
    const cover =
      nm.cover
        ? (/^https?:\/\//i.test(nm.cover) ? nm.cover : `${RAW_BASE}/${nm.cover.replace(/^\/+/, "")}`)
        : null;

    items.push({
      folderName: folder,
      slug: nm.slug,
      title: nm.title,
      date: nm.date,
      tags: nm.tags,
      excerpt: nm.excerpt,
      cover,
      category: nm.category,
      mode: nm.mode,
    });
  }

  items.sort((a, b) => new Date(b.date || "1970-01-01") - new Date(a.date || "1970-01-01"));
  return items;
}

async function getRemoteArticleMDX(slug) {
  if (!REPO) throw new Error("Missing GITHUB_REPO");
  const all = await listRemoteArticles();
  const found = all.find((a) => a.slug === slug);
  if (!found) return null;

  const rawUrl = `${RAW_BASE}/${normalizeSlashes(ARTICLES_DIR)}/${found.folderName}/index.mdx`;
  const r = await fetch(rawUrl, { headers: GH_HEADERS, next: { tags: ["articles"] } });
  if (!r.ok) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(`[getRemoteArticleMDX] missing ${rawUrl}: ${r.status}`);
    }
    return null;
  }
  const source = await r.text();
  const { data: meta, content } = matter(source);

  const nm = normalizeMeta(meta, found.folderName);
  const cover =
    nm.cover
      ? (/^https?:\/\//i.test(nm.cover) ? nm.cover : `${RAW_BASE}/${nm.cover.replace(/^\/+/, "")}`)
      : found.cover || null;

  return { meta: { ...meta, slug: nm.slug, cover }, content };
}

/* =========================
   Public API (dipakai oleh lib/data)
   ========================= */
export async function listArticles() {
  if (USE_LOCAL || !REPO) return listLocalArticles();
  try {
    return await listRemoteArticles();
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("[GitHub] remote failed, fallback to local:", e?.message || e);
    }
    return listLocalArticles();
  }
}

export async function getArticleMDX(slug) {
  if (USE_LOCAL || !REPO) return getLocalArticleMDX(slug);
  try {
    return await getRemoteArticleMDX(slug);
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("[GitHub] get remote failed, fallback to local:", e?.message || e);
    }
    return getLocalArticleMDX(slug);
  }
}
