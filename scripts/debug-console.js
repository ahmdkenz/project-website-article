// scripts/debug-console.js
// Debug utility untuk mengecek data dan mode pada project

const { getAllFlashcards, getAllTerms, getAllArticles, getArticleBySlug } = require('../lib/data');
const { getStories } = require('../lib/server/stories');
const fs = require('fs');
const path = require('path');

async function debugAll() {
  console.log('=== DEBUG PROJECT WEBSITE ARTICLE ===');

  // 1. Cek Flashcards
  const flashcards = await getAllFlashcards();
  console.log(`[DEBUG] Jumlah flashcard: ${flashcards.length}`);
  if (flashcards.length > 0) {
    console.log('[DEBUG] Contoh flashcard:', flashcards[0]);
  }

  // 2. Cek Terms (Glosarium)
  const termsObj = await getAllTerms();
  const allTerms = Object.values(termsObj).flat();
  console.log(`[DEBUG] Jumlah istilah glosarium: ${allTerms.length}`);
  if (allTerms.length > 0) {
    console.log('[DEBUG] Contoh istilah:', allTerms[0]);
  }

  // 3. Cek Articles
  const articles = await getAllArticles();
  console.log(`[DEBUG] Jumlah artikel: ${articles.length}`);
  if (articles.length > 0) {
    console.log('[DEBUG] Contoh artikel:', articles[0]);
  }

  // 4. Cek distribusi mode pada artikel
  const modeDistArticles = articles.reduce((acc, a) => {
    const mode = (a.mode || 'moderate').toLowerCase();
    acc[mode] = (acc[mode] || 0) + 1;
    return acc;
  }, {});
  console.log(`[DEBUG] Distribusi mode artikel:`, modeDistArticles);

  // 5. Cek Tutorials
  const tutorialsDir = path.join(process.cwd(), 'content', 'yuk-literasi');
  if (fs.existsSync(tutorialsDir)) {
    const tutorialFiles = fs.readdirSync(tutorialsDir);
    console.log(`[DEBUG] Jumlah tutorial: ${tutorialFiles.length}`);
    if (tutorialFiles.length > 0) {
      console.log('[DEBUG] Contoh tutorial:', tutorialFiles[0]);
    }
  } else {
    console.warn('[DEBUG] Direktori tutorial tidak ditemukan.');
  }

  // 6. Cek Stories
  const stories = await getStories();
  console.log(`[DEBUG] Jumlah cerita: ${stories.length}`);
  if (stories.length > 0) {
    console.log('[DEBUG] Contoh cerita:', stories[0]);
  }

  // 7. Validasi file penting
  const requiredFiles = [
    'content/articles',
    'content/stories',
  ];
  requiredFiles.forEach((file) => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      console.log(`[DEBUG] File/direktori ditemukan: ${file}`);
    } else {
      console.warn(`[DEBUG] File/direktori TIDAK ditemukan: ${file}`);
    }
  });

  console.log('=== END DEBUG ===');
}

debugAll();
