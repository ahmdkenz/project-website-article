// app/(main)/yuk-literasi/page.js
import Image from "next/image";
import YukLiterasiTabs from './components/YukLiterasiTabs';
import { getStories } from '../../../../lib/server/stories';
import { getAllQuizFiles, getQuizData } from '../../../../lib/quizzes';
import './styles.css';

export default async function YukLiterasiPage() {
  // Banner images
  const bannerSrc1 = "/brand/hero-yuk-literasi.jpg";
  const bannerSrc2 = "/brand/hero-2.jpg";

  // Stories data
  const stories = await getStories();

  // Quizzes data (read MDX frontmatter only)
  const quizFiles = getAllQuizFiles();
  const quizzes = quizFiles.map((file) => {
    const { data } = getQuizData(file);
    return {
      title: data.title,
      description: data.description,
      questions: data.questions,
      pointsPerCorrect: data.pointsPerCorrect || 10,
    };
  });

  return (
    <>
      {/* Hero banner */}
      <section className="hero">
        <div className="hero-media" aria-hidden="true">
          <Image src={bannerSrc1} alt="" fill sizes="100vw" priority={false} className="hero-img" id="hero-img-1" />
          <Image src={bannerSrc2} alt="" fill sizes="100vw" priority={false} className="hero-img" id="hero-img-2" />
          <div className="hero-overlay" />
        </div>
      </section>

      {/* Tabs container mirroring Simulator */}
      <div className="container" style={{ marginTop: '2rem', marginBottom: '3rem' }}>
        <YukLiterasiTabs stories={stories} quizzes={quizzes} />
      </div>
    </>
  );
}