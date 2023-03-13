import { CheckedResult } from './CheckedResult';
import { GridAnswers, Question } from './Question';

export interface Answer {
  quest: Question;
  checkedResult?: CheckedResult;

  /*  text */
  givenText?: string;

  /*  ch & multiCh */
  givenChoiceAnswersIdx?: number[];

  /* grid */
  givenGridAnswers?: GridAnswers;
}
