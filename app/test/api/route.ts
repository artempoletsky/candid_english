import { NextResponse } from "next/server";
import { ResponseError } from "@artempoletsky/easyrpc";
import { getSession } from "~/app/session/route";
import { dec, zLanguageLevel } from "~/lib/language_levels";
import { NextPOST } from "@artempoletsky/easyrpc";
import z from "zod";



import { revalidatePath } from "next/cache"
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


async function getQuestionForLevel(level: LanguageLevel, exclude: string[] = []): Promise<TestQuestion> {
  type Payload = {
    difficulty: LanguageLevel
    exclude: string[]
  };

  return await query(({ test_questions }, payload, { _ }) => {
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

function lightenSession(session: TestSession): TestSessionLight {
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

function makeAnswerRecord(answers: string[], question: TestQuestion): AnswerRecord {
  let isCorrect = true;
  for (let i = 0; i < answers.length; i++) {
    const iOf = question.options[i].indexOf(answers[i]);
    if (iOf != question.correctAnswers[i]) {
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



const ZEmpty = z.object({});
const zStringNotEmpty = z.string().min(1, "Required");


const ZBeginTest = z.object({
  own_rating: zLanguageLevel,
  online: zLanguageLevel,
  certificate: zLanguageLevel,
});

export type ABeginTest = z.infer<typeof ZBeginTest>;

async function beginTest(dict: ABeginTest) {
  const SESSION = getSession();


  let activeEnglishTest = SESSION.activeEnglishTest;
  if (!activeEnglishTest) throw new ResponseError("Test session is invalid");
  activeEnglishTest.otherRatings = dict;
  activeEnglishTest.active = true;

  activeEnglishTest.currentQuestion = await getQuestionForLevel("c2");

  SESSION.activeEnglishTest = activeEnglishTest;

  return lightenSession(activeEnglishTest);
}

export type FBeginTest = typeof beginTest;

/////////

const ZGiveAnswer = z.object({
  dontKnow: z.boolean(),
  answers: z.array(zStringNotEmpty),
});

export type AGiveAnswer = z.infer<typeof ZGiveAnswer>;


const ANSWERS_TO_COMPLETE = 5;

export async function giveAnswer({ dontKnow, answers }: AGiveAnswer) {
  const session = getSession();
  const testSession: TestSession | undefined = session.activeEnglishTest
  if (!testSession || !testSession.currentQuestion) throw new ResponseError("Test session is invalid");

  const aRec = makeAnswerRecord(answers, testSession.currentQuestion);
  testSession.answers.push(aRec);
  const exclude = testSession.answers.map(a => a.question.word);


  if (dontKnow) {
    answers = answers.map(a => "");
  } else if (!aRec.isCorrect) {
    testSession.correctAnswersCount = 0;
  } else {
    testSession.correctAnswersCount++;
    //pass the exam
    if (testSession.correctAnswersCount >= ANSWERS_TO_COMPLETE) {
      testSession.currentQuestion = undefined;
    }
  }
  if (dontKnow || !aRec.isCorrect) {
    testSession.currentLevel = dec(testSession.currentLevel);
    //fail the exam
    if (testSession.currentLevel == "a0") {
      testSession.currentQuestion = undefined;
    }
  }

  if (testSession.currentQuestion !== undefined) {
    testSession.currentQuestion = await getQuestionForLevel(testSession.currentLevel, exclude);
  }


  session.activeEnglishTest = testSession;

  if (testSession.currentQuestion) {
    return lightenSession(testSession);
  } else {
    return testSession;
  }
}

export type FGiveAnswer = (args: AGiveAnswer) => ReturnType<typeof giveAnswer>;

/////

async function tryAgain() {
  const SESSION = getSession();
  SESSION.activeEnglishTest = InitialTestSession;
  return lightenSession(SESSION.activeEnglishTest);
}

export type FTryAgain = typeof tryAgain;

async function createSession() {
  const SESSION = getSession();
  if (!SESSION.activeEnglishTest) {
    SESSION.activeEnglishTest = InitialTestSession;
  }

  return lightenSession(SESSION.activeEnglishTest);
}

export type FCreateSession = typeof createSession;


export const POST = NextPOST(NextResponse, {
  createSession: ZEmpty,
  beginTest: ZBeginTest,
  giveAnswer: ZGiveAnswer,
  tryAgain: ZEmpty,
}, {
  createSession,
  beginTest,
  giveAnswer,
  tryAgain,
});