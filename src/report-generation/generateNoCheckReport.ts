import { CONSTANTS } from '../constants';

interface NoCheckAnswer {
  question: string;
  answer: string;
}

interface StudentAnswer {
  fullName: string;
  answers: NoCheckAnswer[];
}

export function generateNoCheckReport() {
  const studentAnswers = parseAnswersSheet();
  createReportFiles(studentAnswers);
}

const RESULTS_FOLDER_ID = '1IW5cpLlomeRT8Y4c_H9-HL_4dkCwhDMC';

export function createReportFiles(studAnswers: StudentAnswer[]) {
  studAnswers.forEach(({ answers, fullName }) => {
    const docName = fullName;
    const doc = DocumentApp.create(docName);

    const body = doc.getBody();

    answers.forEach(({ question, answer }) => {
      body.appendParagraph(`${question}`).setAttributes({
        [DocumentApp.Attribute.BOLD]: true,
      });
      body.appendParagraph(`${answer}\n`).setAttributes({
        [DocumentApp.Attribute.BOLD]: false,
      });
    });

    const docFile = DriveApp.getFileById(doc.getId());
    DriveApp.getFolderById(RESULTS_FOLDER_ID).addFile(docFile);
    DriveApp.getRootFolder().removeFile(docFile);
  });
}

export function parseAnswersSheet(sheetName?: string): StudentAnswer[] {
  const ansSheet = SpreadsheetApp.getActive().getSheetByName(sheetName || CONSTANTS.SHEET_ANSWER_NAME);

  const [titlesRow, ...rows] = ansSheet!.getDataRange().getValues();
  const questTitles = titlesRow.slice(CONSTANTS.COLS_BEFORE_ANSWERS);

  const studAnswers: StudentAnswer[] = [];

  rows.forEach((row, idx) => {
    const [timestamp, lastname, firstname, ...ansRow] = row;

    const answers: NoCheckAnswer[] = ansRow.map((answer, idx) => ({ answer, question: questTitles[idx] }));

    studAnswers.push({
      fullName: `${lastname} ${firstname}`,
      answers,
    });
  });

  return studAnswers;
}
