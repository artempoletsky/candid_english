

import _ from "lodash";
import fs from "fs";


export type LemmatizeResult = {
  sentence: string,
  lemma: string,
  count: number,
  word: string,
  isInDictionary: boolean,
};

const DoubleConsonants = ['rr', 'tt', 'pp', 'dd', 'gg', 'kk', 'zz', 'cc', 'bb', 'nn', 'mm', 'vv'];
const Suffixes = {
  "ing": "",
  "in'": "",
  "er": "",
  "est": "",
  "ed": "",
  "s": "",
  "s'": "",
  "th": "",
  "ly": "",
};


import WordsDictRaw from "./all_words.json";
import OverridesRaw from "./lemma_overrides.json";
import IrregularRaw from "./irregular_verbs.json";
import WhiteListRaw from "./whitelist.json";
import BlackListRaw from "./blacklist.json";
import OxfordRaw from "./words_light.json";

let WordsDict: Set<string> = new Set(WordsDictRaw);
let Overrides: Record<string, string> = OverridesRaw;
let Irregular: Record<string, string> = IrregularRaw;
let WhiteList: Set<string> = new Set([...WhiteListRaw, ...OxfordRaw.map((w: any) => w.word)]);
let BlackList: Set<string> = new Set(BlackListRaw);

export function saveDefaults() {
  blacklist(BlackList);
  whitelist(WhiteList);
  fs.writeFileSync("./all_words.json", JSON.stringify(Array.from(WordsDict)));
  fs.writeFileSync("./lemma_overrides.json", JSON.stringify(Overrides, undefined, 2));
  fs.writeFileSync("./whitelist.json", JSON.stringify(Array.from(WhiteList), undefined, 2));
  fs.writeFileSync("./blacklist.json", JSON.stringify(Array.from(BlackList), undefined, 2));
}



function getWordsCollection(arg: string | Set<string> | string[]): Set<string> | string[] {
  if (typeof arg == "string") {
    return [arg];
  }
  return arg;
}

function blacklist(word: string): void
function blacklist(words: Set<string> | string[]): void
function blacklist(arg: string | Set<string> | string[]): void {
  const words = getWordsCollection(arg);
  for (const word of words) {
    BlackList.add(word);
    WordsDict.delete(word);
    WhiteList.delete(word);
  }
}

function whitelist(word: string): void
function whitelist(words: Set<string> | string[]): void
function whitelist(arg: string | Set<string> | string[]): void {
  const words = getWordsCollection(arg);
  for (const word of words) {
    BlackList.delete(word);
    WordsDict.add(word);
    WhiteList.add(word);
  }
}

function override(word: string, lemma: string): void
function override(dict: Record<string, string>): void
function override(arg1: Record<string, string> | string, arg2?: string): void {
  let dict = typeof arg1 == "string" ? { [arg1]: arg2! } : arg1;
  Object.assign(Overrides, dict);
}

export { blacklist, whitelist, override, WordsDict };

export type LemmatizerOptionsInner = {
  cutPrefixes: {
    un: boolean;
    re: boolean;
    out: boolean;
  },
};

export type LemmatizerOptions = {
  searchWordInDict?: boolean;
  cutPrefixes?: {
    un?: boolean;
    re?: boolean;
  },
};

const LemmatizeWordOptionsDefault: LemmatizerOptionsInner = {
  cutPrefixes: {
    un: true,
    re: true,
    out: true,
  },
};


export function cutSuffix(word: string, dict: Set<string>, options: LemmatizerOptionsInner): string {
  let lemma = word, suffix = "";

  let ss = ['ss', 'll'];
  for (const s of ss) {
    if (lemma.endsWith(s)) {
      return lemma;
    }
  }

  for (let s in Suffixes) {
    if (word.endsWith(s)) {
      suffix = s;
      lemma = word.slice(0, -suffix.length);
      break;
    }
  }

  if (suffix == "") {
    return word;
  }

  if (WhiteList.has(lemma)) return lemma;

  //humbly -> humble
  if (suffix == "ly") {
    if (dict.has(lemma + "le")) {
      return lemma + "le";
    }
  }

  for (let s of DoubleConsonants) {
    //hopp -> hop
    if (lemma.endsWith(s)) {
      lemma = lemma.slice(0, -1);
      return lemma;
    }
  }


  if (suffix == "s'") {
    suffix = "s";
  } else if (suffix == "in'") {
    suffix = "ing";
  }

  //jinxes boxes
  //misses tosses
  if ((suffix == "s") && (lemma.endsWith('xe') || lemma.endsWith('sse'))) {
    return lemma.slice(0, -1);
  }

  //promises
  //biases
  if ((suffix == "s") && lemma.endsWith('se')) {
    if (dict.has(lemma)) {
      return lemma;
    }
    return lemma.slice(0, -1);
  }



  //fif ->five
  if (suffix == "th" && lemma.endsWith('f')) {
    return lemma.slice(0, -1) + 've';
  }

  //goe
  //toche
  //bushe
  ss = ["she", "che", "oe"];
  for (const s of ss) {
    if (lemma.endsWith(s)) {
      return lemma.slice(0, -1);
    }
  }

  //worri -> worry
  //bodie -> body
  ss = ['ie', 'i'];
  for (const s of ss) {
    if (lemma.endsWith(s)) {
      let l = lemma.slice(0, -s.length);
      if (dict.has(l + 'y')) {
        return l + 'y';
      }
    }
  }

  //ly -> lie
  //dy -> die
  if (lemma.endsWith("y")) {
    let l = lemma.slice(0, -1);
    if (dict.has(l + 'ie')) {
      return l + 'ie';
    }
  }

  //hop -> hope
  if (dict.has(lemma + 'e') && (suffix == "ed" || suffix == "er" || suffix == "ing" || suffix == "est")) {
    return lemma + 'e';
  }

  if (lemma.endsWith("ve")) {
    //serve
    if (dict.has(lemma)) {
      return lemma;
    }
    //wolve
    let l = lemma.slice(0, -2);
    if (dict.has(l + 'f')) {
      return l + 'f';
    }
  }

  if (dict.has(lemma)) {
    return lemma;
  }

  return word;
}


export function cutPrefix(word: string, dict: Set<string>, options: LemmatizerOptionsInner): string {
  const cutPrefixes: Record<string, boolean> = options.cutPrefixes;

  for (const key in cutPrefixes) {
    if (cutPrefixes[key] && word.startsWith(key)) {
      const lemma = word.slice(key.length);
      if (dict.has(lemma)) {
        return lemma;
      }
    }
  }

  return word;
}


export function lemmatizeWord(word: string, dict?: Set<string>, options?: LemmatizerOptions) {
  if (!dict) dict = WordsDict;
  const opts: LemmatizerOptionsInner = _.merge({}, LemmatizeWordOptionsDefault, options);
  if (WhiteList.has(word)) {
    return word;
  }


  let lemma = "";

  while (true) {
    lemma = cutSuffix(word, dict, opts);
    if (WhiteList.has(lemma)) return lemma;
    if (lemma == word) break;
    word = lemma;
  }

  while (true) {
    lemma = cutPrefix(word, dict, opts);
    if (WhiteList.has(lemma)) return lemma;
    if (lemma == word) break;
    word = lemma;
  }

  // unpunished
  while (true) {
    lemma = cutSuffix(word, dict, opts);
    if (WhiteList.has(lemma)) return lemma;
    if (lemma == word) break;
    word = lemma;
  }

  return lemma;
}

const suffixesToRemove = ["'m", "'ve", "'re", "'d", "n't", "'s", "'ll"];
export default function lemmatize(text: string, options?: LemmatizerOptions): Record<string, LemmatizeResult> {


  // {
  //   // ...rfs("/grab_data/words_dict.json"),
  //   ...arrToDict(rfs(LEMMATIZER_WHITELIST))
  // };




  let dict: Record<string, LemmatizeResult> = {};
  const sentences = text.split(/[.!?—]/);

  for (const sentence of sentences) {

    if (sentence == "") {
      continue;
    }
    const words = sentence.split(/[\s\,\;\:\"\-\(\)\[\]]/).filter(word => {
      if (word.match(/[0-9]/g)) {
        return false;
      }
      return true;
    }).map(word => {
      let lemma = word.toLowerCase();
      for (const suffix of suffixesToRemove) {
        if (lemma.endsWith(suffix)) {
          lemma = lemma.slice(0, -suffix.length);
          break;
        }
      }

      if (Overrides[lemma]) {
        lemma = Overrides[lemma];
      } else if (Irregular[lemma]) {
        lemma = Irregular[lemma];
      } else {
        lemma = lemmatizeWord(lemma, WordsDict);
      }

      return {
        word,
        lemma,
        count: 1,
        sentence,
        isInDictionary: WordsDict.has(lemma),
      } as LemmatizeResult;
    }).filter(({ lemma }) => {
      lemma = lemma.replace(/[']/, '');
      return lemma.length > 1 || lemma == 'i' || lemma == 'a';
    });
    dict = words.reduce((d, lr) => {
      if (d[lr.lemma]) {
        d[lr.lemma].count++;
        return d;
      }
      d[lr.lemma] = lr;
      return d;
    }, dict);
  }
  return dict;
};

