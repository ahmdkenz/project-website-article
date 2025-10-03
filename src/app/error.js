"use client";

import { useEffect } from "react";

// Ini adalah komponen error bawaan Next.js untuk menangkap kesalahan
// pada tingkat halaman/route.
export default function Error({ error, reset }) {
  useEffect(() => {
    // Log error ke console dan layanan analitik jika diperlukan
    console.error("Next.js Error Boundary caught error:", error);
  }, [error]);

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
        onClick={() => reset()} 
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
        Coba Lagi
      </button>
      <button 
        onClick={() => window.location.href = "/"} 
        style={{
          backgroundColor: "#f0f0f0",
          border: "none",
          color: "#333",
          padding: "0.5rem 1rem",
          borderRadius: "4px",
          marginTop: "1rem",
          marginLeft: "0.5rem",
          cursor: "pointer"
        }}
      >
        Kembali ke Beranda
      </button>
    </div>
  );
}