import QuizLevelSelector from '@/components/QuizLevelSelector';
import '@/styles/mini-quizzes.css';

export default async function QuizPage() {
  return (
    <div className="mini-quiz-container">
      <div className="quiz-item">
        <QuizLevelSelector />
      </div>
    </div>
  );
}