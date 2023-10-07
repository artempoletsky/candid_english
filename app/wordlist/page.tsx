import { Metadata } from 'next';
import Link from 'next/link';
import WordList from './wordlist';
import Layout from '../components/layout';

import { Word } from './wordlist';

import fs from 'fs/promises'

export const metadata: Metadata = {
  title: 'Explore Oxford\'s 5000 wordlist',
  description: 'Explore Oxford Learner\'s Word List',
}


let level: string = 'any';

export default async function WordlistPage() {
  const data: string = await fs.readFile("./grab_data/words_light.json", { encoding: "utf8" });
  const words: Array<Word> = JSON.parse(data);
  
  return (
    <Layout>
      <h1 className="foo">Wordlist</h1>
      <WordList data={words}></WordList>
      <Link href="/">Back to the main page</Link>
    </Layout>
  );
}
