import { revalidatePath } from "next/cache"
import { getSession } from "~/app/session/route"


export type Question = {
  template: string
  correctAnswers: string[]
  difficulty: number
  options: string[][]
}

export type QuestionLight = Omit<Question, "correctAnswers">

export type AnswerRecord = {
  question: Question
  userAnswers: string[]
  isCorrect: boolean
}

export type TestSession = {
  penaltyQuestions: number
  correctAnswersCount: number
  currentLevel: number // 0-7 A0-C2
  active: boolean
  otherRatings: Record<string, string>
  currentQuestion: Question | undefined
  answers: AnswerRecord[]
}

export type TestSessionLight = Omit<TestSession, "answers" | "currentQuestion"> & {
  currentQuestion: QuestionLight
}

export const InitialTestSession: TestSession = {
  penaltyQuestions: 0,
  currentLevel: 6,
  correctAnswersCount: 0,
  active: false,
  currentQuestion: undefined,
  otherRatings: {},
  answers: [],
};


export function getQuestionForLevel(level: number): Question {
  return {
    template: "Who let the {...} out? {...} are you OK?",
    options: [["dogs", "cats"], ["Annie", "Jimmy"]],
    difficulty: 6,
    correctAnswers: ["dogs", "Annie"]
  };
}

export function lightenSession(session: TestSession): TestSessionLight {
  const q: Partial<Question> | undefined = session.currentQuestion ? { ...session.currentQuestion } : undefined;
  if (q)
    delete q.correctAnswers;
  const result: any = { ...session };
  delete result.answers;
  result.currentQuestion = q;

  return result as TestSessionLight;
}

export function makeAnswerRecord(answers: string[], question: Question): AnswerRecord {
  return {
    question,
    isCorrect: true,
    userAnswers: answers
  }
}
export function createIfNotExists(): TestSession {
  const SESSION = getSession();
  if (!SESSION.activeEnglishTest) {
    SESSION.activeEnglishTest = InitialTestSession;
  }

  return SESSION.activeEnglishTest;
}

export function getTestSession(): TestSession {
  const SESSION = getSession();
  return SESSION.activeEnglishTest;
}

export function reset(revalidate: boolean = true) {
  const SESSION = getSession();
  SESSION.activeEnglishTest = InitialTestSession;

  if (revalidate)
    revalidatePath("/test");
}
