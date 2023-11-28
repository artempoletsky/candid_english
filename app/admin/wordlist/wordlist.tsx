"use client";

import { useState, useEffect, useReducer } from "react";
import css from "~/app/wordlist/wordlist.module.css";
import debounce from "lodash.debounce";
import { addWords, removeWords } from "~/app/edit_my_wordlist/my_wordlist";

import DictLink from "@/dictlink";
import useSWR from "swr";

import Table from "@/largetable";
import Select from "@/select";

export type Word = {
  id: string
  word: string
  level: string
  originalLevel: string
  part: string
};



const levelOptions: Record<string, string> = {
  any: "Any",
  a1: "A1",
  a2: "A2",
  b1: "B1",
  b2: "B2",
  c1: "C1",
};

const levelOptions2: Record<string, string> = {
  x: "Exclude",
  a1: "A1",
  a2: "A2",
  b1: "B1",
  b2: "B2",
  c1: "C1",
};


const levelOptions3: Record<string, string> = {
  any: "Any",
  x: "Exclude",
  a1: "A1",
  a2: "A2",
  b1: "B1",
  b2: "B2",
  c1: "C1",
};

const partOptions: Record<string, string> = {
  any: "Any",
  noun: "Noun",
  verb: "Verb",
  adjective: "Adjective",
  adverb: "Adverb",
  preposition: "Preposition",
  conjunction: "Conjunction",
  determiner: "Determiner",
  pronoun: "Pronoun",
  number: "Number",
  "modal verb": "Modal verb",
  other: "Other"
};

const partOptions2: Record<string, string> = {
  noun: "Noun",
  verb: "Verb",
  adjective: "Adjective",
  adverb: "Adverb",
  preposition: "Preposition",
  conjunction: "Conjunction",
  determiner: "Determiner",
  pronoun: "Pronoun",
  number: "Number",
  "modal verb": "Modal verb",
  other: "Other"
};

const fetcher = (...args: any) => fetch.apply(this, args).then(res => res.json())
const API_WORDLIST_URL = "/admin/api/wordlist_levels";

export default function WordList() {

  let [originalLevel, setOrginalLevelFilter] = useState("any");
  let [level, setLevelFilter] = useState("any");
  let [part, setPartFilter] = useState("any");
  let [searchQuery, setSearchQuery] = useState("");
  let [version, dispatchVersion] = useReducer(version => version + 1, 0);

  const { data, error, isLoading, mutate } = useSWR(API_WORDLIST_URL, fetcher);

  if (isLoading) {
    return (<div>loading...</div>);
  }

  if (error) {
    return (<div>Loading has failed</div>);
  }

  const patchWord = (word: Word, field: "part" | "level", value: string) => {
    return fetch(API_WORDLIST_URL, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        method: "changeField",
        ids: [word.id],
        values: [value],
        fields: [field]
      })
    }).then(e => {
      data[word.id][field] = value;
      dispatchVersion();
      return e;
    });
  }

  const filterFn = (e: Word) => {
    if (level != "any" && level != e.level) return false;
    if (originalLevel != "any" && originalLevel != e.originalLevel) return false;
    if (part != "any" && part != e.part) {
      if (part == "other") {
        return !partOptions[e.part];
      }
      else {
        return false;
      }
    }
    if (searchQuery != "" && !e.word.match(new RegExp(`^${searchQuery}.*?$`, "i"))) return false;

    return true;
  };

  const Row = ({ data, index }: any) => {
    const el: Word = data[index];
    return (
      <tr key={el.id}>
        <td>
          <DictLink type="anchor" service="oxford" word={el} />
          <DictLink type="anchor" service="synonym" word={el} className="ml-1 text-xs align-super">syn</DictLink>
        </td>
        <td className="w-[170px]">
          <Select
            className="select"
            dict={partOptions2}
            defaultValue={el.part}
            id="level_select"
            onChange={e => patchWord(el, "part", e.target.value)} />
        </td>
        <td className="w-[80px]">{levelOptions[el.originalLevel]}</td>
        <td className="w-[145px]"><Select
          className="select"
          dict={levelOptions2}
          defaultValue={el.level}
          id="level_select"
          onChange={e => patchWord(el, "level", e.target.value)} />
        </td>
      </tr>
    )
  };

  const Header = (
    <tr className="text-sm">
      <th className="">Word</th>
      <th className="w-[170px]">Part of speech</th>
      <th className="w-[80px]">Old lvl</th>
      <th className="w-[145px]">New lvl</th>
    </tr>);


  const filteredWords = Object.keys(data).map(id => {
    return {
      id,
      ...data[id]
    } as Word
  }).filter(filterFn);

  const wordCount = filteredWords.length;
  return (
    <>
      <div className="flex items-center gap-2 mb-2" data-key={version}>
        <label htmlFor="level_select">Original level: </label>
        <Select
          className="select"
          dict={levelOptions}
          bind={[originalLevel, setOrginalLevelFilter]}
          id="level_select"
        />
        <label htmlFor="level_select">Level: </label>
        <Select
          className="select"
          dict={levelOptions3}
          bind={[level, setLevelFilter]}
          id="level_select"
        />
        <label htmlFor="part_select">Part of speech: </label>
        <Select
          className="select"
          dict={partOptions}
          bind={[part, setPartFilter]}
          id="part_select"
        />
        <input placeholder="Search" className="input" id="search_q" autoComplete="off" onChange={debounce(e => setSearchQuery(e.target.value), 300)} />
      </div>
      Word count: {wordCount}
      <div>
        {/* <label>
          <input className="checkbox mb-[-5px]" type="checkbox" checked={hideLearnedMode} onChange={e => {
            setHideLearnedMode(e.target.checked);
          }} /> Hide learned words</label> */}
      </div>
      <Table
        tableClass={css.table + " table"}
        height={800}
        header={Header}
        itemCount={wordCount}
        itemSize={76}
        itemData={filteredWords}
        width="100%"
        row={Row}
      />
    </>
  );
}
