// components/LanguageSwitcher.js
"use client";

import { useState, useRef, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';

export default function LanguageSwitcher() {
  const { locale, setLocale, supportedLocales, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on escape key
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleLanguageChange = (newLocale) => {
    setLocale(newLocale);
    setIsOpen(false);
  };

  const currentLocale = supportedLocales[locale];

  return (
    <div className="language-switcher" ref={dropdownRef}>
      <button
        className="btn-ghost btn-sm language-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Current language: ${currentLocale.name}`}
        title={`Change language - Current: ${currentLocale.name}`}
      >
        <span className="language-flag">{currentLocale.flag}</span>
        <span className="language-code">{locale.toUpperCase()}</span>
        <span className="dropdown-arrow" aria-hidden="true">
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {isOpen && (
        <div 
          className="language-dropdown"
          role="listbox"
          aria-label="Available languages"
        >
          {Object.entries(supportedLocales).map(([code, localeInfo]) => (
            <button
              key={code}
              role="option"
              aria-selected={code === locale}
              className={`language-option ${code === locale ? 'active' : ''}`}
              onClick={() => handleLanguageChange(code)}
              title={`Switch to ${localeInfo.name}`}
            >
              <span className="language-flag">{localeInfo.flag}</span>
              <span className="language-name">{localeInfo.name}</span>
              {code === locale && (
                <span className="checkmark" aria-hidden="true">✓</span>
              )}
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        .language-switcher {
          position: relative;
          display: inline-block;
        }

        .language-trigger {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.5rem 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          background: var(--surface-color);
          color: var(--text-color);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .language-trigger:hover {
          background: var(--surface-hover);
          border-color: var(--border-hover);
        }

        .language-trigger:focus {
          outline: 2px solid var(--ring-color);
          outline-offset: 2px;
        }

        .language-flag {
          font-size: 1rem;
          line-height: 1;
        }

        .language-code {
          font-weight: 500;
          min-width: 1.5rem;
          text-align: center;
        }

        .dropdown-arrow {
          font-size: 0.75rem;
          color: var(--text-muted);
          transition: transform 0.2s ease;
        }

        .language-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 0.25rem;
          min-width: 160px;
          background: var(--surface-color);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          overflow: hidden;
        }

        .language-option {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.75rem;
          border: none;
          background: transparent;
          color: var(--text-color);
          font-size: 0.875rem;
          cursor: pointer;
          transition: background 0.2s ease;
          text-align: left;
        }

        .language-option:hover {
          background: var(--surface-hover);
        }

        .language-option:focus {
          outline: 2px solid var(--ring-color);
          outline-offset: -2px;
        }

        .language-option.active {
          background: var(--primary-subtle);
          color: var(--primary-color);
        }

        .language-name {
          flex: 1;
          font-weight: 400;
        }

        .checkmark {
          color: var(--success-color);
          font-weight: bold;
        }

        /* Mobile responsive */
        @media (max-width: 640px) {
          .language-dropdown {
            right: auto;
            left: 0;
            min-width: 140px;
          }
          
          .language-trigger {
            padding: 0.4rem 0.6rem;
          }
          
          .language-option {
            padding: 0.6rem;
          }
        }
      `}</style>
    </div>
  );
}