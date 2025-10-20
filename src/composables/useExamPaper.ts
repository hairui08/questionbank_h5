import rawPaper from "../../paperJson/exam_paper_data.json";

export const typeLabels: Record<number, string> = {
  1: "单选题",
  2: "多选题",
  3: "判断题",
  4: "问答题",
  5: "组合题",
};

export interface NormalizedOption {
  id: string;
  label: string;
  content: string;
  isAnswer: boolean;
}

export interface NormalizedQuestion {
  id: string;
  answerKey: string;
  number: number;
  depth: number;
  childOrderLabel?: string;
  categoryPath?: string[];
  testTypeName: string;
  title: string;
  content: string;
  answer: string;
  myAnswerOriginal: string | null;
  analytic: string;
  newTestType: number;
  answerList: NormalizedOption[];
  children: NormalizedQuestion[];
  isCollect: boolean;
}

export interface NormalizedPaper {
  id: string;
  title: string;
  testNum: number;
  answerTimeMinutes: number;
  questions: NormalizedQuestion[];
}

interface RawAnswerOption {
  Id?: string | null;
  Content?: string | null;
  Sort?: number | string | null;
  IsAnswer?: boolean;
}

interface RawQuestion {
  TestStoreId?: string | null;
  Content?: string | null;
  Title?: string | null;
  Answer?: string | null;
  MyAnswer?: string | null;
  AnalyticQuestions?: string | null;
  NewTestType?: number | string | null;
  AnswerList?: (RawAnswerOption | null)[] | null;
  ChildrenTestList?: (RawQuestion | null)[] | null;
  Sort?: number | string | null;
  TestTypeName?: string | null;
  IsCollect?: boolean;
}

interface RawStrategy {
  TestTypeName?: string | null;
  NewTestType?: number | string | null;
  PapersTestList?: (RawQuestion | null)[] | null;
}

interface RawPaper {
  Id?: string | null;
  Title?: string | null;
  AnswerTime?: number | string | null;
  TestNum?: number | string | null;
  StrategyList?: (RawStrategy | null)[] | null;
}

interface NormalizeContext {
  number: number;
  depth: number;
  parentKey: string | null;
  parentNumber: number;
  childIndex: number;
  strategyName: string;
  fallbackType: number;
  categoryPath: string[];
}

export function normalizeExamPaper(rawInput: RawPaper = rawPaper as unknown as RawPaper): NormalizedPaper {
  const raw = rawInput ?? {};
  const id = String(raw.Id ?? "");
  const title = String(raw.Title ?? "未命名试卷");
  const answerTimeMinutes = toNumber(raw.AnswerTime, 0);
  const strategyList: RawStrategy[] = Array.isArray(raw.StrategyList)
    ? raw.StrategyList.filter((item): item is RawStrategy => Boolean(item))
    : [];
  const questions: NormalizedQuestion[] = [];
  let counter = 1;

  strategyList.forEach((strategy) => {
    const tests: RawQuestion[] = Array.isArray(strategy?.PapersTestList)
      ? strategy.PapersTestList.filter((item): item is RawQuestion => Boolean(item))
      : [];
    tests.sort((a: RawQuestion, b: RawQuestion) => toNumber(a?.Sort) - toNumber(b?.Sort));

    tests.forEach((test, index) => {
    const question = createNormalizedQuestion(test, {
      number: counter,
      depth: 0,
      parentKey: null,
      parentNumber: counter,
      childIndex: index,
      strategyName: String(strategy?.TestTypeName ?? "").trim(),
      fallbackType: toNumber(test?.NewTestType, toNumber(strategy?.NewTestType)),
      categoryPath: (() => {
        const name = String(strategy?.TestTypeName ?? "").trim();
        return name ? [name] : [];
      })(),
    });
      questions.push(question);
      counter += 1;
    });
  });

  const declaredTotal = toNumber(raw.TestNum, questions.length);

  return {
    id,
    title,
    testNum: declaredTotal > 0 ? declaredTotal : questions.length,
    answerTimeMinutes,
    questions,
  };
}

export function flattenQuestions(questions: NormalizedQuestion[]): NormalizedQuestion[] {
  const result: NormalizedQuestion[] = [];
  const visit = (question: NormalizedQuestion) => {
    result.push(question);
    question.children.forEach(visit);
  };
  questions.forEach(visit);
  return result;
}

function createNormalizedQuestion(raw: RawQuestion | null | undefined, ctx: NormalizeContext): NormalizedQuestion {
  const id = String(raw?.TestStoreId ?? `${ctx.parentKey ?? "q"}-${ctx.childIndex}`);
  const answerKey = ctx.parentKey ? `${ctx.parentKey}::${id}` : id;
  const newTestType = toNumber(raw?.NewTestType, ctx.fallbackType);
  const categoryPath = ctx.categoryPath.length
    ? ctx.categoryPath.slice()
    : ctx.strategyName
      ? [ctx.strategyName]
      : [];

  const question: NormalizedQuestion = {
    id,
    answerKey,
    number: ctx.number,
    depth: ctx.depth,
    childOrderLabel: ctx.parentKey ? `${ctx.parentNumber}-${ctx.childIndex + 1}` : undefined,
    categoryPath,
    testTypeName:
      (typeof raw?.TestTypeName === "string" && raw.TestTypeName.trim().length > 0
        ? raw.TestTypeName.trim()
        : ctx.strategyName) || typeLabels[newTestType] || "",
    title: raw?.Title ?? "",
    content: raw?.Content ?? "",
    answer: raw?.Answer ?? "",
    myAnswerOriginal: raw?.MyAnswer ?? null,
    analytic: raw?.AnalyticQuestions ?? "",
    newTestType,
    answerList: normalizeOptions(raw?.AnswerList),
    children: [],
    isCollect: Boolean(raw?.IsCollect),
  };

  const childList: RawQuestion[] = Array.isArray(raw?.ChildrenTestList)
    ? raw.ChildrenTestList.filter((item): item is RawQuestion => Boolean(item))
    : [];
  if (childList.length > 0) {
    question.children = childList
      .slice()
      .sort((a: RawQuestion, b: RawQuestion) => toNumber(a?.Sort) - toNumber(b?.Sort))
      .map((child, index) =>
        createNormalizedQuestion(child, {
          number: ctx.number,
          depth: ctx.depth + 1,
          parentKey: answerKey,
          parentNumber: ctx.number,
          childIndex: index,
          strategyName: question.testTypeName,
          fallbackType: toNumber(child?.NewTestType, newTestType),
          categoryPath,
        }),
      );
  }

  return question;
}

function normalizeOptions(list: (RawAnswerOption | null)[] | null | undefined): NormalizedOption[] {
  if (!Array.isArray(list)) return [];
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return list
    .slice()
    .filter((item): item is RawAnswerOption => Boolean(item))
    .sort((a: RawAnswerOption, b: RawAnswerOption) => toNumber(a?.Sort) - toNumber(b?.Sort))
    .map((item, index) => ({
      id: String(item?.Id ?? index),
      label: alphabet[index] ?? alphabet[alphabet.length - 1],
      content: item?.Content ?? "",
      isAnswer: Boolean(item?.IsAnswer),
    }));
}

export function isChoiceQuestion(question: NormalizedQuestion): boolean {
  return [1, 2, 3].includes(question.newTestType);
}

export function isEssayQuestion(question: NormalizedQuestion): boolean {
  return question.newTestType === 4;
}

export function isCombinationQuestion(question: NormalizedQuestion): boolean {
  return question.newTestType === 5;
}

export function getQuestionTypeLabel(question: NormalizedQuestion): string {
  return question.testTypeName || typeLabels[question.newTestType] || "试题";
}

export function parseAnswerTokens(value: string | null | undefined): string[] {
  if (!value) return [];
  const letters = String(value)
    .toUpperCase()
    .match(/[A-Z]/g);
  if (letters && letters.length) {
    return Array.from(new Set(letters));
  }
  return String(value)
    .split(/[,，\s]+/)
    .map((token) => token.trim().toUpperCase())
    .filter(Boolean);
}

export function toNumber(value: unknown, fallback = 0): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

export function formatSeconds(total: number): string {
  const seconds = Math.max(0, Math.floor(total));
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export const normalizedPaper = normalizeExamPaper();
