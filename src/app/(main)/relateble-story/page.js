import { getStories } from '../../../../lib/stories';
import RelatableStory from '../../../../components/RelatableStory';

export const metadata = {
  title: 'Cerita Relatable | Yuk Literasi Keuangan',
  description: 'Cerita keuangan relatable yang dapat membantumu memahami konsep keuangan dengan cara yang lebih personal.'
};

export default function RelatableStoryPage() {
  // Ambil semua cerita, gunakan yang pertama
  const stories = getStories();
  const firstStory = stories.length > 0 ? stories[0] : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Cerita Relatable</h1>
      <p className="text-gray-600 mb-8">
        Cerita keuangan relatable yang dapat membantumu memahami konsep keuangan dengan cara yang lebih personal.
      </p>
      
      <RelatableStory story={firstStory} />
    </div>
  );
}