"use client";

import { useMode } from "@/context/ModeContext";

export default function ContentModeToggle() {
  const { mode, setMode } = useMode();

  return (
    <div className="inline-flex items-center gap-1 rounded-xl border px-1 py-1">
      <button
        type="button"
        onClick={() => setMode("friendly")}
        className={`px-3 py-1 rounded-lg ${mode === "friendly" ? "bg-black text-white" : ""}`}
        aria-pressed={mode === "friendly"}
      >
        Friendly
      </button>
      <button
        type="button"
        onClick={() => setMode("moderate")}
        className={`px-3 py-1 rounded-lg ${mode === "moderate" ? "bg-black text-white" : ""}`}
        aria-pressed={mode === "moderate"}
      >
        Moderate
      </button>
    </div>
  );
}
