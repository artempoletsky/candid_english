

const Overrides: Record<string, string> = require("../data/lemmatizer/lemma_overrides.json");
const Irregular: Record<string, string> = require("../data/lemmatizer/irregular_verbs.json");
let WordsDict: Record<string, number> = require("../data/lemmatizer/all_words.json");

export type LemmatizeResult = {
  sentence: string,
  lemma: string,
  count: number,
  word: string,
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

export function invalidateDict() {
  delete require.cache[Object.keys(require.cache).find(k => k.endsWith('all_words.json')) as string];
  WordsDict = require("../data/lemmatizer/all_words.json");
}

export function lemmatizeWord(word: string, dict: Record<string, any>, { searchWordInDict }: Record<string, boolean> = {
  searchWordInDict: true
}) {
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


  //bushe
  if (lemma.endsWith('she')) {
    return lemma.slice(0, -1);
  }

  //goe
  if (lemma.endsWith('oe')) {
    return lemma.slice(0, -1);
  }

  //worri -> worry
  //bodie -> body
  let t2Suffixes = ['ie', 'i'];
  for (const s of t2Suffixes) {
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

  if (dict[lemma]) {
    return lemma;
  }

  return word;
}

const suffixesToRemove = ["'m", "'ve", "'re", "'d", "n't", "'s", "'ll"];
export default function lemmatize(text: string): Record<string, LemmatizeResult> {
  let dict: Record<string, LemmatizeResult> = {};
  const sentences = text.split(/[.!?]/);

  for (const sentence of sentences) {

    if (sentence == "") {
      continue;
    }
    const words = sentence.split(/[\s\,\;\:\"\-]/).filter(word => {
      if (word.match(/[0-9]/g)) {
        return false;
      }
      if (word.match(/^[^ia]$/i)) {
        return false;
      }
      return true;
    }).map(initialWord => {
      let word = initialWord.toLowerCase();
      for (const suffix of suffixesToRemove) {
        if (word.endsWith(suffix)) {
          word = word.replace(suffix, '');
          break;
        }
      }

      let lemma;
      if (Overrides[word]) {
        lemma = Overrides[word];
      } else if (Irregular[word]) {
        lemma = Irregular[word];
      } else {
        lemma = lemmatizeWord(word, WordsDict);
      }

      return {
        word: initialWord,
        lemma,
        count: 1,
        sentence
      } as LemmatizeResult;
    }).filter(({ lemma }) => {
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