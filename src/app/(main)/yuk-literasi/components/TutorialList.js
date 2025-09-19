'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function TutorialList() {
  const [tutorials, setTutorials] = useState([
    {
      slug: 'cara-bikin-dana-darurat',
      title: 'Cara Membuat Dana Darurat dalam 30 Hari',
      description: 'Panduan langkah demi langkah untuk membangun dana darurat dengan mudah',
      icon: '💰'
    },
    {
      slug: 'cara-mengelola-utang',
      title: 'Cara Mengelola Utang dengan Bijak',
      description: 'Pelajari cara mengelola utang agar tidak menjadi beban finansial',
      icon: '💳'
    },
    {
      slug: 'memulai-investasi-modal-kecil',
      title: 'Memulai Investasi dengan Modal Kecil',
      description: 'Panduan langkah demi langkah untuk memulai investasi meski dengan dana terbatas',
      icon: '📈'
    }
  ]);

  return (
    <section className="tutorial-list-section">
      <h2 className="section-title">Mini Tutorial Keuangan</h2>
      <p className="section-description">
        Panduan praktis langkah demi langkah untuk mengelola keuangan Anda dengan lebih baik
      </p>
      
      <div className="tutorial-grid">
        {tutorials.map((tutorial) => (
          <Link href={`/yuk-literasi/${tutorial.slug}`} key={tutorial.slug} className="tutorial-card-link">
            <article className="tutorial-card">
              <div className="tutorial-icon">{tutorial.icon}</div>
              <h3 className="tutorial-title">{tutorial.title}</h3>
              <p className="tutorial-description">{tutorial.description}</p>
              <div className="tutorial-action">Baca Selengkapnya →</div>
            </article>
          </Link>
        ))}
      </div>
      
      <style jsx>{`
        .tutorial-list-section {
          margin: 3rem 0;
        }
        
        .section-title {
          font-size: 1.8rem;
          margin-bottom: 0.5rem;
          text-align: center;
        }
        
        .section-description {
          text-align: center;
          color: #666;
          margin-bottom: 2rem;
        }
        
        .tutorial-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        
        .tutorial-card-link {
          text-decoration: none;
          color: inherit;
        }
        
        .tutorial-card {
          border: 1px solid #eaeaea;
          border-radius: 8px;
          padding: 1.5rem;
          transition: all 0.3s ease;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .tutorial-card:hover {
          border-color: #0070f3;
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }
        
        .tutorial-icon {
          font-size: 2rem;
          margin-bottom: 1rem;
        }
        
        .tutorial-title {
          margin: 0.5rem 0;
          font-size: 1.3rem;
        }
        
        .tutorial-description {
          color: #666;
          margin-bottom: 1.5rem;
          flex-grow: 1;
        }
        
        .tutorial-action {
          margin-top: auto;
          color: #0070f3;
          font-weight: 500;
        }
      `}</style>
    </section>
  );
}