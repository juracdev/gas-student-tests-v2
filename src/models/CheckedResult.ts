import { GridAnswers, TextQuestionKey } from './Question';

export interface CheckedResult {
  isError: boolean;

  /*  text */
  foundKeys?: TextQuestionKey[];
  unfoundKeys?: TextQuestionKey[];
  isCorrectOrder?: boolean;

  /*  grid */
  incorrectGridAnswers?: GridAnswers;
}
