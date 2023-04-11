import { CONSTANTS } from '../constants';
import { Question, QuestionType } from '../models/Question';
import { clearStringSpaces } from '../utils/stringUtils';

export function generateQuestionsSheet(quesions: Question[]) {
  const questSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet();
  const sheetName = `Вопросы ${(Math.random() + 1).toString(36).substring(7)}`;
  questSheet.setName(sheetName);

  questSheet
    .getRange('A1:G1')
    .setValues([
      ['Номер', 'Тип вопроса', 'Вопрос', 'Правильный ответ', 'Варианты', 'Ключи', 'Проверять порядок ключей'],
    ]);

  let currentRow = 2;

  quesions.forEach((quest) => {
    questSheet.getRange(currentRow, 1, 1, 5).setValues([getSheetRow(quest)]);
    currentRow++;
  });
}

function getSheetRow(quest: Question): (string | number)[] {
  const type = quest.type === QuestionType.text ? 'текст' : 'выбор';

  let variantsStr = '';

  if (quest.type === QuestionType.choice) {
    const reg = new RegExp(`${CONSTANTS.CHOICE_VARIANTS_DELIMITER}`, 'ig');
    variantsStr = quest
      .choiceVariants!.map((x) => clearStringSpaces(x.replace(reg, '')))
      .join(CONSTANTS.CHOICE_VARIANTS_DELIMITER);
  }

  const rightAnswer =
    quest.type === QuestionType.choice
      ? quest.choiceAnswersIdx!.map((x) => x + 1).join(CONSTANTS.CHOICE_ANSWERS_DELIMITER)
      : quest.correctAnsText!;

  return [quest.number, type, quest.questText, rightAnswer, variantsStr];
}
