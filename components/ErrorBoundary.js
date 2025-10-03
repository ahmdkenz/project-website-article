"use client";

import React, { Component } from "react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state agar render fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error ke layanan analitik atau console
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Kirim ke layanan analitik jika ada
    // if (window.gtag) {
    //   window.gtag('event', 'javascript_error', {
    //     'error_message': error.message,
    //     'error_stack': error.stack,
    //     'error_component': errorInfo.componentStack
    //   });
    // }
  }

  render() {
    if (this.state.hasError) {
      // Tampilkan UI fallback
      return (
        <div className="error-container" style={{
          padding: "2rem",
          margin: "1rem",
          border: "1px solid #f0c0c0",
          borderRadius: "8px",
          backgroundColor: "#fff8f8",
          color: "#333",
          textAlign: "center"
        }}>
          <h2 style={{ marginBottom: "1rem" }}>Terjadi Kesalahan</h2>
          <p>Maaf, terjadi kesalahan saat memuat halaman ini.</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              backgroundColor: "#0070f3",
              border: "none",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              marginTop: "1rem",
              cursor: "pointer"
            }}
          >
            Muat Ulang Halaman
          </button>
          {this.props.showDetails && this.state.error && (
            <details style={{ marginTop: "1rem", textAlign: "left" }}>
              <summary style={{ cursor: "pointer", fontWeight: "bold" }}>Detail Error</summary>
              <pre style={{ 
                overflowX: "auto", 
                padding: "1rem",
                backgroundColor: "#f5f5f5",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "0.9rem",
                marginTop: "0.5rem"
              }}>
                {this.state.error.toString()}
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;