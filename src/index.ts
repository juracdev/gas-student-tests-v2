import { checkAnswer } from './answer-checking/checkAnswer';
import { parseAnswerSheet } from './parsing/parseAnswerSheet';
import { parseQuestionSheet } from './parsing/parseQuestionSheet';
import { generateTestForm } from './test-generation/generateTestForm';

function main() {
  const questions = parseQuestionSheet();
  const testResult = parseAnswerSheet(questions);

  checkAnswer(testResult[1].answers);

  console.log(JSON.stringify(testResult[1].answers));

  // generateTestForm(questions);
}
