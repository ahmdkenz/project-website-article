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
   Helpers path
   ========================= */
function normalizeSlashes(s) {
  return s.replace(/^\/+|\/+$/g, "");
}

/**
 * Hitung direktori "content/articles" dengan aman.
 * - Default: "content/articles"
 * - Jika CONTENT_BASE berisi "content" → hasilkan "…/content/articles"
 * - Hindari duplikasi "content/content/articles"
 */
function computeArticlesDir(base) {
  const b = normalizeSlashes(base || "");
  if (!b) return "content/articles";

  // Jika sudah mengandung "content/articles" → gunakan apa adanya
  if (/(^|\/)content\/articles(\/|$)/.test(b)) return b;
  // Jika mengandung "content" → jadikan ".../content/articles"
  if (/(^|\/)content(\/|$)/.test(b)) {
    const idx = b.indexOf("content");
    const prefix = b.slice(0, idx + "content".length);
    return `${prefix}/articles`;
  }
  // Selain itu → tambahkan "content/articles" di belakang base
  return `${b}/content/articles`;
}

const ARTICLES_DIR = computeArticlesDir(CONTENT_BASE_RAW);

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

  const folders = entries.filter(e => e.isDirectory()).map(e => e.name);
  const items = [];

  for (const folder of folders) {
    const filePath = path.join(baseAbs, folder, "index.mdx");
    try {
      const source = await fs.readFile(filePath, "utf-8");
      const { data: meta } = matter(source);

      const slug = (meta?.slug || folder.replace(/^\d{4}-\d{2}-\d{2}-/, "")).toString();
      // Cover lokal: gunakan apa adanya (jangan diprefix "content/")
      const cover =
        meta?.cover && !/^https?:\/\//i.test(meta.cover)
          ? meta.cover.replace(/\\/g, "/")
          : meta?.cover || null;

      items.push({
        folderName: folder,
        slug,
        title: meta?.title || slug,
        date: meta?.date || null,
        tags: Array.isArray(meta?.tags) ? meta.tags : [],
        excerpt: meta?.excerpt || "",
        cover,
        category: meta?.category || null,
        mode: meta?.mode || null,
      });
    } catch {
      // skip folder tanpa index.mdx
    }
  }

  items.sort(
    (a, b) => new Date(b.date || "1970-01-01") - new Date(a.date || "1970-01-01")
  );
  return items;
}

async function getLocalArticleMDX(slug) {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const all = await listLocalArticles();
  const found = all.find(a => a.slug === slug);
  if (!found) return null;

  const filePath = path.join(
    process.cwd(),
    normalizeSlashes(ARTICLES_DIR),
    found.folderName,
    "index.mdx"
  );
  try {
    const source = await fs.readFile(filePath, "utf-8");
    const { data: meta, content } = matter(source);

    // Cover lokal: biarkan relatif seperti di frontmatter (mis. "assets/articles/.../cover.jpg")
    let cover = meta?.cover || found.cover || null;
    if (cover && !/^https?:\/\//i.test(cover)) cover = cover.replace(/\\/g, "/");

    return { meta: { ...meta, slug: found.slug, cover }, content };
  } catch {
    return null;
  }
}

/* =========================
   Remote (GitHub) helpers
   ========================= */
async function listRemoteFolders() {
  const url = `https://api.github.com/repos/${REPO}/contents/${normalizeSlashes(
    ARTICLES_DIR
  )}?ref=${encodeURIComponent(BRANCH)}`;

  const res = await fetch(url, { headers: GH_HEADERS, next: { tags: ["articles"] } });
  if (!res.ok) {
    const body = await res.text();
    console.warn("[GitHub] listRemoteFolders failed:", res.status, url, body);
    throw new Error(`Failed to list: ${res.status} ${body}`);
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
      console.warn("[GitHub] skip missing index.mdx:", r.status, rawUrl);
      continue;
    }
    const source = await r.text();
    const { data: meta } = matter(source);

    const slug = (meta?.slug || folder.replace(/^\d{4}-\d{2}-\d{2}-/, "")).toString();
    // Cover remote: jika relatif, jadikan absolut ke RAW_BASE (root repo)
    const cover =
      meta?.cover
        ? (/^https?:\/\//i.test(meta.cover) ? meta.cover : `${RAW_BASE}/${meta.cover.replace(/^\/+/, "")}`)
        : null;

    items.push({
      folderName: folder,
      slug,
      title: meta?.title || slug,
      date: meta?.date || null,
      tags: Array.isArray(meta?.tags) ? meta.tags : [],
      excerpt: meta?.excerpt || "",
      cover,
      category: meta?.category || null,
      mode: meta?.mode || null,
    });
  }

  items.sort(
    (a, b) => new Date(b.date || "1970-01-01") - new Date(a.date || "1970-01-01")
  );
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
    console.warn("[GitHub] getRemoteArticleMDX missing index.mdx:", r.status, rawUrl);
    return null;
  }
  const source = await r.text();
  const { data: meta, content } = matter(source);

  // Cover remote: jika relatif, absolutkan ke RAW_BASE
  let cover =
    meta?.cover
      ? (/^https?:\/\//i.test(meta.cover) ? meta.cover : `${RAW_BASE}/${meta.cover.replace(/^\/+/, "")}`)
      : found.cover || null;

  return { meta: { ...meta, slug: found.slug, cover }, content };
}

/* =========================
   Public API (dipakai oleh lib/data)
   ========================= */
export async function listArticles() {
  // Pakai lokal jika diminta atau REPO kosong
  if (USE_LOCAL || !REPO) return listLocalArticles();

  try {
    return await listRemoteArticles();
  } catch (e) {
    console.warn("[GitHub] remote failed, fallback to local:", e?.message || e);
    return listLocalArticles();
  }
}

export async function getArticleMDX(slug) {
  // Pakai lokal jika diminta atau REPO kosong
  if (USE_LOCAL || !REPO) return getLocalArticleMDX(slug);

  try {
    return await getRemoteArticleMDX(slug);
  } catch (e) {
    console.warn("[GitHub] get remote failed, fallback to local:", e?.message || e);
    return getLocalArticleMDX(slug);
  }
}
