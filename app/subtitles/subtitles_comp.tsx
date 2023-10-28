'use client';

import { WordsDict, getMyWords } from '~/lib/words_storage';
import axios from 'axios';

import { AtomizedWord } from '~/app/atomize_text/route';
import { useState, useEffect } from 'react';
import { addWords } from "~/app/edit_my_wordlist/my_wordlist";

import { pull } from "lodash";
import AdjustDropdown from "./adjust_dropdown";

type AtomizedWordResponse = {
  data: {
    words: AtomizedWord[]
  }
};

function uploadFile(input: HTMLInputElement):Promise<AtomizedWordResponse> {

  if (!input || !input.files || !input.files[0]) {
    return new Promise((resolve, reject) => { reject() });
  }

  var data = new FormData();
  data.append('file', input.files[0]);
  // data.append('user', 'hubot');

  const promise = axios.post('/atomize_text', data);

  return promise;
}


export default function SubtitlesComp() {
  let [words, setWords] = useState<AtomizedWord[]>([]);
  let [myWords, setMyWords] = useState<WordsDict>({});
  useEffect(() => {
    setMyWords({ ...getMyWords() });
  }, []);
  function formatSentence(s: string) {
    const json = JSON.parse(s);
    return (<span title={json.time}>{json.text}</span>)
  }

  let filteredWords = words.filter(({ id }) => !myWords[id]);
  // console.log(filteredWords);

  function discardWord(w: AtomizedWord) {
    words = words.filter(word => word.id != w.id);
    setWords(words);
  }
  return (
    <div>
      <input id="subtitles_file" type="file" onChange={e => {
        const input = e.target;

        uploadFile(input).then((res: AtomizedWordResponse) => {
          input.value = '';
          if (!res || !res.data) {
            return;
          }
          setWords(res.data.words);
        });
      }} />
      Words count: {filteredWords.length}
      <table>
        <tbody>
          {filteredWords.map(w => (
            <tr key={w.id}>
              <td className="whitespace-nowrap">
                <i onClick={e => addWords([w.id]).then(words => setMyWords({ ...words }))} title="Mark as learned" className="icon small thumbs_up cursor-pointer mr-2"></i>
                <i onClick={e => discardWord(w)} title="Discard" className="icon small thumbs_down m-0 cursor-pointer mr-2"></i>
                <AdjustDropdown word={w} removeCall={discardWord}></AdjustDropdown>
              </td>
              <td>{w.count}</td>
              <td>{w.id}</td>
              <td onClick={e => console.log(w)} >{formatSentence(w.sentence)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}