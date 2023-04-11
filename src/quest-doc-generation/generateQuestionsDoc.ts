import { CONSTANTS } from '../constants';
import { Question, QuestionType } from '../models/Question';

export function generateQuestionsDoc(questions: Question[], outputDocId: string) {
  const outputDoc = DocumentApp.openById(outputDocId);
  const body = outputDoc.getBody();

  questions.forEach((quest, questIdx) => {
    const qNum = questIdx + 1;

    body.appendParagraph(`${qNum}. ${quest.questText}`);

    if (quest.type === QuestionType.choice || quest.type === QuestionType.multiChoice) {
      quest.choiceVariants!.forEach((chVar, varIdx) => {
        const numerator = CONSTANTS.CHOICE_VARS_NUMERATORS[varIdx];
        body.appendParagraph(`${numerator}) ${chVar}`);
      });
    }

    body.appendParagraph('');
  });

  createAnswersTable(questions, body);
}

function createAnswersTable(questions: Question[], body: GoogleAppsScript.Document.Body) {
  const cells: string[][] = [['Номер', 'Ответ']];

  questions.forEach((quest, questIdx) => {
    const qNum = questIdx + 1;

    let answer: string;

    
    if (quest.type === QuestionType.choice || quest.type === QuestionType.multiChoice) {
      answer = quest.choiceAnswersIdx!.map((idx) => CONSTANTS.CHOICE_VARS_NUMERATORS[idx]).join(',');
    } else {
      answer = quest.correctAnsText!;
    }

    cells.push([`${qNum}`, answer]);
  });

  body.appendTable(cells);
}
