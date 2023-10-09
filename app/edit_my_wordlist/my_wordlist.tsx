'use client';

import { UpdateWordsResponse } from '../update_known_words/route';
import { Word } from '../wordlist/wordlist';
import { useState, useEffect } from 'react';
import store from 'store';
import css from '../wordlist/wordlist.module.css';

function initLocalStorage() {
  if (!store.get('my_words')) {
    store.set('my_words', []);
    store.set('last_words_update', Date.now());
  }
}



export default function MyWordlist() {
  initLocalStorage();
  let [myWords, setMyWords] = useState<string[]>([]);
  let [newWord, setNewWord] = useState<string>('');


  useEffect(() => {
    // update some client side state to say it is now safe to render the client-side only component
    setMyWords(store.get('my_words'));
  }, []);

  function addNewWord() {
    if (!newWord) {
      return;
    }

    updateWordlists({
      added: [newWord]
    })
      .then(() => {
        setNewWord('');
      });
  }

  function updateWordlists(requestBody: any) {
    return fetch('/update_known_words', {
      method: 'POST',
      headers: {
      },
      body: JSON.stringify(requestBody),
    })
      .then(res => res.json())
      .then(updateWords);
  }
  function removeWord(word: string) {
    updateWordlists({
      removed: [word]
    });
  }

  function addWordlists(wordlists: string[]) {
    updateWordlists({
      addedWordlists: wordlists
    });
  }

  function removeWordlists(wordlists: string[]) {
    updateWordlists({
      removedWordlists: wordlists
    });
  }

  function updateWords({ added, removed, updateTimestamp }: UpdateWordsResponse) {
    let words = store.get('my_words');
    console.log(removed);

    words = words.filter((w: string) => !(removed.includes(w) || added.includes(w)));
    words = [...words, ...added];

    store.set('my_words', words);
    store.set('last_words_update', updateTimestamp);
    setMyWords(words);

    return new Promise(resolve => resolve(1));
  }

  return (
    <div>
      <ul className={css.container}>
        {myWords.map(word => <li className="flex" key={word}><span className="grow">{word}</span> <button onClick={() => removeWord(word)}>Remove</button></li>)}
      </ul>
      <div className="flex">
        <input autoComplete="off" className="grow mr-2" type="text" name="new_word" value={newWord} onChange={e => setNewWord(e.target.value)} />
        <button onClick={addNewWord}>Add new word</button>
      </div>
      <div className="flex">
        <button className="grow" onClick={e => addWordlists(['a1'])}>Add A1</button>
        <button className="grow" onClick={e => addWordlists(['a2'])}>Add A2</button>
        <button className="grow" onClick={e => addWordlists(['b1'])}>Add B1</button>
        <button className="grow" onClick={e => addWordlists(['b2'])}>Add B2</button>
        <button className="grow" onClick={e => addWordlists(['c1'])}>Add C1</button>
      </div>
      <div className="flex">
        <button className="grow" onClick={e => removeWordlists(['a1'])}>Remove A1</button>
        <button className="grow" onClick={e => removeWordlists(['a2'])}>Remove A2</button>
        <button className="grow" onClick={e => removeWordlists(['b1'])}>Remove B1</button>
        <button className="grow" onClick={e => removeWordlists(['b2'])}>Remove B2</button>
        <button className="grow" onClick={e => removeWordlists(['c1'])}>Remove C1</button>
      </div>
    </div>
  );
}