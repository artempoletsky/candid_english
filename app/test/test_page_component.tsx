"use client"

import TestStart from './test_start';
import TestProgress from './test_progress';

import TestResult from './test_result';
import { useState, useEffect } from "react";
import { getAPIMethod } from '@artempoletsky/easyrpc/client';
import { API_ENGLISH_TEST } from '~/lib/paths';
import { TestSession, TestSessionLight } from './test_methods';
import { FnTryAgain, FnCreateSession } from './api/route';

export type SessionUpdateCb = (session: TestSessionLight | TestSession) => any;
const tryAgain: FnTryAgain = getAPIMethod(API_ENGLISH_TEST, "tryAgain");
const createSession: FnCreateSession = getAPIMethod(API_ENGLISH_TEST, "createSession");


export default function TestPageComponent() {
  let [testSession, setTestSession] = useState<TestSession | TestSessionLight>();

  useEffect(() => {
    createSession().then(setTestSession);
  }, []);

  if (!testSession) return "loading...";

  return (
    <>
      <div>Level: {testSession.currentLevel}; Correct answers count: {testSession.correctAnswersCount}</div>
      {!testSession.active && <TestStart onStart={setTestSession} />}
      {testSession.currentQuestion && <TestProgress onAnswer={setTestSession} testSession={testSession as TestSessionLight} />}
      {testSession.active && !testSession.currentQuestion && <TestResult onTryAgain={() => tryAgain().then(setTestSession)} testSession={testSession as TestSession} />}
    </>
  );
}