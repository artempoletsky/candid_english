import { AtomizedWord } from "~/app/api/lemmatize_text/route";
import { useState } from "react";
import { API_ADMIN_ADJUST_LEMMATIZER } from "~/lib/paths";
import { ActionIcon, Button, Menu, TextInput } from "@mantine/core";

import { getAPIMethod } from '@artempoletsky/easyrpc/client';
import { FProposeAdjustment } from "./api/route";

const isAdmin = false;
const proposeAdjustment = getAPIMethod<FProposeAdjustment>("/lemmatizer/api/", "proposeAdjustment");

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

type Props = {
  word: AtomizedWord;
  removeCall: Function;
  sentence: string;
}

export default function AdjustLemmatizerDropdown({ word, removeCall, sentence }: Props) {
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

  function propose(proposition: string) {
    // console.log(word);

    proposeAdjustment({
      proposition,
      sentence: sentence,
      word: word.word,
      oldLemma: word.id,
    }).then(onSuccess);
  }

  function proposeOverride() {
    propose((document.getElementById("proposion_input") as HTMLInputElement).value);
  }


  return (
    <Menu shadow="sm" classNames={{
      dropdown: "bg-stone-100 border border-stone-300"
    }}>
      <Menu.Target>
        <ActionIcon>
          ...
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {isAdmin
          ? <ul className="p-3">

            <li className="flex gap-3 items-center">
              <Button onClick={() => override(wordStr, lemma).then(onSuccess)}>Override</Button>
              <span>{wordStr} with</span>
              <TextInput value={lemma} onChange={(e) => setLemma(e.target.value)} />
            </li>
            <li className="flex gap-3">
              <TextInput value={whiteListCandidate} onChange={(e) => setWhiteListCandidate(e.target.value)} />
              <Button onClick={() => toList(whiteListCandidate, "white").then(onSuccess)}> to whitelist</Button></li>
            <li className="flex gap-3">
              <TextInput value={blackListCandidate} onChange={(e) => setBlackListCandidate(e.target.value)} />
              <Button onClick={() => toList(blackListCandidate, "black").then(onSuccess)}> to blacklist</Button></li>
          </ul>
          : <ul className="p-3">
            <li className="flex gap-3 items-center">
              <span>{wordStr} is a form of</span>
              <TextInput placeholder="propose a word" defaultValue={wordStr} id="proposion_input" />
              <Button onClick={proposeOverride}>OK</Button>
            </li>
            <li className="flex gap-3">
              <Button onClick={() => propose("")}>{wordStr} is not an English word</Button></li>
          </ul>}

      </Menu.Dropdown>
    </Menu>
  )
}
