

import _ from "lodash";



export type LemmatizeResult = {
  sentence: string,
  lemma: string,
  count: number,
  word: string,
  isInDictionary: boolean,
};

const DoubleConsonants = ['rr', 'tt', 'pp', 'dd', 'gg', 'kk', 'zz', 'cc', 'bb', 'nn', 'mm'];
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

import { rfs, createIfNotExists, arrToDict } from "./util";
import { LEMMATIZER_ALL, LEMMATIZER_IRREGULAR, LEMMATIZER_OVERRIDES, LEMMATIZER_WHITELIST, OXFORD_LIST_LIGHT } from "./paths";



createIfNotExists(LEMMATIZER_ALL, {});

let WordsDict: Set<string>;
let Overrides: Record<string, string>;
let Irregular: Record<string, string>;
let WhiteList: Set<string>;
const CWD = process.cwd();
export function invalidateDict() {
  // delete require.cache[Object.keys(require.cache).find(k => k.endsWith('all_words.json')) as string];
  WordsDict = new Set(rfs(LEMMATIZER_ALL));
  Overrides = rfs(LEMMATIZER_OVERRIDES);
  Irregular = rfs(LEMMATIZER_IRREGULAR);
  WhiteList = new Set([...rfs(LEMMATIZER_WHITELIST), ...rfs(OXFORD_LIST_LIGHT).map((w: any) => w.word)]);
}
invalidateDict();



export type LemmatizerOptionsInner = {
  cutPrefixes: {
    un: boolean;
    re: boolean;
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

  for (let s of DoubleConsonants) {
    //hopp -> hop
    if (lemma.endsWith(s)) {
      lemma = lemma.slice(0, -1);
      return lemma;
    }
  }

  if (WhiteList.has(lemma)) return lemma;

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
  if (dict.has(lemma + 'e')) {
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
    lemma = cutPrefix(word, dict, opts);
    if (WhiteList.has(lemma)) return lemma;
    if (lemma == word) break;
    word = lemma;
  }

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