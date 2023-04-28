import { Question, QuestionType } from '../models/Question';
import { clearStringSpaces } from '../utils/stringUtils';

function isTextChosenVarian(text: string): boolean {
  return Boolean(text.match(/^[АБВГДЕЁ]\)/i));
}

function clearNumerator(variant: string): string {
  return variant.replace(/^[АБВГДЕЁ]\)/i, '').trim();
}

function clearNumber(question: string): string {
  return question.replace(/^\d+\./, '').trim();
}

export function parseDocumentQuestions(body: GoogleAppsScript.Document.Body): Question[] {
  let qNumber = 1;
  let findRange: GoogleAppsScript.Document.RangeElement | null = null;

  const questions: Question[] = [];

  do {
    findRange = body.findText(`^\s*${qNumber}\\.`);

    if (findRange === null) {
      console.log(`Закончили на ${qNumber - 1} вопросе`);
      break;
    }

    const el = findRange.getElement();

    let qtext = clearStringSpaces(el.asText().getText());
    qtext = clearNumber(qtext);

    let sibling = el.getParent().getNextSibling();

    console.log(`sibling ${JSON.stringify(sibling)} qtext ${qtext} qNumber ${qNumber}`)

    let siblText = sibling.asText().getText();
    const question: Question = {
      number: qNumber,
      questText: qtext,
      type: QuestionType.text,
    };

    if (isTextChosenVarian(siblText)) {
      question.type = QuestionType.choice;
      question.choiceVariants = [clearNumerator(siblText)];

      let siblIsVarian = true;
      do {
        sibling = sibling.getNextSibling();
        siblText = sibling.asText().getText();
        if (isTextChosenVarian(siblText)) {
          question.choiceVariants.push(clearNumerator(siblText));
        } else {
          siblIsVarian = false;
        }
      } while (siblIsVarian === true);
    }
    questions.push(question);

    qNumber++;
  } while (true);

  return questions;
}
