// components/OptimizedImage.js
"use client";

import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  placeholder = 'blur',
  quality = 85,
  sizes = '100vw',
  className = '',
  style = {},
  onLoad,
  onError,
  ...props
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [actualSrc, setActualSrc] = useState(src);

  // Generate placeholder based on image type
  const generatePlaceholder = (width, height) => {
    const canvas = document.createElement('canvas');
    canvas.width = width || 400;
    canvas.height = height || 300;
    const ctx = canvas.getContext('2d');
    
    // Create gradient placeholder
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#f3f4f6');
    gradient.addColorStop(1, '#e5e7eb');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    return canvas.toDataURL('image/jpeg', 0.1);
  };

  // Detect WebP support and optimize format
  useEffect(() => {
    const checkWebPSupport = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL('image/webp').startsWith('data:image/webp');
    };

    const checkAVIFSupport = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL('image/avif').startsWith('data:image/avif');
    };

    let optimizedSrc = src;
    
    // Add format optimization if supported
    if (src && !src.includes('data:')) {
      const url = new URL(src, window.location.origin);
      
      if (checkAVIFSupport()) {
        url.searchParams.set('format', 'avif');
      } else if (checkWebPSupport()) {
        url.searchParams.set('format', 'webp');
      }
      
      // Add quality parameter if not already present
      if (!url.searchParams.has('q')) {
        url.searchParams.set('q', quality.toString());
      }
      
      optimizedSrc = url.toString();
    }
    
    setActualSrc(optimizedSrc);
  }, [src, quality]);

  const handleLoad = (event) => {
    setIsLoading(false);
    setHasError(false);
    
    // Measure image load performance
    if (performance.mark) {
      performance.mark('image-load-end');
      performance.measure('image-load-time', 'image-load-start', 'image-load-end');
    }
    
    if (onLoad) {
      onLoad(event);
    }
  };

  const handleError = (event) => {
    setIsLoading(false);
    setHasError(true);
    
    console.warn(`Failed to load image: ${src}`);
    
    if (onError) {
      onError(event);
    }
  };

  const handleLoadStart = () => {
    if (performance.mark) {
      performance.mark('image-load-start');
    }
  };

  // Error fallback image
  if (hasError) {
    return (
      <div 
        className={`image-error ${className}`}
        style={{
          width: width || '100%',
          height: height || 'auto',
          backgroundColor: '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6b7280',
          border: '1px dashed #d1d5db',
          borderRadius: '8px',
          ...style
        }}
      >
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🖼️</div>
          <div style={{ fontSize: '0.875rem' }}>Image not available</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`optimized-image-container ${className}`} style={style}>
      <Image
        src={actualSrc}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={placeholder === 'blur' ? generatePlaceholder(width, height) : undefined}
        quality={quality}
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
        onLoadStart={handleLoadStart}
        className={`optimized-image ${isLoading ? 'loading' : 'loaded'}`}
        {...props}
      />
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="image-loading-overlay">
          <div className="loading-spinner" />
        </div>
      )}

      <style jsx>{`
        .optimized-image-container {
          position: relative;
          overflow: hidden;
        }

        .optimized-image {
          transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .optimized-image.loading {
          opacity: 0;
        }

        .optimized-image.loaded {
          opacity: 1;
        }

        .image-loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(243, 244, 246, 0.8);
          backdrop-filter: blur(4px);
        }

        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #e5e7eb;
          border-top: 3px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Responsive image optimizations */
        @media (max-width: 640px) {
          .optimized-image {
            max-width: 100%;
            height: auto;
          }
        }

        /* Reduce motion for accessibility */
        @media (prefers-reduced-motion: reduce) {
          .optimized-image,
          .loading-spinner {
            animation: none;
            transition: none;
          }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .image-loading-overlay {
            background: rgba(255, 255, 255, 0.9);
          }
          
          .loading-spinner {
            border-color: #000;
            border-top-color: #333;
          }
        }
      `}</style>
    </div>
  );
}

// Hook for lazy loading images with Intersection Observer
export function useLazyLoading(threshold = 0.1) {
  const [isInView, setIsInView] = useState(false);
  const [ref, setRef] = useState(null);

  useEffect(() => {
    if (!ref || !('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(ref);

    return () => observer.disconnect();
  }, [ref, threshold]);

  return [setRef, isInView];
}

// Component for lazy-loaded images
export function LazyImage({ src, alt, ...props }) {
  const [ref, isInView] = useLazyLoading();

  return (
    <div ref={ref}>
      {isInView ? (
        <OptimizedImage src={src} alt={alt} {...props} />
      ) : (
        <div 
          className="lazy-placeholder"
          style={{
            width: props.width || '100%',
            height: props.height || '200px',
            backgroundColor: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9ca3af'
          }}
        >
          Loading...
        </div>
      )}
    </div>
  );
}