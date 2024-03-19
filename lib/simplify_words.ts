import words from 'an-array-of-english-words';
// import fs from 'fs';
// import lemmatize from "~/lib/wink_lemmatizer";
import { rfs, wfs } from './util';
import { LEMMATIZER_BLACKLIST, LEMMATIZER_WHITELIST, LEMMATIZER_ALL, LEMMATIZER_OVERRIDES } from '~/lib/paths';

import { lemmatizeWord, invalidateDict } from "~/lib/lemmatizer";


function toDict(arr: string[]): Record<string, number> {
  return arr.reduce((dict: Record<string, number>, word) => {
    dict[word] = 1;
    return dict;
  }, {});
};




export default function simplify(): Record<string, number> {
  // const noSuffixes = toDict(words.filter(w => {
  //   for (const s of suffixes) {
  //     if (w.endsWith(s)) {
  //       return false;
  //     }
  //   }
  //   return true;
  // }));

  const WhiteList: Record<string, number> = {
    ...rfs("/grab_data/words_dict.json"),
    ...toDict(rfs(LEMMATIZER_WHITELIST))
  };

  const BlackList: Record<string, number> = toDict(rfs(LEMMATIZER_BLACKLIST));

  const Overrides: Record<string, string> = rfs(LEMMATIZER_OVERRIDES);

  const fullDict = toDict(words);

  for (const word in WhiteList) {
    fullDict[word] = 1;
  }

  for (const word in fullDict) {
    if (BlackList[word] || Overrides[word]) {
      delete fullDict[word];
      continue;
    }

    if (WhiteList[word]) {
      continue;
    }

    const lemma = lemmatizeWord(word, fullDict, {
      searchWordInDict: false
    });

    if (word != lemma) {
      delete fullDict[word];
    }
  }

  for (const word in fullDict) {
    if (WhiteList[word + 'e']) {
      continue;
    }
    if (fullDict[word + 'e']) {
      delete fullDict[word + 'e'];
    }
  }
  wfs(LEMMATIZER_ALL, fullDict);

  invalidateDict();
  return fullDict;
};

// simplify();