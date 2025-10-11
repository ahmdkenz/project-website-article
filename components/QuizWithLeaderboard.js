"use client";

import { useCallback, useMemo, useState } from "react";
import MiniQuiz from "@/components/MiniQuiz";
import Leaderboard from "@/components/Leaderboard";

function slugify(str) {
  return String(str || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "quiz";
}

// Define quiz data for each level
const QUIZ_LEVELS = {
  'Newbie': {
    id: 'quiz-makro-dasar',
    title: 'Mini Quiz Makro Dasar',
    description: 'Kuis singkat untuk pemahaman dasar ekonomi makro.',
    pointsPerCorrect: 10
  },
  'Amateur': {
    id: 'quiz-amatir-ekonomi',
    title: 'Mini Quiz Ekonomi Amatir',
    description: 'Kuis dasar untuk pemahaman ekonomi tingkat amatir.',
    pointsPerCorrect: 10
  },
  'Expert': {
    id: 'quiz-expert-ekonomi',
    title: 'Mini Quiz Ekonomi Expert',
    description: 'Kuis lanjutan untuk pemahaman ekonomi tingkat expert.',
    pointsPerCorrect: 15
  },
  'Pro': {
    id: 'quiz-pro-ekonomi',
    title: 'Mini Quiz Ekonomi Pro',
    description: 'Kuis tingkat profesional untuk pemahaman ekonomi tingkat pro.',
    pointsPerCorrect: 20
  }
};

export default function QuizWithLeaderboard({ quiz, defaultName = "", enableLevelSelection = false }) {
  const quizId = useMemo(() => {
    if (enableLevelSelection) return "multi-level-quiz"; // Semua level menggunakan quizId yang sama
    return quiz?.id ? String(quiz.id) : slugify(quiz?.title || "quiz");
  }, [quiz?.id, quiz?.title, enableLevelSelection]);
  const [name, setName] = useState(() => {
    try { return localStorage.getItem("quiz_name") || defaultName; } catch { return defaultName; }
  });
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showLevelSelection, setShowLevelSelection] = useState(false);
  const [started, setStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  const handleStart = () => {
    if (!name.trim()) return;
    try { localStorage.setItem("quiz_name", name.trim()); } catch {}
    
    if (enableLevelSelection) {
      // Show level selection after name is entered
      setShowLevelSelection(true);
      return;
    }
    
    setStarted(true);
  };

  const handleLevelSelect = async (level) => {
    if (!name.trim()) return;
    
    setSelectedLevel(level);
    setLoadingQuiz(true);
    
    try {
      // Load quiz data from API
      const response = await fetch(`/api/tutorial?slug=${QUIZ_LEVELS[level].id}`);
      if (!response.ok) {
        throw new Error(`Failed to load quiz: ${response.status}`);
      }
      
      const data = await response.json();
      
      setSelectedQuiz({
        id: QUIZ_LEVELS[level].id,
        title: data.metadata.title || QUIZ_LEVELS[level].title,
        questions: data.metadata.questions || [],
        pointsPerCorrect: data.metadata.pointsPerCorrect || QUIZ_LEVELS[level].pointsPerCorrect
      });
      
      setStarted(true);
    } catch (error) {
      console.error('Error loading quiz:', error);
      // Fallback to default quiz structure if API fails
      setSelectedQuiz({
        id: QUIZ_LEVELS[level].id,
        title: QUIZ_LEVELS[level].title,
        questions: [],
        pointsPerCorrect: QUIZ_LEVELS[level].pointsPerCorrect
      });
      setStarted(true);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleReset = () => {
    // Reset to level selection
    setStarted(false);
    setShowLevelSelection(true);
    setSelectedLevel(null);
    setSelectedQuiz(null);
  };

  const [submitMessage, setSubmitMessage] = useState("");
  const [messageType, setMessageType] = useState("info"); // 'info', 'success', 'warning'
  
  const handleFinish = useCallback(async ({ score, answers }) => {
    // Submit to API
    try {
      setSubmitting(true);
      setSubmitMessage("");
      setMessageType("info");
      
      // Use selected quiz or fallback to original quiz
      const currentQuiz = selectedQuiz || quiz;
      const currentQuizId = enableLevelSelection ? quizId : (selectedQuiz ? selectedQuiz.id : quizId);
      
      // Hitung maxScore sama seperti MiniQuiz
      const maxScore = (currentQuiz?.questions || []).reduce(
        (acc, q) => acc + (q.points ?? currentQuiz?.pointsPerCorrect ?? 10),
        0
      );
      
      // Prepare payload with level information
      const payload = {
        quizId: currentQuizId,
        name: name.trim() || "Anon",
        score,
        maxScore
      };
      
      // Add level if using level selection
      if (enableLevelSelection && selectedLevel) {
        payload.level = selectedLevel;
      }
      
      console.log("Submitting quiz score:", payload);
      
      const response = await fetch("/api/leaderboard?debug=1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      const result = await response.json();
      
      // Log debug info jika tersedia
      if (result.debug) {
        console.log("Leaderboard submission debug info:", result.debug);
      }
      
      // Log status error jika ada
      if (result.errorCode) {
        console.warn(`Leaderboard submission error code: ${result.errorCode}`);
      }
      
      if (result.simulated) {
        console.warn("Leaderboard submission was simulated due to Firebase permission issues");
      }
      
      if (result.message) {
        setSubmitMessage(result.message);
        
        // Set message type based on response
        if (result.updated) {
          setMessageType("success"); // Skor diupdate
          console.log("Score updated successfully");
        } else if (result.noUpdate) {
          setMessageType("warning"); // Skor tidak diupdate karena lebih rendah
          console.log("Score not updated (current score is lower)");
        } else {
          setMessageType("info"); // Skor baru disimpan
          console.log("New score saved successfully");
        }
      }
    } catch (e) {
      console.error("Submit score failed", e);
      setSubmitMessage("Gagal menyimpan skor. Silakan coba lagi.");
      setMessageType("warning");
    } finally {
      setSubmitting(false);
      // Tunggu sebentar sebelum refresh leaderboard untuk memastikan data terupdate
      setTimeout(() => {
        setRefreshToken((x) => x + 1);
      }, 500);
    }
  }, [quizId, name, quiz, selectedQuiz, enableLevelSelection, selectedLevel]);

  return (
    <div>
      {!started && !showLevelSelection && (
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
              textAlign: "center"
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
            {enableLevelSelection ? "Mulai Kuis" : "Mulai Kuis"}
          </button>
        </div>
      )}

      {showLevelSelection && !started && (
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
          <div style={{ 
            fontWeight: 600, 
            marginBottom: ".5rem",
            width: "100%"
          }}>
            Halo, {name}! 👋
          </div>
          <div style={{ 
            fontWeight: 600, 
            marginBottom: ".5rem",
            width: "100%"
          }}>Pilih Level Kuis:</div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: ".5rem",
            width: "100%"
          }}>
            {Object.keys(QUIZ_LEVELS).map((level) => (
              <button
                key={level}
                className="mq-btn"
                onClick={() => handleLevelSelect(level)}
                disabled={loadingQuiz}
                style={{ 
                  padding: ".5rem",
                  fontSize: ".875rem",
                  borderRadius: ".375rem"
                }}
              >
                {loadingQuiz ? "..." : level}
              </button>
            ))}
          </div>
          <div style={{ fontSize: ".75rem", color: "var(--text-muted)", marginTop: ".5rem" }}>
            Pilih level yang sesuai dengan kemampuan Anda
          </div>
          <button 
            onClick={() => setShowLevelSelection(false)}
            style={{ 
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              fontSize: ".75rem",
              cursor: "pointer",
              textDecoration: "underline",
              marginTop: ".25rem"
            }}
          >
            ← Kembali
          </button>
        </div>
      )}

      {/* Render MiniQuiz tanpa mengubah logika/tampilan */}
      {started && (
        <MiniQuiz
          title={(selectedQuiz || quiz)?.title}
          questions={(selectedQuiz || quiz)?.questions || []}
          pointsPerCorrect={(selectedQuiz || quiz)?.pointsPerCorrect}
          onFinish={handleFinish}
          onReset={enableLevelSelection ? handleReset : undefined}
          enableLevelSelection={enableLevelSelection}
        />
      )}

      <div 
        aria-live="polite" 
        className={`${submitMessage ? 'quiz-message' : 'muted'}`} 
        style={{ 
          marginTop: ".5rem",
          padding: submitMessage ? ".5rem" : 0,
          borderRadius: "4px",
          backgroundColor: submitMessage ? (
            messageType === "success" ? "var(--success-bg, rgba(0, 170, 0, 0.1))" : 
            messageType === "warning" ? "var(--warning-bg, rgba(255, 170, 0, 0.1))" :
            "var(--bg-highlight)"
          ) : "transparent",
          color: submitMessage ? (
            messageType === "success" ? "var(--success-text, #005500)" :
            messageType === "warning" ? "var(--warning-text, #663300)" :
            "var(--text-color)"
          ) : "var(--text-muted)",
          fontWeight: submitMessage ? "500" : "normal",
          transition: "all 0.3s ease",
          textAlign: "center"
        }}
      >
        {submitting ? "Menyimpan skor..." : (submitMessage ? submitMessage : " ")}
      </div>

      {/* Leaderboard di bawah konten mini quizzes */}
      <Leaderboard 
        quizId={quizId} 
        refreshToken={refreshToken} 
      />
    </div>
  );
}
