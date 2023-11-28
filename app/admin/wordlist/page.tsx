import { Metadata } from "next";
import Link from "next/link";
import WordList from "./wordlist";
import Layout from "@/layout";



export const metadata: Metadata = {
  title: "Edit the wordlist",
};


export default async function WordlistPage() {
  return (
    <Layout>
      <h1>{metadata.title + ""}</h1>
      <WordList />
    </Layout>
  );
}
