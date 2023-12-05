import { NextRequest, NextResponse } from "next/server";
import { InitialTestSession, TestSession, createIfNotExists, getQuestionForLevel, lightenSession, makeAnswerRecord } from "../test_methods";
import validate, { ValidationRule, Validator } from "~/lib/rpc";
import { getSession } from "~/app/session/route";
import { dec } from "~/lib/language_levels";


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

  activeEnglishTest.currentQuestion = getQuestionForLevel("c2");

  SESSION.activeEnglishTest = activeEnglishTest;

  return lightenSession(activeEnglishTest);
}

export type FnBeginTest = typeof begin;

/////////

export type TGiveAnswer = {
  dontKnow: boolean
  answers: string[]
}

const VGiveAnswer: ValidationRule = [{
  dontKnow: "boolean",
  answers: "string[]",
}, async ({ payload }) => {
  const SESSION = getSession();

  if (!SESSION.activeEnglishTest?.currentQuestion) {
    return "Current question is undefined";
  }
  payload.session = SESSION;
  return true;
}]


const ANSWERS_TO_COMPLETE = 5;

export async function giveAnswer({ dontKnow, answers }: TGiveAnswer, payload: any) {

  const testSession: TestSession = payload.session.activeEnglishTest
  if (!testSession.currentQuestion) throw new Error("imposible");

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
    testSession.currentLevel = dec(testSession.currentLevel);
    //fail the exam
    if (testSession.currentLevel == "a0") {
      testSession.currentQuestion = undefined;
    }
  }

  payload.session.activeEnglishTest = testSession;

  if (testSession.currentQuestion) {
    return lightenSession(testSession);
  } else {
    return testSession;
  }
}
type t = Parameters<typeof giveAnswer>[0];
export type FnGiveAnswer = (args: TGiveAnswer) => ReturnType<typeof giveAnswer>;

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