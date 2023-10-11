'use client';

import { isWordLearned, initWordsLocalStorage, addWords } from '~/app/edit_my_wordlist/my_wordlist';
import axios from 'axios';

import { AtomizedWord } from '~/app/atomize_text/route';
import { useState, useEffect } from 'react';

import { pull } from "lodash";


function uploadFile(input: HTMLInputElement) {

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
  let [myWords, setMyWords] = useState<string[]>([]);
  useEffect(() => {
    setMyWords(initWordsLocalStorage());
  }, []);
  function formatSentence(s: string) {
    const json = JSON.parse(s);
    return (<span title={json.time}>{json.text}</span>)
  }

  let filteredWords = words.filter(({ id }) => !myWords.includes(id));
  function discardWord(w: AtomizedWord) {
    words = words.filter(word => word.id != w.id);
    setWords(words);
  }
  return (
    <div>
      <input id="subtitles_file" type="file" onChange={e => {
        const input = e.target;
        uploadFile(input).then((res: any) => {
          input.value = '';
          setWords(res.data.words);
        });
      }} />
      Words count: {filteredWords.length}
      <table>
        <tbody>
          {filteredWords.map(w => (
            <tr key={w.id}>
              <td className="whitespace-nowrap">
                <i onClick={e => addWords([w.id]).then(words => setMyWords(words))} title="Mark as learned" className="icon small thumbs_up cursor-pointer mr-2"></i>
                <i onClick={e => discardWord(w)} title="Discard" className="icon small thumbs_down m-0 cursor-pointer mr-2"></i>
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