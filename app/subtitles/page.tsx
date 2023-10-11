import Layout from "@/layout";
import SubtitlesComp from "./subtitles_comp";
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Learn new words with subtitles',
};

export default async function SubtitlesPage() {
  return (
    <Layout>
      <h1>{"" + metadata.title}</h1>
      <SubtitlesComp></SubtitlesComp>
    </Layout>
  );
}