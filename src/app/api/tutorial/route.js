import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'Tutorial slug is required' }, { status: 400 });
    }

    // Build path to the markdown file
    const filePath = path.join(process.cwd(), 'content', 'yuk-literasi', `${slug}.md`);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Tutorial not found' }, { status: 404 });
    }

    // Read file content
    const fileContents = fs.readFileSync(filePath, 'utf8');
    
    // Parse markdown frontmatter and content
    const { data, content } = matter(fileContents);

    // Return the data and content
    return NextResponse.json({
      metadata: data,
      content
    });
    
  } catch (error) {
    console.error('Error fetching tutorial:', error);
    return NextResponse.json({ error: 'Failed to load tutorial' }, { status: 500 });
  }
}