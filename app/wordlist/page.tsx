import { Metadata } from 'next';
import Link from 'next/link';
import WordList from './wordlist';


import fs from 'fs'

const data = JSON.parse(fs.readFileSync("./grab_data/words_light.json", { encoding: "utf8" }));

// import styles from './custom.module.css';

export const metadata: Metadata = {
  title: 'Explore Oxford\'s 5000 wordlist',
  description: 'Explore Oxford Learner\'s Word List',
}


let level: string = 'any';

export default function BlogMain() {
  return (
    <div className="">
      <h1 className="foo">Wordlist</h1>
      <WordList data={data}></WordList>
      <Link href="/">Back to the main page</Link>
    </div>
  );
}
