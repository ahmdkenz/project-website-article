// app/(main)/dictionary/page.js
import { getAllTerms } from '@/lib/data';
import DictionaryList from '@/components/DictionaryList';

export const revalidate = 60;

export default async function DictionaryPage() {
  const termsData = await getAllTerms();
  const allTermsList = Object.values(termsData).flat();

  return (
    <main className="container">
      {/* Hero tetap ada */}
      <section className="hero small">
        <h1>📖 Kamus Istilah Keuangan</h1>
        <p className="muted">
          Cari istilah keuangan dan pelajari definisinya dengan mudah.
        </p>
      </section>

      {/* Area pencarian */}
      <section className="options-section">
        <div className="search-area">
          <DictionaryList allTerms={allTermsList} />
        </div>
      </section>
    </main>
  );
}
