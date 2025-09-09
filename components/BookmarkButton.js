// components/BookmarkButton.js
"use client";

import { useBookmarks } from "@/hooks/useBookmarks";

export default function BookmarkButton({ slug }) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const active = isBookmarked(slug);

  return (
    <button
      onClick={() => toggleBookmark(slug)}
      className={active ? "btn-primary btn-sm" : "btn btn-sm"}
      style={{ marginTop: "1rem" }}
    >
      {active ? "★ Tersimpan" : "☆ Simpan Artikel"}
    </button>
  );
}
