import { Answer } from '../models/Answer';
import { QuestionType } from '../models/Question';
import { TestResult } from '../models/TestResult';
import { checkChoiceAnswer } from './checkChoiceAnswer';
import { checkGridAnswer } from './checkGridAnswer';
import { checkTextAnswer } from './checkTextAnswer';

export function checkTestResults(testResults: TestResult[]) {
  testResults.forEach((testResult) => {
    checkAnswers(testResult.answers);
  });
}

function checkAnswers(answers: Answer[]): void {
  answers.forEach((ans) => {
    if (ans.quest.type === QuestionType.text) {
      ans.checkedResult = checkTextAnswer(ans);
    }

    if (ans.quest.type === QuestionType.choice || ans.quest.type === QuestionType.multiChoice) {
      ans.checkedResult = checkChoiceAnswer(ans);
    }

    if (ans.quest.type === QuestionType.grid) {
      ans.checkedResult = checkGridAnswer(ans);
    }
  });
}
