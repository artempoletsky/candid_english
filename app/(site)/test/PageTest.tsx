"use client"

import TestStart from "./TestStart";
import TestProgress from "./TestProgress";

import TestResult from "./TestResult";
import { useState, useEffect } from "react";
import { getAPIMethod } from "@artempoletsky/easyrpc/client";
import { API_ENGLISH_TEST } from "lib/paths";

import { FTryAgain, FCreateSession, TestSessionLight, TestSession, RCreateSession } from "./api/route";
import { Loader } from "@mantine/core";

export type SessionUpdateCb = (session: TestSessionLight | TestSession) => any;
const tryAgain: FTryAgain = getAPIMethod(API_ENGLISH_TEST, "tryAgain");



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