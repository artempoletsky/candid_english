import Layout from "@/layout"

import PageTest from "./PageTest";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Test your level of English",
};

export default function page() {

  return (
    <Layout>
      <h1>{metadata.title as string}</h1>
      <PageTest />
    </Layout>
  );
}