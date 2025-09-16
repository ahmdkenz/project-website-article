// src/app/api/robots/route.js
import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yukliterasikeuangan.id';
  
  const robotsTxt = `# Robots.txt for Yuk Literasi Keuangan
# Generated automatically

User-agent: *
Allow: /

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay for politeness
Crawl-delay: 1

# Allow all search engines to crawl our content
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

User-agent: DuckDuckBot
Allow: /

User-agent: Baiduspider
Allow: /

# Block specific paths if needed
# Disallow: /api/
# Disallow: /_next/
# Disallow: /admin/

# Allow specific files
Allow: /manifest.json
Allow: /sw.js
Allow: /robots.txt
Allow: /sitemap.xml

# Block spam bots (add more as needed)
User-agent: AhrefsBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: DotBot
Disallow: /

# Additional information
# This is a financial education website providing free content
# Contact: support@yukliterasikeuangan.id
# Last updated: ${new Date().toISOString().split('T')[0]}
`;

  return new NextResponse(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache for 24 hours
    },
  });
}