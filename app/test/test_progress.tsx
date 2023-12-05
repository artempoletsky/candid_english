
import TestSentence from "./sentence";
import { formDataToDict } from "~/lib/utils_client";
import { getAPIMethod } from "~/lib/rpc_client";
import { MouseEvent, useRef } from "react";
import type { TestSessionLight } from "./test_methods";
import { FnGiveAnswer } from "./api/route";
import { API_ENGLISH_TEST } from "~/lib/paths";
import { SessionUpdateCb } from "./page";

type TestProgressProps = {
  testSession: TestSessionLight
  onAnswer: SessionUpdateCb
}

const giveAnswer: FnGiveAnswer = getAPIMethod(API_ENGLISH_TEST, "giveAnswer");
export default function TestProgress({ testSession, onAnswer }: TestProgressProps) {
  const form = useRef<HTMLFormElement>(null);

  function submitForm(dontKnow: boolean) {
    // 'use server'
    return (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      let formData = new FormData(form.current as HTMLFormElement);

      const answers = formDataToDict(formData);


      const answersArray = [];
      let i = 0;
      while (answers[i]) {
        answersArray.push(answers[i++]);
      }

      giveAnswer({
        dontKnow,
        answers: answersArray
      }).then(onAnswer);

    }


    // giveAnswer(answersArray, dontKnow);
  }
  // console.log(testSession.currentQuestion.template);
  // console.log(testSession.currentQuestion.options);

  // testSession.currentQuestion
  return (
    <form ref={form} method="POST" encType="multipart/form-data">
      {/* <TestSentence question="Who let the {...} out? {...} are you OK?" options={[["dogs", "cats"], ["Annie", "Jimmy"]]} /> */}
      <TestSentence question={testSession.currentQuestion.template} options={testSession.currentQuestion.options} />
      <div className="mt-5 flex justify-center">
        <button onClick={submitForm(false)} type="submit" name="submit" className="btn mr-2" value="submit">Submit</button>
        <button onClick={submitForm(true)} type="submit" name="submit" className="btn" value="x">I don't know</button>
      </div>
    </form>
  );
}
