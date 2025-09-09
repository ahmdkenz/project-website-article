// app/about/page.js

export default function AboutPage() {
  return (
    <>
      <section className="hero small">
        <div className="hero-inner">
          <h1>Tentang LiterasiKu</h1>
          <p className="muted">
            Media edukasi keuangan sederhana untuk membantu masyarakat memahami dan
            mengelola uang dengan lebih bijak.
          </p>
        </div>
      </section>

      <div className="card-grid" style={{ marginTop: '2rem' }}>
        <article className="option-card">
          <div className="icon" aria-hidden="true">🎯</div>
          <h3>Visi Kami</h3>
          <p>
            Meningkatkan literasi keuangan masyarakat Indonesia agar mampu
            mengambil keputusan finansial yang cerdas, bijak, dan berkelanjutan.
          </p>
        </article>

        <article className="option-card">
          <div className="icon" aria-hidden="true">🚀</div>
          <h3>Misi Kami</h3>
          <ul style={{ paddingLeft: '1.2rem', listStyle: 'disc' }}>
            <li>Menyediakan artikel edukatif yang mudah dipahami.</li>
            <li>Membuat konten interaktif seperti flashcards.</li>
            <li>Menyediakan kamus istilah keuangan sederhana.</li>
            <li>Mendorong generasi muda untuk melek finansial.</li>
          </ul>
        </article>
        
        <article className="option-card">
          <div className="icon" aria-hidden="true">💡</div>
          <h3>Kenapa LiterasiKu?</h3>
          <p>
            LiterasiKu hadir karena banyak orang masih kesulitan memahami konsep
            dasar keuangan. Kami ingin semua orang bisa belajar sesuai gaya
            mereka.
          </p>
        </article>
      </div>
    </>
  );
}