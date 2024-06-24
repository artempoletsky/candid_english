import words from "an-array-of-english-words";
// import fs from "fs";
// import lemmatize from "~/lib/wink_lemmatizer";
import { rfs, wfs } from "./util";
import { LEMMATIZER_BLACKLIST, LEMMATIZER_WHITELIST, LEMMATIZER_ALL, LEMMATIZER_OVERRIDES } from "lib/paths";

import { lemmatizeWord, invalidateDict } from "lib/lemmatizer";


function toDict(arr: string[]): Record<string, number> {
  return arr.reduce((dict: Record<string, number>, word) => {
    dict[word] = 1;
    return dict;
  }, {});
};




export default function simplify(): Set<string> {
  // const noSuffixes = toDict(words.filter(w => {
  //   for (const s of suffixes) {
  //     if (w.endsWith(s)) {
  //       return false;
  //     }
  //   }
  //   return true;
  // }));

  const WhiteListArray: string[] = rfs(LEMMATIZER_WHITELIST);
  const WhiteList: Set<string> = new Set(WhiteListArray);

  // {
  //   ...rfs("/grab_data/words_dict.json"),
  //   ...toDict()
  // };

  const BlackList: Set<string> = new Set(rfs(LEMMATIZER_BLACKLIST));

  const Overrides: Record<string, string> = rfs(LEMMATIZER_OVERRIDES);

  const fullDict: Set<string> = new Set([...words, ...WhiteListArray]);

  
  for (const word of BlackList) {
    fullDict.delete(word);
  }

  // for (const word in Overrides) {
    // fullDict.delete(word);
  // }
  // for (const word in WhiteList) {
  //   fullDict.ad
  // }

  // const removedWords = new Set<string>();
  // for (const word in fullDict) {
   
    // if (WhiteList[word]) {
    //   continue;
    // }

    // const lemma = lemmatizeWord(word, fullDict, {
    //   searchWordInDict: false,
    //   cutPrefixes: {
    //     re: true,
    //     un: true,
    //   }
    // });

    // if (word != lemma) {
    //   // delete fullDict[word];
    //   removedWords.add(word);
    // }
  // }

  // for (const word of removedWords) {
  //   delete fullDict[word];
  // }


  wfs(LEMMATIZER_ALL, Array.from(fullDict));

  invalidateDict();
  return fullDict;
};

// simplify();