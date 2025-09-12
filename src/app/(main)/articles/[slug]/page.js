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

// Fungsi skor related sederhana (tag + kategori)
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

// (Opsional, direkomendasikan) prerender semua slug
export async function generateStaticParams() {
  try {
    const all = await getAllArticles();
    // [DIPERBAIKI] Menambahkan pengecekan untuk memastikan 'all' adalah array
    if (!Array.isArray(all)) {
        console.warn("generateStaticParams: getAllArticles tidak mengembalikan array.");
        return [];
    }
    return all.map(a => ({ slug: a.slug }));
  } catch (e) {
    console.warn("generateStaticParams gagal:", e);
    return [];
  }
}
export const dynamicParams = true;


export default async function ArticleDetailPage({ params }) {
  const { slug } = params; // Tidak perlu await di versi Next.js stabil

  let articleData;
  let allArticlesData;

  // [DIPERBAIKI] Menambahkan blok try...catch untuk penanganan error saat pengambilan data
  try {
    // 1) Ambil konten MDX untuk slug ini
    const result = await getArticleBySlug(slug);
    if (!result || !result.meta) {
        // Jika hasil tidak ada atau tidak memiliki metadata, anggap tidak ditemukan
        notFound();
    }
    
    // 2) Map ke bentuk yang dipakai komponen lain
    articleData = { ...result.meta, content: result.content };

    // 3) Ambil semua artikel (metadata) untuk related
    allArticlesData = await getAllArticles();

    // [DIPERBAIKI] Pastikan allArticlesData adalah array
    if (!Array.isArray(allArticlesData)) {
        console.warn("Gagal mendapatkan daftar artikel untuk 'related articles', akan ditampilkan kosong.");
        allArticlesData = [];
    }

  } catch (error) {
    console.error(`Gagal mengambil data untuk artikel slug: ${slug}`, error);
    // Jika terjadi error saat fetching, arahkan ke halaman not found
    notFound();
  }


  // [DIPERBAIKI] Logika untuk artikel terkait dibuat lebih mudah dibaca
  const related = allArticlesData
    .filter((a) => a.slug !== slug)
    .map((a) => ({ 
        article: a, 
        score: scoreRelated(articleData, a) 
    }))
    .filter(({ score }) => score > 0)
    .sort((x, y) => {
        // Urutkan berdasarkan skor tertinggi
        if (y.score !== x.score) {
            return y.score - x.score;
        }
        // Jika skor sama, urutkan berdasarkan tanggal terbaru
        const dateX = new Date(x.article.date || 0).getTime();
        const dateY = new Date(y.article.date || 0).getTime();
        return dateY - dateX;
    })
    .slice(0, 3)
    .map(({ article }) => article);

  // [DIPERBAIKI] Format tanggal dibuat lebih aman dengan pengecekan validitas
  const dateText = articleData?.date && !isNaN(new Date(articleData.date))
    ? new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(articleData.date))
    : "";

  return (
    <>
      {/* Progress bar */}
      <ReadingProgress />

      {/* Tracker untuk increment view */}
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