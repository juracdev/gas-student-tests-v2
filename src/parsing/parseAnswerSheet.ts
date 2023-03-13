import { CONSTANTS } from '../constants';
import { Answer } from '../models/Answer';
import { GridAnswers, Question, QuestionType } from '../models/Question';
import { TestResult } from '../models/TestResult';
import { clearStringSpaces } from '../utils/stringUtils';

export function parseAnswerSheet(questions: Question[], sheetName?: string): TestResult[] {
  const testResults: TestResult[] = [];
  const ansSheet = SpreadsheetApp.getActive().getSheetByName(sheetName || CONSTANTS.SHEET_ANSWER_NAME);

  const [titlesRow, ...rows] = ansSheet!.getDataRange().getValues();
  const questTitles = titlesRow.slice(CONSTANTS.COLS_BEFORE_ANSWERS);

  rows.forEach((row) => {
    const [timestamp, lastname, firstname, ...ansRow] = row;

    const testResult: TestResult = {
      studentFirstname: firstname,
      studentLastname: lastname,
      answers: [],
    };

    questions.forEach((q) => {
      const reg = new RegExp(`^${q.number}.`);
      const columnIdx = questTitles.findIndex((h: string) => h.match(reg));
      const answerCell: string = ansRow[columnIdx];

      const answer: Answer = { quest: q };

      if (q.type === QuestionType.text) {
        answer.givenText = clearStringSpaces(answerCell);
      }

      if (q.type === QuestionType.choice || q.type === QuestionType.multiChoice) {
        const givenChoicesIdx: number[] = [];
        q.choiceVariants!.forEach((chVar, chVarIdx) => {
          if (answerCell.indexOf(chVar) > -1) {
            givenChoicesIdx.push(chVarIdx);
          }
        });
        answer.givenChoiceAnswersIdx = givenChoicesIdx;
      }

      if (q.type === QuestionType.grid) {
        const gridSize = q.gridLeftVariants!.length;
        const gridTitles = questTitles.slice(columnIdx, columnIdx + gridSize);
        const gridAnsCells = ansRow.slice(columnIdx, columnIdx + gridSize);
        answer.givenGridAnswers = parseGridAnswers(q.gridLeftVariants!, q.gridRightVariants!, gridTitles, gridAnsCells);
      }

      testResult.answers.push(answer);
    });

    // console.log(JSON.stringify(testResult));
    testResults.push(testResult);
  });

  return testResults;
}

function parseGridAnswers(
  gridLeftVariants: string[],
  gridRightVariants: string[],
  titlesCells: string[],
  ansCells: string[]
): GridAnswers {
  const result: GridAnswers = {};
  gridLeftVariants.forEach((gridVarLeft, gridVarLeftIdx) => {
    const cellsIndex = titlesCells.findIndex((x) => x.indexOf(gridVarLeft) > -1);
    const gridVarRightIdx = gridRightVariants.findIndex((x) => ansCells[cellsIndex].indexOf(x) > -1);
    result[gridVarLeftIdx] = gridVarRightIdx;
  });

  return result;
}
