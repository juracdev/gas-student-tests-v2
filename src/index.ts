import { calculateTestsStats } from './answer-checking/calculateTestsStats';
import { checkTestResults } from './answer-checking/checkAnswers';
import { parseAnswerSheet } from './parsing/parseAnswerSheet';
import { parseQuestionSheet } from './parsing/parseQuestionSheet';
import { generateTestForm } from './test-generation/generateTestForm';

function main() {}

function generateForm() {
  const questions = parseQuestionSheet();
  generateTestForm(questions);
}

function checkAns() {
  const questions = parseQuestionSheet();
  const testResults = parseAnswerSheet(questions);

  checkTestResults(testResults);
  calculateTestsStats(testResults);

  console.log(JSON.stringify(testResults));
}
