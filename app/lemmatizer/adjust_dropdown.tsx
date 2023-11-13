import { AtomizedWord } from "~/app/api/lemmatize_text/route";
import axios from "axios";
import { useState } from "react";
import { API_ADMIN_ADJUST_LEMMATIZER } from "~/lib/paths";

;

function toList(word: string, listType: "black" | "white") {
  return axios.post(API_ADMIN_ADJUST_LEMMATIZER, {
    method: "addToList",
    listType,
    word
  });
}

function override(word: string, lemma: string) {
  return axios.post(API_ADMIN_ADJUST_LEMMATIZER, {
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
    <details className="dropdown">
      <summary className="btn h-8" onClick={toggle}>...</summary>
      {dropDownVisible &&
        <ul className={" bg-slate-200 shadow dropdown-content p-2 rounded-xl border border-current z-[1] "}>
          <li>
            <button className="btn mr-2" onClick={() => override(wordStr, lemma).then(onSuccess)}>Override</button>
            {wordStr} with
            <input className="input" type="text" value={lemma} onChange={(e) => setLemma(e.target.value)} />
          </li>
          <li>
            <input className="input" type="text" value={whiteListCandidate} onChange={(e) => setWhiteListCandidate(e.target.value)} />
            <button className="btn" onClick={() => toList(whiteListCandidate, "white").then(onSuccess)}> to whitelist</button></li>
          <li>
            <input className="input" type="text" value={blackListCandidate} onChange={(e) => setBlackListCandidate(e.target.value)} />
            <button className="btn" onClick={() => toList(blackListCandidate, "black").then(onSuccess)}> to blacklist</button></li>
        </ul>
      }
    </details>
  )
}
