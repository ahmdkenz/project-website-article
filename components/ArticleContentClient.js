// components/ArticleContentClient.js  ← sekarang Server Component (TANPA 'use client')
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import Only from "@/components/mdx/Only";    // keduanya client component — aman dipakai sbg child
import Switch from "@/components/mdx/Switch";

export default function ArticleContentClient({ article }) {
  if (!article?.content) {
    return <div className="opacity-70">Konten artikel belum tersedia.</div>;
  }

  return (
    <article id="article-content" className="article-body prose max-w-none">
      <MDXRemote
        source={article.content}          // string MDX
        components={{ Only, Switch }}     // komponen client untuk gating mode
        options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
      />
    </article>
  );
}
