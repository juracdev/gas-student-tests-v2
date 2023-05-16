import { Question, QuestionType } from '../models/Question';
import { parseDocumentAnswers } from '../parsing/parseDocumentAnswers';
import { parseDocumentQuestions } from '../parsing/parseDocumentQuestions';
import { generateQuestionsDoc } from './generateQuestionsDoc';

/*  ID исходных google-документов, из которых будут взяты вопросы  */
interface InputDocs {
  /*  key - id документа, value - название документа (дисциплины) */
  [inputDocId: string]: {
    title: string;
    /*  Кол-ва вопросов из каждого файла */
    textQuestsAmount: number;
    choisenQuestsAmount: number;
  };
}

export interface UniqueQuestsOptions {
  outDocsFolderId: string;
}

type UniqueQuestion = Question & {
  isAdded?: boolean;
  inputDocId?: string;
};

interface UniqueQuestionGroups {
  [docId: string]: {
    title: string;
    textQuests: UniqueQuestion[];
    choisenQuests: UniqueQuestion[];
    freeQuestsAmount: number;
  };
}

/*  ----------- MAIN --------------- */

export function writeQuestionGroupsData() {
  const inputDocs = parseSettingsFromSheet();
  const [questsGroups] = getQuestionsByGroups(inputDocs);

  const Q_DATA_SH_NAME = 'Обзор вопросов';
  const sheet = SpreadsheetApp.getActive().getSheetByName(Q_DATA_SH_NAME)!;

  sheet.getRange('A:Z').clearContent();

  sheet.getRange('A1:C1').setValues([['Название', 'Закрытые вопросы', 'Открытые вопросы']]);

  let currentRow = 2;

  Object.values(questsGroups).forEach((group) => {
    sheet.getRange(currentRow, 1, 1, 3).setValues([[group.title, group.choisenQuests.length, group.textQuests.length]]);
    currentRow++;
  });
}

export function createUniqueQuestDocs(options: UniqueQuestsOptions) {
  const inputDocs = parseSettingsFromSheet();
  const variants = parseVariantsFromSheet();

  console.log('VARIANTS ', variants);
  const variantsAmount = variants.length;

  const [questsGroups, totalQuestsAmount] = getQuestionsByGroups(inputDocs);

  console.log(`QG START ${Object.keys(questsGroups)}`);

  const requiredQuestsAmount = calculateRequiredQuestsAmount(inputDocs, variantsAmount);

  if (totalQuestsAmount < requiredQuestsAmount)
    throw new Error(`Общее кол-во вопросов ${totalQuestsAmount} меньше чем требуемое ${requiredQuestsAmount}`);

  const questSets: UniqueQuestion[][] = [];

  for (let i = 0; i < variantsAmount; i++) {
    let set: UniqueQuestion[] = [];

    Object.entries(inputDocs).forEach(([docId, { textQuestsAmount, choisenQuestsAmount }]) => {
      const selectedQuests = selectQuestionsFromGroup(questsGroups, docId, textQuestsAmount, choisenQuestsAmount);
      set.push(...selectedQuests);
    });

    set = set.sort(() => Math.random() - 0.5);

    questSets.push(set);
  }

  /* CONSOLE */
  questSets.forEach((set, idx) => {
    console.log(`---- set ${idx + 1}`);
    set.forEach((q, qIdx) => {
      console.log(
        `${qIdx + 1}) ${inputDocs[q.inputDocId!].title}, (${
          q.type === QuestionType.choice ? 'Варианты ответа' : 'Текстовый'
        }) questNum: ${q.number}`
      );
    });
  });

  writeRunReport(inputDocs, questSets, variants);

  /*  ГЕНЕРАЦИЯ ФАЙЛОВ */
  variants.forEach((variant, idx) => {
    const docName = `${idx + 1}. ${variant}`;
    const doc = DocumentApp.create(docName);

    generateQuestionsDoc(questSets[idx], doc.getId());

    const docFile = DriveApp.getFileById(doc.getId());
    DriveApp.getFolderById(options.outDocsFolderId).addFile(docFile);
    DriveApp.getRootFolder().removeFile(docFile);
  });
}

function writeRunReport(inputDocs: InputDocs, questSets: UniqueQuestion[][], variants: string[]) {
  const REPORT_SH_NAME = 'Отчёт последнего запуска';
  const sheet = SpreadsheetApp.getActive().getSheetByName(REPORT_SH_NAME)!;

  sheet.getRange('A:Z').clearContent();

  sheet.getRange('A1').setValue([`Запуск ${new Date().toISOString()}`]);

  let currentRow = 2;

  questSets.forEach((set, idx) => {
    let reportCell = '';
    set.forEach((q, qIdx) => {
      reportCell += `${qIdx + 1}) ${inputDocs[q.inputDocId!].title}, (${
        q.type === QuestionType.choice ? 'Варианты ответа' : 'Текстовый'
      }) questNum: ${q.number}\n`;
    });
    sheet.getRange(currentRow, 1, 1, 2).setValues([[variants[idx], reportCell]]);
    currentRow++;
  });
}

function getQuestionsByGroups(inputDocs: InputDocs): [UniqueQuestionGroups, number] {
  const questsGroups: UniqueQuestionGroups = {};
  let totalQuestsAmount = 0;

  Object.entries(inputDocs).forEach(([inputDocId, docName]) => {
    const doc = DocumentApp.openById(inputDocId);
    const body = doc.getBody();

    let questions: UniqueQuestion[] = parseDocumentQuestions(body);
    parseDocumentAnswers(body, questions);

    totalQuestsAmount += questions.length;

    questsGroups[inputDocId] = {
      title: inputDocs[inputDocId].title,
      textQuests: [],
      choisenQuests: [],
      freeQuestsAmount: questions.length,
    };
    const currentGroup = questsGroups[inputDocId];

    questions.forEach((q) => {
      q.isAdded = false;
      q.inputDocId = inputDocId;

      const arrToAdd = q.type === QuestionType.choice ? currentGroup.choisenQuests : currentGroup.textQuests;
      arrToAdd.push(q);
    });

    console.log(`GROUP ${inputDocId}`);
    console.log(`text ${currentGroup.textQuests.length}`);
    console.log(`ch ${currentGroup.choisenQuests.length}`);
  });

  return [questsGroups, totalQuestsAmount];
}

function calculateRequiredQuestsAmount(inputDocs: InputDocs, variantsAmount: number): number {
  const questsPerVariant = Object.values(inputDocs).reduce((acc, { choisenQuestsAmount, textQuestsAmount }) => {
    return acc + choisenQuestsAmount + textQuestsAmount;
  }, 0);

  return questsPerVariant * variantsAmount;
}

function selectQuestionsFromGroup(
  questsGroups: UniqueQuestionGroups,
  docId: string,
  textQuestsAmount: number,
  choisenQuestsAmount: number
): UniqueQuestion[] {
  const group = questsGroups[docId];
  console.log(`SEL START docId ${docId}, group ${group}`);
  const requiredQuestAmount = textQuestsAmount + choisenQuestsAmount;

  const textQuests = group.textQuests.filter((x) => !x.isAdded).slice(0, textQuestsAmount);
  const chQuests = group.choisenQuests.filter((x) => !x.isAdded).slice(0, choisenQuestsAmount);

  let result: UniqueQuestion[] = [...textQuests, ...chQuests];

  result.forEach((x) => (x.isAdded = true));

  group.freeQuestsAmount -= result.length;

  if (result.length < requiredQuestAmount) {
    console.log(`1. result.length ${result.length < requiredQuestAmount}, requiredQuestAmount ${requiredQuestAmount}`);
    const biggestGroupId = findBiggestGroupId(questsGroups);
    const biggestGroup = questsGroups[biggestGroupId];
    const restQuestsAmount = requiredQuestAmount - result.length;

    console.log(`2. biggestGroupId ${biggestGroupId}, restQuestsAmount ${restQuestsAmount}`);
    const biggestGrpQuests = [
      ...biggestGroup.textQuests.filter((x) => !x.isAdded),
      ...biggestGroup.choisenQuests.filter((x) => !x.isAdded),
    ].slice(0, restQuestsAmount);

    biggestGroup.freeQuestsAmount -= biggestGrpQuests.length;
    biggestGrpQuests.forEach((x) => (x.isAdded = true));

    result.push(...biggestGrpQuests);
    console.log(`3. result.length ${result.length < requiredQuestAmount}`);
  }

  return result;
}

function findBiggestGroupId(questsGroups: UniqueQuestionGroups): string {
  let maxFreeAmount = -1;
  let resultId = '';

  Object.entries(questsGroups).forEach(([groupId, group]) => {
    if (group.freeQuestsAmount > maxFreeAmount) {
      maxFreeAmount = group.freeQuestsAmount;
      resultId = groupId;
    }
  });

  return resultId;
}

function parseSettingsFromSheet(): InputDocs {
  const INPUT_DOCS_SH_NAME = 'InputDocs';
  const sheet = SpreadsheetApp.getActive().getSheetByName(INPUT_DOCS_SH_NAME);

  const [titlesRow, ...rows] = sheet!.getDataRange().getValues();

  const result: InputDocs = {};

  rows.forEach((row) => {
    const [docId, title, choisenQuestsAmount, textQuestsAmount] = row;
    result[docId] = { title, choisenQuestsAmount, textQuestsAmount };
  });

  return result;
}

function parseVariantsFromSheet(): string[] {
  const VARIANTS_SH_NAME = 'Variants';
  const sheet = SpreadsheetApp.getActive().getSheetByName(VARIANTS_SH_NAME);

  const [titlesRow, ...rows] = sheet!.getDataRange().getValues();
  const variants: string[] = [];

  rows.forEach((row) => {
    const [variant] = row;
    variants.push(variant.trim());
  });

  return variants;
}

