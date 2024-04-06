"use client";
import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useEffect, useState } from "react";
import { UserSelf } from "app/globals";
import { RPC, } from "@artempoletsky/easyrpc/client";
import type * as API from "./api/user/methods";
import { rpc } from "./rpc";
import type { RModifyUserWords } from "./api/words/methods_words";
// import { BreadcrumbsArray } from "./layout";

export class Store {
  static setUser: Dispatch<SetStateAction<UserSelf | null>>;
  static updateMyWords: (arg: RModifyUserWords) => Promise<Set<string>>;
  static rewriteMyWords: (arg: {
    updateTimestamp: number;
    myWords: Set<string>;
  }) => void;
}

export function useStore() {
  return useContext(StoreContext);
}

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

function createStore() {
  const [user, setUser] = useState<UserSelf | null>(null);
  const [myWords, setMyWords] = useState(new Set<string>());
  const [myWordsVersion, setMyWordsVersion] = useState(0);
  Store.setUser = setUser;
  Store.rewriteMyWords = ({ myWords, updateTimestamp }) => {
    localStorage["last_words_update"] = updateTimestamp;
    setMyWordsVersion(updateTimestamp);
    localStorage["my_words"] = JSON.stringify(Array.from(myWords));
    setMyWords(myWords);
  }
  Store.updateMyWords = ({ added, removed, updateTimestamp }) => {
    const newWords = new Set(myWords);
    for (const word of removed) newWords.delete(word);
    for (const word of added) newWords.add(word);
    Store.rewriteMyWords({ myWords: newWords, updateTimestamp });
    return Promise.resolve(newWords);
  }

  return { user, myWords, myWordsVersion };
}

const StoreContext = createContext<ReturnType<typeof createStore>>({
  user: null,
  myWords: new Set([]),
  myWordsVersion: 0,
});

export type ChildrenProps = {
  children?: ReactNode;
}

const getMyPage = rpc("user").method("getMyPage");

export default function StoreProvider({ children }: ChildrenProps) {
  const store = createStore();
  useEffect(() => {
    getMyPage().then(({ user }) => {
      Store.setUser(user);
      Store.rewriteMyWords({
        myWords: getWordsLS(),
        updateTimestamp: getWordsVersionLS(),
      })
    });
  }, []);
  return (<StoreContext.Provider value={store}>
    {children}
  </StoreContext.Provider>);
}