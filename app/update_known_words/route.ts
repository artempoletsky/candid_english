import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { Word } from "~/app/wordlist/wordlist";

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
  wordlists = JSON.parse(fs.readFileSync('./grab_data/words_level.json', { encoding: 'utf-8' }));

  return wordlists[wordlistName] || [];
}

export async function POST(req: NextRequest) {

  const res: UpdateWordsResponse = { added: [], removed: [], updateTimestamp: Date.now() };


  const reqBody = await req.json();
  const request: UpdateWordsRequest = {
    ...DefaultRequest,
    ...reqBody
  };

  res.added = request.added;
  res.removed = request.removed;

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