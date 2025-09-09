// components/ThemeToggle.js (contoh minimal)
"use client";
import { useMode } from '@/context/ModeContext';

export default function ThemeToggle() {
  const { theme, setTheme } = useMode();
  return (
    <button
      className="btn btn-ghost"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle tema"
      title="Toggle tema"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
