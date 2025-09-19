import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Fungsi untuk mengambil semua cerita dari direktori content/stories/
export function getStories() {
  try {
    const storiesDir = path.join(process.cwd(), 'content/stories');
    
    // Periksa apakah direktori ada
    if (!fs.existsSync(storiesDir)) {
      return [];
    }
    
    const filenames = fs.readdirSync(storiesDir);

    return filenames.map((filename) => {
      const filePath = path.join(storiesDir, filename);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContents);

      return {
        slug: filename.replace('.mdx', ''),
        ...data,
        content,
      };
    });
  } catch (error) {
    console.error('Error reading stories:', error);
    return [];
  }
}

// Fungsi untuk mengambil satu cerita berdasarkan slug
export function getStoryBySlug(slug) {
  try {
    const storiesDir = path.join(process.cwd(), 'content/stories');
    const filePath = path.join(storiesDir, `${slug}.mdx`);
    
    // Periksa apakah file ada
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      ...data,
      content,
    };
  } catch (error) {
    console.error(`Error reading story ${slug}:`, error);
    return null;
  }
}