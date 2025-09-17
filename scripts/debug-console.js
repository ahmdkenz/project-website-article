// scripts/debug-console.js
// Debug utility untuk mengecek data dan mode pada project

const { getAllFlashcards, getAllTerms, getAllArticles } = require('../lib/data');

async function debugAll() {
  console.log('=== DEBUG PROJECT WEBSITE ARTICLE ===');

  // Cek Flashcards
  const flashcards = await getAllFlashcards();
  console.log(`[DEBUG] Jumlah flashcard: ${flashcards.length}`);
  if (flashcards.length > 0) {
    console.log('[DEBUG] Contoh flashcard:', flashcards[0]);
  }

  // Cek Terms (Glosarium)
  const termsObj = await getAllTerms();
  const allTerms = Object.values(termsObj).flat();
  console.log(`[DEBUG] Jumlah istilah glosarium: ${allTerms.length}`);
  if (allTerms.length > 0) {
    console.log('[DEBUG] Contoh istilah:', allTerms[0]);
  }

  // Cek Articles
  const articles = await getAllArticles();
  console.log(`[DEBUG] Jumlah artikel: ${articles.length}`);
  if (articles.length > 0) {
    console.log('[DEBUG] Contoh artikel:', articles[0]);
  }

  // Cek distribusi mode pada flashcard
  const modeDist = flashcards.reduce((acc, f) => {
    if (f.definitionFriendly && f.definitionFriendly.trim()) acc.friendly++;
    if (f.definitionModerate && f.definitionModerate.trim()) acc.moderate++;
    return acc;
  }, { friendly: 0, moderate: 0 });
  console.log(`[DEBUG] Distribusi mode flashcard:`, modeDist);

  // Cek distribusi mode pada glosarium
  const modeDistTerms = allTerms.reduce((acc, t) => {
    if (t.definitionFriendly && t.definitionFriendly.trim()) acc.friendly++;
    if (t.definitionModerate && t.definitionModerate.trim()) acc.moderate++;
    return acc;
  }, { friendly: 0, moderate: 0 });
  console.log(`[DEBUG] Distribusi mode glosarium:`, modeDistTerms);

  // Cek distribusi mode pada artikel
  const modeDistArticles = articles.reduce((acc, a) => {
    const m = (a.mode || 'moderate').toLowerCase();
    acc[m] = (acc[m] || 0) + 1;
    return acc;
  }, {});
  console.log(`[DEBUG] Distribusi mode artikel:`, modeDistArticles);

  console.log('=== END DEBUG ===');
}

debugAll();
