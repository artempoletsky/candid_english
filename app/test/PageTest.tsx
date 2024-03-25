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


type Props = {
  session: TestSessionLight | TestSession;
}
export default function PageTest({ session }: Props) {
  let [testSession, setTestSession] = useState<TestSession | TestSessionLight>(session);

  if (!testSession.active) return <TestStart onStart={setTestSession} />;
  if (!testSession.completed) return <TestProgress onAnswer={setTestSession} testSession={testSession as TestSessionLight} />;
  return <TestResult onTryAgain={() => tryAgain().then(setTestSession)} testSession={testSession as TestSession} />
}