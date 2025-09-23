"use client";

import QuizWithLeaderboard from "./QuizWithLeaderboard";

export default function QuizLevelSelector({ defaultName = "" }) {
  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h2>🧩 Mini Quiz Multi Level</h2>
        <p className="muted">
          Pilih level kuis yang sesuai dengan kemampuan Anda dan tantang diri Anda untuk mendapatkan skor tertinggi!
        </p>
      </div>
      
      <QuizWithLeaderboard 
        quiz={null} 
        defaultName={defaultName} 
        enableLevelSelection={true}
      />
    </div>
  );
}