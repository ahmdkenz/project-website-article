// components/mdx/Switch.js
"use client";

import React from "react";
import { useMode } from "@/context/ModeContext";

function normModeVal(v) {
  if (v === undefined || v === null) return undefined;
  return String(v).toLowerCase().trim();
}

/**
 * Usage in MDX:
 * <Switch friendly="for friendly" moderate="for moderate" />
 * Accepts ReactNode for either prop.
 * If friendly undefined, falls back to moderate and vice versa.
 */
export default function Switch({ friendly, moderate }) {
  const { mode: ctxMode } = useMode() || {};
  const mode = normModeVal(ctxMode || "moderate");

  // If mode is friendly -> show friendly else moderate
  if (mode === "friendly") {
    return <>{friendly ?? moderate ?? null}</>;
  }
  // mode moderate or other -> show moderate fallback to friendly
  return <>{moderate ?? friendly ?? null}</>;
}
