import { Metadata } from "next";
import Link from "next/link";
import WordList from "./wordlist";
import Layout from "@/layout";





export default async function WordlistPage() {
  return (
    <Layout>
      <h1 className="foo">Edit the wordlist</h1>
      <WordList />
    </Layout>
  );
}
