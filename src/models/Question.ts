export interface TextQuestionKey {
  values: string[];
}

export interface Question {
  number: number;
  type: QuestionType;
  questText: string;

  /* text */
  correctAnsText?: string;
  keys?: TextQuestionKey[];
  isKeysOrdered?: boolean;

  /*  ch & multiCh */
  choiceAnswersIdx?: number[];
  choiceVariants?: string[];

  /* grid */
  gridLeftVariants?: string[];
  gridRightVariants?: string[];
  gridAnswers?: GridAnswers;
}

export enum QuestionType {
  choice,
  text,
  multiChoice,
  grid,
}

export const questionTypesMap = {
  текст: QuestionType.text,
  'множ выбор': QuestionType.multiChoice,
  сетка: QuestionType.grid,
  выбор: QuestionType.choice,
};

export interface GridAnswers {
  [key: number]: number;
}
