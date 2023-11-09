import { Metadata } from 'next';
import Link from 'next/link';
import WordList from './wordlist';
import Layout from '../components/layout';


export const metadata: Metadata = {
  title: 'Explore Oxford\'s 5000 wordlist',
  description: 'Explore Oxford Learner\'s Word List',
}


export default async function WordlistPage() {
  return (
    <Layout>
      <h1 className="foo">Wordlist</h1>
      <WordList></WordList>
    </Layout>
  );
}
