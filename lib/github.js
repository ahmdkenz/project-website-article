// lib/github.js
import matter from "gray-matter";

// ---- Remote (GitHub) config ----
const REPO = process.env.GITHUB_REPO;
const BRANCH = process.env.GITHUB_BRANCH || "main";
const ARTICLES_DIR = "content/articles";
const RAW_BASE = REPO ? `https://raw.githubusercontent.com/${REPO}/${BRANCH}` : "";
const GH_HEADERS = process.env.GITHUB_TOKEN
  ? { Authorization: `token ${process.env.GITHUB_TOKEN}` }
  : {};

// ---- Local fallback flag ----
const USE_LOCAL = process.env.USE_LOCAL_CONTENT === "true";

// ===== Helpers =====
function folderToSlug(folder) {
  return folder.replace(/^\d{4}-\d{2}-\d{2}-/, "");
}

// ===== LOCAL mode =====
async function listLocalArticles() {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const base = path.join(process.cwd(), "content", "articles");

  let dirs = [];
  try {
    const entries = await fs.readdir(base, { withFileTypes: true });
    dirs = entries.filter(e => e.isDirectory()).map(e => e.name);
  } catch {
    return [];
  }

  const items = [];
  for (const folder of dirs) {
    const filePath = path.join(base, folder, "index.mdx");
    try {
      const file = await fs.readFile(filePath, "utf-8");
      const { data: meta } = matter(file);
      const slug = meta?.slug || folderToSlug(folder);
      const cover = meta?.cover && !/^https?:\/\//.test(meta.cover)
        ? path.join("content", meta.cover).replace(/\\/g, "/") // biar aman di Win
        : meta?.cover || null;

      items.push({
        folderName: folder,
        slug,
        title: meta?.title || slug,
        date: meta?.date || null,
        tags: meta?.tags || [],
        excerpt: meta?.excerpt || "",
        cover,
      });
    } catch {
      // skip folder tanpa index.mdx
    }
  }

  items.sort((a, b) => new Date(b.date || "1970-01-01") - new Date(a.date || "1970-01-01"));
  return items;
}

async function getLocalArticleMDX(slug) {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const base = path.join(process.cwd(), "content", "articles");

  // cari folder yang cocok
  const list = await listLocalArticles();
  const found = list.find(x => x.slug === slug);
  if (!found) return null;

  const filePath = path.join(base, found.folderName, "index.mdx");
  try {
    const file = await fs.readFile(filePath, "utf-8");
    const { data: meta, content } = matter(file);
    let cover = meta?.cover || found.cover || null;
    if (cover && !/^https?:\/\//.test(cover)) {
      cover = path.join("content", cover).replace(/\\/g, "/");
    }
    return { meta: { ...meta, slug: found.slug, cover }, content };
  } catch {
    return null;
  }
}

// ===== REMOTE (GitHub) mode =====
async function listRemoteFolders() {
  const url = `https://api.github.com/repos/${REPO}/contents/${ARTICLES_DIR}?ref=${BRANCH}`;
  const res = await fetch(url, { headers: GH_HEADERS, next: { tags: ["articles"] } });
  if (!res.ok) throw new Error(`Failed to list: ${res.status} ${await res.text()}`);
  const items = await res.json();
  return items.filter(x => x.type === "dir").map(d => d.name);
}

async function listRemoteArticles() {
  const folders = await listRemoteFolders();
  const items = [];
  for (const folder of folders) {
    const rawUrl = `${RAW_BASE}/${ARTICLES_DIR}/${folder}/index.mdx`;
    const r = await fetch(rawUrl, { headers: GH_HEADERS, next: { tags: ["articles"] } });
    if (!r.ok) continue;
    const file = await r.text();
    const { data: meta } = matter(file);
    const slug = meta?.slug || folderToSlug(folder);
    const cover = meta?.cover
      ? (/^https?:\/\//.test(meta.cover) ? meta.cover : `${RAW_BASE}/${meta.cover}`)
      : null;

    items.push({
      folderName: folder,
      slug,
      title: meta?.title || slug,
      date: meta?.date || null,
      tags: meta?.tags || [],
      excerpt: meta?.excerpt || "",
      cover,
    });
  }
  items.sort((a, b) => new Date(b.date || "1970-01-01") - new Date(a.date || "1970-01-01"));
  return items;
}

async function getRemoteArticleMDX(slug) {
  const list = await listRemoteArticles();
  const found = list.find(x => x.slug === slug);
  if (!found) return null;

  const rawUrl = `${RAW_BASE}/${ARTICLES_DIR}/${found.folderName}/index.mdx`;
  const r = await fetch(rawUrl, { headers: GH_HEADERS, next: { tags: ["articles"] } });
  if (!r.ok) return null;
  const file = await r.text();
  const { data: meta, content } = matter(file);
  const cover = meta?.cover
    ? (/^https?:\/\//.test(meta.cover) ? meta.cover : `${RAW_BASE}/${meta.cover}`)
    : found.cover || null;

  return { meta: { ...meta, slug: found.slug, cover }, content };
}

// ===== Public API (dipakai halaman) =====
export async function listArticles() {
  if (USE_LOCAL) return listLocalArticles();
  return listRemoteArticles();
}

export async function getArticleMDX(slug) {
  if (USE_LOCAL) return getLocalArticleMDX(slug);
  return getRemoteArticleMDX(slug);
}
