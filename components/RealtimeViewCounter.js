"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

/**
 * Komponen realtime untuk menampilkan jumlah view dari artikel.
 * @param {string} slug - slug artikel (ID di Firestore)
 */
export default function RealtimeViewCounter({ slug }) {
  const [views, setViews] = useState(0);

  useEffect(() => {
    if (!slug) return;

    const ref = doc(db, "articles", slug);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setViews(snap.data().views || 0);
      }
    });

    return () => unsub();
  }, [slug]);

  return (
    <span className="muted" style={{ fontSize: ".9rem" }}>
      👁️ {views} kali dibaca
    </span>
  );
}
