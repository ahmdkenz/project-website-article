"use client";

import { useMode } from "@/context/ModeContext";

/**
 * Pemakaian di MDX:
 * <Only mode="friendly">Konten khusus friendly</Only>
 * <Only mode="moderate">Konten khusus moderate</Only>
 * <Only mode={["friendly","moderate"]}>Konten untuk keduanya</Only>
 */
export default function Only({ mode, children }) {
  const { mode: current } = useMode();

  if (Array.isArray(mode)) {
    if (!mode.includes(current)) return null;
  } else {
    if (current !== mode) return null;
  }
  return <>{children}</>;
}
