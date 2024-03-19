"use client";

import { useState, useEffect } from "react";
import css from "./wordlist.module.css";
import debounce from "lodash.debounce";
import { addWords, removeWords } from "~/app/edit_my_wordlist/my_wordlist";
import { isWordLearned, getMyWords } from "~/lib/words_storage";

import DictLink from "@/dictlink";

import Table from "@/largetable";
import Select from "@/select";
import Checkbox from "@/checkbox";
import { LevelOptionsAny, PartOptionsAny } from "~/lib/select_options";
import { LanguageLevel } from "~/lib/language_levels";


export type Word = {
  id: string,
  word: string,
  level: LanguageLevel,
  part: string
};


export default function WordList({ words }: { words: Word[] }) {
  let [myWords, setSetMyWordsView] = useState<Record<string, boolean>>({ ...getMyWords() });
  let [hideLearnedMode, setHideLearnedMode] = useState(true);


  let [level, setLevel] = useState<LanguageLevel | "any">("any");
  let [part, setPart] = useState("any");
  let [searchQuery, setSearchQuery] = useState("");
  let [excludedWords, setExcludedWords] = useState<Array<String>>([]);

  const dataEmpty = !words;
  if (dataEmpty) {
    words = [];
  }
  
  function toggleWord(word: string, isKnown: boolean) {
    const fn = isKnown ? addWords : removeWords;
    fn([word]).then(words => setSetMyWordsView({ ...words }));
  }


  const filterFn = (e: Word) => {
    if (hideLearnedMode && isWordLearned(e.word)) {
      return false;
    }
    if (level != "any" && level != e.level) return false;
    if (part != "any" && part != e.part) {
      if (part == "other") {
        return !PartOptionsAny[e.part];
      }
      else {
        return false;
      }
    }
    if (searchQuery != "" && !e.word.match(new RegExp(`^${searchQuery}.*?$`, "i"))) return false;
    // if (searchQuery != "" && e.word.indexOf(searchQuery) == -1) return false;
    if (excludedWords.includes(e.word)) return false;
    return true;
  };

  const Row = ({ data, index }: any) => {
    const el: Word = data[index];
    return (
      <tr key={el.id}>
        <td className="w-[56px] align-middle text-center">
          {!hideLearnedMode ?
            <input className="checkbox align-middle" type="checkbox" checked={isWordLearned(el.word)} onChange={e => toggleWord(el.word, e.target.checked)} />
            :
            <i className="small icon thumbs_up cursor-pointer" title="Mark as learned" onClick={e => toggleWord(el.word, true)}></i>
          }
        </td>
        <td>
          <DictLink className="mr-1" service="reverso" word={el} />
          <DictLink type="anchor" service="oxford" word={el} />
        </td>
        <td className="w-2/6">{el.part} </td>
        <td className="w-1/6">{el.level}</td>
      </tr>
    )
  };



  const filteredWords = words.filter(filterFn);
  const wordCount = filteredWords.length;
  return (
    <>
      <div className="flex items-center gap-2 mb-2">
        <label htmlFor="level_select">Level: </label>
        <Select
          className="select"
          dict={LevelOptionsAny}
          bind={[level, setLevel]}
          id="level_select"
        />
        <label htmlFor="part_select">Part of speech: </label>
        <Select
          className="select"
          dict={PartOptionsAny}
          bind={[part, setPart]}
          id="part_select"
        />
        <input placeholder="Search" className="input" id="search_q" autoComplete="off" onChange={debounce(e => setSearchQuery(e.target.value), 300)} />
      </div>
      Word count: {wordCount}
      <div>
        <Checkbox
          className="checkbox mb-[-5px]"
          label="Hide learned words"
          bind={[hideLearnedMode, setHideLearnedMode]}
        />
      </div>
      <Table
        tableClass={css.table + " table"}
        height={800}
        itemCount={wordCount}
        itemSize={53}
        itemData={filteredWords}
        width="100%"
        row={Row}
      />
    </>
  );
}
