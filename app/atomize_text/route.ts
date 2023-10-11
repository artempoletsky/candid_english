import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { reject } from 'lodash';

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

const words_dict: { [key: string]: any } = JSON.parse(fs.readFileSync('./grab_data/words_dict.json', { encoding: 'utf8' }));

// console.log(words_dict);
const extraWordForms: { [key: string]: string } = {
  an: 'a',
  gotta: 'get',
  gonna: 'go',
  okay: 'ok',
  wanna: 'want',
  "'cause": 'because',
  kinda: 'kind',
  ca: 'can',
  wo: 'will',
  shoulda: 'should',
  "'em": "them",
}


// function cutNCheck(word: string, tail: string): string {
//   if (irregularVerbs[word]) {
//     return irregularVerbs[word];
//   }
//   const cut: string = word.replace(new RegExp(tail + '$'), '');
//   if (irregularVerbs[cut]) {
//     return irregularVerbs[cut];
//   }
//   if (words_dict[cut]) {
//     return cut;
//   }
//   return '';
// }

const nonReplaceableSuffixes = ["'d", "'ll", "'ve", "'re", "n't", "'s", "s'", "'m"];
// const tails = ['', 'd', 'ed', 'er', 'est', 'ing', 's'];


const lemmatizer = require('wink-lemmatizer');
export function lemmatize(word: string): string {
  if (word.match(/[0-9]/g)) {
    return '';
  }

  word = word.toLowerCase().replace(new RegExp(`(${nonReplaceableSuffixes.join(')|(')})$`), '');

  if (extraWordForms[word]) {
    return extraWordForms[word];
  }
  const noSymbols = word.replace(/[^\p{L}'\s]/gu, '');

  // if (words_dict[noSymbols]) {
  //   return noSymbols;
  // }

  const verb = lemmatizer.verb(noSymbols);
  if (verb != noSymbols) {
    return verb;
  }
  const noun = lemmatizer.noun(noSymbols);
  if (noun != noSymbols) {
    return noun;
  }
  const adjective = lemmatizer.adjective(noSymbols);
  if (adjective != noSymbols) {
    return adjective;
  }

  /*
  for (const tail of tails) {
    const cut = cutNCheck(noSymbols, tail);
    if (cut) {
      return cut;
    }
  }*/

  return noSymbols || '';
}


export function atomizeSRT(subs: Subtitle[]): AtomizedWord[] {
  const dict: { [key: string]: AtomizedWord } = {};

  for (const sub of subs) {
    const words: string[] = sub.text
      .trim()
      .split(/[\s-,!?.;]+/);

    for (const w of words) {
      const defaultForm = lemmatize(w);
      if (!defaultForm) {
        continue;
      }
      if (dict[defaultForm]) {
        dict[defaultForm].count++;
        continue;
      };
      dict[defaultForm] = {
        id: defaultForm,
        word: w,
        sentence: JSON.stringify({
          time: sub.time,
          text: sub.text,
        }),
        count: 1
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