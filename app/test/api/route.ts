import { NextResponse } from "next/server";
import { InitialTestSession, TestSession, createIfNotExists, getQuestionForLevel, lightenSession, makeAnswerRecord } from "../test_methods";
import { ValidationRule } from "@artempoletsky/easyrpc";
import { getSession } from "~/app/session/route";
import { dec } from "~/lib/language_levels";
import { NextPOST } from "@artempoletsky/easyrpc";


export type ABeginTest = {
  own_rating: string
  online: string
  certificate: string
}
const VBeginTest: ValidationRule<ABeginTest> = {
  own_rating: "string",
  online: "string",
  certificate: "string",
}

async function beginTest(dict: ABeginTest) {
  const SESSION = getSession();

  let activeEnglishTest: TestSession = SESSION.activeEnglishTest;
  activeEnglishTest.otherRatings = dict;
  activeEnglishTest.active = true;

  activeEnglishTest.currentQuestion = getQuestionForLevel("c2");

  SESSION.activeEnglishTest = activeEnglishTest;

  return lightenSession(activeEnglishTest);
}

export type FnBeginTest = typeof beginTest;

/////////

export type AGiveAnswer = {
  dontKnow: boolean
  answers: string[]
}

const VGiveAnswer: ValidationRule<AGiveAnswer> = [{
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

export async function giveAnswer({ dontKnow, answers }: AGiveAnswer, payload: any) {

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

export type FnGiveAnswer = (args: AGiveAnswer) => ReturnType<typeof giveAnswer>;

/////

async function tryAgain() {
  const SESSION = getSession();
  SESSION.activeEnglishTest = InitialTestSession;
  return lightenSession(SESSION.activeEnglishTest);
}

export type FnTryAgain = typeof tryAgain;

async function createSession() {
  return lightenSession(createIfNotExists());
}

export type FnCreateSession = typeof createSession;


export const POST = NextPOST(NextResponse, {
  createSession: {},
  beginTest: VBeginTest,
  giveAnswer: VGiveAnswer,
  tryAgain: {},
}, {
  createSession,
  beginTest,
  giveAnswer,
  tryAgain,
});