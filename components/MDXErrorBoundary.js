"use client";

import { Component } from "react";

class MDXErrorBoundary extends Component {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error("MDX rendering error:", error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: "1.5rem",
          margin: "1rem 0",
          border: "1px solid #e0e0e0",
          borderRadius: "6px",
          backgroundColor: "#f9f9f9"
        }}>
          <h3 style={{ marginBottom: "0.75rem" }}>Konten tidak dapat ditampilkan</h3>
          <p>Maaf, ada kendala teknis saat memuat konten ini.</p>
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
        </div>
      );
    }
    return this.props.children;
  }
}

export default MDXErrorBoundary;