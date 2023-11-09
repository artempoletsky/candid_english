'use client';
import { useState, useEffect } from 'react';
import css from './wordlist.module.css';
import debounce from 'lodash.debounce';
import { addWords, removeWords } from '~/app/edit_my_wordlist/my_wordlist';
import { isWordLearned, getMyWords } from '~/lib/words_storage';
import Link from 'next/link'
import DictLink from "@/dictlink";

export type Word = {
  id: string,
  word: string,
  level: string,
  part: string
};




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

export default function WordList({ data }: { data: Array<Word> }) {
  let [myWords, setSetMyWordsView] = useState<Record<string, boolean>>({ ...getMyWords() });

  let [hideLearnedMode, setHideLearnedMode] = useState(true);

  function toggleWord(word: string, isKnown: boolean) {
    const fn = isKnown ? addWords : removeWords;
    fn([word]).then(words => setSetMyWordsView({ ...words }));
  }

  let [level, setLevel] = useState("any");
  let [part, setPart] = useState("any");
  let [searchQuery, setSearchQuery] = useState("");
  let [excludedWords, setExcludedWords] = useState<Array<String>>([]);


  const filterFn = (e: Word) => {
    if (hideLearnedMode && myWords[e.word.toLowerCase()]) {
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
    if (searchQuery != "" && !e.word.match(new RegExp(`^${searchQuery}.*?$`, 'i'))) return false;
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
        <input id="search_q" autoComplete="off" onChange={debounce(e => setSearchQuery(e.target.value), 300)} />
      </div>
      Word count: {wordCount}
      <div>
        <Link href="/edit_my_wordlist">Edit my wordlist</Link>
        <label>&nbsp;<input type="checkbox" checked={hideLearnedMode} onChange={e => {
          const now = Date.now();
          setHideLearnedMode(e.target.checked);
          requestAnimationFrame(() => {
            console.log((Date.now() - now) / 1000);
          });
        }} /> Hide learned words</label>
      </div>

      <div className={css.container}>
        <table className={css.table}>
          <tbody>
            {words.map((el: Word) =>
              <tr key={el.id}>
                <td className={css.checkbox_td}>
                  {!hideLearnedMode ?
                    <input type='checkbox' checked={isWordLearned(el.word)} onChange={e => toggleWord(el.word, e.target.checked)} />
                    :
                    <i className="small icon thumbs_up cursor-pointer" title="Mark as learned" onClick={e => toggleWord(el.word, true)}></i>
                  }
                </td>
                <td>
                  <DictLink className="mr-1" service="reverso" word={el} />
                  <DictLink type="anchor" service="oxford" word={el} />
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
