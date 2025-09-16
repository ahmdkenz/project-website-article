// src/app/not-found.js
"use client";

import Link from 'next/link';
import { useEffect } from 'react';

export default function NotFound() {
  // Set page title dynamically
  useEffect(() => {
    document.title = '404 - Halaman Tidak Ditemukan | Yuk Literasi Keuangan';
  }, []);
  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <div className="not-found-content">
          <div className="error-code">404</div>
          <h1 className="error-title">Halaman Tidak Ditemukan</h1>
          <p className="error-description">
            Maaf, halaman yang Anda cari tidak dapat ditemukan. 
            Mungkin telah dipindahkan atau tautan yang Anda gunakan sudah tidak valid.
          </p>
          
          <div className="error-actions">
            <Link href="/" className="btn-primary">
              Kembali ke Beranda
            </Link>
            
            <Link href="/articles" className="btn-secondary">
              Lihat Artikel
            </Link>
            
            <button 
              onClick={() => window.history.back()}
              className="btn-ghost"
            >
              Kembali
            </button>
          </div>

          <div className="error-suggestions">
            <h3>Mungkin Anda mencari:</h3>
            <ul>
              <li><Link href="/articles">Artikel Terbaru</Link></li>
              <li><Link href="/dictionary">Kamus Finansial</Link></li>
              <li><Link href="/flashcards">Kartu Belajar</Link></li>
              <li><Link href="/about">Tentang Kami</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="error-illustration">
          <div className="floating-elements">
            <div className="element">📚</div>
            <div className="element">💰</div>
            <div className="element">📊</div>
            <div className="element">🎯</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .not-found-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2rem 1rem;
        }

        .not-found-container {
          max-width: 800px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          align-items: center;
        }

        .not-found-content {
          text-align: left;
        }

        .error-code {
          font-size: 6rem;
          font-weight: 900;
          line-height: 1;
          margin-bottom: 1rem;
          background: linear-gradient(45deg, #fbbf24, #f59e0b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        }

        .error-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        .error-description {
          font-size: 1.1rem;
          line-height: 1.6;
          margin-bottom: 2rem;
          opacity: 0.9;
        }

        .error-actions {
          display: flex;
          gap: 1rem;
          margin-bottom: 3rem;
          flex-wrap: wrap;
        }

        .btn-primary, .btn-secondary, .btn-ghost {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          display: inline-block;
          text-align: center;
          min-width: 120px;
        }

        .btn-primary {
          background: #2563eb;
          color: white;
        }

        .btn-primary:hover {
          background: #1d4ed8;
          transform: translateY(-2px);
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .btn-ghost {
          background: transparent;
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .btn-ghost:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .error-suggestions {
          background: rgba(255, 255, 255, 0.1);
          padding: 1.5rem;
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }

        .error-suggestions h3 {
          margin-bottom: 1rem;
          font-size: 1.2rem;
        }

        .error-suggestions ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .error-suggestions li {
          margin-bottom: 0.5rem;
        }

        .error-suggestions a {
          color: white;
          text-decoration: none;
          opacity: 0.9;
          transition: opacity 0.2s ease;
        }

        .error-suggestions a:hover {
          opacity: 1;
          text-decoration: underline;
        }

        .error-illustration {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          min-height: 400px;
        }

        .floating-elements {
          position: relative;
          width: 200px;
          height: 200px;
        }

        .element {
          position: absolute;
          font-size: 3rem;
          animation: float 6s ease-in-out infinite;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
        }

        .element:nth-child(1) {
          top: 0;
          left: 0;
          animation-delay: 0s;
        }

        .element:nth-child(2) {
          top: 0;
          right: 0;
          animation-delay: 1.5s;
        }

        .element:nth-child(3) {
          bottom: 0;
          left: 0;
          animation-delay: 3s;
        }

        .element:nth-child(4) {
          bottom: 0;
          right: 0;
          animation-delay: 4.5s;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) rotate(5deg);
          }
          50% {
            transform: translateY(-10px) rotate(-5deg);
          }
          75% {
            transform: translateY(-15px) rotate(3deg);
          }
        }

        @media (max-width: 768px) {
          .not-found-container {
            grid-template-columns: 1fr;
            gap: 2rem;
            text-align: center;
          }

          .not-found-content {
            text-align: center;
          }

          .error-code {
            font-size: 4rem;
          }

          .error-title {
            font-size: 2rem;
          }

          .error-actions {
            justify-content: center;
            flex-direction: column;
            align-items: center;
          }

          .btn-primary, .btn-secondary, .btn-ghost {
            width: 100%;
            max-width: 200px;
          }

          .error-illustration {
            min-height: 250px;
          }

          .floating-elements {
            width: 150px;
            height: 150px;
          }

          .element {
            font-size: 2rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .element {
            animation: none;
          }
          
          .btn-primary:hover,
          .btn-secondary:hover,
          .btn-ghost:hover {
            transform: none;
          }
        }
      `}</style>
    </div>
  );
}