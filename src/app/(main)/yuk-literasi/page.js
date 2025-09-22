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
      id: data.id || file.replace(/\.[^./]+$/, ""),
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

      {/* Hero content section - mirroring articles page structure */}
      <section className="hero-content" aria-labelledby="yuk-literasi-title">
        <h1 id="yuk-literasi-title" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
          <span style={{fontSize:'1.2em',marginRight:6}}>📚</span>
          Yuk Literasi Keuangan
        </h1>
        <p className="muted" style={{textAlign:'center'}}>
          Pelajari konsep keuangan melalui tutorial, cerita relatable, dan mini quiz yang interaktif.
        </p>
      </section>

      {/* Main content container - using same pattern as articles */}
      <section className="yuk-literasi-compact container" aria-labelledby="literasi-content">
        <YukLiterasiTabs stories={stories} quizzes={quizzes} />
      </section>
    </>
  );
}