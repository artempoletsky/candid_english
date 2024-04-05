"use client"

import TestStart from "./TestStart";
import TestProgress from "./TestProgress";

import TestResult from "./TestResult";
import { useState, useEffect } from "react";

import { TestSessionLight, TestSession, RCreateSession } from "./api/route";
import { rpc } from "app/rpc";

export type SessionUpdateCb = (session: TestSessionLight | TestSession) => any;
const { tryAgain } = rpc("exam").methods("tryAgain");



export default function PageTest({ session, takeSurvey: takeSurveyInitial }: RCreateSession) {
  let [testSession, setTestSession] = useState<TestSession | TestSessionLight>(session);
  let [takeSurvey, setTakeSurvey] = useState(takeSurveyInitial);

  function onTryAgain() {
    setTakeSurvey(false);
    tryAgain().then(setTestSession);
  }
  if (!testSession.active) return <TestStart onStart={setTestSession} takeSurvey={takeSurvey} />;
  if (!testSession.completed) return <TestProgress onAnswer={setTestSession} testSession={testSession as TestSessionLight} />;
  return <TestResult onTryAgain={onTryAgain} testSession={testSession as TestSession} />
}