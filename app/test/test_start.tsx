import Select from "@/select";
import { FormEvent } from "react";
import { getAPIMethod } from "~/lib/rpc_client";
import { formDataToDict } from "~/lib/utils_client";
import { API_ENGLISH_TEST } from "~/lib/paths";
import type { FnBeginTest, TBeginTest } from "./api/route";
import { SessionUpdateCb } from "./page";
import { asDict, range } from "~/lib/language_levels";

const Levels = asDict(range());

function injectOptions(injeced: Record<string, string>): Record<string, string> {
  return {
    ...injeced,
    ...Levels,
  }
}


type TestStartProps = {
  onStart: SessionUpdateCb
}

const beginTest: FnBeginTest = getAPIMethod(API_ENGLISH_TEST, "begin");
export default function TestStart({ onStart }: TestStartProps) {
  function submitForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = formDataToDict(new FormData(e.target as HTMLFormElement));
    beginTest(formData as TBeginTest).then(onStart);
  }
  return (
    <form onSubmit={submitForm} method="POST" encType="multipart/form-data">
      <p className="mt-5">How do you rate your level of English?</p>
      <Select className="select" name="own_rating" dict={injectOptions({
        x: "I don't know"
      })} />
      <p className="mt-5">How other online English tests rate your level of English (in general)?</p>
      <Select className="select" name="online" dict={injectOptions({
        x: "I did't tried them"
      })} />
      <p className="mt-5">In case you have taken an official English exam like TOEFL, IELTS, etc. what result did you get?</p>
      <Select className="select" name="certificate" dict={injectOptions({
        x: "I didn't take one"
      })} />
      <div className="mt-5 flex justify-center"><button name="submit" type="submit" className="btn">Begin test</button></div>
    </form>
  );
}
