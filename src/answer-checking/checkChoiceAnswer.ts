import { Answer } from '../models/Answer';
import { CheckedResult } from '../models/CheckedResult';

export function checkChoiceAnswer(ans: Answer): CheckedResult {
  const givenIdxs = ans.givenChoiceAnswersIdx!;
  const correcetIdxs = ans.quest.choiceAnswersIdx!;

  let isError = false;
  correcetIdxs.forEach((corIdx) => {
    if (!givenIdxs.includes(corIdx)) isError = true;
  });

  return { isError };
}
