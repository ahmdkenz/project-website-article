import MiniQuiz from '@/components/MiniQuiz';
import { notFound } from 'next/navigation';
import '@/styles/mini-quizzes.css';
import { getAllQuizFiles, getQuizData } from '@/lib/quizzes';

export default async function QuizPage() {
  const quizFiles = getAllQuizFiles();

  if (quizFiles.length === 0) {
    notFound();
  }

  const quizzes = quizFiles.map((file) => {
    const { data: metadata } = getQuizData(file);

    return {
      title: metadata.title,
      description: metadata.description,
      questions: metadata.questions,
      pointsPerCorrect: metadata.pointsPerCorrect || 10,
    };
  });

  return (
    <div className="mini-quiz-container">
      {quizzes.map((quiz, index) => (
        <div key={index} className="quiz-item">
          <h2>{quiz.title}</h2>
          <p>{quiz.description}</p>
          <MiniQuiz
            title={quiz.title}
            questions={quiz.questions}
            pointsPerCorrect={quiz.pointsPerCorrect}
          />
        </div>
      ))}
    </div>
  );
}