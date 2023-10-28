import { AtomizedWord } from "~/app/api/atomize_text/route";
import axios from "axios";
import { useState } from "react";
import css from "./adjust_dropdown.module.css";

const API_PATH = "/api/admin/adjust_lemmatizer";

function toList(word: string, listType: "black" | "white") {
  return axios.post(API_PATH, {
    method: "addToList",
    listType,
    word
  });
}

function override(word: string, lemma: string) {
  return axios.post(API_PATH, {
    method: "addOverride",
    lemma,
    word
  });
}

export default function ({ word, removeCall }: { word: AtomizedWord, removeCall: Function }) {
  const wordStr = word.word.toLowerCase();
  const id = word.id.toLowerCase();
  let [lemma, setLemma] = useState(wordStr);
  let [whiteListCandidate, setWhiteListCandidate] = useState(wordStr);
  let [blackListCandidate, setBlackListCandidate] = useState(id);
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
          <li> <input type="text" value={whiteListCandidate} onChange={(e) => setWhiteListCandidate(e.target.value)} /><button onClick={() => toList(wordStr, "white").then(onSuccess)}> to whitelist</button></li>
          <li> <input type="text" value={blackListCandidate} onChange={(e) => setBlackListCandidate(e.target.value)} /><button onClick={() => toList(id, "black").then(onSuccess)}> to blacklist</button></li>
        </ul>
      }
    </div>
  )
}