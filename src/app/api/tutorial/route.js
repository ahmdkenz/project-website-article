import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import yaml from 'js-yaml';
import { NextResponse } from 'next/server';

// Configure gray-matter to use yaml.load instead of yaml.safeLoad
matter.engines.yaml = (input) => yaml.load(input);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    console.log(`Received slug: ${slug}`); // Log the slug value

    if (!slug) {
      return NextResponse.json({ error: 'Slug tutorial diperlukan' }, { status: 400 });
    }

    // Membersihkan slug jika memiliki ekstensi file
    let cleanSlug = slug;
    if (slug.endsWith('.md') || slug.endsWith('.mdx')) {
      cleanSlug = slug.substring(0, slug.lastIndexOf('.'));
    }
    
    console.log(`Clean slug: ${cleanSlug}`); // Log the cleaned slug
    
    // Bangun path ke file markdown atau mdx
    const filePathMd = path.join(process.cwd(), 'content', 'yuk-literasi', `${cleanSlug}.md`);
    const filePathMdx = path.join(process.cwd(), 'content', 'yuk-literasi', `${cleanSlug}.mdx`);
    
    // Juga cek di folder quizzes
    const quizFilePathMdx = path.join(process.cwd(), 'content', 'quizzes', `${cleanSlug}.mdx`);
    
    console.log(`Looking for files:`, { filePathMd, filePathMdx, quizFilePathMdx }); // Log file paths

    // Periksa apakah file ada (md atau mdx)
    let filePath = null;
    if (fs.existsSync(filePathMd)) {
      filePath = filePathMd;
      console.log(`Found MD file: ${filePathMd}`);
    } else if (fs.existsSync(filePathMdx)) {
      filePath = filePathMdx;
      console.log(`Found MDX file: ${filePathMdx}`);
    } else if (fs.existsSync(quizFilePathMdx)) {
      filePath = quizFilePathMdx;
      console.log(`Found Quiz MDX file: ${quizFilePathMdx}`);
    } else {
      console.error(`File not found for slug: ${cleanSlug}`); // Log file not found
      return NextResponse.json({ error: 'Tutorial tidak ditemukan' }, { status: 404 });
    }

    // Baca konten file
    const fileContents = fs.readFileSync(filePath, 'utf8');
    
    // Parse frontmatter dan konten markdown
    const { data, content } = matter(fileContents);

    // Kembalikan data dan konten
    return NextResponse.json({
      metadata: data,
      content,
      steps: data.steps || [] // Tambahkan langkah-langkah jika tersedia
    });
    
  } catch (error) {
    console.error('Kesalahan saat mengambil tutorial:', error.message, error.stack);
    return NextResponse.json({ error: 'Gagal memuat tutorial. Silakan coba lagi nanti.' }, { status: 500 });
  }
}