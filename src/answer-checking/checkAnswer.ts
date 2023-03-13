import { Answer } from '../models/Answer';
import { QuestionType } from '../models/Question';
import { checkChoiceAnswer } from './checkChoiceAnswer';
import { checkGridAnswer } from './checkGridAnswer';
import { checkTextAnswer } from './checkTextAnswer';

export function checkAnswer(answers: Answer[]) {
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
