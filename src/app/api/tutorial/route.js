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

    if (!slug) {
      return NextResponse.json({ error: 'Slug tutorial diperlukan' }, { status: 400 });
    }

    // Bangun path ke file markdown
    const filePath = path.join(process.cwd(), 'content', 'yuk-literasi', `${slug}.md`);

    // Periksa apakah file ada
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Tutorial tidak ditemukan' }, { status: 404 });
    }

    // Baca konten file
    const fileContents = fs.readFileSync(filePath, 'utf8');
    
    // Parse frontmatter dan konten markdown
    const { data, content } = matter(fileContents);

    // Kembalikan data dan konten
    return NextResponse.json({
      metadata: data,
      content
    });
    
  } catch (error) {
    console.error('Kesalahan saat mengambil tutorial:', error.message, error.stack);
    return NextResponse.json({ error: 'Gagal memuat tutorial. Silakan coba lagi nanti.' }, { status: 500 });
  }
}