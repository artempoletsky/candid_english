import { NextRequest, NextResponse } from "next/server";

import { rfs } from "lib/util";
import { OXFORD_BY_LEVEL } from "lib/paths";

export type UpdateWordsRequest = {
  added: string[],
  removed: string[],
  addedWordlists: string[],
  removedWordlists: string[],
};


export type UpdateWordsResponse = {
  added: string[],
  removed: string[],
  updateTimestamp: Number,
};

const DefaultRequest: UpdateWordsRequest = {
  added: [],
  removed: [],
  addedWordlists: [],
  removedWordlists: [],
}

let wordlists: {
  [key: string]: string[]
} = {};

function getWordlist(wordlistName: string): string[] {
  if (wordlists[wordlistName]) {
    return wordlists[wordlistName];
  }

  wordlists = rfs(OXFORD_BY_LEVEL);

  return wordlists[wordlistName] || [];
}

export async function POST(req: NextRequest) {

  const res: UpdateWordsResponse = { added: [], removed: [], updateTimestamp: Date.now() };


  const reqBody = await req.json();
  const request: UpdateWordsRequest = {
    ...DefaultRequest,
    ...reqBody
  };

  res.added = request.added.map(w => w.toLowerCase());
  res.removed = request.removed.map(w => w.toLowerCase());

  for (const wordlistName of request.addedWordlists) {
    const words = getWordlist(wordlistName);
    res.added = [...res.added, ...words];
  }

  for (const wordlistName of request.removedWordlists) {
    const words = getWordlist(wordlistName);
    res.removed = [...res.removed, ...words];
  }

  return NextResponse.json(res, {
    status: 200
  });
}