
import { NextRequest, NextResponse } from "next/server";
import simplify from "~/lib/simplify_words";
import { rfs, wfs } from "~/lib/util";
import { LEMMATIZER_BLACKLIST, LEMMATIZER_WHITELIST, LEMMATIZER_OVERRIDES } from "~/lib/paths";
import validate, { APIObject, ValidationRecord, validateUnionFabric } from "~/lib/api";

const CWD = process.cwd();

type TAddOverride = {
  word: string,
  lemma: string
}

const VAddOverride: ValidationRecord = {
  word: "string",
  lemma: "string",
}

const OKResponse = {
  message: "OK"
};

export async function addOverride({
  word,
  lemma
}: Record<string, string>) {
  const overrides: Record<string, string> = rfs(LEMMATIZER_OVERRIDES);
  overrides[word.toLowerCase()] = lemma.toLowerCase();
  wfs(LEMMATIZER_OVERRIDES, overrides, {
    pretty: true
  });

  return OKResponse;
};

const LIST_TYPES = ["black", "white"] as const;

type TAddToList = {
  word: string,
  listType: typeof LIST_TYPES[number]
}

const VAddToList: ValidationRecord = {
  word: "string",
  listType: validateUnionFabric(LIST_TYPES),
}

export async function addToList({ word, listType }: TAddToList) {
  const filename = listType == "white" ? LEMMATIZER_WHITELIST : LEMMATIZER_BLACKLIST;

  const list: string[] = rfs(filename);
  word = word.toLowerCase();

  if (list.includes(word)) return;
  list.push(word);
  wfs(filename, list, {
    pretty: true
  });

  return OKResponse;
};


export async function POST(req: NextRequest) {
  // const reqBody = await req.json();
  let { method, ...args } = await req.json();

  let [a, b] = await validate(
    {
      method,
      args
    },
    {
      addToList: VAddToList,
      addOverride: VAddOverride,
    },
    {
      addOverride,
      addToList
    }
  );

  simplify();
  return NextResponse.json(a, b);
}