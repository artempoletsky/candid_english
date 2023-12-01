import Select from "@/select";
import { getSession } from "~/app/session/route";
import { initialTestSession, type TestSession } from "./page";
import { formDataToDict } from "~/lib/util";
import { cookies } from "next/headers";
import { COOKIE_SESSION_KEY } from "~/lib/paths";
import { NextResponse } from "next/server";
import TestSentence from "./sentence";
import { revalidatePath } from "next/cache";

export default function TestProgress() {
  async function submitForm(formData: FormData) {
    'use server'
    const SESSION = getSession();
    SESSION.activeEnglishTest = initialTestSession;
    revalidatePath('/test', "layout");
    // let activeEnglishTest: TestSession = SESSION.activeEnglishTest;
  }
  return (
    <form action={submitForm} method="POST">
      <TestSentence question="Who let the {...} out? {...} are you OK?" options={[["dogs", "cats"], ["Annie", "Jimmy"]]} />
      <div className="mt-5 flex justify-center">
        <button type="submit" className="btn mr-2">Submit</button>
        <button type="submit" className="btn">I don't know</button>
      </div>
    </form>
  );
}
