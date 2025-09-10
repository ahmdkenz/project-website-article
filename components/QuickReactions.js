"use client";

import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase";
import {
  doc,
  onSnapshot,
  runTransaction,
  getDoc,
  setDoc,
} from "firebase/firestore";

const EMOJIS = [
  { key: "like",  emoji: "👍", label: "Bermanfaat" },
  { key: "love",  emoji: "❤️", label: "Menarik" },
  { key: "think", emoji: "🤔", label: "Masih Bingung" },
  { key: "fire",  emoji: "🔥", label: "Keren!" },
];

// generate atau ambil uid browser (tanpa Auth)
function getOrCreateUID() {
  try {
    const k = "uid";
    let id = localStorage.getItem(k);
    if (!id) {
      // crypto.randomUUID tersedia di browser modern
      id = crypto?.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
      localStorage.setItem(k, id);
    }
    return id;
  } catch {
    // fallback kalau localStorage non-available
    return "anon";
  }
}

export default function QuickReactions({ slug }) {
  const [counts, setCounts] = useState({ like: 0, love: 0, think: 0, fire: 0 });
  const [mine, setMine]     = useState(null); // null | "like" | "love" | "think" | "fire"
  const total = useMemo(
    () => (counts.like ?? 0) + (counts.love ?? 0) + (counts.think ?? 0) + (counts.fire ?? 0),
    [counts]
  );

  // Realtime: dengar perubahan counts di artikel
  useEffect(() => {
    if (!slug) return;
    const artRef = doc(db, "articles", slug);

    const unsub = onSnapshot(artRef, (snap) => {
      const data = snap.data() || {};
      const r = data.reactions || {};
      setCounts({
        like:  r.like  || 0,
        love:  r.love  || 0,
        think: r.think || 0,
        fire:  r.fire  || 0,
      });
    });

    return () => unsub();
  }, [slug]);

  // Ambil reaction milikku (user ini) untuk artikel ini
  useEffect(() => {
    if (!slug) return;
    const uid = getOrCreateUID();
    const mineRef = doc(db, "articles", slug, "reactions", uid);

    (async () => {
      const snap = await getDoc(mineRef);
      if (snap.exists()) {
        setMine(snap.data()?.type ?? null);
      } else {
        setMine(null);
      }
    })();
  }, [slug]);

  // Click handler: enforce 1 orang = 1 reaction (toggle / switch) via transaction
  const handleReact = async (type) => {
    const uid = getOrCreateUID();
    const artRef  = doc(db, "articles", slug);
    const mineRef = doc(db, "articles", slug, "reactions", uid);

    try {
      await runTransaction(db, async (tx) => {
        const artSnap  = await tx.get(artRef);
        const mineSnap = await tx.get(mineRef);

        const base = artSnap.exists() ? (artSnap.data() || {}) : {};
        const reactions = { like: 0, love: 0, think: 0, fire: 0, ...(base.reactions || {}) };

        if (mineSnap.exists()) {
          const prevType = mineSnap.data().type;
          if (prevType === type) {
            // Case A: klik emoji yg sama -> HAPUS reaction
            reactions[prevType] = Math.max(0, (reactions[prevType] || 0) - 1);
            tx.set(artRef, { reactions }, { merge: true });
            // hapus dokumen user reaction
            tx.set(mineRef, { type: null }, { merge: false }); // optional: bisa tx.delete(mineRef)
            // Lebih konsisten pakai delete:
            // tx.delete(mineRef);
          } else {
            // Case B: ganti reaction -> decrement lama, increment baru
            if (prevType) reactions[prevType] = Math.max(0, (reactions[prevType] || 0) - 1);
            reactions[type] = (reactions[type] || 0) + 1;

            tx.set(artRef, { reactions }, { merge: true });
            tx.set(mineRef, { type, updatedAt: Date.now() }, { merge: true });
          }
        } else {
          // Case C: belum pernah react -> tambah baru
          reactions[type] = (reactions[type] || 0) + 1;
          // pastikan dokumen artikel ada
          tx.set(artRef, { reactions }, { merge: true });
          // set dokumen milik user
          tx.set(mineRef, { type, createdAt: Date.now() }, { merge: true });
        }
      });

      // Optimistic UI (sinkron dengan hasil transaksi):
      setMine((prev) => (prev === type ? null : type));
    } catch (e) {
      console.error("Reaction failed:", e);
    }
  };

  return (
    <section
      aria-label="Reaksi pembaca"
      style={{
        marginTop: "1.25rem",
        paddingTop: "1rem",
        borderTop: "1px solid var(--border-color)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: ".75rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
          {EMOJIS.map(({ key, emoji, label }) => {
            const active = mine === key;
            const count = counts[key] ?? 0;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleReact(key)}
                className={active ? "btn-primary btn-sm" : "btn btn-sm"}
                title={label}
                aria-pressed={active}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: ".45rem",
                  borderRadius: "999px",
                }}
              >
                <span aria-hidden>{emoji}</span>
                <span style={{ fontWeight: 600 }}>{count}</span>
              </button>
            );
          })}
        </div>

        <span className="muted" style={{ fontSize: ".9rem" }}>
          {total} total reaksi
        </span>
      </div>
    </section>
  );
}
