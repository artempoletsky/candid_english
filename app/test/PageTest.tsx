"use client"

import TestStart from "./TestStart";
import TestProgress from "./TestProgress";

import TestResult from "./TestResult";
import { useState, useEffect } from "react";
import { getAPIMethod } from "@artempoletsky/easyrpc/client";
import { API_ENGLISH_TEST } from "~/lib/paths";

import { FTryAgain, FCreateSession, TestSessionLight, TestSession } from "./api/route";
import { Loader } from "@mantine/core";

export type SessionUpdateCb = (session: TestSessionLight | TestSession) => any;
const tryAgain: FTryAgain = getAPIMethod(API_ENGLISH_TEST, "tryAgain");
const createSession: FCreateSession = getAPIMethod(API_ENGLISH_TEST, "createSession");


export default function TestPageComponent() {
  let [testSession, setTestSession] = useState<TestSession | TestSessionLight>();

  useEffect(() => {
    createSession().then(setTestSession);
  }, []);

  if (!testSession) return <Loader type="dots" />;

  return (
    <>
      {/* <div>Level: {testSession.currentLevel}; Correct answers count: {testSession.correctAnswersCount}</div> */}
      {!testSession.active && <TestStart onStart={setTestSession} />}
      {testSession.currentQuestion && <TestProgress onAnswer={setTestSession} testSession={testSession as TestSessionLight} />}
      {testSession.active && !testSession.currentQuestion && <TestResult onTryAgain={() => tryAgain().then(setTestSession)} testSession={testSession as TestSession} />}
    </>
  );
}