import { CONSTANTS } from '../constants';
import { Question, QuestionType } from '../models/Question';

export function generateTestForm(questions: Question[]) {
  const form = FormApp.create('test-form');

  questions.forEach((q) => {
    const qText = `${q.number}. ${q.questText}`;

    if (q.type === QuestionType.choice || q.type === QuestionType.multiChoice) {
      const chItem = q.type === QuestionType.choice ? form.addMultipleChoiceItem() : form.addCheckboxItem();
      const variantItems = applyNumerators(q.choiceVariants!).map((v) => chItem.createChoice(v));
      chItem.setTitle(qText).setChoices(variantItems).setRequired(true);
    }

    if (q.type === QuestionType.grid) {
      const gridItem = form.addGridItem();
      gridItem.setTitle(qText);
      gridItem.setRows(q.gridLeftVariants!);
      gridItem.setColumns(q.gridRightVariants!);
    }

    if (q.type === QuestionType.text) {
      const textItem = form.addParagraphTextItem();
      textItem.setTitle(qText).setRequired(true);
    }
  });
}

function applyNumerators(variants: string[]): string[] {
  return variants.map((v, idx) => `${CONSTANTS.CHOICE_VARS_NUMERATORS[idx]}) ${v}`);
}
