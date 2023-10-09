'use client';
import { useState, useEffect } from 'react';
import css from './wordlist.module.css';
import debounce from 'lodash.debounce';
import { initWordsLocalStorage, addWords, removeWords } from '../edit_my_wordlist/my_wordlist';
import Link from 'next/link'

export type Word = {
  id: string,
  word: string,
  level: string,
  part: string
};

const REVERSO_LANG = "russian";

export default function WordList({ data }: { data: Array<Word> }) {
  let [myWords, setSetMyWordsView] = useState<string[]>([]);

  let [hideLearnedMode, setHideLearnedMode] = useState(true);

  useEffect(() => {
    // myWords = initWordsLocalStorage();
    setSetMyWordsView(initWordsLocalStorage());
  }, []);

  function isKnownWord(word: string) {
    return myWords.includes(word);
  }

  function toggleWord(word: string, isKnown: boolean) {
    const fn = isKnown ? addWords : removeWords;
    fn([word]).then(words => setSetMyWordsView(words));
  }

  let [level, setLevel] = useState("any");
  let [part, setPart] = useState("any");
  let [searchQuery, setSearchQuery] = useState("");
  let [excludedWords, setExcludedWords] = useState<Array<String>>([]);
  let testEditMode = true;

  const levelOptions: { [key: string]: string } = {
    any: 'Any',
    a1: 'A1',
    a2: 'A2',
    b1: 'B1',
    b2: 'B2',
    c1: 'C1',
  };

  const partOptions: { [key: string]: string } = {
    any: 'Any',
    noun: 'Noun',
    verb: 'Verb',
    adjective: 'Adjective',
    adverb: 'Adverb',
    preposition: 'Preposition',
    conjunction: 'Conjunction',
    determiner: 'Determiner',
    pronoun: 'Pronoun',
    number: 'Number',
    'modal verb': 'Modal verb',
    other: 'Other'
  };

  const levelOptionsArr = Object.keys(levelOptions)
    .map(key => <option key={key} value={key}>{levelOptions[key]}</option>);

  const partOptionsArr = Object.keys(partOptions)
    .map(key => <option key={key} value={key}>{partOptions[key]}</option>);

  const filterFn = (e: Word) => {
    if (hideLearnedMode && myWords.includes(e.word)) {
      return false;
    }
    if (level != "any" && level != e.level) return false;
    if (part != "any" && part != e.part) {
      if (part == "other") {
        return !partOptions[e.part];
      }
      else {
        return false;
      }
    }
    if (searchQuery != "" && !e.word.startsWith(searchQuery)) return false;
    if (excludedWords.includes(e.word)) return false;
    return true;
  };

  const words = data.filter(filterFn);
  const wordCount = words.length;
  return (
    <>
      <div className="flex">
        <label htmlFor="level_select">Level: </label>
        <select id="level_select" value={level} onChange={e => setLevel(e.target.value)}>
          {levelOptionsArr}
        </select>
        <label htmlFor="part_select">Part of speech: </label>
        <select id="part_select" value={part} onChange={e => setPart(e.target.value)}>
          {partOptionsArr}
        </select>
        <label htmlFor="search_q">Search: </label>
        <input id="search_q" onChange={debounce(e => setSearchQuery(e.target.value), 300)} />
      </div>
      <label htmlFor="filter_file">Exclude words from list:</label>
      <input id="filter_file" type="file" onChange={e => {
        const files = e.target.files;
        if (!files) return;
        const file = files[0];
        const reader = new FileReader();
        reader.onload = function (e) {
          const text: String = e.target!.result as String;
          setExcludedWords(text.split("\n").slice(2).map(line => line.split(/[\s;,]/)[0]));
        }
        reader.readAsText(file);
      }} />
      <button className="txt-vol rounded-xl" onClick={() => {
        let input: HTMLInputElement = document.getElementById("filter_file") as HTMLInputElement;
        input.value = "";
        setExcludedWords([]);
      }}>Clear</button>
      Word count: {wordCount}
      <div>
        <Link href="/edit_my_wordlist">Edit my wordlist</Link>
        <label>&nbsp;<input type="checkbox" checked={hideLearnedMode} onChange={e => setHideLearnedMode(e.target.checked)} /> Hide learned words</label>
      </div>

      <div className={css.container}>
        <table className={css.table}>
          <tbody>
            {words.map((el: Word) =>
              <tr key={el.id}>
                <td className={css.checkbox_td}>
                  {!hideLearnedMode ?
                    <input type='checkbox' checked={isKnownWord(el.word)} onChange={e => toggleWord(el.word, e.target.checked)} />
                    :
                    <i className="small icon reverso" title="Mark as learned" onClick={e => toggleWord(el.word, true)}></i>
                  }
                </td>
                <td>
                  <a className="small icon reverso" title="Search word on Reverso" target="_blank" href={`https://context.reverso.net/translation/english-${REVERSO_LANG}/${el.word}`}></a>
                  <a className={css.word} target="_blank" href={"https://www.oxfordlearnersdictionaries.com/definition/english/" + el.id}>{el.word}</a>
                </td>
                <td>{el.part} </td>
                <td>{el.level}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
