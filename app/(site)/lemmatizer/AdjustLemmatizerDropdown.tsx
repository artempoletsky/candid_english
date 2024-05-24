import { AtomizedWord } from "app/api/lemmatize_text/route";
import { useState } from "react";

import { ActionIcon, Button, Menu, TextInput } from "@mantine/core";

import { rpc } from "app/rpc";

const isAdmin = false;
const { proposeAdjustment } = rpc("lemmatizer").methods("proposeAdjustment");


type Props = {
  word: AtomizedWord;
  removeCall: Function;
  sentence: string;
}

export default function AdjustLemmatizerDropdown({ word, removeCall, sentence }: Props) {
  const wordStr = word.word.toLowerCase();
  const id = word.id.toLowerCase();
  
  const [dropDownVisible, setDropdownVisible] = useState(false);

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
    <Menu opened={dropDownVisible} onChange={setDropdownVisible} shadow="sm" classNames={{
      dropdown: "bg-stone-100 border border-stone-300"
    }}>
      <Menu.Target>
        <ActionIcon>
          ...
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>

        <ul className="p-3">
          <li className="flex gap-3 items-center">
            <span>{wordStr} is a form of</span>
            <TextInput placeholder="propose a word" defaultValue={wordStr} id="proposion_input" />
            <Button onClick={proposeOverride}>OK</Button>
          </li>
          <li className="flex gap-3">
            <Button onClick={() => propose("")}>{wordStr} is not an English word</Button></li>
        </ul>

      </Menu.Dropdown>
    </Menu>
  )
}
