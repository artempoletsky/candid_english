
import Lemmatizer from "./lemmatizer";
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Disassemble text to words",
};

export default async function SubtitlesPage() {
  return (
    <>
      <h1>Text lemmatizer</h1>
      <Lemmatizer />
    </>
  );
}