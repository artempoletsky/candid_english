
import { TestSession } from "./test";
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
      <p className="mt-5">Your level is </p>

      <div className="mt-5 flex justify-center"><button type="submit" className="btn">Take the test again</button></div>
    </form>
  );
}
