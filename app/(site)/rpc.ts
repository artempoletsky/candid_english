import { RPC } from "@artempoletsky/easyrpc/client";

import type { API as lemmatizer } from "./lemmatizer/api/route";
import type { API as exam } from "./test/api/route";
import type { API as fiveWords } from "./5words/api/route";
import type * as user from "./api/user/methods";
import type * as discussion from "./api/discussion/methods_discussion";
import type * as words from "./api/words/methods_words";


type SiteAPI = {
  lemmatizer: lemmatizer;
  exam: exam;
  fiveWords: fiveWords;
  discussion: typeof discussion;
  user: typeof user;
  words: typeof words;
};

const endPoints = {
  discussion: "/api/discussion",
  lemmatizer: "/lemmatizer/api",
  exam: "/test/api",
  user: "/api/user",
  fiveWords: "/5words/api",
  words: "/api/words",
};

export function rpc<T extends keyof SiteAPI>(name: T) {
  return RPC<SiteAPI[T]>(endPoints[name], {
  });
}