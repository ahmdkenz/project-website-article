// app/(main)/articles/[slug]/page.js
import { notFound } from "next/navigation";
import { getAllArticles } from "@/lib/data";
import ArticleContentClient from "@/components/ArticleContentClient";
import RelatedArticles from "@/components/RelatedArticles";
import ReadingProgress from "@/components/ReadingProgress";
import BookmarkButton from "@/components/BookmarkButton";
import ShareButtons from "@/components/ShareButtons";
import QuickReactions from "@/components/QuickReactions";
import Comments from "@/components/Comments";

/* ✅ import CSS Module khusus halaman ini */
import styles from "@/styles/articles-detail-modules.css";

export const revalidate = 60;

// skor related sederhana (tag + kategori)
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
      {/* Progress bar */}
      <ReadingProgress />

      {/* Wrapper halaman (scoped) */}
      <div className={styles.page}>
        {/* Header: judul + bookmark (pakai CSS Module) */}
        <section className={styles.header}>
          <div className={styles.headerInner}>
            <div style={{ flex: "1 1 auto", minWidth: 0 }}>
              <h2 className={styles.title}>{article.title}</h2>
              {dateText && <p className={`muted ${styles.date}`}>{dateText}</p>}
            </div>
            <div style={{ flex: "0 0 auto" }}>
              <BookmarkButton slug={article.slug} />
            </div>
          </div>
        </section>

        {/* Konten artikel (tidak pakai .container supaya tidak ketularan grid) */}
        <main className={styles.main} aria-label="Konten artikel">
          <ArticleContentClient article={article} />
        </main>

        {/* Share */}
        <div className={styles.section}>
          <ShareButtons title={article.title} slug={article.slug} />
        </div>

        {/* Reaksi cepat */}
        <div className={styles.section}>
          <QuickReactions slug={article.slug} />
        </div>

        {/* Komentar */}
        <div className={styles.section}>
          <Comments slug={article.slug} />
        </div>
      </div>

      {/* Related Articles di bawah (biarkan styling komponennya) */}
      <RelatedArticles items={related} />
    </>
  );
}
