// src/app/offline/page.js
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check initial connection status
    setIsOnline(navigator.onLine);

    // Listen for connection changes
    const handleOnline = () => {
      setIsOnline(true);
      // Optionally redirect back to previous page
      setTimeout(() => {
        router.back();
      }, 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [router]);

  return (
    <div className="offline-page">
      <div className="offline-container">
        <div className="offline-icon">
          {isOnline ? '🌐' : '📚'}
        </div>
        
        {isOnline ? (
          <div className="reconnected">
            <h1>Koneksi Pulih!</h1>
            <p>Anda kembali online. Mengalihkan ke halaman sebelumnya...</p>
            <div className="loading-spinner" />
          </div>
        ) : (
          <div className="offline-content">
            <h1>Anda Sedang Offline</h1>
            <p>
              Koneksi internet tidak tersedia saat ini. Beberapa konten mungkin 
              tidak dapat diakses, tetapi konten yang sudah dimuat masih bisa dibaca.
            </p>
            
            <div className="offline-tips">
              <h3>Tips saat offline:</h3>
              <ul>
                <li>Artikel yang sudah dibuka sebelumnya masih bisa dibaca</li>
                <li>Bookmark dan preferensi tersimpan di perangkat Anda</li>
                <li>Fitur pencarian untuk konten lokal masih berfungsi</li>
              </ul>
            </div>

            <div className="offline-actions">
              <button 
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                Coba Lagi
              </button>
              
              <button 
                onClick={() => router.push('/')}
                className="btn-secondary"
              >
                Kembali ke Beranda
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .offline-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1rem;
        }

        .offline-container {
          max-width: 480px;
          text-align: center;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 3rem 2rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .offline-icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }

        h1 {
          font-size: 2rem;
          margin-bottom: 1rem;
          font-weight: 700;
        }

        p {
          font-size: 1.1rem;
          line-height: 1.6;
          margin-bottom: 2rem;
          opacity: 0.9;
        }

        .offline-tips {
          text-align: left;
          background: rgba(255, 255, 255, 0.1);
          padding: 1.5rem;
          border-radius: 12px;
          margin: 2rem 0;
        }

        .offline-tips h3 {
          margin-bottom: 1rem;
          font-size: 1.2rem;
        }

        .offline-tips ul {
          list-style: none;
          padding: 0;
        }

        .offline-tips li {
          margin-bottom: 0.5rem;
          padding-left: 1.5rem;
          position: relative;
        }

        .offline-tips li::before {
          content: '💡';
          position: absolute;
          left: 0;
        }

        .offline-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-primary, .btn-secondary {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
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

        .reconnected {
          animation: fadeIn 0.5s ease-in;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top: 3px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 1rem auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 640px) {
          .offline-container {
            padding: 2rem 1.5rem;
          }
          
          .offline-icon {
            font-size: 3rem;
          }
          
          h1 {
            font-size: 1.5rem;
          }
          
          .offline-actions {
            flex-direction: column;
            align-items: center;
          }
          
          .btn-primary, .btn-secondary {
            width: 100%;
            max-width: 200px;
          }
        }
      `}</style>
    </div>
  );
}