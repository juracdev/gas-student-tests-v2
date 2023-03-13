import { Answer } from '../models/Answer';
import { CheckedResult } from '../models/CheckedResult';
import { TextQuestionKey } from '../models/Question';

interface FindTextKeysResult {
  foundKeys: TextQuestionKey[];
  unfoundKeys: TextQuestionKey[];
  isCorrectOrder: boolean;
}

export function checkTextAnswer(ans: Answer): CheckedResult {
  const { foundKeys, unfoundKeys, isCorrectOrder } = findTextKeys(ans.givenText!, ans.quest.keys!);

  return {
    isError: unfoundKeys.length > 0 || (ans.quest.isKeysOrdered! && !isCorrectOrder),
    foundKeys,
    unfoundKeys,
    isCorrectOrder,
  };
}

function findTextKeys(givenText: string, keys: TextQuestionKey[]): FindTextKeysResult {
  const foundKeys: TextQuestionKey[] = [];
  const unfoundKeys: TextQuestionKey[] = [];
  let lastFoundIdx = 0;
  let isCorrectOrder = true;

  keys.forEach((key) => {
    const result = matchKey(givenText, key);

    if (result.index > -1) {
      foundKeys.push(key);
      if (result.index < lastFoundIdx) isCorrectOrder = false;
      lastFoundIdx = result.index;
    } else {
      unfoundKeys.push(key);
    }
  });

  return {
    foundKeys,
    unfoundKeys,
    isCorrectOrder,
  };
}

type MatchKeyResult = { key: TextQuestionKey; index: number };

function matchKey(answer: string, key: TextQuestionKey): MatchKeyResult {
  let index = -1;
  key.values.forEach((val) => {
    const reg = new RegExp(val, 'i');
    const match = answer.match(reg);
    if (index < 0 && match && typeof match.index === 'number') {
      index = match.index;
    }
  });

  return { key, index };
}
