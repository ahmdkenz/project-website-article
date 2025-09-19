'use client';

import { useState } from 'react';
import styles from '../styles/RelatableStory.module.css';

export default function RelatableStory({ story }) {
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  if (!story) {
    return <div className={styles.placeholder}>Tidak ada cerita untuk ditampilkan.</div>;
  }

  const handleChoiceClick = (choice) => {
    setSelectedChoice(choice);
    setShowFeedback(true);
  };

  return (
    <div className={styles.storyContainer}>
      <div className={styles.storyContent}>
        <h2 className={styles.storyTitle}>{story.title}</h2>
        <div className={styles.storyText}>
          {story.content.split('\n\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
        
        <div className={styles.questionSection}>
          <h3 className={styles.question}>{story.question}</h3>
          
          <div className={styles.choices}>
            {story.choices.map((choice, index) => (
              <button
                key={index}
                className={`${styles.choiceButton} ${selectedChoice === choice ? styles.selected : ''}`}
                onClick={() => handleChoiceClick(choice)}
                disabled={showFeedback}
              >
                {choice}
              </button>
            ))}
          </div>
          
          {showFeedback && (
            <div className={styles.feedback}>
              {selectedChoice === story.answer ? (
                <div className={styles.correctFeedback}>
                  <p>Bagus sekali! Menabung adalah keputusan finansial yang bijak.</p>
                </div>
              ) : (
                <div className={styles.incorrectFeedback}>
                  <p>Hmm, mungkin ada pilihan yang lebih baik untuk masa depan finansial yang lebih sehat.</p>
                </div>
              )}
              <button 
                className={styles.resetButton}
                onClick={() => {
                  setSelectedChoice(null);
                  setShowFeedback(false);
                }}
              >
                Coba Lagi
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}