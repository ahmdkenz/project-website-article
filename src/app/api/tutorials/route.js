import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const tutorialsDir = path.join(process.cwd(), 'content', 'yuk-literasi');
    const files = fs.readdirSync(tutorialsDir);

    const tutorials = files.filter(f => f.endsWith('.md') || f.endsWith('.mdx')).map((file) => {
      const filePath = path.join(tutorialsDir, file);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data } = matter(fileContents);

      return {
        slug: file.replace(/\.(md|mdx)$/i, ''),
        title: data.title || 'Untitled',
        description: data.description || '',
        icon: data.icon || '📄',
        type: data.type || 'tutorial',
      };
    });

    return NextResponse.json(tutorials);
  } catch (error) {
    console.error('Error fetching tutorials:', error);
    return NextResponse.json({ error: 'Gagal memuat daftar tutorial.' }, { status: 500 });
  }
}