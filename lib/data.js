// lib/data.js
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Fungsi untuk mengekstrak konten antara <Only mode="..."> tags
function extractModeContent(content, mode) {
  try {
    // Regex untuk mencari semua konten dalam tag Only dengan mode tertentu
    const regex = new RegExp(
      `<Only\\s+mode=["']${mode}["']>([\\s\\S]*?)</Only>`,
      'gi'
    );
    
    // Kumpulkan semua konten yang cocok
    let allContent = '';
    let match;
    while ((match = regex.exec(content)) !== null) {
      if (match && match[1]) {
        allContent += match[1].trim() + '\n\n';
      }
    }
    
    return allContent.trim();
  } catch (error) {
    console.error(`Error extracting ${mode} content:`, error);
    return '';
  }
}

// Fungsi untuk mendapatkan semua flashcards
export async function getAllFlashcards() {
  try {
    // Coba baca dari file JSON terlebih dahulu (lebih cepat)
    const flashcardsJsonPath = path.join(process.cwd(), 'data', 'flashcards.json');
    
    if (fs.existsSync(flashcardsJsonPath)) {
      const jsonData = fs.readFileSync(flashcardsJsonPath, 'utf8');
      const flashcards = JSON.parse(jsonData);
      console.log(`[getAllFlashcards] Loaded ${flashcards.length} flashcards from JSON`);
      return flashcards;
    }
    
    // Fallback ke pembacaan dari folder flashcards
    const flashcardsDir = path.join(process.cwd(), 'data', 'flashcards');
    
    if (!fs.existsSync(flashcardsDir)) {
      console.warn('[getAllFlashcards] Flashcards directory not found, returning empty array');
      return [];
    }

    const fileNames = fs.readdirSync(flashcardsDir);
    const mdxFiles = fileNames.filter(name => name.endsWith('.mdx'));
    console.log(`[getAllFlashcards] Found ${mdxFiles.length} MDX files in flashcards directory`);

    const flashcards = [];

    for (const fileName of mdxFiles) {
      try {
        const filePath = path.join(flashcardsDir, fileName);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const { data: frontmatter, content } = matter(fileContent);

        // Extract content for both modes using simple string parsing
        const friendlyContent = extractModeContent(content, 'friendly');
        const moderateContent = extractModeContent(content, 'moderate');

        const flashcard = {
          term: frontmatter.term || '',
          category: frontmatter.category || '',
          definitionFriendly: friendlyContent || '', // Pastikan tidak null
          definitionModerate: moderateContent || '', // Pastikan tidak null
        };

        flashcards.push(flashcard);
      } catch (error) {
        console.error(`[getAllFlashcards] Error processing flashcard file ${fileName}:`, error);
      }
    }

    // Sort by term for consistent ordering
    flashcards.sort((a, b) => a.term.localeCompare(b.term));
    console.log(`[getAllFlashcards] Processed ${flashcards.length} flashcards from MDX files`);
    
    return flashcards;
  } catch (error) {
    console.error('[getAllFlashcards] Error:', error);
    return [];
  }
}

// Fungsi untuk mendapatkan semua istilah/terms (glosarium)
export async function getAllTerms() {
  try {
    // Coba baca dari file JSON terlebih dahulu (lebih cepat)
    const termsJsonPath = path.join(process.cwd(), 'data', 'terms.json');
    
    if (fs.existsSync(termsJsonPath)) {
      const jsonData = fs.readFileSync(termsJsonPath, 'utf8');
      const termsObject = JSON.parse(jsonData);
      console.log(`[getAllTerms] Loaded terms from JSON with ${Object.keys(termsObject).length} categories`);
      return termsObject;
    }
    
    // Fallback ke pembacaan dari folder terms
    const termsDir = path.join(process.cwd(), 'data', 'terms');
    
    if (!fs.existsSync(termsDir)) {
      console.warn('[getAllTerms] Terms directory not found, returning empty object');
      return {};
    }

    const fileNames = fs.readdirSync(termsDir);
    const mdxFiles = fileNames.filter(name => name.endsWith('.mdx'));
    console.log(`[getAllTerms] Found ${mdxFiles.length} MDX files in terms directory`);

    const termsByCategory = {};

    for (const fileName of mdxFiles) {
      try {
        const filePath = path.join(termsDir, fileName);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const { data: frontmatter, content } = matter(fileContent);

        // Extract content for both modes
        const friendlyContent = extractModeContent(content, 'friendly');
        const moderateContent = extractModeContent(content, 'moderate');

        const category = frontmatter.category || 'Uncategorized';
        
        if (!termsByCategory[category]) {
          termsByCategory[category] = [];
        }

        termsByCategory[category].push({
          term: frontmatter.term || '',
          definitionFriendly: friendlyContent || '', // Pastikan tidak null
          definitionModerate: moderateContent || '', // Pastikan tidak null
        });
      } catch (error) {
        console.error(`[getAllTerms] Error processing term file ${fileName}:`, error);
      }
    }

    console.log(`[getAllTerms] Processed terms with ${Object.keys(termsByCategory).length} categories`);
    return termsByCategory;
  } catch (error) {
    console.error('[getAllTerms] Error:', error);
    return {};
  }
}

// Fungsi untuk mendapatkan semua artikel
export async function getAllArticles() {
  try {
    const articlesDir = path.join(process.cwd(), 'content', 'articles');
    
    if (!fs.existsSync(articlesDir)) {
      console.warn('[getAllArticles] Articles directory not found, returning empty array');
      return [];
    }

    const dirEntries = fs.readdirSync(articlesDir, { withFileTypes: true });
    const articleDirs = dirEntries.filter(dirent => dirent.isDirectory());
    console.log(`[getAllArticles] Found ${articleDirs.length} article directories`);
    
    const articles = [];

    for (const dirent of articleDirs) {
      try {
        const articleDir = path.join(articlesDir, dirent.name);
        const indexPath = path.join(articleDir, 'index.mdx');
        
        if (!fs.existsSync(indexPath)) {
          console.warn(`[getAllArticles] No index.mdx found in ${dirent.name}, skipping`);
          continue;
        }
        
        const fileContent = fs.readFileSync(indexPath, 'utf8');
        const { data: frontmatter } = matter(fileContent);
        
        const slug = frontmatter.slug || dirent.name;
        
        articles.push({
          ...frontmatter,
          slug,
          // Tambahkan mode jika tidak ada di frontmatter
          mode: frontmatter.mode || 'moderate',
        });
      } catch (error) {
        console.error(`[getAllArticles] Error processing article ${dirent.name}:`, error);
      }
    }
    
    console.log(`[getAllArticles] Processed ${articles.length} articles`);
    // Urutkan artikel berdasarkan tanggal, terbaru di awal
    articles.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    
    return articles;
  } catch (error) {
    console.error('[getAllArticles] Error:', error);
    return [];
  }
}

// Fungsi untuk mendapatkan artikel berdasarkan slug
export async function getArticleBySlug(slug) {
  try {
    // Cari di semua folder artikel
    const articlesDir = path.join(process.cwd(), 'content', 'articles');
    
    if (!fs.existsSync(articlesDir)) {
      console.warn(`[getArticleBySlug] Articles directory not found for slug: ${slug}`);
      return null;
    }
    
    // Cek dulu apakah slug adalah nama direktori
    let articleDir = path.join(articlesDir, slug);
    if (!fs.existsSync(articleDir)) {
      // Jika bukan, cari di semua direktori artikel yang memiliki slug yang cocok di frontmatter
      const dirEntries = fs.readdirSync(articlesDir, { withFileTypes: true });
      const articleDirs = dirEntries.filter(dirent => dirent.isDirectory());
      
      for (const dirent of articleDirs) {
        const currentDir = path.join(articlesDir, dirent.name);
        const indexPath = path.join(currentDir, 'index.mdx');
        
        if (fs.existsSync(indexPath)) {
          const fileContent = fs.readFileSync(indexPath, 'utf8');
          const { data: frontmatter } = matter(fileContent);
          
          if (frontmatter.slug === slug) {
            articleDir = currentDir;
            break;
          }
        }
      }
      
      if (articleDir === path.join(articlesDir, slug) && !fs.existsSync(articleDir)) {
        console.warn(`[getArticleBySlug] No directory found for slug: ${slug}`);
        return null;
      }
    }
    
    const indexPath = path.join(articleDir, 'index.mdx');
    
    if (!fs.existsSync(indexPath)) {
      console.warn(`[getArticleBySlug] No index.mdx found for slug: ${slug}`);
      return null;
    }
    
    const fileContent = fs.readFileSync(indexPath, 'utf8');
    const { data: meta, content } = matter(fileContent);
    
    // Ekstrak konten untuk kedua mode jika perlu
    const friendlyContent = meta.mode === 'friendly' ? content : extractModeContent(content, 'friendly');
    const moderateContent = meta.mode === 'moderate' ? content : extractModeContent(content, 'moderate');
    
    return { 
      meta, 
      content,
      contentFriendly: friendlyContent,
      contentModerate: moderateContent
    };
  } catch (error) {
    console.error(`[getArticleBySlug] Error for slug ${slug}:`, error);
    return null;
  }
}

// Fungsi untuk mendapatkan artikel terbaru
export async function getLatest(limit = 5) {
  const articles = await getAllArticles();
  
  return articles
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0, limit);
}

// Fungsi untuk mendapatkan artikel populer
export async function getPopular(limit = 5) {
  const articles = await getAllArticles();
  
  // Urutkan berdasarkan views jika tersedia, jika tidak berdasarkan tanggal
  return articles
    .sort((a, b) => {
      if (a.views !== undefined && b.views !== undefined) {
        return b.views - a.views;
      }
      return new Date(b.date || 0) - new Date(a.date || 0);
    })
    .slice(0, limit);
}

// Helper functions untuk mode
export function normMode(mode) {
  if (!mode) return 'moderate';
  const normalized = String(mode).toLowerCase().trim();
  return ['friendly', 'moderate'].includes(normalized) ? normalized : 'moderate';
}

// Fungsi filter berdasarkan mode
export function filterByMode(items, mode) {
  if (!Array.isArray(items) || !items.length) return [];
  
  const normalizedMode = normMode(mode);
  
  return items.filter(item => {
    const itemMode = normMode(item?.mode);
    // Tampilkan item yang modenya sesuai dengan mode saat ini
    return itemMode === normalizedMode || itemMode === 'both';
  });
}