// app/(main)/articles/page.js
import { getAllArticles } from '@/lib/data';
import ArticleList from '@/components/ArticleList';
import Link from 'next/link';

export default async function ArticlesPage() {
  const articles = await getAllArticles();

  // kumpulkan semua tags unik
  const tagSet = new Set();
  articles.forEach((a) => {
    if (Array.isArray(a.tags)) a.tags.forEach((t) => tagSet.add(t));
  });
  const allTags = Array.from(tagSet).sort((a, b) => a.localeCompare(b));

  return (
    <>
      <section className="hero small">
        <h2>Kumpulan Artikel</h2>
        <p className="muted">
          Panduan, tips, dan pengetahuan finansial yang mudah dipahami.
        </p>
      </section>

      <ArticleList allArticles={articles} />

      {/* Tags Section sebelum footer */}
      {allTags.length > 0 && (
        <section
          className="tags-section"
          style={{
            marginTop: "2rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid var(--border-color)",
          }}
        >
          <h3 style={{ marginBottom: ".75rem" }}>Semua Tag</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem" }}>
            {allTags.map((t) => (
              <Link
                key={t}
                href={`/articles?tags=${encodeURIComponent(t)}`}
                className="tag"
              >
                #{t}
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
