// app/(main)/search/page.js
import { Suspense } from "react";
import SearchPageClient from "@/components/SearchPageClient";
import {
  searchAll,
  buildSummaryForArticle,
  buildSummaryForTerm,
  buildSummaryForCard,
} from "@/lib/search";

export const dynamic = "force-static"; // aman untuk data file-based; ubah ke 'force-dynamic' bila perlu

export default async function SearchPage({ searchParams }) {
  const q = (searchParams?.q || "").toString();
  const rawResults = await searchAll(q);

  // Ringkas data agar aman dikirim ke client
  const results = {
    articles: (rawResults.articles || []).map(buildSummaryForArticle),
    terms: (rawResults.terms || []).map(buildSummaryForTerm),
    flashcards: (rawResults.flashcards || []).map(buildSummaryForCard),
  };

  return (
    <Suspense fallback={<p>Loading search...</p>}>
      <SearchPageClient initialQuery={q} initialResults={results} />
    </Suspense>
  );
}
