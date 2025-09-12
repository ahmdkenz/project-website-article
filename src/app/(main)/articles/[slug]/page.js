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

/** Skor related sederhana: tag (2 poin/tag yang sama) + 1 poin jika kategori sama */
function scoreRelated(base, cand) {
  if (!base || !cand || cand.slug === base.slug) return -1;
  const baseTags = new Set((base.tags || []).map((t) => String(t).toLowerCase()));
  const candTags = new Set((cand.tags || []).map((t) => String(t).toLowerCase()));
  let shared = 0;
  for (const t of candTags) if (baseTags.has(t)) shared++;
  const sameCategory =
    (base.category || "").toLowerCase() === (cand.category || "").toLowerCase() ? 1 : 0;
  return shared * 2 + sameCategory;
}

/** (Opsional) Prerender semua slug untuk ISR */
export async function generateStaticParams() {
  try {
    const all = await getAllArticles();
    if (!Array.isArray(all)) {
      console.warn("generateStaticParams: getAllArticles tidak mengembalikan array.");
      return [];
    }
    return all
      .filter((a) => a?.slug)
      .map((a) => ({ slug: String(a.slug) }));
  } catch (e) {
    console.warn("generateStaticParams gagal:", e);
    return [];
  }
}

export const dynamicParams = true;

/** (Opsional) Metadata berbasis slug */
export async function generateMetadata({ params }) {
  const { slug } = await params; // <- Dynamic APIs async
  if (!slug) return { title: "Artikel" };
  return { title: `Artikel: ${slug}` };
}

export default async function ArticleDetailPage({ params }) {
  // ✅ Next.js 15: params adalah Promise di Server Components → wajib di-await
  const { slug } = await params;

  // Guard ekstra: pastikan slug valid
  if (!slug || typeof slug !== "string") {
    console.warn("ArticleDetailPage: slug tidak valid:", slug);
    notFound();
  }

  let articleData;
  let allArticlesData = [];

  try {
    // 1) Ambil konten MDX untuk slug ini
    const result = await getArticleBySlug(slug);
    if (!result || !result.meta) {
      notFound();
    }

    // 2) Normalisasi data artikel untuk komponen client
    articleData = { ...result.meta, content: result.content, slug };

    // 3) Ambil semua artikel (metadata) untuk related
    const all = await getAllArticles();
    allArticlesData = Array.isArray(all) ? all : [];
    if (!Array.isArray(all)) {
      console.warn("Related: getAllArticles bukan array; related akan kosong.");
    }
  } catch (error) {
    console.error(`Gagal mengambil data untuk artikel slug: ${slug}`, error);
    notFound();
  }

  // 4) Hitung artikel terkait
  const related = allArticlesData
    .filter((a) => a?.slug && a.slug !== slug)
    .map((a) => ({ article: a, score: scoreRelated(articleData, a) }))
    .filter(({ score }) => score > 0)
    .sort((x, y) => {
      if (y.score !== x.score) return y.score - x.score; // skor tertinggi dulu
      const dx = new Date(x.article.date || 0).getTime();
      const dy = new Date(y.article.date || 0).getTime();
      return dy - dx; // tanggal terbaru dulu
    })
    .slice(0, 3)
    .map(({ article }) => article);

  // 5) Format tanggal aman
  const dateText = (() => {
    const raw = articleData?.date;
    const d = raw ? new Date(raw) : null;
    if (!d || Number.isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(d);
  })();

  return (
    <>
      {/* Progress bar (client) */}
      <ReadingProgress />

      {/* Tracker untuk increment view (client) */}
      <ViewTracker slug={articleData.slug} />

      <div className={styles.page}>
        <section className={styles.header}>
          <div className={styles.headerInner}>
            <div style={{ flex: "1 1 auto", minWidth: 0 }}>
              <h2 className={styles.title}>{articleData.title}</h2>
              {dateText && <p className={`muted ${styles.date}`}>{dateText}</p>}
            </div>
            <div style={{ flex: "0 0 auto" }} aria-label="Aksi Artikel">
              <BookmarkButton slug={articleData.slug} />
            </div>
          </div>
        </section>

        <main className={styles.main} aria-label="Konten artikel">
          <ArticleContentClient article={articleData} />
        </main>

        <div className={styles.section}>
          <ShareButtons title={articleData.title} slug={articleData.slug} />
        </div>

        <div className={styles.section}>
          <QuickReactions slug={articleData.slug} />
        </div>

        <div className={styles.section}>
          <Comments slug={articleData.slug} />
        </div>
      </div>

      <RelatedArticles items={related} />
    </>
  );
}
