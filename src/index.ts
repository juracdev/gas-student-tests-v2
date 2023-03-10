import { parseQuestionSheet } from './parsing/parseQuestionSheet';
import { generateTestForm } from './test-generation/generateTestForm';

function main() {
  const questions = parseQuestionSheet();
  generateTestForm(questions);
}
