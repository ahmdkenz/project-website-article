"use client";
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import styles from './TutorialList.module.css';

export default function TutorialList({ initialCount = 6, step = 6, listId = 'tutorial-list' }) {
  const [tutorials, setTutorials] = useState([]);
  const [visible, setVisible] = useState(initialCount);

  useEffect(() => {
    async function fetchTutorials() {
      try {
        const response = await fetch('/api/tutorials');
        if (!response.ok) {
          throw new Error('Gagal memuat daftar tutorial.');
        }
        const data = await response.json();
        setTutorials(data);
      } catch (error) {
        console.error('Error fetching tutorials:', error);
      }
    }

    fetchTutorials();
  }, []);

  const total = tutorials.length;
  const items = useMemo(() => tutorials.slice(0, visible), [tutorials, visible]);

  const canShowMore = visible < total;
  const canShowLess = visible > initialCount;

  const handleShowMore = () => setVisible((v) => Math.min(v + step, total));
  const handleShowLess = () => setVisible(initialCount);

  // Tambahkan fungsi untuk memetakan judul ke emoticon berdasarkan konten di `content/yuk-literasi`
  function getEmoticonByTitle(title) {
    const mapping = {
      'Akumulasi Aset': '💰',
      'Cara Membuat Dana Darurat dalam 30 Hari': '⛑️',
      'Cara Mengelola Utang dengan Bijak': '📉',
      'Edukasi Berkelanjutan': '📚',
      'Manajemen Arus Kas': '💵',
      'Memulai Investasi dengan Modal Kecil': '📈',
      'Pengelolaan Utang': '🧾',
      'Pengenalan Investasi': '💡',
      'Prioritas Finansial': '🎯',
    };
    return mapping[title] || '📘'; // Default emoticon jika tidak ada pemetaan
  }

  if (!total) {
    return <p className="muted">Belum ada tutorial untuk ditampilkan.</p>;
  }

  return (
    <>
      <section className={styles['tutorial-list-section']}>
        <h2 className={styles['section-title']}>Mini Tutorial Keuangan</h2>
        <p className={styles['section-description']}>
          Panduan praktis langkah demi langkah untuk mengelola keuangan Anda dengan lebih baik
        </p>

        <div id={listId} className={styles['tutorial-grid']} aria-live="polite">
          {items.map((tutorial) => (
            <Link href={tutorial.type === 'quiz' ? `/quizzes/${tutorial.slug}` : `/yuk-literasi/tutorial/${tutorial.slug}`} key={tutorial.slug} className={styles['tutorial-card-link']}>
              <article className={styles['tutorial-card']}>
                <h3 className={styles['tutorial-title']}>
                  <span className="emoticon">{getEmoticonByTitle(tutorial.title)}</span>
                  {tutorial.title}
                </h3>
                <p className={styles['tutorial-description']}>{tutorial.description}</p>
                <div className={styles['tutorial-action']}>Baca Selengkapnya →</div>
              </article>
            </Link>
          ))}
        </div>

        <div className={styles['list-footer']}>
          {canShowMore && (
            <button
              type="button"
              className={`${styles.btn} ${styles['btn-outline']}`}
              onClick={handleShowMore}
              aria-controls={listId}
              aria-expanded={visible > initialCount}
            >
              Lihat {Math.min(step, total - visible)} lagi
            </button>
          )}

          {canShowLess && (
            <button
              type="button"
              className={`${styles.btn} ${styles['btn-ghost']}`}
              onClick={handleShowLess}
              aria-controls={listId}
              aria-expanded={visible > initialCount}
            >
              Tampilkan lebih sedikit
            </button>
          )}
        </div>

        <div className={styles['list-hint']}>
          Menampilkan <strong>{visible}</strong> dari <strong>{total}</strong> tutorial
        </div>
      </section>
    </>
  );
}