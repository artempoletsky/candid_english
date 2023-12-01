import Layout from '@/layout'
import Sentence from "./sentence";

import { getSession } from '../session/route';
import TestStart from './test_start';
import TestProgress from './test_progress';

// export const dynamic = 'force-dynamic'



export type TestSession = {
  currentLevel: number // 0-7 A0-C2
  questionsRemained: number
  started: boolean
  otherRatings: Record<string, string>
}

export const initialTestSession: TestSession = {
  currentLevel: 7,
  questionsRemained: 5,
  started: false,
  otherRatings: {}
};


export default async function Test() {
  const SESSION = getSession();
  let testSession = SESSION.activeEnglishTest;
  if (!testSession) {
    SESSION.activeEnglishTest = testSession = initialTestSession;
  }
  
  
  
  return (
    <Layout>
      <h1>Test your level of English</h1>
      {!testSession.started && <TestStart />}
      {testSession.started && <TestProgress />}
    </Layout>
  );
}