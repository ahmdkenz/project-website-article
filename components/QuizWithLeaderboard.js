"use client";

import { useCallback, useMemo, useState } from "react";
import MiniQuiz from "@/components/MiniQuiz";
import Leaderboard from "@/components/Leaderboard";

function slugify(str) {
  return String(str || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "quiz";
}

export default function QuizWithLeaderboard({ quiz, defaultName = "" }) {
  const quizId = useMemo(() => (quiz?.id ? String(quiz.id) : slugify(quiz?.title || "quiz")), [quiz?.id, quiz?.title]);
  const [name, setName] = useState(() => {
    try { return localStorage.getItem("quiz_name") || defaultName; } catch { return defaultName; }
  });
  const [started, setStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  const handleStart = () => {
    if (!name.trim()) return;
    try { localStorage.setItem("quiz_name", name.trim()); } catch {}
    setStarted(true);
  };

  const handleFinish = useCallback(async ({ score, answers }) => {
    // Submit to API
    try {
      setSubmitting(true);
      // Hitung maxScore sama seperti MiniQuiz
      const maxScore = (quiz?.questions || []).reduce(
        (acc, q) => acc + (q.points ?? quiz?.pointsPerCorrect ?? 10),
        0
      );
      await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId, name: name.trim() || "Anon", score, maxScore }),
      });
    } catch (e) {
      console.error("Submit score failed", e);
    } finally {
      setSubmitting(false);
      setRefreshToken((x) => x + 1);
    }
  }, [quizId, name, quiz?.questions, quiz?.pointsPerCorrect]);

  return (
    <div>
      {!started && (
        <div className="mini-quiz" style={{
          display: "flex",
          flexDirection: "column",
          gap: ".75rem",
          alignItems: "center",
          textAlign: "center",
          margin: "0 0 1rem 0",
          padding: "1.25rem",
          border: "1px dashed var(--border-color)",
          borderRadius: ".75rem",
          maxWidth: "420px",
          marginLeft: "auto",
          marginRight: "auto"
        }}>
          <label htmlFor={`${quizId}-name`} style={{ 
            fontWeight: 600, 
            marginBottom: ".25rem",
            display: "block",
            width: "100%"
          }}>Nama Anda:</label>
          <input
            id={`${quizId}-name`}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tulis nama untuk leaderboard"
            style={{ 
              width: "100%",
              display: "block",
              textAlign: "center" // Default teks berada di tengah
            }}
          />
          <button 
            className="mq-btn primary" 
            onClick={handleStart} 
            disabled={!name.trim()}
            style={{ 
              minWidth: "120px",
              padding: ".75rem 1.5rem",
              borderRadius: ".5rem",
              marginTop: ".25rem"
            }}
          >
            Mulai Kuis
          </button>
        </div>
      )}

      {/* Render MiniQuiz tanpa mengubah logika/tampilan */}
      {started && (
        <MiniQuiz
          title={quiz?.title}
          questions={quiz?.questions || []}
          pointsPerCorrect={quiz?.pointsPerCorrect}
          onFinish={handleFinish}
        />
      )}

      <div aria-live="polite" className="muted" style={{ marginTop: ".5rem" }}>
        {submitting ? "Menyimpan skor..." : " "}
      </div>

      {/* Leaderboard di bawah konten mini quizzes */}
  <Leaderboard quizId={quizId} refreshToken={refreshToken} />
    </div>
  );
}
