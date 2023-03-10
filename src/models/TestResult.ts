import { Answer } from './Answer';

export interface TestResult {
  studentFirstname: string;
  studentLastname: string;

  answers: Answer[];
}
