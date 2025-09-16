// components/ErrorBoundary.js
"use client";

import React from 'react';
import { useI18n } from '@/lib/i18n';

class ErrorBoundaryClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }

    // Save error details
    this.setState({
      error,
      errorInfo
    });

    // Send error to analytics/logging service
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    // In production, send to error tracking service like Sentry
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry error logging
      // Sentry.captureException(error, { extra: errorInfo });
    }

    // Custom error logging
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: localStorage.getItem('userId') || 'anonymous'
    };

    // Send to custom analytics endpoint
    if (process.env.NEXT_PUBLIC_ERROR_ENDPOINT) {
      fetch(process.env.NEXT_PUBLIC_ERROR_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorData)
      }).catch(err => {
        console.error('Failed to log error:', err);
      });
    }

    // Store in localStorage for debugging
    const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
    errors.push(errorData);
    
    // Keep only last 10 errors
    if (errors.length > 10) {
      errors.splice(0, errors.length - 10);
    }
    
    localStorage.setItem('app_errors', JSON.stringify(errors));
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={this.handleRetry}
          onReload={this.handleReload}
          t={this.props.t}
        />
      );
    }

    return this.props.children;
  }
}

// Error fallback component
function ErrorFallback({ error, errorInfo, onRetry, onReload, t }) {
  const isProduction = process.env.NODE_ENV === 'production';

  return (
    <div className="error-boundary">
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        
        <h1 className="error-title">
          {t ? t('common.error') : 'Terjadi Kesalahan'}
        </h1>
        
        <p className="error-message">
          {isProduction 
            ? (t ? t('error.production_message') : 'Maaf, terjadi kesalahan yang tidak terduga. Tim kami telah diberitahu dan akan segera memperbaikinya.')
            : error?.message || 'Something went wrong'
          }
        </p>

        <div className="error-actions">
          <button onClick={onRetry} className="btn-primary">
            {t ? t('error.retry') : 'Coba Lagi'}
          </button>
          
          <button onClick={onReload} className="btn-secondary">
            {t ? t('error.reload') : 'Muat Ulang Halaman'}
          </button>
          
          <button 
            onClick={() => window.history.back()} 
            className="btn-ghost"
          >
            {t ? t('error.go_back') : 'Kembali'}
          </button>
        </div>

        {!isProduction && (
          <details className="error-details">
            <summary>Technical Details (Development Only)</summary>
            <div className="error-stack">
              <h4>Error:</h4>
              <pre>{error?.stack}</pre>
              
              <h4>Component Stack:</h4>
              <pre>{errorInfo?.componentStack}</pre>
            </div>
          </details>
        )}

        <div className="error-help">
          <p>
            {t ? t('error.help_text') : 'Jika masalah terus berlanjut, silakan hubungi tim support kami.'}
          </p>
        </div>
      </div>

      <style jsx>{`
        .error-boundary {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          padding: 1rem;
        }

        .error-container {
          max-width: 600px;
          text-align: center;
          background: white;
          border-radius: 16px;
          padding: 3rem 2rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          border: 1px solid #fed7d7;
        }

        .error-icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        }

        .error-title {
          font-size: 2rem;
          color: #dc2626;
          margin-bottom: 1rem;
          font-weight: 700;
        }

        .error-message {
          font-size: 1.1rem;
          color: #6b7280;
          line-height: 1.6;
          margin-bottom: 2rem;
        }

        .error-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 2rem;
        }

        .btn-primary, .btn-secondary, .btn-ghost {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          min-width: 120px;
        }

        .btn-primary {
          background: #dc2626;
          color: white;
        }

        .btn-primary:hover {
          background: #b91c1c;
          transform: translateY(-2px);
        }

        .btn-secondary {
          background: #6b7280;
          color: white;
        }

        .btn-secondary:hover {
          background: #4b5563;
          transform: translateY(-2px);
        }

        .btn-ghost {
          background: transparent;
          color: #6b7280;
          border: 1px solid #d1d5db;
        }

        .btn-ghost:hover {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        .error-details {
          text-align: left;
          margin: 2rem 0;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .error-details summary {
          cursor: pointer;
          font-weight: 600;
          color: #374151;
          margin-bottom: 1rem;
        }

        .error-stack {
          margin-top: 1rem;
        }

        .error-stack h4 {
          margin: 1rem 0 0.5rem;
          color: #374151;
        }

        .error-stack pre {
          background: #1f2937;
          color: #f9fafb;
          padding: 1rem;
          border-radius: 6px;
          overflow-x: auto;
          font-size: 0.875rem;
          line-height: 1.4;
        }

        .error-help {
          border-top: 1px solid #e5e7eb;
          padding-top: 1.5rem;
          margin-top: 1.5rem;
        }

        .error-help p {
          color: #6b7280;
          font-size: 0.9rem;
          margin: 0;
        }

        @media (max-width: 640px) {
          .error-container {
            padding: 2rem 1.5rem;
          }
          
          .error-icon {
            font-size: 3rem;
          }
          
          .error-title {
            font-size: 1.5rem;
          }
          
          .error-actions {
            flex-direction: column;
            align-items: center;
          }
          
          .btn-primary, .btn-secondary, .btn-ghost {
            width: 100%;
            max-width: 250px;
          }
        }
      `}</style>
    </div>
  );
}

// Wrapper component that provides translation context
export default function ErrorBoundary({ children }) {
  // Use try-catch to handle cases where I18nProvider is not available
  let t;
  try {
    const context = useI18n();
    t = context?.t;
  } catch (error) {
    // If useI18n fails, t will be undefined and we'll use fallback text
    t = undefined;
  }
  
  return (
    <ErrorBoundaryClass t={t}>
      {children}
    </ErrorBoundaryClass>
  );
}