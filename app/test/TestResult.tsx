
import { userView } from "~/lib/language_levels";
import { FormEvent } from "react";
import { TestSession } from "./api/route";
import { Button } from "@mantine/core";

type TestResultProps = {
  testSession: TestSession;
  onTryAgain: () => void;
}

export default function TestResult({ testSession, onTryAgain }: TestResultProps) {
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onTryAgain();
  }
  return (
    <form onSubmit={onSubmit} method="POST" encType="multipart/form-data">
      <p className="mt-5">Your level is</p>
      <p className="font-bold font-5xl">{userView(testSession.currentLevel)}</p>

      <div className="mt-5 flex justify-center"><Button type="submit" className="btn">Take the test again</Button></div>
    </form>
  );
}
