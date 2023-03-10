import { GridAnswers, Question } from './Question';

export interface Answer {
  quest: Question;

  /*  text */
  givenText?: string;

  /*  ch & multiCh */
  givenChoiceAnswersIdx?: number[];

  /* grid */
  givenGridAnswers?: GridAnswers;
}
