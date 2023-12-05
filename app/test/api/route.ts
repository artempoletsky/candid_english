import { NextRequest, NextResponse } from "next/server";
import { formDataToDict } from "~/lib/client_utils";
import { InitialTestSession, TestSession, createIfNotExists, getQuestionForLevel, lightenSession, makeAnswerRecord } from "../test";
import validate, { ValidationRule } from "~/lib/api";
import { getSession } from "~/app/session/route";


export type TBeginTest = {
  own_rating: string
  online: string
  certificate: string
}
const VBeginTest: ValidationRule = {
  own_rating: "string",
  online: "string",
  certificate: "string",
}

async function begin(dict: TBeginTest) {
  const SESSION = getSession();

  let activeEnglishTest: TestSession = SESSION.activeEnglishTest;
  activeEnglishTest.otherRatings = dict;
  activeEnglishTest.active = true;

  activeEnglishTest.currentQuestion = getQuestionForLevel(6);

  SESSION.activeEnglishTest = activeEnglishTest;

  return lightenSession(activeEnglishTest);
}

export type FnBeginTest = typeof begin;

/////////

export type TGiveAnswer = {
  dontKnow: boolean
  answers: string[]
}
const VGiveAnswer: ValidationRule = {
  dontKnow: "boolean",
  answers: "string[]",
}


const ANSWERS_TO_COMPLETE = 5;

export async function giveAnswer({ dontKnow, answers }: TGiveAnswer) {
  const SESSION = getSession();
  const testSession: TestSession = SESSION.activeEnglishTest

  if (!testSession.currentQuestion) {
    throw new Error("Current question is undefined");
  }
  const aRec = makeAnswerRecord(answers, testSession.currentQuestion);
  testSession.answers.push(aRec);
  testSession.currentQuestion = getQuestionForLevel(testSession.currentLevel);

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
    testSession.currentLevel--;
    //fail the exam
    if (testSession.currentLevel == 0) {
      testSession.currentQuestion = undefined;
    }
  }

  SESSION.activeEnglishTest = testSession;

  if (testSession.currentQuestion) {
    return lightenSession(testSession);
  } else {
    return testSession;
  }
}

export type FnGiveAnswer = typeof giveAnswer;

export async function GET() {
  // beginTest(dict);
  const session: TestSession = createIfNotExists();

  return NextResponse.json(lightenSession(session), {
    status: 200
  });
}
/////
export type TTryAgain = {}

const VTryAgain: ValidationRule = {}

async function tryAgain({ }: TTryAgain) {
  const SESSION = getSession();
  SESSION.activeEnglishTest = InitialTestSession;
  return lightenSession(SESSION.activeEnglishTest);
}

export type FnTryAgain = typeof tryAgain;

export async function POST(req: NextRequest) {
  let { method, ...args } = await req.json();
  let [a, b] = await validate({
    method,
    args
  }, {
    begin: VBeginTest,
    giveAnswer: VGiveAnswer,
    tryAgain: VTryAgain,
  }, {
    begin,
    giveAnswer,
    tryAgain,
  });

  return NextResponse.json(a, b);
}