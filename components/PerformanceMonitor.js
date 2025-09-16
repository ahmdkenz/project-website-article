// components/PerformanceMonitor.js
"use client";

import { useEffect } from 'react';

export default function PerformanceMonitor() {
  useEffect(() => {
    // Web Vitals monitoring
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Monitor Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.startTime);
            // Send to analytics service
            sendToAnalytics('LCP', entry.startTime);
          }
        }
      });
      
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // Browser doesn't support this metric
      }

      // Monitor First Input Delay (FID)
      const fidObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.entryType === 'first-input') {
            const fid = entry.processingStart - entry.startTime;
            console.log('FID:', fid);
            sendToAnalytics('FID', fid);
          }
        }
      });
      
      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        // Browser doesn't support this metric
      }

      // Monitor Cumulative Layout Shift (CLS)
      let clsValue = 0;
      let clsEntries = [];
      
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            clsEntries.push(entry);
            clsValue += entry.value;
          }
        }
        console.log('CLS:', clsValue);
        sendToAnalytics('CLS', clsValue);
      });
      
      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // Browser doesn't support this metric
      }

      // Monitor Navigation Timing
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0];
          if (navigation) {
            const metrics = {
              'DNS Lookup': navigation.domainLookupEnd - navigation.domainLookupStart,
              'TCP Connect': navigation.connectEnd - navigation.connectStart,
              'Request': navigation.responseStart - navigation.requestStart,
              'Response': navigation.responseEnd - navigation.responseStart,
              'DOM Processing': navigation.domContentLoadedEventStart - navigation.responseEnd,
              'Load Complete': navigation.loadEventEnd - navigation.loadEventStart,
              'Total Load Time': navigation.loadEventEnd - navigation.navigationStart
            };
            
            Object.entries(metrics).forEach(([name, value]) => {
              console.log(`${name}: ${value}ms`);
              sendToAnalytics(name.replace(' ', '_').toLowerCase(), value);
            });
          }
        }, 0);
      });

      // Resource loading performance
      const resourceObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.duration > 1000) { // Log slow resources (>1s)
            console.warn('Slow resource:', entry.name, entry.duration + 'ms');
            sendToAnalytics('slow_resource', {
              name: entry.name,
              duration: entry.duration,
              type: entry.initiatorType
            });
          }
        }
      });
      
      try {
        resourceObserver.observe({ entryTypes: ['resource'] });
      } catch (e) {
        // Browser doesn't support this
      }

      // Memory usage monitoring (if available)
      if ('memory' in performance) {
        const checkMemory = () => {
          const memory = performance.memory;
          const memoryUsage = {
            used: memory.usedJSHeapSize,
            total: memory.totalJSHeapSize,
            limit: memory.jsHeapSizeLimit,
            usage_percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
          };
          
          if (memoryUsage.usage_percentage > 80) {
            console.warn('High memory usage:', memoryUsage.usage_percentage + '%');
            sendToAnalytics('high_memory_usage', memoryUsage);
          }
        };
        
        // Check memory every 30 seconds
        const memoryInterval = setInterval(checkMemory, 30000);
        
        return () => {
          clearInterval(memoryInterval);
        };
      }

      // Clean up observers
      return () => {
        lcpObserver.disconnect();
        fidObserver.disconnect();
        clsObserver.disconnect();
        resourceObserver.disconnect();
      };
    }
  }, []);

  return null; // This component doesn't render anything
}

// Analytics helper function
function sendToAnalytics(metric, value) {
  // In a real application, you would send this to your analytics service
  // For example: Google Analytics, Mixpanel, etc.
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`📊 Analytics: ${metric}`, value);
  }
  
  // Example implementations:
  
  // Google Analytics 4
  if (typeof gtag !== 'undefined') {
    gtag('event', 'web_vitals', {
      metric_name: metric,
      metric_value: typeof value === 'number' ? Math.round(value) : value,
      custom_parameter: 'performance_monitoring'
    });
  }
  
  // Custom analytics endpoint
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metric,
        value,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        connection: navigator.connection ? {
          effectiveType: navigator.connection.effectiveType,
          downlink: navigator.connection.downlink,
          rtt: navigator.connection.rtt
        } : null
      })
    }).catch(error => {
      console.error('Failed to send analytics:', error);
    });
  }
  
  // Local storage for debugging
  if (process.env.NODE_ENV === 'development') {
    const analytics = JSON.parse(localStorage.getItem('performance_analytics') || '[]');
    analytics.push({
      metric,
      value,
      timestamp: Date.now(),
      url: window.location.href
    });
    
    // Keep only last 100 entries
    if (analytics.length > 100) {
      analytics.splice(0, analytics.length - 100);
    }
    
    localStorage.setItem('performance_analytics', JSON.stringify(analytics));
  }
}

// Export analytics function for manual tracking
export { sendToAnalytics };