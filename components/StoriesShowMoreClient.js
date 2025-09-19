'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import '../styles/storymodal.css';

function MiniStoryCard({ story, isDarkTheme }) {
  return (
    <article className="article-card">
      <div className="article-content">
        <h3>{story?.title ?? "Tanpa judul"}</h3>
        
        {story?.excerpt && <p className="muted">{story.excerpt}</p>}
        
        {/* Aksi */}
        <div className="card-actions" style={{ marginTop: ".75rem" }}>
          <button
            onClick={() => {
              // Render cerita dengan pilihan dan feedback
              const storyModal = document.createElement('div');
              storyModal.className = 'story-modal';
              
              // Buat konten HTML untuk modal
              const paragraphs = story.content.split('\n\n').map(p => `<p>${p}</p>`).join('');
              
              // Tambahkan class tema jika dark mode
              if (isDarkTheme) {
                document.documentElement.classList.add('dark');
              }
              
              // Buat struktur untuk modal
              storyModal.innerHTML = `
                <div class="story-modal-content">
                  <h2 class="story-title">${story?.title ?? "Tanpa judul"}</h2>
                  <div class="story-text">${paragraphs}</div>
                  
                  <div class="question-section">
                    <h3 class="question">${story.question || "Apa pendapat Anda?"}</h3>
                    
                    <div class="choices">
                      ${Array.isArray(story.choices) 
                        ? story.choices.map((choice, idx) => 
                            `<button class="choice-button" data-choice="${choice}">${choice}</button>`
                          ).join('')
                        : '<p class="no-choices">Tidak ada pilihan tersedia</p>'
                      }
                    </div>
                    
                    <div class="feedback" style="display:none">
                      <div class="correct-feedback">
                        <p>Bagus sekali! Menabung adalah keputusan finansial yang bijak.</p>
                      </div>
                      <div class="incorrect-feedback" style="display:none">
                        <p>Hmm, mungkin ada pilihan yang lebih baik untuk masa depan finansial yang lebih sehat.</p>
                      </div>
                      <button class="reset-button">Coba Lagi</button>
                    </div>
                  </div>
                  
                  <button class="close-modal">Tutup</button>
                </div>
              `;
              
              document.body.appendChild(storyModal);
              
              // Event listeners untuk pilihan
              if (Array.isArray(story.choices)) {
                const correctAnswer = story.answer;
                storyModal.querySelectorAll('.choice-button').forEach(button => {
                  button.addEventListener('click', function() {
                    // Tandai pilihan yang dipilih
                    storyModal.querySelectorAll('.choice-button').forEach(btn => 
                      btn.classList.remove('selected'));
                    this.classList.add('selected');
                    
                    // Tampilkan feedback
                    const feedback = storyModal.querySelector('.feedback');
                    const correctFeedback = storyModal.querySelector('.correct-feedback');
                    const incorrectFeedback = storyModal.querySelector('.incorrect-feedback');
                    
                    feedback.style.display = 'block';
                    
                    const selectedChoice = this.getAttribute('data-choice');
                    if (selectedChoice === correctAnswer) {
                      correctFeedback.style.display = 'block';
                      incorrectFeedback.style.display = 'none';
                    } else {
                      correctFeedback.style.display = 'none';
                      incorrectFeedback.style.display = 'block';
                    }
                    
                    // Nonaktifkan semua tombol pilihan
                    storyModal.querySelectorAll('.choice-button').forEach(btn => 
                      btn.disabled = true);
                  });
                });
                
                // Reset button
                storyModal.querySelector('.reset-button').addEventListener('click', () => {
                  storyModal.querySelector('.feedback').style.display = 'none';
                  storyModal.querySelectorAll('.choice-button').forEach(btn => {
                    btn.classList.remove('selected');
                    btn.disabled = false;
                  });
                });
              }
              
              // Close button
              storyModal.querySelector('.close-modal').addEventListener('click', () => {
                document.body.removeChild(storyModal);
              });
            }}
            className="btn btn-ghost"
          >
            Baca Cerita
          </button>
        </div>
      </div>
    </article>
  );
}

export default function StoriesShowMoreClient({
  stories = [],
  initialCount = 6,
  step = 3,
  listId = "stories-list",
}) {
  // Get theme information
  const { theme, systemTheme } = useTheme();
  const currentTheme = theme === 'system' ? systemTheme : theme;
  const isDarkTheme = currentTheme === 'dark';
  
  const total = stories.length;
  const safeInitial = Math.max(0, Math.min(initialCount, total || 0));

  const [visible, setVisible] = useState(safeInitial);

  // Reset ke awal jika daftar stories berubah
  useEffect(() => {
    setVisible(Math.max(0, Math.min(initialCount, stories.length || 0)));
  }, [stories, initialCount]);

  const items = useMemo(
    () => (Array.isArray(stories) ? stories.slice(0, visible) : []),
    [stories, visible]
  );

  const canShowMore = visible < total;
  const canShowLess = visible > safeInitial;

  const handleShowMore = () => setVisible((v) => Math.min(v + step, total));
  const handleShowLess = () => setVisible(safeInitial);

  if (!total) {
    return <p className="muted">Belum ada cerita yang tersedia.</p>;
  }

  return (
    <>
      {/* Hasil cerita */}
      <section id={listId} className="card-grid" style={{ marginTop: "1.5rem" }}>
        {items.length > 0 ? (
          items.map((story) => (
            <MiniStoryCard key={story.slug} story={story} isDarkTheme={isDarkTheme} />
          ))
        ) : (
          <p style={{ gridColumn: "1 / -1", textAlign: "center" }}>
            Tidak ada cerita yang tersedia saat ini.
          </p>
        )}
      </section>

      {/* Footer tombol "Lihat selengkapnya" */}
      <div className="list-footer">
        {canShowMore ? (
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleShowMore}
            aria-controls={listId}
            aria-expanded={visible > safeInitial}
          >
            Lihat {Math.min(step, total - visible)} lagi
          </button>
        ) : null}

        {canShowLess ? (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleShowLess}
            aria-controls={listId}
            aria-expanded={visible > safeInitial}
          >
            Tampilkan lebih sedikit
          </button>
        ) : null}
      </div>

      {/* Hint opsional di bawah tombol */}
      <div className="list-hint">
        Menampilkan <strong>{visible}</strong> dari <strong>{total}</strong> cerita
      </div>
    </>
  );
}