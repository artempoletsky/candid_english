import { RPC } from "@artempoletsky/easyrpc/client";

import type { API as adminWordlist } from "./admin/wordlist/api/route";
import type { API as lemmatizer } from "./lemmatizer/api/route";
import type { API as exam } from "./test/api/route";
import type { API as fiveWords } from "./5words/api/route";
import type * as discussion from "./api/discussion/methods_discussion";
import type * as user from "./api/user/methods";


type SiteAPI = {
  adminWordlist: adminWordlist;
  lemmatizer: lemmatizer;
  exam: exam;
  fiveWords: fiveWords;
  discussion: typeof discussion;
  user: typeof user;
};

const endPoints = {
  adminWordlist: "/admin/wordlist/api",
  discussion: "/api/discussion",
  lemmatizer: "/lemmatizer/api",
  exam: "/test/api",
  user: "/api/user",
  fiveWords: "/5words/api/",
};

export function rpc<T extends keyof SiteAPI>(name: T) {
  return RPC<SiteAPI[T]>(endPoints[name]);
}