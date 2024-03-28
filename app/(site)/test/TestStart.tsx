import { FormEvent } from "react";
import { getAPIMethod } from "@artempoletsky/easyrpc/client";
import { formDataToDict } from "lib/utils_client";
import { API_ENGLISH_TEST } from "lib/paths";
import type { FBeginTest, ABeginTest } from "./api/route";
import { SessionUpdateCb } from "./PageTest";
import { Button } from "@mantine/core";
import Survey from "./Survey";


type Props = {
  onStart: SessionUpdateCb;
  survey: boolean;
}

const beginTest: FBeginTest = getAPIMethod(API_ENGLISH_TEST, "beginTest");


export default function TestStart({ onStart, survey }: Props) {
  function submitForm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = formDataToDict(new FormData(e.target as HTMLFormElement));
    beginTest(formData as ABeginTest).then(onStart);
  }
  return (
    <form onSubmit={submitForm} method="POST" encType="multipart/form-data">
      <p className="mt-5">How do you rate your level of English?</p>
      {survey && <Survey />}
      <div className="mt-5 flex justify-center"><Button name="submit" type="submit" className="btn">Begin test</Button></div>
    </form>
  );
}
