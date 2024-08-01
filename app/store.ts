"use client";

import { createStore, useStoreUntyped, StoreDispatchers, addChangeListener } from "@artempoletsky/easystore";
import { UserSelf } from "./globals";
import { rpc } from "./rpc";
import { RModifyUserWords } from "./api/words/methods_words";

export type Store = {
  user: UserSelf | null;
  myWords: Set<string>;
  myWordsVersion: number;
};

const getMyPage = rpc("user").method("getMyPage");


function getWordsLS(): Set<string> {
  let arr: string[] = []

  if (localStorage["my_words"]) {
    try {
      arr = JSON.parse(localStorage["my_words"]);
    } catch (error) {
      console.log(error);
    }
  }
  return new Set(arr);
}

function getWordsVersionLS(): number {
  let result = 0;
  if (localStorage["last_words_update"]) {
    try {
      result = localStorage["my_words"] * 1;
    } catch (error) {
      console.log(error);
    }
  }
  return result;
}

export const Store = createStore<Store>({
  initialValues: {
    user: null,
    myWords: new Set(),
    myWordsVersion: 0,
  },
  useEffect() {
    StoreDispatchers.myWords(getWordsLS());
    StoreDispatchers.myWordsVersion(getWordsVersionLS());
    getMyPage().then(({ user }) => {
      Store.user = user;
    });
  }
});

export function useStore<KeyT extends keyof Store>(key: KeyT) {
  return useStoreUntyped<Store, KeyT>(key);
};

addChangeListener<Store, "myWords">("myWords", val => {
  localStorage["my_words"] = JSON.stringify(Array.from(val));
});

addChangeListener<Store, "myWordsVersion">("myWordsVersion", val => {
  localStorage["last_words_update"] = val;
});


export function updateMyWords({ added, removed, updateTimestamp }: RModifyUserWords) {
  const newWords = new Set(Store.myWords);
  for (const word of removed) newWords.delete(word);
  for (const word of added) newWords.add(word);
  Store.myWords = newWords;
  Store.myWordsVersion = updateTimestamp;
}