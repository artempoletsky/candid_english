import Select from "@/select";
import { getSession } from "../session/route";
import type { TestSession } from "./page";
import { formDataToDict } from "~/lib/util";
import { cookies } from "next/headers";
import { COOKIE_SESSION_KEY } from "~/lib/paths";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

const Levels: Record<string, string> = {
  a0: "A0",
  a1: "A1",
  a2: "A2",
  b1: "B1",
  b2: "B2",
  c1: "C1",
  c2: "C2",
}

function injectOptions(injeced: Record<string, string>): Record<string, string> {
  return {
    ...injeced,
    ...Levels,
  }
}
export default function TestStart() {
  async function submitForm(formData: FormData) {
    'use server'
    const SESSION = getSession();
    
    let activeEnglishTest: TestSession = SESSION.activeEnglishTest;
    activeEnglishTest.otherRatings = formDataToDict(formData)
    activeEnglishTest.started = true;

    // console.log(activeEnglishTest);
    
    SESSION.activeEnglishTest = activeEnglishTest;

    revalidatePath('/test', "layout");

  }
  return (
    <form action={submitForm} method="POST">
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
      <div className="mt-5 flex justify-center"><button type="submit" className="btn">Begin test</button></div>
    </form>
  );
}
