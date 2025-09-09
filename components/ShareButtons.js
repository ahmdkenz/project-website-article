// components/ShareButtons.js
"use client";

import { useEffect, useMemo, useState } from "react";

export default function ShareButtons({ title, slug }) {
  // fallback URL kalau dipanggil di server sebelum hydrasi
  const [href, setHref] = useState("");
  useEffect(() => {
    // Prioritas 1: URL saat ini
    if (typeof window !== "undefined") {
      setHref(window.location.href);
      return;
    }
  }, []);

  // Prioritas 2 (fallback saat SSR): pakai base url .env + slug
  const shareUrl = useMemo(() => {
    if (href) return href;
    const base =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "https://example.com";
    return `${base}/articles/${slug}`;
  }, [href, slug]);

  const text = title || "Baca artikel ini";
  const via = "yuk-literasi"; // opsional untuk Twitter

  const handleWebShare = async () => {
    if (navigator?.share) {
      try {
        await navigator.share({ title: text, url: shareUrl });
      } catch {
        // user batal, diamkan
      }
    } else {
      // kalau tidak didukung, fallback: salin link
      await copyLink();
    }
  };

  const [copied, setCopied] = useState(false);
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // fallback terakhir
      alert(`Salin tautan ini:\n${shareUrl}`);
    }
  };

  const waHref = `https://wa.me/?text=${encodeURIComponent(`${text}\n${shareUrl}`)}`;
  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    text
  )}&url=${encodeURIComponent(shareUrl)}&via=${encodeURIComponent(via)}`;

  return (
    <section
      aria-label="Bagikan artikel"
      style={{
        marginTop: "1rem",
        paddingTop: "1rem",
        borderTop: "1px solid var(--border-color)",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: ".5rem",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          maxWidth: 800,
          margin: "0 auto",
        }}
      >
        <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
          {/* Web Share API (mobile/modern browsers) */}
          <button
            type="button"
            onClick={handleWebShare}
            className="btn-primary btn-sm"
            title="Bagikan (native share)"
            style={{ borderRadius: 999 }}
          >
            📤 Bagikan
          </button>

          {/* WhatsApp */}
          <a
            className="btn btn-sm"
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            title="Bagikan ke WhatsApp"
            style={{ borderRadius: 999 }}
          >
            🟢 WhatsApp
          </a>

          {/* Twitter / X */}
          <a
            className="btn btn-sm"
            href={xHref}
            target="_blank"
            rel="noopener noreferrer"
            title="Bagikan ke X (Twitter)"
            style={{ borderRadius: 999 }}
          >
            ✖️ X
          </a>

          {/* Copy Link */}
          <button
            type="button"
            onClick={copyLink}
            className="btn btn-sm"
            title="Salin tautan"
            style={{ borderRadius: 999 }}
          >
            {copied ? "✅ Tersalin" : "🔗 Salin Link"}
          </button>
        </div>

        {/* URL mini, opsional ditampilkan */}
        <span className="muted" style={{ fontSize: ".85rem", overflowWrap: "anywhere" }}>
          {shareUrl}
        </span>
      </div>
    </section>
  );
}
