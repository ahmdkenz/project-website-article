// lib/data.js
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { compileMDX } from 'next-mdx-remote/rsc';
import Only from '@/components/mdx/Only';

const mdxComponents = {
  Only,
};

// Helper function to read all MDX files from a directory
function getMDXFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs.readdirSync(dir).filter(file => file.endsWith('.mdx'));
}

// Helper function to parse MDX file and extract content (simplified for flashcards/terms)
function parseMDXFileSimple(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);

    return {
      meta: data,
      rawContent: content,
    };
  } catch (error) {
    console.error(`Error parsing MDX file ${filePath}:`, error);
    return null;
  }
}

// Helper function to parse MDX file and extract content (for articles)
async function parseMDXFile(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);
    
    // Compile MDX content
    const { content: compiledContent } = await compileMDX({
      source: content,
      components: mdxComponents,
      options: {
        parseFrontmatter: false,
      },
    });

    return {
      meta: data,
      content: compiledContent,
      rawContent: content,
    };
  } catch (error) {
    console.error(`Error parsing MDX file ${filePath}:`, error);
    return null;
  }
}

// Function to extract content for specific mode from raw MDX content
function extractContentByMode(rawContent, mode = 'moderate') {
  if (!rawContent) return '';
  
  // Extract content between <Only mode="..."> tags
  const friendlyMatch = rawContent.match(/<Only\s+mode="friendly"[^>]*>([\s\S]*?)<\/Only>/);
  const moderateMatch = rawContent.match(/<Only\s+mode="moderate"[^>]*>([\s\S]*?)<\/Only>/);
  
  if (mode === 'friendly' && friendlyMatch) {
    return friendlyMatch[1].trim();
  }
  
  if (mode === 'moderate' && moderateMatch) {
    return moderateMatch[1].trim();
  }
  
  // Default to moderate if mode not found
  if (moderateMatch) {
    return moderateMatch[1].trim();
  }
  
  // Fallback to friendly if moderate not found
  if (friendlyMatch) {
    return friendlyMatch[1].trim();
  }
  
  return rawContent.trim();
}

// Get all flashcards from MDX files
export async function getAllFlashcards() {
  const flashcardsDir = path.join(process.cwd(), 'data', 'flashcards');
  const files = getMDXFiles(flashcardsDir);
  
  const flashcards = [];
  
  for (const file of files) {
    const filePath = path.join(flashcardsDir, file);
    const parsed = parseMDXFileSimple(filePath);
    
    if (parsed && parsed.meta) {
      flashcards.push({
        term: parsed.meta.term || '',
        category: parsed.meta.category || '',
        definitionFriendly: extractContentByMode(parsed.rawContent, 'friendly'),
        definitionModerate: extractContentByMode(parsed.rawContent, 'moderate'),
        definition: extractContentByMode(parsed.rawContent, 'moderate'), // Default to moderate
        slug: file.replace('.mdx', ''),
      });
    }
  }
  
  return flashcards;
}

// Get all terms from MDX files
export async function getAllTerms() {
  const termsDir = path.join(process.cwd(), 'data', 'terms');
  const files = getMDXFiles(termsDir);
  
  const terms = [];
  
  for (const file of files) {
    const filePath = path.join(termsDir, file);
    const parsed = parseMDXFileSimple(filePath);
    
    if (parsed && parsed.meta) {
      terms.push({
        term: parsed.meta.term || '',
        category: parsed.meta.category || '',
        definitionFriendly: extractContentByMode(parsed.rawContent, 'friendly'),
        definitionModerate: extractContentByMode(parsed.rawContent, 'moderate'),
        definition: extractContentByMode(parsed.rawContent, 'moderate'), // Default to moderate
        slug: file.replace('.mdx', ''),
      });
    }
  }
  
  return terms;
}

// Get all articles from MDX files (existing functionality)
export async function getAllArticles() {
  const articlesDir = path.join(process.cwd(), 'content', 'articles');
  
  if (!fs.existsSync(articlesDir)) {
    return [];
  }
  
  const articleFolders = fs.readdirSync(articlesDir).filter(folder => {
    const folderPath = path.join(articlesDir, folder);
    return fs.statSync(folderPath).isDirectory();
  });
  
  const articles = [];
  
  for (const folder of articleFolders) {
    const filePath = path.join(articlesDir, folder, 'index.mdx');
    
    if (fs.existsSync(filePath)) {
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const { data } = matter(fileContent);
        
        articles.push({
          article: {
            ...data,
            slug: data.slug || folder,
          },
        });
      } catch (error) {
        console.error(`Error reading article ${folder}:`, error);
      }
    }
  }
  
  return articles;
}

// Get a specific article by slug
export async function getArticleBySlug(slug) {
  const articlesDir = path.join(process.cwd(), 'content', 'articles');
  
  // Try to find the article folder that contains this slug
  if (!fs.existsSync(articlesDir)) {
    return null;
  }
  
  const articleFolders = fs.readdirSync(articlesDir).filter(folder => {
    const folderPath = path.join(articlesDir, folder);
    return fs.statSync(folderPath).isDirectory();
  });
  
  for (const folder of articleFolders) {
    const filePath = path.join(articlesDir, folder, 'index.mdx');
    
    if (fs.existsSync(filePath)) {
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(fileContent);
        
        // Check if this is the article we're looking for
        if (data.slug === slug || folder === slug) {
          const { content: compiledContent } = await compileMDX({
            source: content,
            components: mdxComponents,
            options: {
              parseFrontmatter: false,
            },
          });
          
          return {
            meta: {
              ...data,
              slug: data.slug || folder,
            },
            content: compiledContent,
          };
        }
      } catch (error) {
        console.error(`Error reading article ${folder}:`, error);
      }
    }
  }
  
  return null;
}

// Helper function to filter data by mode (for backwards compatibility)
export function filterByMode(data, mode = 'moderate') {
  if (!Array.isArray(data)) {
    return data;
  }
  
  return data.map(item => {
    if (item.definitionFriendly && item.definitionModerate) {
      return {
        ...item,
        definition: mode === 'friendly' ? item.definitionFriendly : item.definitionModerate,
      };
    }
    return item;
  });
}

// Normalize mode value
export function normMode(mode) {
  if (!mode || typeof mode !== 'string') {
    return 'moderate';
  }
  const normalized = mode.toLowerCase().trim();
  return normalized === 'friendly' ? 'friendly' : 'moderate';
}

// Get latest articles
export function getLatest(articles, limit = 6, options = {}) {
  if (!Array.isArray(articles)) {
    return [];
  }
  
  // Sort by date (newest first)
  const sorted = [...articles].sort((a, b) => {
    const dateA = new Date(a.date || 0);
    const dateB = new Date(b.date || 0);
    return dateB - dateA;
  });
  
  const result = limit ? sorted.slice(0, limit) : sorted;
  
  // Apply mode filter if specified
  if (options.mode && options.mode !== 'moderate') {
    return filterByMode(result, options.mode);
  }
  
  return result;
}

// Get popular articles (by views)
export function getPopular(articles, viewsMap = {}, limit = 6, options = {}) {
  if (!Array.isArray(articles)) {
    return [];
  }
  
  // Sort by views (highest first)
  const sorted = [...articles].sort((a, b) => {
    const viewsA = viewsMap[a.slug] || 0;
    const viewsB = viewsMap[b.slug] || 0;
    return viewsB - viewsA;
  });
  
  const result = limit ? sorted.slice(0, limit) : sorted;
  
  // Apply mode filter if specified
  if (options.mode && options.mode !== 'moderate') {
    return filterByMode(result, options.mode);
  }
  
  return result;
}