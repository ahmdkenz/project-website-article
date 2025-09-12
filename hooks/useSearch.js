// src/hooks/useSearch.js
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export function useSearch({ minLen = 2, limit = 20, debounceMs = 200 } = {}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const abortRef = useRef(null);
  const timerRef = useRef(null);

  const canSearch = useMemo(() => query.trim().length >= minLen, [query, minLen]);

  useEffect(() => {
    // cleanup on unmount
    return () => {
      if (abortRef.current) abortRef.current.abort();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!canSearch) {
      setResults([]);
      setLoading(false);
      setErr(null);
      return;
    }

    setLoading(true);
    setErr(null);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        if (abortRef.current) abortRef.current.abort();
        const ac = new AbortController();
        abortRef.current = ac;

        const url = `/api/search?q=${encodeURIComponent(query)}&limit=${limit}`;
        const res = await fetch(url, { signal: ac.signal });
        if (!res.ok) throw new Error("Search request failed");

        const json = await res.json();
        setResults(Array.isArray(json.results) ? json.results : []);
      } catch (e) {
        if (e.name !== "AbortError") setErr(e);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, canSearch, limit]);

  return { query, setQuery, results, loading, error: err, canSearch };
}
