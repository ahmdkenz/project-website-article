// components/RelatedArticles.js
import Link from "next/link";

export default function RelatedArticles({ items = [] }) {
  if (!items.length) return null;

  return (
    <section
      className="related-articles"
      style={{
        marginTop: "2rem",
        paddingTop: "1.25rem",
        borderTop: "1px solid var(--border-color)",
      }}
    >
      <h3 style={{ marginBottom: ".75rem" }}>Artikel Terkait</h3>

      <div
        className="articles-list"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1rem",
        }}
      >
        {items.map((a) => (
          <article key={a.slug} className="article-card">
            <div className="article-content">
              <h4>{a.title}</h4>
              {a.excerpt ? <p className="muted">{a.excerpt}</p> : null}
              <div className="meta" style={{ display: "flex", gap: ".35rem", flexWrap: "wrap" }}>
                {a.category ? <span className="badge">{a.category}</span> : null}
                {Array.isArray(a.tags)
                  ? a.tags.slice(0, 4).map((t) => (
                      <span className="tag" key={t}>#{t}</span>
                    ))
                  : null}
              </div>
              <div className="card-actions" style={{ marginTop: ".6rem" }}>
                <Link href={`/articles/${a.slug}`} className="btn btn-ghost">
                  Baca Selengkapnya
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
