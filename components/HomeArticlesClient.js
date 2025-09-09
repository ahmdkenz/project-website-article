// components/HomeArticlesClient.js — CLIENT COMPONENT
"use client";

import Link from 'next/link';

function ArticleCard({ a }) {
  return (
    <article className="article-card">
      <div className="article-content">
        <h3>{a.title}</h3>
        {a.excerpt && <p className="muted">{a.excerpt}</p>}
        <div className="meta" style={{ display: 'flex', gap: '.35rem', flexWrap: 'wrap' }}>
          {a.category ? <span className="badge">{a.category}</span> : null}
          {Array.isArray(a.tags) ? a.tags.slice(0, 4).map(t => (
            <span className="tag" key={t}>#{t}</span>
          )) : null}
          {a.readTime ? <span className="tag">{a.readTime} min</span> : null}
        </div>
        <div className="card-actions" style={{ marginTop: '.75rem' }}>
          <Link href={`/articles/${a.slug}`} className="btn btn-ghost">
            Baca Selengkapnya
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function HomeArticlesClient({ latest = [], popular = [] }) {
  return (
    <>
      <section
        className="homepage-articles"
        style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem' }}
      >
        <h2>🆕 Artikel Terbaru</h2>
        <div className="articles-list" id="latestArticlesContainer">
          {latest.length ? latest.map(a => <ArticleCard key={a.slug} a={a} />) : <p className="muted">Belum ada artikel.</p>}
        </div>
      </section>

      <section
        className="homepage-articles"
        style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem' }}
      >
        <h2>🔥 Artikel Populer</h2>
        <div className="articles-list" id="popularArticlesContainer">
          {popular.length ? popular.map(a => <ArticleCard key={a.slug} a={a} />) : <p className="muted">Belum ada artikel.</p>}
        </div>
      </section>
    </>
  );
}
