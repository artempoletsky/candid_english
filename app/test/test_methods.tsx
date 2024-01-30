import { revalidatePath } from "next/cache"
import { getSession } from "~/app/session/route"
import { TestQuestion, query } from "~/db"
import { LanguageLevel } from "~/lib/language_levels"


export type QuestionLight = Omit<TestQuestion, "correctAnswers" | "word">

export type AnswerRecord = {
  question: TestQuestion
  userAnswers: string[]
  isCorrect: boolean
}

export type TestSession = {
  penaltyQuestions: number
  correctAnswersCount: number
  currentLevel: LanguageLevel
  active: boolean
  otherRatings: Record<string, string>
  currentQuestion: TestQuestion | undefined
  answers: AnswerRecord[]
}

export type TestSessionLight = Omit<TestSession, "answers" | "currentQuestion"> & {
  currentQuestion: QuestionLight
}

export const InitialTestSession: TestSession = {
  penaltyQuestions: 0,
  currentLevel: "c2",
  correctAnswersCount: 0,
  active: false,
  currentQuestion: undefined,
  otherRatings: {},
  answers: [],
};


export async function getQuestionForLevel(level: LanguageLevel, exclude: string[] = []): Promise<TestQuestion> {
  type Payload = {
    difficulty: LanguageLevel
    exclude: string[]
  };

  return await query<Payload>(({ test_questions }, { payload, _ }) => {
    let ids = test_questions.indexIds("difficulty", payload.difficulty);
    ids = ids.filter(id => !payload.exclude.includes(id));
    if (!ids.length) throw new Error("Ids are empty");

    let id = _.sample(ids) as string;
    return test_questions.at(id);
  }, {
    difficulty: level,
    exclude,
  });

  // return {
  //   word: "foo",
  //   template: "Who let the {...} out? {...} are you OK?",
  //   options: [["dogs", "cats"], ["Annie", "Jimmy"]],
  //   difficulty: "c2",
  //   correctAnswers: ["dogs", "Annie"]
  // };
}

export function lightenSession(session: TestSession): TestSessionLight {
  const q: Partial<TestQuestion> | undefined = session.currentQuestion ? { ...session.currentQuestion } : undefined;
  if (q) {
    delete q.correctAnswers;
    delete q.word;
  }

  const result: any = { ...session };
  delete result.answers;
  result.currentQuestion = q;
  return result as TestSessionLight;
}

export function makeAnswerRecord(answers: string[], question: TestQuestion): AnswerRecord {
  let isCorrect = true;
  for (let i = 0; i < answers.length; i++) {
    if (answers[i] != question.correctAnswers[i]) {
      isCorrect = false;
      break;
    }
  }

  return {
    question,
    isCorrect,
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

