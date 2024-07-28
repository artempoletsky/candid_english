"use client";


import { AtomizedWord } from "../../api/lemmatize_text/route";
import { useState, useEffect, useRef } from "react";

import AdjustLemmatizerDropdown from "./AdjustLemmatizerDropdown";
import DictLink from "components/dictlink";
import { API_LEMMATIZE } from "lib/paths";
import { Checkbox, FileInput, Table } from "@mantine/core";
import { rpc } from "app/rpc";

import { fetchCatch } from "@artempoletsky/easyrpc/react";
import { useStore, updateMyWords } from "app/store";

type AtomizedWordResponse = {
  words: AtomizedWord[]
};

const addWords = rpc("words").method("addWords");

function uploadFile(file: File): Promise<AtomizedWordResponse> {

  var data = new FormData();
  data.append("file", file);
  // data.append("user", "hubot");

  return fetch(API_LEMMATIZE, {
    method: "POST",
    body: data,
  }).then(e => e.json());
}


export default function PageLemmatizer() {
  const [words, setWords] = useState<AtomizedWord[]>([]);
  const [myWords] = useStore("myWords");
  const fileInput = useRef<any>(null);
  const [filterKnownWords, setFilterKnownWords] = useState(true);
  const [uploadCompleted, setUploadCompleted] = useState(false);

  const fc = fetchCatch(addWords)
    .then(updateMyWords)
    .before((word: string) => ({ words: [word] }));

  function parseSentence(word: AtomizedWord) {
    const json = JSON.parse(word.sentence);
    let text = json.text.replace(word.word, `<b>${word.word}</b>`);
    return {
      time: json.time,
      text,
    }
  }

  function formatSentence(word: AtomizedWord) {
    const { time, text } = parseSentence(word);
    return (<span onClick={e => copySentenceToClipboard(e.currentTarget)} title={time} dangerouslySetInnerHTML={{ __html: text }}></span>);
  }

  function copySentenceToClipboard(el: HTMLElement) {
    // const json = JSON.parse(word.sentence);
    // let text = json.text.replace(word.word, `<b>${word.word}</b>`);
    navigator.clipboard.writeText(el.innerHTML);
  }

  const inDict: AtomizedWord[] = [];
  const notInDict: AtomizedWord[] = [];

  for (const lres of words) {
    if (filterKnownWords && myWords.has(lres.id)) continue;

    const arr = lres.isInDictionary ? inDict : notInDict;
    arr.push(lres);
  }

  // let filteredWords = words.filter(({ id }) => !myWords[id]);
  // console.log(filteredWords);

  function discardWord(w: AtomizedWord) {
    return function () {
      setWords(words.filter(word => word.id != w.id));
    }
  }



  function printTable(array: AtomizedWord[]) {

    return <>
      <div className="mt-4">Words count: {array.length}</div>
      <Table className="w-full mt-5" classNames={{
        tr: "border-stone-400"
      }}>
        <Table.Tbody>
          {array.map(w => (
            <Table.Tr key={w.id}>
              <Table.Td className="w-0 whitespace-nowrap">
                <i onClick={fc.action(w.id)} title="Mark as learned" className="icon small thumbs_up cursor-pointer mr-2"></i>
                <i onClick={discardWord(w)} title="Discard" className="icon small thumbs_down m-0 cursor-pointer mr-2"></i>
                <AdjustLemmatizerDropdown sentence={parseSentence(w).text} word={w} removeCall={discardWord} />
              </Table.Td>
              <Table.Td className="w-0">{w.count}</Table.Td>
              <Table.Td className="w-0" onClick={e => copySentenceToClipboard(e.currentTarget)} >
                {w.id}</Table.Td>
              <Table.Td>{formatSentence(w)}</Table.Td>
              <Table.Td className="w-0 whitespace-nowrap">
                <DictLink className="mr-1" word={w} service="google" />
                <DictLink className="mr-1" word={w} service="oxford" />
                <DictLink className="mr-1" word={w} service="reverso" />
                <DictLink word={w} service="urban" />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </>

  }

  let [fileToUpload, setFileToUpload] = useState<File | null>(null);

  return (
    <div>
      <h1 className="h1">Text lemmatizer</h1>
      {/* <FileInput /> */}
      <FileInput placeholder="Upload srt file" value={fileToUpload} id="subtitles_file" className="file-input w-full max-w-xs mr-2 mb-3" onChange={file => {
        setFileToUpload(file);
        // const input = e.target;
        if (!file) return;

        uploadFile(file).then((res) => {
          setFileToUpload(null);

          if (!res || !res.words) {
            return;
          }
          setWords(res.words);
          setUploadCompleted(true);
        });
      }} />

      {uploadCompleted ? <>
        <div className="mt-3">
          <Checkbox checked={filterKnownWords} onChange={e => setFilterKnownWords(e.target.checked)} label="Filter known words" />
        </div>
        {printTable(inDict)}

        {notInDict.length != 0 && <>
          <h3>Probably not English words:</h3>
          {printTable(notInDict)}
        </>}
      </> : <>
        <p>Upload text here, and we will disassemble it to a list of words that you can learn.</p>
        <p>Only .srt files are suppoted for now.</p>
        <p>You can download subtitles for your favorite movies and TV shows here: <a target="_blank" href="https://www.opensubtitles.org/en/search/sublanguageid-eng">www.opensubtitles.org</a></p>
      </>}
    </div>
  );
}