// components/QuickReactions.js
"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_PREFIX = "reactions:";

/**
 * Struktur data di localStorage:
 * key: reactions:<slug>
 * value:
 * {
 *   counts: { like: number, love: number, think: number, fire: number },
 *   mine:   { like: boolean, love: boolean, think: boolean, fire: boolean }
 * }
 */
function loadReactions(slug) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + slug);
    if (!raw) {
      return {
        counts: { like: 0, love: 0, think: 0, fire: 0 },
        mine: { like: false, love: false, think: false, fire: false },
      };
    }
    const parsed = JSON.parse(raw);
    return {
      counts: { like: 0, love: 0, think: 0, fire: 0, ...(parsed.counts || {}) },
      mine:   { like: false, love: false, think: false, fire: false, ...(parsed.mine || {}) },
    };
  } catch {
    return {
      counts: { like: 0, love: 0, think: 0, fire: 0 },
      mine: { like: false, love: false, think: false, fire: false },
    };
  }
}

function saveReactions(slug, state) {
  try {
    localStorage.setItem(STORAGE_PREFIX + slug, JSON.stringify(state));
  } catch {}
}

export default function QuickReactions({ slug }) {
  const [state, setState] = useState(() => ({
    counts: { like: 0, love: 0, think: 0, fire: 0 },
    mine: { like: false, love: false, think: false, fire: false },
  }));

  useEffect(() => {
    setState(loadReactions(slug));
  }, [slug]);

  const total = useMemo(
    () =>
      (state.counts.like ?? 0) +
      (state.counts.love ?? 0) +
      (state.counts.think ?? 0) +
      (state.counts.fire ?? 0),
    [state]
  );

  const toggle = (key) => {
    setState((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const wasActive = !!next.mine[key];
      next.mine[key] = !wasActive;
      // increment/decrement count, jangan sampai minus
      if (!wasActive) next.counts[key] = (next.counts[key] ?? 0) + 1;
      else next.counts[key] = Math.max(0, (next.counts[key] ?? 0) - 1);
      saveReactions(slug, next);
      return next;
    });
  };

  const Btn = ({ k, label, emoji }) => {
    const active = !!state.mine[k];
    const count = state.counts[k] ?? 0;
    return (
      <button
        type="button"
        onClick={() => toggle(k)}
        className={active ? "btn-primary btn-sm" : "btn btn-sm"}
        title={label}
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
          <Btn k="like"  emoji="👍" label="Bermanfaat" />
          <Btn k="love"  emoji="❤️" label="Menarik" />
          <Btn k="think" emoji="🤔" label="Masih Bingung" />
          <Btn k="fire"  emoji="🔥" label="Keren!" />
        </div>

        <span className="muted" style={{ fontSize: ".9rem" }}>
          {total} total reaksi
        </span>
      </div>
    </section>
  );
}
