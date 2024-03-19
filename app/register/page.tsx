
import PageRegister from "./PageRegister";
import { Metadata } from "next";
import { getPageData } from "./api/methods";
import Layout from "@/layout";

export const metadata: Metadata = {
  title: "",
};

type Props = {};
export default async function (props: Props) {
  const dbVersion = await getPageData();
  metadata.title = dbVersion;
  return (
    <Layout>
      <h1>{metadata.title as string}</h1>
      <PageRegister></PageRegister>
    </Layout>
  );
}
