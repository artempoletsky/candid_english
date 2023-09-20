import { Metadata } from 'next';
import Link from 'next/link';
import WordList from './wordlist';


import fs from 'fs'

const data = JSON.parse(fs.readFileSync("./data/words_light.json", { encoding: "utf8" }));

// import styles from './custom.module.css';

export const metadata: Metadata = {
  title: 'Test',
  description: 'Start testing your English level',
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
