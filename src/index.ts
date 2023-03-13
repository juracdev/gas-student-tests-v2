import { checkAnswer } from './answer-checking/checkAnswer';
import { parseAnswerSheet } from './parsing/parseAnswerSheet';
import { parseQuestionSheet } from './parsing/parseQuestionSheet';
import { generateTestForm } from './test-generation/generateTestForm';

function main() {}

function generateForm() {
  const questions = parseQuestionSheet();
  generateTestForm(questions);
}

function checkAnswers() {
  const questions = parseQuestionSheet();
  const testResult = parseAnswerSheet(questions);

  checkAnswer(testResult[0].answers);

  console.log(JSON.stringify(testResult[0]));
}
