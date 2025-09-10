"use client";

import { useEffect, useState } from "react";
import { db, serverTimestamp } from "@/lib/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  or,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function Comments({ slug }) {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [text, setText] = useState("");

  // 🔹 Listener realtime dari Firestore
  useEffect(() => {
    // Ambil komentar berdasarkan articleId atau slug
    const q = query(
      collection(db, "comments"),
      or(where("articleId", "==", slug), where("slug", "==", slug))
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      // 🔹 Debug (hapus kalau sudah yakin jalan)
      console.log("🔥 Komentar snapshot:", data);

      // Sort manual berdasarkan createdAt
      const sorted = data.sort(
        (a, b) =>
          (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)
      );

      setItems(sorted);
    });

    return () => unsub();
  }, [slug]);

  const addComment = async (e) => {
    e.preventDefault();
    const trimmed = (text || "").trim();
    if (!trimmed) return;

    await addDoc(collection(db, "comments"), {
      articleId: slug, // simpan dengan konsisten
      slug: slug, // tambahan biar lebih aman
      name: name || "Anonim",
      text: trimmed,
      createdAt: serverTimestamp(),
    });

    setText("");
  };

  const removeComment = async (id) => {
    await deleteDoc(doc(db, "comments", id));
  };

  const fmt = (ts) =>
    ts?.toDate?.()
      ? new Intl.DateTimeFormat("id-ID", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(ts.toDate())
      : "";

  return (
    <section
      aria-label="Komentar Artikel"
      style={{
        marginTop: "2rem",
        borderTop: "1px solid var(--border-color)",
        paddingTop: "1.25rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: ".75rem",
          marginBottom: ".75rem",
        }}
      >
        <h3 style={{ margin: 0 }}>Komentar</h3>
        <span className="muted" style={{ fontSize: ".9rem" }}>
          {items.length} komentar
        </span>
      </div>

      {/* Form komentar */}
      <form
        onSubmit={addComment}
        style={{ display: "grid", gap: ".6rem", marginBottom: "1rem" }}
      >
        <div style={{ display: "grid", gap: ".35rem" }}>
          <label
            htmlFor="commentName"
            className="muted"
            style={{ fontSize: ".9rem" }}
          >
            Nama (opsional)
          </label>
          <input
            id="commentName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama kamu…"
            className="btn"
            style={{
              width: "100%",
              background: "var(--surface-color)",
              color: "var(--text-color)",
              border: "1px solid var(--border-color)",
              borderRadius: "10px",
              padding: ".6rem .8rem",
            }}
          />
        </div>

        <div style={{ display: "grid", gap: ".35rem" }}>
          <label htmlFor="commentText" className="visually-hidden">
            Komentar
          </label>
          <textarea
            id="commentText"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Tulis komentar…"
            rows={3}
            required
            style={{
              width: "100%",
              background: "var(--surface-color)",
              color: "var(--text-color)",
              border: "1px solid var(--border-color)",
              borderRadius: "10px",
              padding: ".8rem 1rem",
              lineHeight: 1.6,
              resize: "vertical",
            }}
          />
        </div>

        <div>
          <button type="submit" className="btn-primary btn-sm">
            Kirim Komentar
          </button>
        </div>
      </form>

      {/* Daftar komentar */}
      <div style={{ display: "grid", gap: ".75rem" }}>
        {items.length === 0 ? (
          <p className="muted">Belum ada komentar. Jadilah yang pertama!</p>
        ) : (
          items.map((c) => (
            <article
              key={c.id}
              className="article-card"
              style={{
                background: "var(--surface-color)",
                border: "1px solid var(--border-color)",
                borderRadius: "12px",
                padding: "1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: ".75rem",
                }}
              >
                <div>
                  <strong>{c.name || "Anonim"}</strong>
                  <div className="muted" style={{ fontSize: ".85rem" }}>
                    {fmt(c.createdAt)}
                  </div>
                </div>
                <button
                  className="btn btn-sm"
                  onClick={() => removeComment(c.id)}
                  title="Hapus komentar ini"
                >
                  Hapus
                </button>
              </div>
              <p
                style={{
                  marginTop: ".6rem",
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.7,
                }}
              >
                {c.text}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
