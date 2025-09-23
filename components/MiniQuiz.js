"use client";

import { useMemo, useState } from 'react';

// NOTE: We won't add new folders. CSS is imported globally from styles in app/layout. This local import is a no-op placeholder.

export default function MiniQuiz({ title = 'Mini Quiz', questions = [], pointsPerCorrect = 10, onFinish }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]); // {choiceIndex, correct}
  const [finished, setFinished] = useState(false);

  const total = questions.length;

  const score = useMemo(() => {
    return answers.reduce((acc, a) => acc + (a.correct ? (a.points ?? pointsPerCorrect) : 0), 0);
  }, [answers, pointsPerCorrect]);

  const badge = useMemo(() => {
    if (!total) return '';
    const max = questions.reduce((acc, q) => acc + (q.points ?? pointsPerCorrect), 0);
    const pct = max ? Math.floor((score / max) * 100) : 0; // use floor to avoid rounding up
    if (pct >= 80) return 'Pro';
    if (pct >= 50) return 'Expert';
    if (pct > 0) return 'Amateur';
    return 'Newbie';
  }, [score, questions, pointsPerCorrect, total]);

  if (!Array.isArray(questions) || questions.length === 0) {
    return <div className="mini-quiz"><p>Tidak ada pertanyaan.</p></div>;
  }

  const q = questions[current];

  const selectOption = (idx) => {
    if (answers[current] != null) return; // Prevent selecting if already answered
    
    setSelected(idx);
    
    // Auto-submit after selection
    const correct = Array.isArray(q.correctIndex)
      ? q.correctIndex.includes(idx)
      : idx === q.correctIndex;
    const entry = { choiceIndex: idx, correct, points: q.points ?? pointsPerCorrect };
    const nextAnswers = [...answers];
    nextAnswers[current] = entry;
    setAnswers(nextAnswers);

    // Move to next question after a short delay
    setTimeout(() => {
      if (current < total - 1) {
        setCurrent((c) => c + 1);
        setSelected(null);
      } else {
        setFinished(true);
        // Recompute final score from nextAnswers to avoid stale score from useMemo
        const finalScore = nextAnswers.reduce((acc, a) => acc + (a?.correct ? (a.points ?? pointsPerCorrect) : 0), 0);
        onFinish?.({ score: finalScore, answers: nextAnswers });
      }
    }, 1500); // 1.5 second delay to show the selected answer
  };

  const reset = () => {
    setCurrent(0);
    setSelected(null);
    setAnswers([]);
    setFinished(false);
  };

  return (
    <div className="mini-quiz">
      <div className="mini-quiz-header">
        <div className="mini-quiz-title">{title}</div>
        <div className="mini-quiz-progress">{current + 1} / {total}</div>
      </div>

      {!finished ? (
        <div>
          <div className="mq-question">{q.question}</div>
          <ul className="mq-options" role="listbox" aria-label="Pilihan jawaban">
            {q.options?.map((opt, idx) => {
              const isAnswered = answers[current] != null;
              const isSelected = selected === idx || answers[current]?.choiceIndex === idx;
              return (
                <li
                  key={idx}
                  className={`mq-option ${isSelected ? 'selected' : ''}`}
                  role="option"
                  aria-pressed={isSelected}
                  onClick={() => selectOption(idx)}
                >
                  <span>{String.fromCharCode(65 + idx)}.</span>
                  <span>{opt}</span>
                </li>
              );
            })}
          </ul>

          <div className="mq-controls">
            <button className="mq-btn" onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0}>Sebelumnya</button>
            <button className="mq-btn" onClick={() => setCurrent((c) => Math.min(total - 1, c + 1))} disabled={current >= total - 1}>Berikutnya</button>
          </div>
        </div>
      ) : (
        <div className="mq-result">
          <div className="mq-score">Skor: {score}</div>
          <div style={{ marginTop: '.5rem' }}>
            <span className="mq-badge" aria-label={`Badge ${badge}`}>🏅 {badge}</span>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <button className="mq-btn" onClick={reset}>Ulangi</button>
          </div>
        </div>
      )}
    </div>
  );
}
