// src/app/(main)/articles/[slug]/page.js
import { notFound } from "next/navigation";
import { getAllArticles, getArticleBySlug } from "@/lib/data";
import ArticleContentClient from "@/components/ArticleContentClient";
import RelatedArticles from "@/components/RelatedArticles";
import ReadingProgress from "@/components/ReadingProgress";
import BookmarkButton from "@/components/BookmarkButton";
import ShareButtons from "@/components/ShareButtons";
import QuickReactions from "@/components/QuickReactions";
import Comments from "@/components/Comments";
import ViewTracker from "@/components/ViewTracker";
import styles from "@/styles/articles-detail.module.css";

export const revalidate = 60;

// skor related sederhana (tag + kategori)
function scoreRelated(base, cand) {
  if (!cand || cand.slug === base.slug) return -1;
  const baseTags = new Set((base.tags || []).map((t) => String(t).toLowerCase()));
  const candTags = new Set((cand.tags || []).map((t) => String(t).toLowerCase()));
  let shared = 0;
  for (const t of candTags) if (baseTags.has(t)) shared++;
  const sameCategory =
    (base.category || "").toLowerCase() === (cand.category || "").toLowerCase() ? 1 : 0;
  return shared * 2 + sameCategory;
}

/* (Opsional, direkomendasikan) prerender semua slug */
export async function generateStaticParams() {
  const all = await getAllArticles(); // metadata list (tanpa content)
  return all.map((a) => ({ slug: a.slug }));
}

export default async function ArticleDetailPage({ params }) {
  // ✅ Next.js 15: dynamic API harus di-await
  const { slug } = await params;

  // 1) Ambil konten MDX untuk slug ini
  const result = await getArticleBySlug(slug); // { meta, content } dari lib/github
  if (!result) notFound();

  // 2) Map ke bentuk yang dipakai komponen lain
  const article = { ...result.meta, content: result.content };

  // 3) Ambil semua artikel (metadata) untuk related
  const all = await getAllArticles();
  const related = [...all]
    .filter((a) => a.slug !== slug)
    .map((a) => ({ a, s: scoreRelated(article, a) }))
    .filter(({ s }) => s > 0)
    .sort(
      (x, y) =>
        y.s - x.s ||
        new Date(y.a.date || 0).getTime() - new Date(x.a.date || 0).getTime()
    )
    .slice(0, 3)
    .map(({ a }) => a);

  const dateText = article?.date
    ? new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(article.date))
    : "";

  return (
    <>
      {/* Progress bar */}
      <ReadingProgress />

      {/* Tracker untuk increment view */}
      <ViewTracker slug={article.slug} />

      <div className={styles.page}>
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

        <main className={styles.main} aria-label="Konten artikel">
          <ArticleContentClient article={article} />
        </main>

        <div className={styles.section}>
          <ShareButtons title={article.title} slug={article.slug} />
        </div>

        <div className={styles.section}>
          <QuickReactions slug={article.slug} />
        </div>

        <div className={styles.section}>
          <Comments slug={article.slug} />
        </div>
      </div>

      <RelatedArticles items={related} />
    </>
  );
}
