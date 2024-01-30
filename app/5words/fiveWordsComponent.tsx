"use client";
import DictLink from "@/dictlink";
import useSWR from "swr";
import { getAPIMethod } from "@artempoletsky/easyrpc/client";
import type { FGetFiveWords } from "./api/route";
import { useEffect, useState } from "react";

export const AvailableLevels = ["a1", "a2", "b1", "b2", "c1", "all"] as const;

const getFiveWords: FGetFiveWords = getAPIMethod("/5words/api/", "getFiveWords");

export default function FiveWordsComponent() {

  // const host = headers().get("host");
  // const apiRes = await fetch("/admin/api/worldist_levels");
  // console.log(apiRes);
  const { data: words, isLoading, error, mutate } = useSWR("getFiveWords", () => getFiveWords({ level: "all" }));

  // const [words, setWords] = useState<string[]>([]);


  useEffect(() => {
    // if (data) setWords(data);
    // getFiveWords({ level: "all" }).then(mutate);
  }, []);

  if (isLoading) {
    return "loading...";
  }

  if (error || !words) {
    return "failed to load";
  }


  // setWords(data);
  return (
    <div>
      <div>
        {AvailableLevels.map(level => <button className="btn" onClick={() => getFiveWords({ level }).then((words) => {
          mutate(words, {
            "revalidate": false
          });
        })}>Load {level}</button>)}
      </div>
      <ul>
        {words.map((w, i) => <li key={i}><DictLink word={{ id: w, word: w }} service="oxford" type="anchor" /></li>)}
      </ul>
    </div>
  );
}