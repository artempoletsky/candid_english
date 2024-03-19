import { Metadata } from "next";
import Link from "next/link";
import PageWordlist from "./PageWordlist";
import Layout from "@/layout";
import ComponentLoader from "@/ComponentLoader";
import type { FGetOxfordList } from "./api/route";


export const metadata: Metadata = {
  title: "Explore Oxford's 5000 wordlist",
  description: "Explore Oxford Learner's Word List",
}

export const dynamic = "force-static";

export default function page() {
  const method = "/wordlist/api/?getOxfordList" as unknown as FGetOxfordList;
  return (
    <Layout>
      <h1 className="">{metadata.title as string}</h1>

      <ComponentLoader
        Component={PageWordlist}
        method={method}
        args={{}}
      />
    </Layout>
  );
}
