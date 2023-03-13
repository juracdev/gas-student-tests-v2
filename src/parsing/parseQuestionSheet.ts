import { CONSTANTS } from '../constants';
import { GridAnswers, Question, QuestionType, questionTypesMap, TextQuestionKey } from '../models/Question';
import { clearStringSpaces } from '../utils/stringUtils';

export function parseQuestionSheet(sheetId?: string): Question[] {
  const questSheet = (sheetId ? SpreadsheetApp.openById(sheetId) : SpreadsheetApp.getActive()).getSheetByName(
    'Вопросы'
  );
  const values = questSheet!.getDataRange().getValues().slice(1);

  const questions: Question[] = [];

  values.forEach((value) => {
    const [numCell, qTypeCell, qTextCell, ansCell, variantsCell, keysCell, isKeysOrderedCell] = value;

    const type = questionTypesMap[qTypeCell.trim().toLowerCase()];

    if (type === undefined) {
      throw new Error(`Вопрос №${numCell} содержит неправильное значение типа "${qTypeCell}"`);
    }

    const question: Question = {
      number: numCell,
      type,
      questText: clearStringSpaces(qTextCell),
    };

    /* choice or multiChoice */
    if (type === QuestionType.choice || type === QuestionType.multiChoice) {
      question.choiceVariants = variantsCell.split(CONSTANTS.CHOICE_VARIANTS_DELIMITER).map((x) => x.trim());
      let answers: number[] = [];

      if (typeof ansCell === 'number') {
        answers.push(ansCell);
      } else {
        answers.push(...ansCell.split(CONSTANTS.CHOICE_ANSWERS_DELIMITER).map((x) => Number(x)));
      }

      question.choiceAnswersIdx = answers.map((x) => x - 1);
    }

    /*  text */
    if (type === QuestionType.text) {
      question.correctAnsText = clearStringSpaces(ansCell);
      question.keys = parseTextKeys(keysCell);
      question.isKeysOrdered = isKeysOrderedCell.trim().toLowerCase() === 'да';
    }

    /*  grid */
    if (type === QuestionType.grid) {
      question.gridAnswers = parseGridAnswers(ansCell);
      const { left, right } = parseGridVariants(variantsCell);
      question.gridLeftVariants = left;
      question.gridRightVariants = right;
    }

    questions.push(question);
  });

  return questions;
}

function parseGridAnswers(ansCell: string): GridAnswers {
  const result: GridAnswers = {};
  const pairs = ansCell.split(CONSTANTS.GRID_ANSWER_PAIR_DELIMITER);

  pairs.forEach((pair) => {
    const [left, right] = pair.split(CONSTANTS.GRID_ANSWER_PAIR_LINK).map((x) => Number(x) - 1);
    result[left] = right;
  });

  return result;
}

interface ParsedGridVariants {
  left: string[];
  right: string[];
}

function parseGridVariants(varCell: string): ParsedGridVariants {
  const colStrings = varCell.match(/\[.*?\]/g)?.map((str) => str.replace(/[\[\]]/g, ''));
  const [left, right] = colStrings!.map((col) => col.split(CONSTANTS.CHOICE_VARIANTS_DELIMITER).map((v) => v.trim()));

  return { left, right };
}

function parseTextKeys(keysCell: string): TextQuestionKey[] {
  const keyStrings = keysCell.split(CONSTANTS.CHOICE_VARIANTS_DELIMITER).map((x) => clearStringSpaces(x));

  return keyStrings.map((keyStr) => {
    const isMultipleKeys = /\[.+\]/.test(keyStr);
    const values = isMultipleKeys
      ? keyStr.split(CONSTANTS.CHOICE_OPTIONS_DELIMITER).map((k) => k.trim().replace(/[\[\]]/g, ''))
      : [keyStr];

    return {
      values,
    };
  });
}
