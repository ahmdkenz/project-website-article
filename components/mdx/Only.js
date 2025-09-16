// components/mdx/Only.js
"use client";

import React from "react";
import { useMode } from "@/context/ModeContext";

function normModeVal(v) {
  if (Array.isArray(v)) return v.map((x) => String(x).toLowerCase().trim());
  if (v === undefined || v === null) return v;
  const val = String(v).toLowerCase().trim();
  // Legacy support: convert 'both' to array ['friendly', 'moderate']
  if (val === 'both') return ['friendly', 'moderate'];
  return val;
}

/**
 * Usage in MDX:
 * <Only mode="friendly">...</Only>
 * <Only mode={["friendly","moderate"]}>...</Only>
 * <Only mode="both">...</Only> // legacy support: will render in both friendly and moderate
 */
export default function Only({ mode, children }) {
  const ctx = useMode();
  const currentRaw = ctx?.mode ?? "moderate"; // fallback safe
  const current = normModeVal(currentRaw);

  // Normalize prop mode
  const m = normModeVal(mode);

  // If mode prop missing -> nothing shown (fail-safe). You can change to show always if desired.
  if (m === undefined || m === null) {
    // In development, warn to help authors
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn("[Only] missing 'mode' prop on <Only> - defaulting to hide content");
    }
    return null;
  }

  // Hanya dukung 'friendly' atau 'moderate', 'both' sudah diubah menjadi array di normModeVal
  if (typeof m === "string") {
    return current === m ? <>{children}</> : null;
  }

  // array case - support hanya untuk 'friendly' dan 'moderate'
  if (Array.isArray(m)) {
    const validModes = m.filter(mode => mode === 'friendly' || mode === 'moderate');
    return validModes.includes(current) ? <>{children}</> : null;
  }

  // fallback: hide
  return null;
}
