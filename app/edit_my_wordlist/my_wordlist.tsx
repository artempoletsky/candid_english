"use client";

import { FixedSizeList as List } from "react-window";
import { UpdateWordsResponse } from "~/app/api/update_known_words/route";
import { useState, useEffect } from "react";
import css from "../wordlist/wordlist.module.css";
import Link from "next/link"
import { getMyWords, saveMyWords } from "~/lib/words_storage";


export function updateWordlists(requestBody: any): Promise<Record<string, boolean>> {
  return fetch("/api/update_known_words", {
    method: "POST",
    headers: {
    },
    body: JSON.stringify(requestBody),
  })
    .then(res => res.json())
    .then(updateLocalStorage);
}

export function updateLocalStorage(response: UpdateWordsResponse): Promise<Record<string, boolean>> {
  const { added, removed, updateTimestamp } = response;
  const words: Record<string, boolean> = getMyWords();

  removed.forEach(w => {
    delete words[w];
  });

  // pull(words, ...removed);

  added.forEach(w => {
    words[w] = true;
  });
  saveMyWords();

  return Promise.resolve(words);
}

export function addWords(words: string[]): Promise<Record<string, boolean>> {
  return updateWordlists({
    added: words
  });
}

export function removeWords(words: string[]): Promise<Record<string, boolean>> {
  return updateWordlists({
    removed: words
  });
}

export function addWordlists(wordlists: string[]): Promise<Record<string, boolean>> {
  return updateWordlists({
    addedWordlists: wordlists
  });
}

export function removeWordlists(wordlists: string[]): Promise<Record<string, boolean>> {
  return updateWordlists({
    removedWordlists: wordlists
  });
}


export function clearMyWords(): Promise<Record<string, boolean>> {
  return updateWordlists({
    removed: Object.keys(getMyWords())
  });
}

export function saveTextFile(fileName: string, textData: string) {
  let blobData = new Blob([textData], { type: "text/plain" });
  let url = window.URL.createObjectURL(blobData);

  let a = document.createElement("a");
  a.setAttribute("style", "display: none");
  document.body.appendChild(a);
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
  a.remove();
}

export function saveMyWordlist() {
  saveTextFile("my_wordlist.txt", Object.keys(getMyWords()).sort().join("\r\n"));
}


export default function MyWordlist() {
  // initWordsLocalStorage();
  let [myWords, setMyWords] = useState<Record<string, boolean>>(getMyWords());
  let [newWord, setNewWord] = useState<string>("");
  let [searchQuery, setSearchQuery] = useState<string>("");
  let [updateTrigger, setUpdateTrigger] = useState(0);


  useEffect(() => {
    // update some client side state to say it is now safe to render the client-side only component
    // setMyWords(store.get("my_words"));
  }, []);

  function updateViewWords(words: Record<string, boolean>): Promise<Record<string, boolean>> {
    // setMyWords(words);
    setUpdateTrigger(Math.random());

    return Promise.resolve(words);
  }

  function addNewWord() {
    if (!newWord) {
      return;
    }

    addWords([newWord])
      .then(updateViewWords)
      .then(() => {
        setNewWord("");
      });
  }

  function removeWord(word: string) {
    updateWordlists({
      removed: [word]
    }).then(updateViewWords)
  }

  const wordsArr = Object.keys(myWords).filter(w => {
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
        <i className="small icon thumbs_down cursor-pointer mr-1" title="Remove" onClick={() => removeWord(word)}></i>
        <span>{word}</span>
      </div>
    )
  };

  return (
    <div>
      <div className="flex mb-3">
        <input
          className="input grow mr-5"
          type="text" name="new_word"
          placeholder="Search" autoComplete="off"
          value={searchQuery} onChange={e => setSearchQuery(e.target.value.toLowerCase())}
        />
        <input
          className="input grow mr-2"
          type="text" name="new_word"
          placeholder="Add new word" autoComplete="off"
          value={newWord} onChange={e => setNewWord(e.target.value)}
        />
        <button className="btn" onClick={addNewWord}>Add</button>
      </div>



      <div className="mb-3">
        <label htmlFor="filter_file">Import from file:</label>
        <input className="file-input" id="filter_file" type="file" onChange={e => {
          const input = e.target;
          const files = input.files;
          if (!files) return;
          const file = files[0];
          const reader = new FileReader();
          reader.onload = function (e: ProgressEvent<FileReader>) {
            if (e.target) {
              const text: string = e.target.result + "";
              const words = text.split("\n")
                .map(line => line.split(/[\s;,]/)[0].toLowerCase())
                .filter((w: string) => w.match(/^\p{L}.*/u));


              addWords(words)
                .then(updateViewWords)
              // console.log(words);
            }
            input.value = "";
          }
          reader.readAsText(file);
        }} />
        <button className="btn" onClick={saveMyWordlist}>Export to file</button>

        <button className="btn" onClick={e => {
          const promptResult = prompt("Are you sure? Type \"DELETE\" to delete all words.");
          if (promptResult == "DELETE") {
            clearMyWords().then(updateViewWords);
          }
        }}>Remove all words</button>
      </div>

      <div className="mb-3">
        <div className="join join-vertical">
          <button className="btn join-item grow" onClick={e => addWordlists(["a1"]).then(updateViewWords)}>Add A1</button>
          <button className="btn join-item grow" onClick={e => removeWordlists(["a1"]).then(updateViewWords)}>Remove A1</button>
        </div>

        <div className="join join-vertical">
          <button className="btn join-item grow" onClick={e => addWordlists(["a2"]).then(updateViewWords)}>Add A2</button>
          <button className="btn join-item grow" onClick={e => removeWordlists(["a2"]).then(updateViewWords)}>Remove A2</button>
        </div>

        <div className="join join-vertical">
          <button className="btn join-item grow" onClick={e => addWordlists(["b1"]).then(updateViewWords)}>Add B1</button>
          <button className="btn join-item grow" onClick={e => removeWordlists(["b1"]).then(updateViewWords)}>Remove B1</button>
        </div>

        <div className="join join-vertical">
          <button className="btn join-item grow" onClick={e => addWordlists(["b2"]).then(updateViewWords)}>Add B2</button>
          <button className="btn join-item grow" onClick={e => removeWordlists(["b2"]).then(updateViewWords)}>Remove B2</button>
        </div>

        <div className="join join-vertical">
          <button className="btn join-item grow" onClick={e => addWordlists(["c1"]).then(updateViewWords)}>Add C1</button>
          <button className="btn join-item grow" onClick={e => removeWordlists(["c1"]).then(updateViewWords)}>Remove C1</button>
        </div>
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
