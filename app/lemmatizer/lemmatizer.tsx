'use client';

import { getMyWords } from '~/lib/words_storage';
import axios from 'axios';

import { AtomizedWord } from '~/app/api/lemmatize_text/route';
import { useState, useEffect } from 'react';
import { addWords } from "~/app/edit_my_wordlist/my_wordlist";

import AdjustDropdown from "./adjust_dropdown";
import DictLink from "@/dictlink";
import { API_LEMMATIZE } from '~/lib/paths';

type AtomizedWordResponse = {
  data: {
    words: AtomizedWord[]
  }
};

function uploadFile(input: HTMLInputElement): Promise<AtomizedWordResponse> {

  if (!input || !input.files || !input.files[0]) {
    return Promise.reject();
  }

  var data = new FormData();
  data.append('file', input.files[0]);
  // data.append('user', 'hubot');

  const promise = axios.post(API_LEMMATIZE, data);

  return promise;
}


export default function LemmatizerComponent() {
  let [words, setWords] = useState<AtomizedWord[]>([]);
  let [myWords, setMyWords] = useState<Record<string, boolean>>({});
  useEffect(() => {
    setMyWords({ ...getMyWords() });
  }, []);


  function formatSentence(word: AtomizedWord) {
    const json = JSON.parse(word.sentence);
    let text = json.text.replace(word.word, `<b>${word.word}</b>`);
    return (<span title={json.time} dangerouslySetInnerHTML={{ __html: text }}></span>);
  }

  function copySentenceToClipboard(el: HTMLElement) {
    // const json = JSON.parse(word.sentence);
    // let text = json.text.replace(word.word, `<b>${word.word}</b>`);
    navigator.clipboard.writeText(el.innerHTML);
  }

  const inDict: AtomizedWord[] = [];
  const notInDict: AtomizedWord[] = [];

  for (const lres of words) {
    if (myWords[lres.id]) continue;

    const arr = lres.isInDictionary ? inDict : notInDict;
    arr.push(lres);
  }

  // let filteredWords = words.filter(({ id }) => !myWords[id]);
  // console.log(filteredWords);

  function discardWord(w: AtomizedWord) {
    words = words.filter(word => word.id != w.id);
    setWords(words);
  }


  function printTable(array: AtomizedWord[]) {
    return <>
      <div className="mt-4">Words count: {array.length}</div>
      <table className="w-full mt-5 table">
        <tbody>
          {array.map(w => (
            <tr key={w.id}>
              <td className="w-0 whitespace-nowrap">
                <i onClick={e => addWords([w.id]).then(words => setMyWords({ ...words }))} title="Mark as learned" className="icon small thumbs_up cursor-pointer mr-2"></i>
                <i onClick={e => discardWord(w)} title="Discard" className="icon small thumbs_down m-0 cursor-pointer mr-2"></i>
                <AdjustDropdown word={w} removeCall={discardWord}></AdjustDropdown>
              </td>
              <td className="w-0">{w.count}</td>
              <td className="w-0" onClick={e => copySentenceToClipboard(e.target as HTMLElement)} >
                {w.id}</td>
              <td onClick={e => copySentenceToClipboard(e.target as HTMLElement)} >{formatSentence(w)}</td>
              <td className="w-0 whitespace-nowrap">
                <DictLink className="mr-1" word={w} service="google" />
                <DictLink className="mr-1" word={w} service="oxford" />
                <DictLink className="mr-1" word={w} service="reverso" />
                <DictLink word={w} service="urban" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>

  }
  return (
    <div>
      <input id="subtitles_file" className="file-input w-full max-w-xs mr-2" type="file" onChange={e => {
        const input = e.target;

        uploadFile(input).then((res: AtomizedWordResponse) => {
          input.value = '';
          if (!res || !res.data) {
            return;
          }
          setWords(res.data.words);
        });
      }} />
      {printTable(inDict)}

      {notInDict.length != 0 && <>
        <h3>Probably not English words:</h3>
        {printTable(notInDict)}
      </>}

    </div>
  );
}