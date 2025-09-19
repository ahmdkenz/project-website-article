'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import MarkdownRenderer from '../components/MarkdownRenderer';

export default function TutorialPage({ params: paramsPromise }) {
  const [params, setParams] = useState(null);
  const [content, setContent] = useState('');
  const [metadata, setMetadata] = useState({
    title: 'Loading...',
    description: '',
    date: '',
    author: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function unwrapParams() {
      try {
        const resolvedParams = await paramsPromise;
        setParams(resolvedParams);
      } catch (err) {
        console.error('Error unwrapping params:', err);
        setError('Failed to load tutorial parameters.');
      }
    }

    unwrapParams();
  }, [paramsPromise]);

  useEffect(() => {
    if (!params) return;

    async function fetchTutorial() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/tutorial?slug=${params.tutorial}`);

        if (!response.ok) {
          throw new Error(`Failed to load tutorial content (${response.status})`);
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setContent(data.content);
        setMetadata({
          title: data.metadata.title || 'Untitled Tutorial',
          description: data.metadata.description || '',
          date: data.metadata.date || '',
          author: data.metadata.author || ''
        });
      } catch (err) {
        console.error('Error fetching tutorial:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTutorial();
  }, [params]);

  if (error) {
    return (
      <div className="tutorial-error-container">
        <h1>Oops, terjadi kesalahan!</h1>
        <p>{error}</p>
        <Link href="/yuk-literasi" className="btn-back">Kembali ke Daftar Tutorial</Link>
      </div>
    );
  }

  return (
    <div className="tutorial-container">
      {isLoading ? (
        <div className="loading-container">
          <p>Memuat tutorial...</p>
        </div>
      ) : (
        <>
          <div className="tutorial-header">
            <Link href="/yuk-literasi" className="btn-back">← Kembali ke Daftar Tutorial</Link>
            <div className="tutorial-meta">
              {metadata.date && <span className="tutorial-date">Diperbarui: {metadata.date}</span>}
              {metadata.author && <span className="tutorial-author">Oleh: {metadata.author}</span>}
            </div>
          </div>

          <div className="tutorial-content">
            <MarkdownRenderer markdownContent={content} />
          </div>
        </>
      )}

      <style jsx>{`
        .tutorial-container {
          max-width: 800px;
          margin: 2rem auto;
          padding: 0 1rem;
        }

        .loading-container {
          text-align: center;
          padding: 2rem;
        }

        .tutorial-error-container {
          text-align: center;
          padding: 2rem;
        }

        .tutorial-header {
          margin-bottom: 2rem;
          border-bottom: 1px solid #eaeaea;
          padding-bottom: 1rem;
        }

        .tutorial-meta {
          display: flex;
          justify-content: space-between;
          margin-top: 1rem;
          font-size: 0.9rem;
          color: #666;
        }

        .btn-back {
          display: inline-block;
          margin-bottom: 1rem;
          color: #0070f3;
          text-decoration: none;
        }

        .btn-back:hover {
          text-decoration: underline;
        }

        .tutorial-content {
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}