import { AtomizedWord } from "../atomize_text/route";
import axios from "axios";
import { useState } from "react";
import css from "./adjust_dropdown.module.css";

function toList(word: string, listType: "black" | "white") {
  return axios.post('/admin/adjust_lemmatizer', {
    method: "addToList",
    listType,
    word
  });
}

function override(word: string, lemma: string) {
  return axios.post('/admin/adjust_lemmatizer', {
    method: "addOverride",
    lemma,
    word
  });
}

export default function ({ word, removeCall }: { word: AtomizedWord, removeCall: Function }) {
  const wordStr = word.word.toLowerCase();
  const id = word.id.toLowerCase();
  let [lemma, setLemma] = useState(wordStr);
  let [dropDownVisible, setDropdownVisible] = useState(false);

  function onSuccess() {
    setDropdownVisible(false);
    removeCall(word);
  }

  function toggle() {
    setDropdownVisible(!dropDownVisible);
  }

  return (
    <div className={css.container}>
      <button onClick={toggle}>...</button>
      {dropDownVisible &&
        <ul className={css.dropdown + " bg-slate-200 p-2 rounded-xl border border-current"}>
          <li>
            <button className="mr-2" onClick={() => override(wordStr, lemma).then(onSuccess)}>Override</button>
            {wordStr} with
            <input type="text" value={lemma} onChange={(e) => setLemma(e.target.value)} />
          </li>
          <li><button onClick={() => toList(wordStr, "white").then(onSuccess)}>{wordStr} to whitelist</button></li>
          <li><button onClick={() => toList(id, "black").then(onSuccess)}>{id} to blacklist</button></li>
        </ul>
      }
    </div>
  )
}