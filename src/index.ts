import { calculateTestsStats } from './answer-checking/calculateTestsStats';
import { checkTestResults } from './answer-checking/checkAnswers';
import { Question } from './models/Question';
import { parseAnswerSheet } from './parsing/parseAnswerSheet';
import { parseDocumentAnswers } from './parsing/parseDocumentAnswers';
import { parseDocumentQuestions } from './parsing/parseDocumentQuestions';
import { parseQuestionSheet } from './parsing/parseQuestionSheet';
import { generateQuestionsDoc } from './quest-doc-generation/generateQuestionsDoc';
import { generateQuestionsSheet } from './test-generation/generateQuestionsSheet';
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

function parseDocument(docId: string) {
  const doc = DocumentApp.openById(docId);
  const body = doc.getBody();

  const questions = parseDocumentQuestions(body);
  parseDocumentAnswers(body, questions);

  console.log(JSON.stringify(questions));

  generateQuestionsSheet(questions);
}

function createQuestionsDoc(docIds: string[], outputDocId: string) {
  let combinedQuesions: Question[] = [];

  docIds.forEach((docId) => {
    const doc = DocumentApp.openById(docId);
    const body = doc.getBody();

    const questions = parseDocumentQuestions(body);
    parseDocumentAnswers(body, questions);

    combinedQuesions.push(...questions);
  });

  combinedQuesions =  combinedQuesions.sort(() => Math.random() - 0.5);

  generateQuestionsDoc(combinedQuesions, outputDocId)
}
