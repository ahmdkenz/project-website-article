"use client";

import dynamic from "next/dynamic";

const FlashcardListComponent = dynamic(() => import("@/components/FlashcardList"), {
  ssr: false, // Disable server-side rendering for this component
});

export default function DynamicFlashcardList({ allFlashcards }) {
  return <FlashcardListComponent allFlashcards={allFlashcards} />;
}