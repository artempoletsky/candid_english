import Layout from "app/components/PageLayout"

import PageTest from "./PageTest";
import { Metadata } from "next";
import ComponentLoader from "../components/ComponentLoader";
import { API_ENGLISH_TEST } from "lib/paths";
import { FCreateSession } from "./api/route";

export const metadata: Metadata = {
  title: "Test your level of English",
};

export default function page() {
  const method = API_ENGLISH_TEST + "?createSession" as unknown as FCreateSession;
  return (
    <>
      <h1>{metadata.title as string}</h1>
      <ComponentLoader
        Component={PageTest}
        args={{}}
        method={method}
      />
    </>
  );
}