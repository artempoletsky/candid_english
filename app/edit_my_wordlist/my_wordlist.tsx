'use client';

import { UpdateWordsResponse } from '../update_known_words/route';
import { Word } from '../wordlist/wordlist';
import { useState, useEffect } from 'react';
import store from 'store';
import css from '../wordlist/wordlist.module.css';
import { uniq, pull } from 'lodash';
import Link from 'next/link'

export function initWordsLocalStorage(): string[] {
  let myWords = store.get('my_words');
  if (!myWords) {
    myWords = [];
    store.set('my_words', myWords);
    store.set('last_words_update', Date.now());
  }
  return myWords;
}


export function updateWordlists(requestBody: any): Promise<string[]> {
  return fetch('/update_known_words', {
    method: 'POST',
    headers: {
    },
    body: JSON.stringify(requestBody),
  })
    .then(res => res.json())
    .then(updateLocalStorage);
}

export function updateLocalStorage(response: UpdateWordsResponse): Promise<string[]> {
  const { added, removed, updateTimestamp } = response;
  let words = store.get('my_words');

  pull(words, ...removed);
  words = uniq([...words, ...added]);

  words = words.sort((a: string, b: string) => a.toLowerCase() > b.toLowerCase() ? 0 : -1);

  store.set('my_words', words);
  store.set('last_words_update', updateTimestamp);

  return new Promise(resolve => resolve(words));
}

export function addWords(words: string[]): Promise<string[]> {
  return updateWordlists({
    added: words
  });
}

export function removeWords(words: string[]): Promise<string[]> {
  return updateWordlists({
    removed: words
  });
}

export function addWordlists(wordlists: string[]): Promise<string[]> {
  return updateWordlists({
    addedWordlists: wordlists
  });
}

export function removeWordlists(wordlists: string[]): Promise<string[]> {
  return updateWordlists({
    removedWordlists: wordlists
  });
}


export function clearMyWords(): Promise<string[]> {
  return updateWordlists({
    removed: store.get("my_words")
  });
}


export default function MyWordlist() {
  initWordsLocalStorage();
  let [myWords, setMyWords] = useState<string[]>([]);
  let [newWord, setNewWord] = useState<string>('');


  useEffect(() => {
    // update some client side state to say it is now safe to render the client-side only component
    setMyWords(store.get('my_words'));
  }, []);

  function updateViewWords(words: string[]): Promise<string[]> {
    setMyWords(words);
    return new Promise(resolve => resolve(words))
  }

  function addNewWord() {
    if (!newWord) {
      return;
    }

    addWords([newWord])
      .then(updateViewWords)
      .then(() => {
        setNewWord('');
      });
  }

  function removeWord(word: string) {
    updateWordlists({
      removed: [word]
    }).then(updateViewWords)
  }



  return (
    <div>
      <div className="flex">
        <input autoComplete="off" className="grow mr-2" type="text" name="new_word" value={newWord} onChange={e => setNewWord(e.target.value)} />
        <button onClick={addNewWord}>Add new word</button>
      </div>
      <div>
        <label htmlFor="filter_file">Add words from a file:</label>
        <input id="filter_file" type="file" onChange={e => {
          const input = e.target;
          const files = input.files;
          if (!files) return;
          const file = files[0];
          const reader = new FileReader();
          reader.onload = function (e: ProgressEvent<FileReader>) {
            if (e.target) {
              const text: string = e.target.result + '';
              const words = text.split("\n").slice(2)
                .map(line => line.split(/[\s;,]/)[0].toLowerCase())
                .filter((w: string) => w.match(/^\p{L}.*/u));


              addWords(words)
                .then(updateViewWords)
              // console.log(words);
            }
            input.value = '';
          }
          reader.readAsText(file);
        }} />


        <button onClick={e => clearMyWords().then(updateViewWords)}>Remove all words</button>
      </div>

      <Link href="/wordlist">Explore Oxford's wordlist</Link>
      <div className="flex">
        <button className="grow" onClick={e => addWordlists(['a1']).then(updateViewWords)}>Add A1</button>
        <button className="grow" onClick={e => addWordlists(['a2']).then(updateViewWords)}>Add A2</button>
        <button className="grow" onClick={e => addWordlists(['b1']).then(updateViewWords)}>Add B1</button>
        <button className="grow" onClick={e => addWordlists(['b2']).then(updateViewWords)}>Add B2</button>
        <button className="grow" onClick={e => addWordlists(['c1']).then(updateViewWords)}>Add C1</button>
      </div>
      <div className="flex">
        <button className="grow" onClick={e => removeWordlists(['a1']).then(updateViewWords)}>Remove A1</button>
        <button className="grow" onClick={e => removeWordlists(['a2']).then(updateViewWords)}>Remove A2</button>
        <button className="grow" onClick={e => removeWordlists(['b1']).then(updateViewWords)}>Remove B1</button>
        <button className="grow" onClick={e => removeWordlists(['b2']).then(updateViewWords)}>Remove B2</button>
        <button className="grow" onClick={e => removeWordlists(['c1']).then(updateViewWords)}>Remove C1</button>
      </div>
      <ul className={css.container}>
        {myWords.map(word => <li className="flex" key={word}>
          <span className="grow">{word}</span>
          <i className="small icon thumbs_down cursor-pointer" title="Remove" onClick={() => removeWord(word)}></i>
        </li>)}
      </ul>
    </div>
  );
}