import { calculateTestsStats } from './answer-checking/calculateTestsStats';
import { checkTestResults } from './answer-checking/checkAnswers';
import { Question } from './models/Question';
import { parseAnswerSheet } from './parsing/parseAnswerSheet';
import { parseDocumentAnswers } from './parsing/parseDocumentAnswers';
import { parseDocumentQuestions } from './parsing/parseDocumentQuestions';
import { parseQuestionSheet } from './parsing/parseQuestionSheet';
import { generateQuestionsDoc } from './quest-doc-generation/generateQuestionsDoc';
import { generateNoCheckReport } from './report-generation/generateNoCheckReport';
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

type GroupedQuestion = Question & {
  groupIdx?: number;
  groupQuestNum?: number;
};

function createQuestionsDoc(docIds: string[], outputDocId: string) {
  let combinedQuesions: GroupedQuestion[] = [];

  docIds.forEach((docId, docIdx) => {
    const doc = DocumentApp.openById(docId);
    const body = doc.getBody();

    let questions: GroupedQuestion[] = parseDocumentQuestions(body);
    parseDocumentAnswers(body, questions);

    questions = questions.map((q) => ({ ...q, groupIdx: docIdx }));

    combinedQuesions.push(...questions);
  });

  combinedQuesions = combinedQuesions.map((q, idx) => ({ ...q, groupQuestNum: idx + 1 }));

  combinedQuesions = combinedQuesions.sort(() => Math.random() - 0.5);

  const groupsNums: number[][] = [];

  for (let i = 0; i < docIds.length; i++) {
    groupsNums.push([]);
  }

  combinedQuesions.forEach(quest => {
    const grIdx = quest.groupIdx!;
    groupsNums[grIdx].push(quest.groupQuestNum!);
    console.log(quest);
  });

 console.log(JSON.stringify(groupsNums));

  generateQuestionsDoc(combinedQuesions, outputDocId)
}

function createNoCheckReport() {
  generateNoCheckReport();
}