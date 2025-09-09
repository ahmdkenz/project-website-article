// hooks/useBookmarks.js
"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "bookmarked_articles";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      setBookmarks(saved);
    } catch {
      setBookmarks([]);
    }
  }, []);

  const toggleBookmark = (slug) => {
    setBookmarks((prev) => {
      const exists = prev.includes(slug);
      const updated = exists
        ? prev.filter((s) => s !== slug)
        : [...prev, slug];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const isBookmarked = (slug) => bookmarks.includes(slug);

  return { bookmarks, toggleBookmark, isBookmarked };
}
