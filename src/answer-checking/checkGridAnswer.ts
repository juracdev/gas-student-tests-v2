import { Answer } from '../models/Answer';
import { CheckedResult } from '../models/CheckedResult';
import { GridAnswers } from '../models/Question';

export function checkGridAnswer(ans: Answer): CheckedResult {
  let isError = false;
  const incorrectGridAnswers: GridAnswers = {};
  const givenAnswers = ans.givenGridAnswers!;

  Object.entries(ans.quest.gridAnswers!).forEach(([left, rigth]) => {
    if (givenAnswers[left] !== rigth) {
      isError = true;
      incorrectGridAnswers[left] = givenAnswers[left];
    }
  });

  return {
    isError,
    incorrectGridAnswers,
  };
}
