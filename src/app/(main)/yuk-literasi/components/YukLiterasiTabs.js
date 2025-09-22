"use client";

import { useState } from 'react';
import TutorialList from './TutorialList';
import StoriesShowMoreClient from '@/components/StoriesShowMoreClient';
// import MiniQuiz from '@/components/MiniQuiz';
import QuizWithLeaderboard from '@/components/QuizWithLeaderboard';
// CSS now loaded through layout.js in proper order

export default function YukLiterasiTabs({ stories = [], quizzes = [] }) {
  const [activeTab, setActiveTab] = useState('tutorial');

  return (
    <div className="yuk-literasi-tabs">
      <div className="simulator-tabs" role="tablist" aria-label="Yuk Literasi Sections">
          <button
            className={`simulator-tab ${activeTab === 'tutorial' ? 'active' : ''}`}
            onClick={() => setActiveTab('tutorial')}
            aria-pressed={activeTab === 'tutorial'}
            role="tab"
            aria-selected={activeTab === 'tutorial'}
            aria-controls="tab-panel-tutorial"
            id="tab-tutorial"
          >
            📘 Tutorial
          </button>
          <button
            className={`simulator-tab ${activeTab === 'cerita' ? 'active' : ''}`}
            onClick={() => setActiveTab('cerita')}
            aria-pressed={activeTab === 'cerita'}
            role="tab"
            aria-selected={activeTab === 'cerita'}
            aria-controls="tab-panel-cerita"
            id="tab-cerita"
          >
            💡 Cerita Relatable
          </button>
          <button
            className={`simulator-tab ${activeTab === 'kuis' ? 'active' : ''}`}
            onClick={() => setActiveTab('kuis')}
            aria-pressed={activeTab === 'kuis'}
            role="tab"
            aria-selected={activeTab === 'kuis'}
            aria-controls="tab-panel-kuis"
            id="tab-kuis"
          >
            🧩 Mini Quizzes
          </button>
        </div>

        <div className="simulator-content">
          {activeTab === 'tutorial' && (
            <div
              id="tab-panel-tutorial"
              role="tabpanel"
              aria-labelledby="tab-tutorial"
              className="simulator-section"
              style={{ 
                backgroundColor: 'transparent',
                padding: 0,
                margin: 0,
                maxWidth: '100%',
                width: '100%'
              }}
            >
              <TutorialList />
            </div>
          )}

          {activeTab === 'cerita' && (
            <div
              id="tab-panel-cerita"
              role="tabpanel"
              aria-labelledby="tab-cerita"
              className="simulator-section"
              style={{ 
                backgroundColor: 'transparent',
                padding: 0,
                margin: 0,
                maxWidth: '100%',
                width: '100%'
              }}
            >
              <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.2em', marginRight: '6px' }}>💡</span>
                Yuk Pahami
              </h2>
              <p className="muted" style={{ marginBottom: '1.5rem' }}>
                Cerita relatable yang membantu Anda memahami konsep keuangan dengan cara yang lebih personal dan menarik.
              </p>
              <StoriesShowMoreClient stories={stories} initialCount={3} step={3} listId="relatable-stories-list" />
            </div>
          )}

          {activeTab === 'kuis' && (
            <div
              id="tab-panel-kuis"
              role="tabpanel"
              aria-labelledby="tab-kuis"
              className="simulator-section"
              style={{ 
                backgroundColor: 'transparent',
                padding: 0,
                margin: 0,
                maxWidth: '100%',
                width: '100%'
              }}
            >
              {Array.isArray(quizzes) && quizzes.length > 0 ? (
                <div className="mini-quiz-container">
                  {quizzes.map((quiz, idx) => (
                    <div key={idx} className="quiz-item" style={{ marginBottom: '2rem' }}>
                      <h2>{quiz.title}</h2>
                      {quiz.description && <p className="muted">{quiz.description}</p>}
                      <QuizWithLeaderboard quiz={quiz} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="muted">Belum ada kuis untuk ditampilkan.</p>
              )}
            </div>
          )}
        </div>
    </div>
  );
}
