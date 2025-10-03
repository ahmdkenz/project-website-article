import Link from 'next/link';

// Halaman 404 kustom yang akan digunakan jika halaman tidak ditemukan
export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>404 - Halaman Tidak Ditemukan</h1>
      <p style={{ marginBottom: '2rem' }}>
        Maaf, halaman yang Anda cari tidak dapat ditemukan.
      </p>
      <Link href="/" style={{
        backgroundColor: '#0070f3',
        color: 'white',
        padding: '0.75rem 1.5rem',
        borderRadius: '0.375rem',
        textDecoration: 'none',
        fontWeight: 'bold'
      }}>
        Kembali ke Beranda
      </Link>
    </div>
  );
}