'use client';

import { use, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import MainLayout from '../../layout';
import '@/styles/footer.css';
import '@/styles/base.css'; // Import base CSS untuk variabel tema
import '@/styles/mini-quizzes.css';
import MiniQuiz from '@/components/MiniQuiz';
import './tutorial.css';

export default function TutorialPageWrapper(props) {
  return (
    <MainLayout>
      <TutorialPage {...props} />
    </MainLayout>
  );
}

function TutorialPage({ params: paramsPromise }) {
  const params = use(paramsPromise);

  const [content, setContent] = useState('');
  const [metadata, setMetadata] = useState({
    title: 'Loading...',
    description: '',
    date: '',
    author: ''
  });
  const [questions, setQuestions] = useState([]);
  const [steps, setSteps] = useState([]); // steps from metadata if available
  const [currentStep, setCurrentStep] = useState(0); // current step index
  const [transitionDirection, setTransitionDirection] = useState('next'); // 'next' | 'prev'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const stepTopRef = useRef(null);
  const touchStartXRef = useRef(null);

  useEffect(() => {
    if (!params) return;

    async function fetchTutorial() {
      try {
        setIsLoading(true);
        console.log(`Fetching tutorial for slug: ${params.slug}`); // Log the slug value
        const response = await fetch(`/api/tutorial?slug=${params.slug}`);

        if (!response.ok) {
          if (response.status === 404) {
            console.error(`Tutorial not found for slug: ${params.slug}`);
            throw new Error(`Tutorial not found (404)`);
          }
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
        // Load quiz questions if type is quiz
        if (data?.metadata?.type === 'quiz' && Array.isArray(data?.metadata?.questions)) {
          setQuestions(data.metadata.questions);
        } else {
          setQuestions([]);
        }
        setSteps(Array.isArray(data.steps) ? data.steps : []);

        // Initialize step from URL hash if present (#step-N)
        if (Array.isArray(data.steps) && data.steps.length > 0 && typeof window !== 'undefined') {
          const match = window.location.hash.match(/#step-(\d+)/);
          if (match) {
            const idx = Math.max(0, Math.min(parseInt(match[1], 10) - 1, data.steps.length - 1));
            setCurrentStep(idx);
          } else {
            setCurrentStep(0);
          }
        } else {
          setCurrentStep(0);
        }
      } catch (err) {
        console.error('Error fetching tutorial:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTutorial();
  }, [params]);

  // Keep URL hash in sync with current step and smooth scroll to top of step content
  useEffect(() => {
    if (steps.length > 0 && typeof window !== 'undefined') {
      const newHash = `#step-${currentStep + 1}`;
      if (window.location.hash !== newHash) {
        // Avoid adding extra history entries
        history.replaceState(null, '', newHash);
      }
    }
    // Smooth scroll to the top of the step area
    stepTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [currentStep, steps.length]);

  // Keyboard navigation (Left/Right arrows)
  useEffect(() => {
    const onKeyDown = (e) => {
      if (steps.length === 0) return;
      if (e.key === 'ArrowRight') handleNextStep();
      if (e.key === 'ArrowLeft') handlePreviousStep();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [steps.length, currentStep]);

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setTransitionDirection('next');
      setCurrentStep((s) => s + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setTransitionDirection('prev');
      setCurrentStep((s) => s - 1);
    }
  };

  const goToStep = (idx) => {
    if (idx === currentStep || idx < 0 || idx >= steps.length) return;
    setTransitionDirection(idx > currentStep ? 'next' : 'prev');
    setCurrentStep(idx);
  };

  const onTouchStart = (e) => {
    if (e.touches && e.touches.length > 0) {
      touchStartXRef.current = e.touches[0].clientX;
    }
  };

  const onTouchEnd = (e) => {
    const startX = touchStartXRef.current;
    if (startX == null) return;
    const endX = (e.changedTouches && e.changedTouches[0]?.clientX) ?? startX;
    const deltaX = endX - startX;
    const threshold = 50; // px
    if (deltaX < -threshold) handleNextStep();
    if (deltaX > threshold) handlePreviousStep();
    touchStartXRef.current = null;
  };

  const stepsCount = steps.length;
  const progressPct = stepsCount > 0 ? Math.round(((currentStep + 1) / stepsCount) * 100) : 0;

  useEffect(() => {
    console.log(`Steps count: ${steps.length}`);
    console.log(`Current step: ${currentStep}`);
    console.log(`Progress percentage: ${progressPct}%`);
  }, [steps.length, currentStep, progressPct]);

  if (error) {
    return (
      <div className="tutorial-error-container">
        <h1>Oops, terjadi kesalahan!</h1>
        <p>{error}</p>
        <Link href="/yuk-literasi" className="btn-back">Kembali ke Daftar Tutorial</Link>
      </div>
    );
  }

  if (!content && steps.length === 0 && questions.length === 0) {
    return <div>Content not found. Please check the URL or try again later.</div>;
  }

  // Resolve current step item (string or object with title/content)
  const stepItem = stepsCount > 0 ? steps[currentStep] : null;
  const stepTitle = stepItem && typeof stepItem === 'object' && stepItem !== null ? stepItem.title : null;
  const stepContent = stepItem && typeof stepItem === 'object' && stepItem !== null ? (stepItem.content ?? '') : (typeof stepItem === 'string' ? stepItem : '');

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
              {metadata.date && <span className="tutorial-date">📅 {metadata.date}</span>}
              {metadata.author && <span className="tutorial-author">✍️ {metadata.author}</span>}
            </div>
          </div>

          <div className="tutorial-content" ref={stepTopRef} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <h1>{metadata.title}</h1>
            {metadata.description && <p>{metadata.description}</p>}

            {Array.isArray(questions) && questions.length > 0 ? (
              <MiniQuiz title={metadata.title} questions={questions} pointsPerCorrect={metadata.pointsPerCorrect ?? 10} />
            ) : stepsCount > 0 ? (
              <div className="step-guide" aria-live="polite">
                <div className="sg-progress" aria-label={`Progres ${progressPct}%`}>
                  <div className="sg-progressBar" style={{ width: `${progressPct}%` }} />
                </div>

                <div className={`step-slide ${transitionDirection === 'next' ? 'slide-in-right' : 'slide-in-left'}`} key={currentStep}>
                  <h2>Langkah {currentStep + 1} dari {stepsCount}{stepTitle ? `: ${stepTitle}` : ''}</h2>
                  {stepContent ? (
                    <MarkdownRenderer markdownContent={stepContent} />
                  ) : (
                    <p>Ikuti instruksi pada langkah ini.</p>
                  )}
                </div>

                <div className="step-navigation">
                  <button onClick={handlePreviousStep} disabled={currentStep === 0} aria-label="Langkah sebelumnya">Sebelumnya</button>
                  <div className="step-dots" role="tablist" aria-label="Navigasi langkah">
                    {steps.map((_, idx) => (
                      <button
                        key={idx}
                        role="tab"
                        aria-selected={idx === currentStep}
                        className={`dot ${idx === currentStep ? 'active' : ''}`}
                        onClick={() => goToStep(idx)}
                        aria-label={`Pergi ke langkah ${idx + 1}`}
                        title={`Langkah ${idx + 1}`}
                      />
                    ))}
                  </div>
                  <button onClick={handleNextStep} disabled={currentStep === stepsCount - 1} aria-label="Langkah berikutnya">Berikutnya</button>
                </div>
              </div>
            ) : (
              <MarkdownRenderer markdownContent={content} />
            )}
          </div>
        </>
      )}
    </div>
  );
}