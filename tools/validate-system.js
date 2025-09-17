// tools/validate-system.js
//
// Script untuk memvalidasi komponen utama sistem
// Jalankan dengan: node tools/validate-system.js

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Path utama
const ROOT_DIR = path.resolve(__dirname, '..');
const ARTICLES_DIR = path.join(ROOT_DIR, 'content', 'articles');
const FLASHCARDS_DIR = path.join(ROOT_DIR, 'data', 'flashcards');
const FLASHCARDS_JSON = path.join(ROOT_DIR, 'data', 'flashcards.json');
const TERMS_JSON = path.join(ROOT_DIR, 'data', 'terms.json');

console.log('======================================');
console.log('VALIDASI SISTEM WEBSITE');
console.log('======================================');
console.log('');

// Fungsi untuk mengekstrak konten mode
function extractModeContent(content, mode) {
  const regex = new RegExp(`<Only\\s+mode=["']${mode}["']>([\\s\\S]*?)</Only>`, 'gi');
  let allContent = '';
  let match;
  while ((match = regex.exec(content)) !== null) {
    if (match && match[1]) {
      allContent += match[1].trim() + '\n\n';
    }
  }
  return allContent.trim();
}

// Validasi artikel
async function validateArticles() {
  console.log('Validasi Artikel...');
  
  try {
    if (!fs.existsSync(ARTICLES_DIR)) {
      console.error('ERROR: Directory artikel tidak ditemukan:', ARTICLES_DIR);
      return false;
    }
    
    const dirEntries = fs.readdirSync(ARTICLES_DIR, { withFileTypes: true });
    const articleDirs = dirEntries.filter(dirent => dirent.isDirectory());
    console.log(`Menemukan ${articleDirs.length} direktori artikel`);
    
    let validArticles = 0;
    let invalidArticles = 0;
    let modeCount = { friendly: 0, moderate: 0, both: 0, undefined: 0 };
    
    for (const dirent of articleDirs) {
      const articleDir = path.join(ARTICLES_DIR, dirent.name);
      const indexPath = path.join(articleDir, 'index.mdx');
      
      if (!fs.existsSync(indexPath)) {
        console.warn(`- PERINGATAN: Tidak ada index.mdx di ${dirent.name}`);
        invalidArticles++;
        continue;
      }
      
      try {
        const fileContent = fs.readFileSync(indexPath, 'utf8');
        const { data: frontmatter } = matter(fileContent);
        
        // Cek frontmatter yang diperlukan
        const hasRequiredFields = frontmatter.title && frontmatter.slug;
        
        if (!hasRequiredFields) {
          console.warn(`- PERINGATAN: Artikel ${dirent.name} tidak memiliki title atau slug`);
          invalidArticles++;
          continue;
        }
        
        // Hitung mode
        const mode = frontmatter.mode || 'undefined';
        modeCount[mode] = (modeCount[mode] || 0) + 1;
        
        validArticles++;
      } catch (error) {
        console.error(`- ERROR: Gagal memproses artikel ${dirent.name}:`, error.message);
        invalidArticles++;
      }
    }
    
    console.log(`Artikel valid: ${validArticles}, tidak valid: ${invalidArticles}`);
    console.log(`Mode count: Friendly: ${modeCount.friendly}, Moderate: ${modeCount.moderate}, Both: ${modeCount.both}, Undefined: ${modeCount.undefined}`);
    
    return validArticles > 0;
  } catch (error) {
    console.error('ERROR validasi artikel:', error);
    return false;
  }
}

// Validasi flashcards
async function validateFlashcards() {
  console.log('\nValidasi Flashcards...');
  
  let jsonFlashcards = [];
  let mdxFlashcards = [];
  
  try {
    // Cek JSON
    if (fs.existsSync(FLASHCARDS_JSON)) {
      const jsonData = fs.readFileSync(FLASHCARDS_JSON, 'utf8');
      jsonFlashcards = JSON.parse(jsonData);
      console.log(`Menemukan ${jsonFlashcards.length} flashcard di flashcards.json`);
    } else {
      console.warn('PERINGATAN: File flashcards.json tidak ditemukan');
    }
    
    // Cek direktori MDX
    if (fs.existsSync(FLASHCARDS_DIR)) {
      const fileNames = fs.readdirSync(FLASHCARDS_DIR);
      const mdxFiles = fileNames.filter(name => name.endsWith('.mdx'));
      console.log(`Menemukan ${mdxFiles.length} file MDX di direktori flashcards`);
      
      for (const fileName of mdxFiles) {
        try {
          const filePath = path.join(FLASHCARDS_DIR, fileName);
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const { data: frontmatter, content } = matter(fileContent);
          
          const friendlyContent = extractModeContent(content, 'friendly');
          const moderateContent = extractModeContent(content, 'moderate');
          
          if (!frontmatter.term) {
            console.warn(`- PERINGATAN: Flashcard ${fileName} tidak memiliki term`);
            continue;
          }
          
          if (!friendlyContent && !moderateContent) {
            console.warn(`- PERINGATAN: Flashcard ${fileName} tidak memiliki konten dalam tag <Only>`);
          }
          
          mdxFlashcards.push({
            term: frontmatter.term,
            category: frontmatter.category,
            hasFriendly: !!friendlyContent,
            hasModerate: !!moderateContent
          });
        } catch (error) {
          console.error(`- ERROR: Gagal memproses flashcard ${fileName}:`, error.message);
        }
      }
    } else {
      console.warn('PERINGATAN: Direktori flashcards tidak ditemukan');
    }
    
    // Tampilkan statistik
    if (mdxFlashcards.length > 0) {
      const withFriendly = mdxFlashcards.filter(f => f.hasFriendly).length;
      const withModerate = mdxFlashcards.filter(f => f.hasModerate).length;
      const withBoth = mdxFlashcards.filter(f => f.hasFriendly && f.hasModerate).length;
      
      console.log(`Dari ${mdxFlashcards.length} flashcard MDX:`);
      console.log(`- Dengan konten Friendly: ${withFriendly}`);
      console.log(`- Dengan konten Moderate: ${withModerate}`);
      console.log(`- Dengan kedua konten: ${withBoth}`);
    }
    
    return jsonFlashcards.length > 0 || mdxFlashcards.length > 0;
  } catch (error) {
    console.error('ERROR validasi flashcards:', error);
    return false;
  }
}

// Validasi terms
async function validateTerms() {
  console.log('\nValidasi Terms (Glosarium)...');
  
  try {
    if (!fs.existsSync(TERMS_JSON)) {
      console.error('ERROR: File terms.json tidak ditemukan');
      return false;
    }
    
    const jsonData = fs.readFileSync(TERMS_JSON, 'utf8');
    const termsObject = JSON.parse(jsonData);
    const categories = Object.keys(termsObject);
    
    console.log(`Menemukan ${categories.length} kategori di terms.json`);
    
    let totalTerms = 0;
    let termsWithFriendly = 0;
    let termsWithModerate = 0;
    
    categories.forEach(category => {
      if (Array.isArray(termsObject[category])) {
        const terms = termsObject[category];
        totalTerms += terms.length;
        
        termsWithFriendly += terms.filter(t => t.definitionFriendly).length;
        termsWithModerate += terms.filter(t => t.definitionModerate).length;
        
        console.log(`- Kategori "${category}": ${terms.length} istilah`);
      }
    });
    
    console.log(`Total ${totalTerms} istilah`);
    console.log(`- Dengan definisi Friendly: ${termsWithFriendly}`);
    console.log(`- Dengan definisi Moderate: ${termsWithModerate}`);
    
    return totalTerms > 0;
  } catch (error) {
    console.error('ERROR validasi terms:', error);
    return false;
  }
}

// Validasi komponen
function validateComponents() {
  console.log('\nValidasi Komponen...');
  
  const requiredComponents = [
    { path: 'components/FlashcardList.js', name: 'FlashcardList' },
    { path: 'components/Flashcard.js', name: 'Flashcard' },
    { path: 'components/DictionaryList.js', name: 'DictionaryList' },
    { path: 'components/ArticleList.js', name: 'ArticleList' },
    { path: 'components/mdx/Only.js', name: 'Only (MDX)' },
    { path: 'context/ModeContext.js', name: 'ModeContext' },
    { path: 'lib/data.js', name: 'data.js' },
    { path: 'lib/search.js', name: 'search.js' }
  ];
  
  let missingComponents = [];
  
  for (const component of requiredComponents) {
    const componentPath = path.join(ROOT_DIR, component.path);
    if (!fs.existsSync(componentPath)) {
      missingComponents.push(component.name);
      console.error(`- ERROR: Komponen ${component.name} (${component.path}) tidak ditemukan`);
    }
  }
  
  if (missingComponents.length === 0) {
    console.log('Semua komponen yang diperlukan tersedia');
    return true;
  } else {
    console.error(`${missingComponents.length} komponen tidak ditemukan: ${missingComponents.join(', ')}`);
    return false;
  }
}

// Jalankan validasi
async function runValidation() {
  console.log('Memulai validasi sistem...\n');
  
  const componentsValid = validateComponents();
  const articlesValid = await validateArticles();
  const flashcardsValid = await validateFlashcards();
  const termsValid = await validateTerms();
  
  console.log('\n======================================');
  console.log('HASIL VALIDASI:');
  console.log('======================================');
  console.log(`Komponen: ${componentsValid ? '✅ VALID' : '❌ TIDAK VALID'}`);
  console.log(`Artikel: ${articlesValid ? '✅ VALID' : '❌ TIDAK VALID'}`);
  console.log(`Flashcards: ${flashcardsValid ? '✅ VALID' : '❌ TIDAK VALID'}`);
  console.log(`Terms/Glosarium: ${termsValid ? '✅ VALID' : '❌ TIDAK VALID'}`);
  
  const allValid = componentsValid && articlesValid && flashcardsValid && termsValid;
  console.log('\nKESIMPULAN:');
  console.log(allValid ? '✅ Sistem valid dan siap digunakan' : '❌ Sistem memiliki beberapa masalah, lihat pesan di atas');
  
  return allValid;
}

// Jalankan validasi
runValidation()
  .then(isValid => {
    process.exit(isValid ? 0 : 1);
  })
  .catch(error => {
    console.error('ERROR pada proses validasi:', error);
    process.exit(1);
  });