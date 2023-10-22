import words from 'an-array-of-english-words';
import fs from 'fs';
// import lemmatize from "~/lib/wink_lemmatizer";


const BlackList: Record<string, number> = toDict(require("../data/lemmatizer/blacklist.json"));
let WhiteList: Record<string, number> = require("../grab_data/words_dict.json");

WhiteList = {
  ...WhiteList,
  ...toDict(require("../data/lemmatizer/whitelist.json"))
}


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

  const fullDict = toDict(words);

  for (const word in fullDict) {
    if (BlackList[word]) {
      delete fullDict[word];
      continue;
    }
    if (WhiteList[word]) {
      continue;
    }
   
    const lemma = lemmatizeWord(word, fullDict, {
      searchWordInDict: false
    });
    if (word == 'fifth') debugger;
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

  fs.writeFileSync('./data/lemmatizer/all_words.json', JSON.stringify(fullDict));

  invalidateDict();
  return fullDict;
};

// simplify();