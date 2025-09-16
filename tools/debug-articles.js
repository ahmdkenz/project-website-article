// Debug script untuk memeriksa artikel dan mode
const { getAllArticles } = require('../lib/data');

async function debugArticles() {
  try {
    console.log("Debugging artikel dan mode...");
    const articles = await getAllArticles();
    
    // Count by mode
    const modes = {};
    articles.forEach(article => {
      const mode = (article.mode || "moderate").toLowerCase().trim();
      modes[mode] = (modes[mode] || 0) + 1;
    });
    
    console.log("== JUMLAH ARTIKEL PER MODE ==");
    console.log(modes);
    
    // List semua artikel dengan mode
    console.log("\n== DAFTAR ARTIKEL DAN MODE ==");
    articles.forEach(article => {
      const mode = (article.mode || "moderate").toLowerCase().trim();
      console.log(`${article.slug}: ${mode}`);
    });

    // List artikel friendly mode
    console.log("\n== ARTIKEL FRIENDLY MODE ==");
    const friendlyArticles = articles.filter(a => {
      const mode = (a.mode || "moderate").toLowerCase().trim();
      return mode === "friendly";
    });
    
    if (friendlyArticles.length === 0) {
      console.log("TIDAK ADA ARTIKEL DENGAN MODE FRIENDLY!");
    } else {
      friendlyArticles.forEach(a => console.log(`${a.slug}: ${a.title}`));
    }
  } catch (err) {
    console.error("Error debugging articles:", err);
  }
}

debugArticles();