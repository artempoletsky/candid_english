import { NextResponse } from "next/server";
import { ResponseError } from "@artempoletsky/easyrpc";

import { Levels, dec, zLanguageLevel } from "lib/language_levels";
import { NextPOST } from "@artempoletsky/easyrpc";
import z from "zod";



import { revalidatePath } from "next/cache"
import { query } from "app/db"
import { LanguageLevel } from "lib/language_levels"
import { TestQuestion } from "app/globals";
import { getSession } from "app/session/session";


export type ExamTicketLight = {
  template: string;
  options: string[][];
}

export type AnswerRecord = {
  question: TestQuestion
  userAnswers: string[]
  isCorrect: boolean
}

export type TestSession = {
  completed: boolean;
  penaltyQuestions: number;
  correctAnswersCount: number;
  currentLevel: LanguageLevel;
  active: boolean;
  survey?: SurveyLanguageLevel;
  currentQuestion: TestQuestion | undefined;
  answers: AnswerRecord[];
}

export type TestSessionLight = Omit<TestSession,
  | "currentQuestion"
  | "penaltyQuestions"
  | "correctAnswersCount"
  | "currentLevel"
  | "otherRatings"
  | "currentQuestion"
  | "answers"
> & {
  currentQuestion: ExamTicketLight | undefined;
}

const InitialTestSession: TestSession = {
  completed: false,
  penaltyQuestions: 0,
  currentLevel: "c2",
  correctAnswersCount: 0,
  active: false,
  currentQuestion: undefined,
  survey: {
    certificate: "x",
    online: "x",
    ownRating: "x",
  },
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

    let id = _.sample(ids)!;
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

function lightenSession(session: TestSession): TestSessionLight | TestSession {
  if (session.completed) return session;
  const current = session.currentQuestion;
  let currentQuestion: ExamTicketLight | undefined;
  if (current) {
    currentQuestion = {
      options: current.options,
      template: current.template,
    }
  }

  const result: TestSessionLight = {
    active: session.active,
    completed: session.completed,
    currentQuestion,
  };

  return result;
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

const zLanguageLevelExclude = z.enum(["x", ...Levels]);
const ZSurvey = z.object({
  ownRating: zLanguageLevelExclude,
  online: zLanguageLevelExclude,
  certificate: zLanguageLevelExclude,
});

export type SurveyLanguageLevel = z.infer<typeof ZSurvey>;
const ZBeginTest = z.object({
  survey: ZSurvey.optional(),
});

export type ABeginTest = z.infer<typeof ZBeginTest>;

async function beginTest({ survey }: ABeginTest) {
  const SESSION = await getSession();

  console.log(survey);
  

  let activeEnglishTest = SESSION.activeEnglishTest;
  if (!activeEnglishTest) throw new ResponseError("Test session is invalid");
  activeEnglishTest.survey = survey;
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

async function giveAnswer({ dontKnow, answers }: AGiveAnswer) {
  const session = await getSession();
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
      testSession.completed = true;
    }
  }
  if (dontKnow || !aRec.isCorrect) {
    testSession.currentLevel = dec(testSession.currentLevel);
    //fail the exam
    if (testSession.currentLevel == "a0") {
      testSession.currentQuestion = undefined;
      testSession.completed = true;
    }
  }

  if (testSession.currentQuestion !== undefined) {
    testSession.currentQuestion = await getQuestionForLevel(testSession.currentLevel, exclude);
  }


  session.activeEnglishTest = testSession;
  if (testSession.completed) {
    session.englishLevel = testSession.currentLevel;
    const user = session.user;
    if (user) {
      user.englishLevel = testSession.currentLevel;
    }
    const sessid = session.id;
    await query(({ users, completed_exams, surveys }, { username, sessid, resultLevel, survey, answers }) => {
      if (username) {
        users.where("username", username).limit(1).update(u => {
          u.englishLevel = resultLevel;
        });
      }

      let surveyId = 0;
      if (survey) {
        surveyId = surveys.insert({
          data: survey,
          type: "EnglishLevelTest",
          username,
        });
      }

      completed_exams.insert({
        sessid,
        surveyId,
        answers,
        resultLevel,
        username,
      });
    }, {
      username: user?.username || "",
      resultLevel: testSession.currentLevel,
      sessid,
      survey: testSession.survey,
      answers: testSession.answers.map(a => ({
        questionId: a.question.word,
        userAnswers: a.userAnswers,
      }))
    });
  }

  if (testSession.currentQuestion) {
    return lightenSession(testSession);
  } else {
    return testSession;
  }
}

export type FGiveAnswer = (args: AGiveAnswer) => ReturnType<typeof giveAnswer>;

/////

async function tryAgain() {
  const SESSION = await getSession();
  SESSION.activeEnglishTest = InitialTestSession;
  return lightenSession(SESSION.activeEnglishTest);
}

export type FTryAgain = typeof tryAgain;

async function createSession() {
  const session = await getSession();
  if (!session.activeEnglishTest) {
    session.activeEnglishTest = InitialTestSession;
  }
  const takeSurvey: boolean = await query(({ surveys, completed_exams }, { username, sessid }) => {
    if (username) {
      return surveys.where("username", username).limit(1).select().length == 0;
    }
    return completed_exams.where("sessid", sessid).limit(1).select().length == 0;
  }, {
    username: session.user?.username || "",
    sessid: session.id,
  })

  return {
    session: lightenSession(session.activeEnglishTest),
    takeSurvey,
  }
}

export type FCreateSession = typeof createSession;
export type RCreateSession = Awaited<ReturnType<FCreateSession>>;


export const POST = NextPOST({
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