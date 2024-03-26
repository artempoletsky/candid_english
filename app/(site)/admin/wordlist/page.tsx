import { Metadata } from "next";
import Link from "next/link";
import WordList from "./wordlist";



export const metadata: Metadata = {
  title: "Edit the wordlist",
};


export default async function WordlistPage() {
  return (
    <WordList />
  );
}
