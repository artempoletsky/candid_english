"use client";

import { FixedSizeList as List } from "react-window";
import { useState, useEffect } from "react";
import { DictRange, userView } from "lib/language_levels";
import { rpc } from "app/rpc";
import { Store, useStore } from "app/StoreProvider";
import { fetchCatch } from "@artempoletsky/easyrpc/react";
import { WordlistsLevel } from "app/api/words/schemas_words";
import { Button, FileInput, TextInput } from "@mantine/core";
import { saveTextFile } from "lib/utils_client";

const {
  addWords, removeWords, addWordlists, removeWordlists
} = rpc("words").methods("addWords", "removeWords", "addWordlists", "removeWordlists");



export default function PageMyWords() {
  // initWordsLocalStorage();
  const { myWords } = useStore();

  const [newWord, setNewWord] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  function saveMyWordlist() {
    saveTextFile("my_wordlist.txt", Array.from(myWords).sort().join("\r\n"));
  }

  function clearMyWords() {
    removeWords({
      words: Array.from(myWords),
    }).then(Store.updateMyWords);
  }

  function updateViewWords(words: Record<string, boolean>): Promise<Record<string, boolean>> {
    // setMyWords(words);
    setUpdateTrigger(Math.random());

    return Promise.resolve(words);
  }

  const fc = fetchCatch(addWords)
    .then(arg => {
      Store.updateMyWords(arg);
      setNewWord("");
    });

  const addNewWord = fc.before(() => ({
    words: [newWord]
  })).action();

  const fcRemoveWord = fc.method(removeWords).before((word: string) => ({
    words: [word]
  }));

  const fcAddWordlist = fc.method(addWordlists).before((wordlist: WordlistsLevel) => ({
    wordlists: [wordlist]
  }));

  const fcRemoveWordlist = fc.method(removeWordlists).before((wordlist: WordlistsLevel) => ({
    wordlists: [wordlist]
  }));

  const wordsArr = Array.from(myWords).filter(w => {
    // if (searchQuery != "" && !e.word.match(new RegExp(`^${searchQuery}.*?$`, "i"))) return false;
    if (searchQuery == "") {
      return true;
    }
    return w.indexOf(searchQuery) != -1;
  }).sort((w1, w2) => {
    const s1 = w1.startsWith(searchQuery);
    const s2 = w2.startsWith(searchQuery);
    if (s1 == s2) //if both starts with search query sorts normally
      return w1 > w2 ? 1 : -1;

    //else the word witch starts with search query goes first
    return s1 < s2 ? 1 : -1;
  });
  const wordCount = wordsArr.length;

  const Row = ({ style, data, index }: any) => {
    const word = data[index];
    return (
      <div style={style}>
        <i className="small icon thumbs_down cursor-pointer mr-1" title="Remove" onClick={fcRemoveWord.action(word)}></i>
        <span>{word}</span>
      </div>
    )
  };

  return (
    <div>
      <div className="flex mb-3">
        <TextInput
          className="input grow mr-5"
          type="text" name="new_word"
          placeholder="Search" autoComplete="off"
          value={searchQuery} onChange={e => setSearchQuery(e.target.value.toLowerCase())}
        />
        <TextInput
          className="input grow mr-2"
          type="text" name="new_word"
          placeholder="Add new word" autoComplete="off"
          value={newWord} onChange={e => setNewWord(e.target.value)}
        />
        <Button className="btn" onClick={addNewWord}>Add</Button>
      </div>



      <div className="mb-3">
        <label htmlFor="filter_file">Import from file:</label>
        <FileInput value={uploadFile} className="file-input" id="filter_file" onChange={file => {
          setUploadFile(file);
          if (!file) return;
          const reader = new FileReader();
          reader.onload = function (e: ProgressEvent<FileReader>) {
            if (e.target) {
              const text: string = e.target.result + "";
              const words = text.split("\n")
                .map(line => line.split(/[\s;,]/)[0].toLowerCase())
                .filter((w: string) => w.match(/^\p{L}.*/u));

              addWords({ words })
                .then(Store.updateMyWords);
              // console.log(words);
              setUploadFile(null);
            }
          }
          reader.readAsText(file);
        }} />
        <Button className="btn" onClick={saveMyWordlist}>Export to file</Button>

        <Button className="btn" onClick={e => {
          const promptResult = prompt("Are you sure? Type \"DELETE\" to delete all words.");
          if (promptResult == "DELETE") {
            clearMyWords();
          }
        }}>Remove all words</Button>
      </div>

      <div className="mb-3">
        {DictRange.map(level => <div key={level} className="join join-vertical">
          <Button className="join-item grow" onClick={fcAddWordlist.action(level)}>Add {userView(level)}</Button>
          <Button className="join-item grow" onClick={fcRemoveWordlist.action(level)}>Remove {userView(level)}</Button>
        </div>
        )}
      </div>

      Word count: {wordCount}

      <List
        data-update={updateTrigger}
        height={800}
        itemCount={wordCount}
        itemSize={29}
        itemData={wordsArr}
        width="100%"
      >
        {Row}
      </List>
    </div >
  );
}
