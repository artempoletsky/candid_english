
import { userView } from "~/lib/language_levels";
import { TestSession } from "./test_methods";
import { FormEvent } from "react";

type TestResultProps = {
  testSession: TestSession
  onTryAgain: Function
}

export default function TestResult({ testSession, onTryAgain }: TestResultProps) {
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onTryAgain();
  }
  return (
    <form onSubmit={onSubmit} method="POST" encType="multipart/form-data">
      <p className="mt-5">Your level is</p>
      <h1>{userView(testSession.currentLevel)}</h1>
      <div className="mt-5 flex justify-center"><button type="submit" className="btn">Take the test again</button></div>
    </form>
  );
}
