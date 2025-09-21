'use server';

import { notFound } from 'next/navigation';
import RelatableStory from '../../../../../components/RelatableStory';
import { getStoryBySlug } from '../../../../../lib/server/stories';
import Link from 'next/link';
import '../../../../../styles/base.css'; // Pastikan file CSS global sudah diimpor

export default async function StoryPage({ params }) {
  const { slug } = params;
  const story = await getStoryBySlug(slug);

  if (!story) {
    notFound();
  }

  return (
    <>
      <div className="container" style={{ marginTop: '2rem', marginBottom: '3rem' }}>
        {/* Navigasi kembali */}
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/yuk-literasi" className="btn btn-ghost btn-sm">
            &larr; Kembali ke daftar cerita
          </Link>
        </div>

        {/* Tampilkan cerita dengan komponen yang sudah ada */}
        <div className="story-content">
          <RelatableStory story={story} />
        </div>
      </div>
    </>
  );
}