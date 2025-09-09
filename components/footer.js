// components/Footer.js
"use client"; // "use client" WAJIB di sini karena kita menggunakan new Date()

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <p>© {currentYear} Yuk Literasi Keuangan. Dibuat dengan ❤ untuk edukasi finansial.</p>
      </div>
    </footer>
  );
}