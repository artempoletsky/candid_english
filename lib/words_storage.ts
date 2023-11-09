'use client';

import { debounce } from "lodash";

let myWords: Record<string, boolean>;

function fromArray(array: string[]): Record<string, boolean> {
  myWords = {};
  return array.reduce((res, el: string) => {
    res[el] = true;
    return res;
  }, myWords);
}

export function getMyWords(): Record<string, boolean> {
  if (myWords) {
    return myWords;
  }
  let wordsArray: string[] = [];
  if (localStorage['my_words']) {
    try {
      wordsArray = JSON.parse(localStorage['my_words']);
    } catch (error) {
      console.log(error);
    }
  }
  return fromArray(wordsArray);
};

export function rewrite(array: string[], update_time: number = 0) {

  if (update_time) {
    const last_update = parseInt(localStorage['last_words_update']);
    if (update_time < last_update) {
      return;
    }
  }

  fromArray(array);
  localStorage['my_words'] = JSON.stringify(array);
  localStorage['last_words_update'] = Date.now().toString();
}


export const saveMyWords = debounce(() => {
  localStorage['my_words'] = JSON.stringify(Object.keys(myWords));
}, 100);


export function isWordLearned(word: string): boolean {
  return myWords[word.toLowerCase()] || false;
}
