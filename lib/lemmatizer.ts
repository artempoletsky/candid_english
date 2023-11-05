





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
};

import { wfs, rfs, createIfNotExists } from "./util";
import { LemmatizerWordlist, LemmatizerIrregular, LemmatizerOverrides } from "./paths";
createIfNotExists(LemmatizerWordlist, {});

let WordsDict: Record<string, number>;
let Overrides: Record<string, string>;
let Irregular: Record<string, string>;
const CWD = process.cwd();
export function invalidateDict() {
  // delete require.cache[Object.keys(require.cache).find(k => k.endsWith('all_words.json')) as string];
  WordsDict = rfs(LemmatizerWordlist);
  Overrides = rfs(LemmatizerOverrides);
  Irregular = rfs(LemmatizerIrregular);
}
invalidateDict();

type LemmatizeWordOptions = {
  searchWordInDict: boolean
};
const LemmatizeWordOptionsDefault: LemmatizeWordOptions = {
  searchWordInDict: true
};
export function lemmatizeWord(word: string, dict: Record<string, any>, options?: LemmatizeWordOptions) {
  options = options ? { ...LemmatizeWordOptionsDefault, ...options } : LemmatizeWordOptionsDefault;

  const { searchWordInDict } = options;

  let lemma = word, suffix = "";

  if (searchWordInDict && dict[word]) {
    return word;
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

  //jinxes boxes
  //misses tosses
  if ((suffix == "s" || suffix == "s'") && (lemma.endsWith('xe') || lemma.endsWith('sse'))) {
    return lemma.slice(0, -1);
  }


  for (let s of DoubleConsonants) {
    //hopp -> hop
    if (lemma.endsWith(s)) {
      lemma = lemma.slice(0, -1);
      return lemma;
    }
  }

  //fif ->five
  if (suffix == "th" && lemma.endsWith('f')) {
    return lemma.slice(0, -1) + 've';
  }

  //goe
  //toche
  //bushe
  let ss = ["she", "che", "oe"];
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
      if (dict[l + 'y']) {
        return l + 'y';
      }
    }
  }

  //hop -> hope
  if (dict[lemma + 'e']) {
    return lemma + 'e';
  }

  if (lemma.endsWith("ve")) {
    //serve
    if (dict[lemma]) {
      return lemma;
    }
    //wolve
    let l = lemma.slice(0, -2);
    if (dict[l + 'f']) {
      return l + 'f';
    }
  }

  if (dict[lemma]) {
    return lemma;
  }

  return word;
}

const suffixesToRemove = ["'m", "'ve", "'re", "'d", "n't", "'s", "'ll"];
export default function lemmatize(text: string): Record<string, LemmatizeResult> {
  let dict: Record<string, LemmatizeResult> = {};
  const sentences = text.split(/[.!?]/);
  const isLemmaInDict: Record<string, boolean> = {};

  for (const sentence of sentences) {

    if (sentence == "") {
      continue;
    }
    const words = sentence.split(/[\s\,\;\:\"\-]/).filter(word => {
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
        isInDictionary: !!WordsDict[lemma],
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