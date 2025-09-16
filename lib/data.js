// lib/data.js
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Simple function to extract content between <Only mode="..."> tags
function extractModeContent(content, mode) {
  try {
    // Create regex to match <Only mode="targetMode">content</Only>
    const regex = new RegExp(
      `<Only\\s+mode=["']${mode}["']>([\\s\\S]*?)</Only>`,
      'gi'
    );
    const match = regex.exec(content);
    
    if (match && match[1]) {
      return match[1].trim();
    }
    
    return '';
  } catch (error) {
    console.error(`Error extracting ${mode} content:`, error);
    return '';
  }
}

export async function getAllFlashcards() {
  try {
    const flashcardsDir = path.join(process.cwd(), 'data', 'flashcards');
    
    if (!fs.existsSync(flashcardsDir)) {
      console.warn('Flashcards directory not found, returning empty array');
      return [];
    }

    const fileNames = fs.readdirSync(flashcardsDir);
    const mdxFiles = fileNames.filter(name => name.endsWith('.mdx'));

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
          definitionFriendly: friendlyContent,
          definitionModerate: moderateContent,
          // Keep raw content for client-side processing if needed
          rawContent: content,
          frontmatter
        };

        flashcards.push(flashcard);
      } catch (error) {
        console.error(`Error processing flashcard file ${fileName}:`, error);
      }
    }

    // Sort by term for consistent ordering
    flashcards.sort((a, b) => a.term.localeCompare(b.term));
    
    return flashcards;
  } catch (error) {
    console.error('Error in getAllFlashcards:', error);
    return [];
  }
}

// Additional helper functions
export function normMode(mode) {
  if (!mode) return 'moderate';
  const normalized = String(mode).toLowerCase().trim();
  return ['friendly', 'moderate'].includes(normalized) ? normalized : 'moderate';
}

// Placeholder functions for other expected exports  
export async function getAllArticles() {
  // Implementation would go here for articles
  return [];
}

export async function getArticleBySlug(slug) {
  // Implementation would go here for articles
  return null;
}

export async function getLatest(limit = 5) {
  // Implementation would go here for latest content
  return [];
}

export async function getPopular(limit = 5) {
  // Implementation would go here for popular content
  return [];
}

export async function getAllTerms() {
  // Implementation would go here for terms
  return [];
}

export function filterByMode(items, mode) {
  // Helper function for filtering by mode if needed
  return items;
}