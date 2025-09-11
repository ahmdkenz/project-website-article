"use client";

import { useMode } from "@/context/ModeContext";

/**
 * Pemakaian di MDX:
 * <Switch friendly="teks untuk friendly" moderate="teks untuk moderate" />
 * - Boleh juga isi berupa ReactNode (bukan hanya string)
 */
export default function Switch({ friendly, moderate }) {
  const { mode } = useMode();
  return <>{mode === "friendly" ? (friendly ?? moderate) : (moderate ?? friendly)}</>;
}
