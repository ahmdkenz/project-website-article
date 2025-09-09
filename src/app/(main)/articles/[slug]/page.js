// app/(main)/articles/[slug]/page.js
import { notFound } from "next/navigation";
import { getAllArticles } from "@/lib/data";
import ArticleContentClient from "@/components/ArticleContentClient";
import RelatedArticles from "@/components/RelatedArticles";
import ReadingProgress from "@/components/ReadingProgress";
import BookmarkButton from "@/components/BookmarkButton";
import Comments from "@/components/Comments"; 
import QuickReactions from "@/components/QuickReactions";


export const revalidate = 60;

function scoreRelated(base, cand) {
  if (!cand || cand.slug === base.slug) return -1;
  const baseTags = new Set((base.tags || []).map((t) => String(t).toLowerCase()));
  const candTags = new Set((cand.tags || []).map((t) => String(t).toLowerCase()));
  let shared = 0;
  for (const t of candTags) if (baseTags.has(t)) shared++;
  const sameCategory =
    (base.category || "").toLowerCase() === (cand.category || "").toLowerCase()
      ? 1
      : 0;
  return shared * 2 + sameCategory;
}

export default async function ArticleDetailPage({ params }) {
  const { slug } = params;
  const all = await getAllArticles();
  const article = all.find((a) => a.slug === slug);
  if (!article) notFound();

  const related = [...all]
    .filter((a) => a.slug !== slug)
    .map((a) => ({ a, s: scoreRelated(article, a) }))
    .filter(({ s }) => s > 0)
    .sort((x, y) => y.s - x.s || new Date(y.a.date || 0) - new Date(x.a.date || 0))
    .slice(0, 3)
    .map(({ a }) => a);

  const dateText = article?.date
    ? new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(
        new Date(article.date)
      )
    : "";

  return (
    <>
      <ReadingProgress />

      {/* Hero: Judul + Bookmark sejajar */}
      <section className="hero small" style={{ marginBottom: "2rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "1rem",
            flexWrap: "wrap",
            borderBottom: "1px solid var(--border-color)",
            paddingBottom: "1rem",
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.6rem", marginBottom: ".35rem", lineHeight: 1.35 }}>
              {article.title}
            </h2>
            {dateText && <p className="muted">{dateText}</p>}
          </div>

          {/* Tombol bookmark di kanan judul */}
          <BookmarkButton slug={article.slug} />
        </div>
      </section>

      {/* Konten artikel */}
      <main
        style={{
          marginTop: "1rem",
          maxWidth: "800px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <ArticleContentClient article={article} />
      </main>

{/* ✅ Reaksi cepat */}
<div style={{ maxWidth: "800px", margin: "0 auto" }}>
  <QuickReactions slug={article.slug} />
</div>

      {/* ✅ Komentar artikel (localStorage per slug) */}
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <Comments slug={article.slug} />
      </div>

      {/* Related Articles */}
      <RelatedArticles items={related} />
    </>
  );
}
