import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

/**
 * Get the directory path for quizzes.
 */
export function getQuizzesDir() {
  return path.join(process.cwd(), 'content', 'quizzes');
}

/**
 * Get all quiz files from the quizzes directory.
 */
export function getAllQuizFiles() {
  const quizzesDir = getQuizzesDir();
  return fs.readdirSync(quizzesDir);
}

/**
 * Get metadata and content of a quiz file.
 * @param {string} fileName - The name of the quiz file.
 */
export function getQuizData(fileName) {
  const quizzesDir = getQuizzesDir();
  const filePath = path.join(quizzesDir, fileName);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  return matter(fileContent);
}