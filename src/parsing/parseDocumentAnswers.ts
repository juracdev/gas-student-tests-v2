import { CONSTANTS } from '../constants';
import { Question, QuestionType } from '../models/Question';

export function parseDocumentAnswers(body: GoogleAppsScript.Document.Body, questions: Question[]): void {
  const tables = body.getTables();
  const table = tables[0];
  const numRows = table.getNumRows() - 1;

  for (let i = 1; i <= numRows; i++) {
    const row = table.getRow(i);

    const leftAnswer = { number: i, text: row.getCell(1).asText().getText().trim() };
    const rightAnswer = { number: i + numRows, text: row.getCell(4).getText().trim() };

    [leftAnswer, rightAnswer].forEach((ans) => {
      if (ans.number > questions.length) return;

      const quesion = questions.find((x) => x.number === ans.number);
      console.log(JSON.stringify(ans));

      if (quesion!.type === QuestionType.choice) {
        const match = ans.text.match(/^[АБВГДЕЁ]/i);
        if (!match) {
          throw new Error(`Невозможно найти нумератор для вопроса ${ans.number} в строке "${ans.text}"`)
        };
        const numerator = match[0].toLowerCase();
        const numeratorIdx = CONSTANTS.CHOICE_VARS_NUMERATORS.findIndex((x) => x === numerator);
        if (numeratorIdx < 0) throw new Error(`Невозможно найти нумератор "${numerator}" в списке доступных`);
        quesion!.choiceAnswersIdx = [numeratorIdx];
      } else {
        quesion!.correctAnsText = ans.text;
      }
    });
  }
}
