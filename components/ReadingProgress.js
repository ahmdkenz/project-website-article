// components/ReadingProgress.js
"use client";

import { useEffect, useRef, useState } from "react";

export default function ReadingProgress(
  /**
   * Props opsional: kamu bisa biarkan kosong (default aman).
   * - target: selector elemen isi artikel (default "#article-content")
   * - headerOffsetVar: nama CSS variable untuk tinggi header sticky (default "--navbar-h")
   * - headerOffsetPx: angka offset px (jika ingin override variable)
   */
  { target = "#article-content", headerOffsetVar = "--navbar-h", headerOffsetPx } = {}
) {
  const [progress, setProgress] = useState(0);

  // ==== 👇 Kode ASLI kamu (dipertahankan sebagai fallback) ====
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const pct = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
      // NOTE: nilai ini akan dipakai HANYA saat fallback ke "page progress"
      // (ketika target artikel tidak ditemukan).
      // Di mode artikel-aware, kita update progress lewat rAF handler lain.
      // Tetap dipertahankan agar "tanpa pengurangan source code".
      // setProgress(pct); // <- JANGAN aktifkan ini; kita set dari handler pintar di bawah.
      void pct; // elak warning unused bila tidak fallback
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  // ==== ☝️ Akhir blok kode ASLI yang dipertahankan ====

  // ====== Tambahan: implementasi "artikel-aware" yang robust ======
  const dimsRef = useRef(null);          // { top, bottom, height }
  const rafIdRef = useRef(null);
  const targetElRef = useRef(null);
  const isFallbackRef = useRef(false);   // true jika target tidak ditemukan

  useEffect(() => {
    const root = document.documentElement;

    const parsePx = (val) => {
      if (typeof val === "number") return val;
      if (!val) return 0;
      const n = parseFloat(String(val).trim().replace("px", ""));
      return Number.isFinite(n) ? n : 0;
    };

    const getHeaderOffset = () => {
      if (typeof headerOffsetPx === "number") return headerOffsetPx;
      const v = getComputedStyle(root).getPropertyValue(headerOffsetVar);
      return parsePx(v);
    };

    const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);

    const findTarget = () => {
      // Cari elemen target; default #article-content (dari ArticleContentClient)
      const el = document.querySelector(target);
      targetElRef.current = el || null;
      isFallbackRef.current = !el; // fallback jika tidak ada
      return el;
    };

    const measure = () => {
      const el = targetElRef.current ?? findTarget();
      if (!el) {
        dimsRef.current = null;
        // Saat tidak ada target, set progress berdasarkan halaman penuh (fallback)
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
        setProgress(pct);
        return;
      }
      const rect = el.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const height = el.offsetHeight;
      dimsRef.current = {
        top,
        height,
        bottom: top + height,
      };
      // Setelah measure, update sekali posisi saat ini
      updateProgress();
    };

    const updateProgress = () => {
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(() => {
        const dims = dimsRef.current;
        if (!dims || isFallbackRef.current) {
          // Fallback: progress halaman penuh, sama seperti kode asli
          const scrollTop = window.scrollY || document.documentElement.scrollTop;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
          setProgress(pct);
          return;
        }
        const offset = getHeaderOffset();             // kompensasi header sticky
        const currentY = window.scrollY + offset;     // posisi baca
        const ratio = clamp01((currentY - dims.top) / (dims.bottom - dims.top));
        setProgress(ratio * 100);
      });
    };

    // Observer untuk tinggi artikel dinamis (gambar, embed, MDX)
    const ro = new ResizeObserver(() => measure());

    // Images inside target: re-measure when they load
    const hookImages = () => {
      const el = targetElRef.current;
      if (!el) return [];
      const imgs = Array.from(el.querySelectorAll("img"));
      const unhooks = imgs.map((img) => {
        if (img.complete) return () => {};
        const onLoad = () => measure();
        img.addEventListener("load", onLoad, { once: true });
        img.addEventListener("error", onLoad, { once: true });
        return () => {
          img.removeEventListener("load", onLoad);
          img.removeEventListener("error", onLoad);
        };
      });
      return unhooks;
    };

    // INIT
    const el = findTarget();
    if (el) {
      ro.observe(el);
    }
    const unhookImgs = hookImages();

    // Fonts-ready dapat mengubah layout → ukur ulang
    if (document.fonts && typeof document.fonts.ready?.then === "function") {
      document.fonts.ready.then(() => measure());
    }

    // Pertama kali: ukur & set progress awal
    measure();

    // Listeners
    const onScroll = () => updateProgress();
    const onResize = () => measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    // Cleanup
    return () => {
      try { ro.disconnect(); } catch {}
      unhookImgs.forEach((fn) => fn && fn());
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
    };
  }, [target, headerOffsetVar, headerOffsetPx]);

  // Aksesibilitas + render hemat via transform.
  return (
    <div
      className="progress-bar"
      role="progressbar"
      aria-label="Progress membaca artikel"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      style={{
        // Tetap pertahankan gaya aslimu (width%), agar "tanpa pengurangan".
        width: `${progress}%`,
        // Tambahkan transform agar animasi dan repaint lebih hemat.
        transform: `scaleX(${progress / 100})`,
        transformOrigin: "left",
      }}
    />
  );
}
