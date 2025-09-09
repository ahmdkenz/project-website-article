// lib/search.js
// Utility pencarian terpadu (Articles, Terms, Flashcards)
// Catatan: dipanggil dari Server Components untuk membaca file di /data.

import fs from 'fs/promises';
import path from 'path';

function normalize(str) {
  return (str || '')
    .toString()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // hapus diakritik
    .replace(/[^\w\s-]/g, ' ')       // hilangkan simbol
    .replace(/\s+/g, ' ')            // normalisasi spasi
    .trim();
}

function tokenize(str) {
  return normalize(str).split(' ').filter(Boolean);
}

function scoreMatch(text, queryTokens) {
  // Skoring ringan: +2 substring, +5 kata utuh, +1 prefix
  const t = normalize(text);
  let score = 0;
  for (const q of queryTokens) {
    if (!q) continue;
    if (t.includes(q)) score += 2;
    if (new RegExp(`\\b${q}\\b`, 'i').test(t)) score += 5;
    if (t.startsWith(q)) score += 1;
  }
  return score;
}

async function readJsonFile(fileName) {
  const filePath = path.join(process.cwd(), 'data', fileName);
  const fileData = await fs.readFile(filePath, 'utf8');
  return JSON.parse(fileData);
}

export async function loadAll() {
  const [articles, flashcards, termsObj] = await Promise.all([
    readJsonFile('articles.json'),
    readJsonFile('flashcards.json'),
    readJsonFile('terms.json'),
  ]);
  const terms = Object.values(termsObj || {}).flat();
  return { articles: articles || [], flashcards: flashcards || [], terms: terms || [] };
}

export async function searchAll(query) {
  const q = normalize(query);
  const tokens = tokenize(q);
  const { articles, flashcards, terms } = await loadAll();

  if (!q || tokens.length === 0) {
    return {
      articles: articles.slice(0, 20),
      terms: terms.slice(0, 20),
      flashcards: flashcards.slice(0, 20),
    };
  }

  const rankedArticles = articles
    .map(a => {
      const score =
        scoreMatch(a.title, tokens) * 3 +
        scoreMatch(a.excerpt || '', tokens) * 2 +
        scoreMatch((a.contentFriendly || '') + ' ' + (a.contentModerate || ''), tokens) +
        scoreMatch((a.category || '') + ' ' + (Array.isArray(a.tags) ? a.tags.join(' ') : ''), tokens);
      return { item: a, score };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(x => x.item);

  const rankedTerms = terms
    .map(t => {
      const score =
        scoreMatch(t.term, tokens) * 3 +
        scoreMatch((t.aliases || []).join(' '), tokens) * 2 +
        scoreMatch((t.definitionFriendly || '') + ' ' + (t.definitionModerate || ''), tokens);
      return { item: t, score };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(x => x.item);

  const rankedFlashcards = flashcards
    .map(c => {
      const score =
        scoreMatch(c.term || c.front || '', tokens) * 3 +
        scoreMatch((c.back || '') + ' ' + (c.definitionFriendly || '') + ' ' + (c.definitionModerate || ''), tokens);
      return { item: c, score };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(x => x.item);

  return {
    articles: rankedArticles.slice(0, 50),
    terms: rankedTerms.slice(0, 50),
    flashcards: rankedFlashcards.slice(0, 50),
  };
}

// Ringkasan aman dikirim ke client (hindari HTML penuh)
export function buildSummaryForArticle(a) {
  return {
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt || '',
    date: a.date || '',
    category: a.category || null,
    tags: Array.isArray(a.tags) ? a.tags : [],
    readTime: a.readTime || null,
  };
}

export function buildSummaryForTerm(t) {
  return {
    id: t.id || t.term,
    term: t.term,
    aliases: Array.isArray(t.aliases) ? t.aliases : [],
    category: t.category || null,
    definitionFriendly: t.definitionFriendly || t.definition || '',
    definitionModerate: t.definitionModerate || t.definition || '',
  };
}

export function buildSummaryForCard(c) {
  return {
    id: c.id || c.term || c.front,
    term: c.term || c.front || '',
    back: c.back || '',
    definitionFriendly: c.definitionFriendly || '',
    definitionModerate: c.definitionModerate || '',
    topic: c.topic || null,
  };
}
