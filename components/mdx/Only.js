// components/mdx/Only.js
"use client";

import React from "react";
import { useMode } from "@/context/ModeContext";

function normModeVal(v) {
  if (Array.isArray(v)) return v.map((x) => String(x).toLowerCase().trim());
  if (v === undefined || v === null) return v;
  return String(v).toLowerCase().trim();
}

/**
 * Usage in MDX:
 * <Only mode="friendly">...</Only>
 * <Only mode={["friendly","moderate"]}>...</Only>
 * <Only mode="both">...</Only> // will render in both
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
      console.warn("[Only] missing 'mode' prop on <Only> - defaulting to hide content");
    }
    return null;
  }

  // support "both" shortcut
  if (typeof m === "string") {
    if (m === "both") return <>{children}</>;
    return current === m ? <>{children}</> : null;
  }

  // array case
  if (Array.isArray(m)) {
    const lowered = m.map((x) => String(x).toLowerCase().trim());
    if (lowered.includes("both")) return <>{children}</>;
    return lowered.includes(current) ? <>{children}</> : null;
  }

  // fallback: hide
  return null;
}
