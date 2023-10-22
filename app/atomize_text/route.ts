import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { reject } from 'lodash';
import lemmatize from "~/lib/lemmatizer";

export type Subtitle = {
  id: number;
  text: string;
  time: string
}

export type AtomizedWord = {
  word: string,
  id: string,
  sentence: string,
  count: number
}


export function parseSRT(text: string): Subtitle[] {
  const subsRaw = text.split("\r\n");
  const subs: Subtitle[] = [];
  let i = -1;

  for (let rowID = 0; rowID < subsRaw.length; rowID++) {
    const row = subsRaw[rowID];
    let id: number = parseInt(row);
    let currentSub: Subtitle = subs[i];

    if (!Number.isNaN(id)) {
      currentSub = {
        id,
        text: '',
        time: subsRaw[rowID + 1] || ''
      };
      subs.push(currentSub);
      i++;
      rowID++;
    } else if (currentSub) {
      currentSub.text += row.replace(/<\/?[^>]+(>|$)/g, "") + '\n';
    }
  }
  subs.map(s => {
    s.text = s.text.trim();
  });
  return subs;
}


export function atomizeSRT(subs: Subtitle[]): AtomizedWord[] {
  const dict: { [key: string]: AtomizedWord } = {};

  for (const sub of subs) {
    const subLemmas = lemmatize(sub.text);
    for (const lemma in subLemmas) {
      const count = subLemmas[lemma].count;
      if (dict[lemma]) {
        dict[lemma].count += count;
        continue;
      }
      
      dict[lemma] = {
        id: lemma,
        word: subLemmas[lemma].word,
        count,
        sentence: JSON.stringify({
          time: sub.time,
          text: sub.text
        })
      };

    }
  }

  return Object.values(dict).sort((e1, e2) => e2.count - e1.count);
}


// console.log(newWordsArr);
export async function POST(req: NextRequest) {
  // const reqBody = await req.json();
  let formData = await req.formData();
  let file: File = formData.get('file') as File;
  if (!file) {
    return NextResponse.json({}, {
      status: 400
    });
  }

  const text = await file.text()
  const subs = parseSRT(text);
  const words = atomizeSRT(subs);



  const res = { words };
  return NextResponse.json(res, {
    status: 200
  });
}