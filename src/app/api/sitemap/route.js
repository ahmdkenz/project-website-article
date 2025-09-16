// src/app/api/sitemap/route.js
import { NextResponse } from 'next/server';
import { listArticles } from '@/lib/github';

export async function GET() {
  try {
    // Get all articles
    const articles = await listArticles();
    
    // Base URL - should come from environment variable in production
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yukliterasikeuangan.id';
    
    // Static pages
    const staticPages = [
      {
        loc: baseUrl,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: '1.0'
      },
      {
        loc: `${baseUrl}/articles`,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: '0.9'
      },
      {
        loc: `${baseUrl}/dictionary`,
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: '0.8'
      },
      {
        loc: `${baseUrl}/flashcards`,
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: '0.8'
      },
      {
        loc: `${baseUrl}/about`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: '0.6'
      },
      {
        loc: `${baseUrl}/yuk-literasi`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: '0.6'
      }
    ];

    // Article pages
    const articlePages = articles.map(article => ({
      loc: `${baseUrl}/articles/${article.slug}`,
      lastmod: article.updatedAt || article.publishedAt || new Date().toISOString(),
      changefreq: 'monthly',
      priority: '0.7'
    }));

    // Language variations
    const languages = ['id', 'en', 'ms'];
    const languagePages = [];
    
    languages.forEach(lang => {
      if (lang !== 'id') { // Skip default language
        staticPages.forEach(page => {
          languagePages.push({
            ...page,
            loc: page.loc.replace(baseUrl, `${baseUrl}/${lang}`)
          });
        });
        
        articlePages.forEach(page => {
          languagePages.push({
            ...page,
            loc: page.loc.replace(baseUrl, `${baseUrl}/${lang}`)
          });
        });
      }
    });

    // Combine all pages
    const allPages = [...staticPages, ...articlePages, ...languagePages];

    // Generate XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${allPages.map(page => `  <url>
    <loc>${page.loc}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
${languages.length > 1 ? languages.map(lang => {
  const hreflang = lang === 'id' ? 'id-ID' : lang === 'en' ? 'en-US' : 'ms-MY';
  const href = lang === 'id' ? page.loc : page.loc.replace(baseUrl, `${baseUrl}/${lang}`);
  return `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${href}" />`;
}).join('\n') : ''}
  </url>`).join('\n')}
</urlset>`;

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new NextResponse('Error generating sitemap', { status: 500 });
  }
}