// components/ArticleContentClient.js  ← sekarang Server Component (TANPA 'use client')
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import Only from "@/components/mdx/Only";    // keduanya client component — aman dipakai sbg child
import Switch from "@/components/mdx/Switch";

export default function ArticleContentClient({ article }) {
  if (!article) {
    return <div className="opacity-70">Artikel tidak ditemukan.</div>;
  }

  // Jika konten tidak tersedia, tampilkan pesan yang lebih informatif
  if (!article.content) {
    return (
      <div className="article-body prose max-w-none">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <p className="text-yellow-700">
            Konten artikel ini belum tersedia dalam mode yang Anda pilih.
          </p>
        </div>
        <p>Silakan mencoba mengubah mode pembacaan atau kembali lagi nanti.</p>
      </div>
    );
  }

  return (
    <article id="article-content" className="article-body prose max-w-none">
      {/* Badge mode di bagian atas artikel */}
      {article.meta?.mode && (
        <div className="mb-4">
          <span
            className={`badge badge-mode badge-mode-${article.meta.mode}`}
            style={{
              background: article.meta.mode === "friendly" ? "#ff9800" : "#8e24aa",
              color: "#fff",
              fontSize: ".9em",
              fontWeight: 500,
              padding: "3px 10px",
              borderRadius: 8,
              display: "inline-block"
            }}
          >
            {article.meta.mode === "friendly" ? "Friendly Mode" : "Moderate Mode"}
          </span>
        </div>
      )}
      
      <MDXRemote
        source={article.content}          // string MDX
        components={{ Only, Switch }}     // komponen client untuk gating mode
        options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
      />
    </article>
  );
}
