// components/ArticleContentClient.js
"use client";

import { useMode } from "@/context/ModeContext";

export default function ArticleContentClient({ article }) {
  const { mode } = useMode();

  const rawContent =
    mode === "moderate"
      ? article.contentModerate || article.contentFriendly || ""
      : article.contentFriendly || article.contentModerate || "";

  return (
    <article
  id="article-content"
  className="article-body"
  dangerouslySetInnerHTML={{ __html: rawContent }}
/>
  );
}
