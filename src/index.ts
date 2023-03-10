import { parseAnswerSheet } from './parsing/parseAnswerSheet';
import { parseQuestionSheet } from './parsing/parseQuestionSheet';
import { generateTestForm } from './test-generation/generateTestForm';

function main() {
  const questions = parseQuestionSheet();
  parseAnswerSheet(questions);
}
