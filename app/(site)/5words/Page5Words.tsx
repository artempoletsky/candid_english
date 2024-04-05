"use client";
import DictLink from "components/dictlink";

import { fetchCatch } from "@artempoletsky/easyrpc/react";
import { useEffect, useState } from "react";
import { Button } from "@mantine/core";
import { rpc } from "app/rpc";

export const AvailableLevels = ["a1", "a2", "b1", "b2", "c1", "all"] as const;
type TAvaliableLevels = typeof AvailableLevels[number];
const getFiveWords = rpc("fiveWords").method("getFiveWords");

type Props = {
  words: string[];
}
export default function Page5Words({ words: initialWords }: Props) {

  const [words, setWords] = useState(initialWords);

  const fc = fetchCatch(getFiveWords)
    .before((level: TAvaliableLevels) => ({
      level,
    }))
    .then(setWords)

  return (
    <div>
      <div className="flex gap-3 mb-3">
        {AvailableLevels.map(level => <Button className="btn" onClick={fc.action(level)}>Load {level}</Button>)}
      </div>
      <ul>
        {words.map((w, i) => <li key={i}><DictLink word={{ id: w, word: w }} service="oxford" type="anchor" /></li>)}
      </ul>
    </div>
  );
}