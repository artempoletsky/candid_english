
import Page5Words from "./Page5Words";
import ComponentLoader from "components/ComponentLoader";
import { FGetFiveWords, FGetFiveWordsPage } from "./api/route";

export const dynamic = "force-static";
export const metadata = {
  title: ""
};

export default async function FiveWords() {
  const method = "/5words/api/?getFiveWordsPage" as unknown as FGetFiveWordsPage;
  return (
    <ComponentLoader
      Component={Page5Words}
      args={{ level: "all" }}
      method={method}
    />
  );
}