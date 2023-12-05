"use client"
import Layout from '@/layout'



import TestStart from './test_start';
import TestProgress from './test_progress';

import TestResult from './test_result';
import useSWR from 'swr';
import { useState, useEffect } from "react";
import { fetcher, getAPIData, getAPIMethod } from '~/lib/client_utils';
import { API_ENGLISH_TEST } from '~/lib/paths';
import { TestSession, TestSessionLight } from './test';
import { FnTryAgain } from './api/route';

export type SessionUpdateCb = (session: TestSessionLight | TestSession) => any;
const tryAgain: FnTryAgain = getAPIMethod(API_ENGLISH_TEST, "tryAgain");
const loadSession = getAPIData(API_ENGLISH_TEST);

export default function Test() {
  let [testSession, setTestSession] = useState<TestSession | TestSessionLight>();
  
  useEffect(()=> {
    loadSession().then(setTestSession);
  }, []);

  if (!testSession) return "loading";

  return (
    <Layout>
      <h1>Test your level of English</h1>
      <div>Level: {testSession.currentLevel}; Correct answers count: {testSession.correctAnswersCount}</div>
      {!testSession.active && <TestStart onStart={setTestSession} />}
      {testSession.currentQuestion && <TestProgress onAnswer={setTestSession} testSession={testSession as TestSessionLight} />}
      {testSession.active && !testSession.currentQuestion && <TestResult onTryAgain={() => tryAgain({}).then(setTestSession)} testSession={testSession as TestSession} />}
    </Layout>
  );
}