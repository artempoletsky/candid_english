import { getAPIMethod, useErrorResponse, JSONErrorResponse } from "@artempoletsky/easyrpc/client";
import { API_ENDPOINT } from "~/app/kurgandb/generated";
import { TableComponentProps } from "~/app/kurgandb/globals";
import type { FGetUnreviewedLemmatizerPropositions, FResolvePropostion, FUnreviewAll } from "../api";
import { ComponentType, ElementType, ReactNode, useEffect, useState } from "react";
import useSWR from "swr";
import type { LemmatizerProposition } from "~/globals";
import { Button, ButtonProps, TextInputProps } from "@mantine/core";
import TextInput from "~/app/kurgandb/comp/TextInput";

import DictLink from "~/app/components/dictlink";
import { fetchCatch, useVars } from "@artempoletsky/easyrpc/client";

const getData = getAPIMethod<FGetUnreviewedLemmatizerPropositions>(API_ENDPOINT, "getUnreviewedLemmatizerPropositions");
const resolveProposition = getAPIMethod<FResolvePropostion>(API_ENDPOINT, "resolveProposition");
const unreviewAll = getAPIMethod<FUnreviewAll>(API_ENDPOINT, "unreviewAll");


export default function LemmatizerPropositions({ scheme }: TableComponentProps) {
  const swr = useSWR(" ", fetchCatch(getData).fetcher({ page: 1 }), {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    // revalidateOnMount: false,
  });


  function removeFirst() {
    if (!swr.data) throw new Error("error");
    if (swr.data.length <= 0) {
      getData({ page: 1 });
    } else {
      swr.mutate(swr.data.slice(1));
    }
  }

  const [setErrorResponse, errorMessage, errorRes] = useErrorResponse();
  const fc = fetchCatch(resolveProposition)
    .then(removeFirst)
    .catch(setErrorResponse)
    .buttonElement(Button);


  let removedId: number = 0;
  const deleteFromList = fetchCatch(resolveProposition)
    .before(({ id }: LemmatizerProposition) => {
      removedId = id;
      return {
        word: "",
        lemma: "",
        propositionId: id,
        list: "decline",
      }
    })
    .then(() => {
      if (!swr.data) throw new Error();
      swr.mutate(swr.data.filter(e => e.id != removedId), {
        revalidate: false,
      });
    })
    .catch(setErrorResponse);

  const blackFC = fc.before(() => ({
    word: black,
    lemma: "",
    propositionId: first.id,
    list: "black",
  }));

  const whiteFC = fc.before(() => ({
    word: white,
    lemma: "",
    propositionId: first.id,
    list: "white",
  }));

  const overrideFC = fc.before(() => ({
    word: ovrWord,
    lemma: ovrLemma,
    propositionId: first.id,
    list: "override",
  }));

  const declineFC = fc.before(() => ({
    word: "",
    lemma: "",
    propositionId: first.id,
    list: "decline",
  }));

  const first: LemmatizerProposition = swr.data && swr.data[0] as any;

  const [{ black, white, ovrWord, ovrLemma }, h] = useVars({
    placeholders: {
      black: "Blacklist",
      white: "Whitelist",
      ovrWord: "Override word",
      ovrLemma: "Override lemma",
    },
    Comp: TextInput,
    errorResponse: errorRes,
  });

  useEffect(() => {
    const first = swr.data && swr.data[0];
    if (first) {
      h.setAll({
        white: first.word,
        black: first.oldLemma,
        ovrLemma: first.word,
        ovrWord: first.proposition,
      });
    }
  }, [swr.data]);

  useEffect(() => {
    setErrorResponse(swr.error);
  }, [swr.error]);

  const fcUnreview = fetchCatch(unreviewAll)
    .then(data => {
      swr.mutate(data, { revalidate: false });
    })
    .catch(setErrorResponse)
    .buttonElement(Button);

  if (swr.isLoading) {
    return "Loading...";
  }
  if (swr.error || swr.data === undefined) {
    return errorMessage || "Error";
  }


  const isBlacklist = first && !first.proposition;


  return <div>
    To review: {swr.data.length}
    <div className="mb-3">
      {fcUnreview.button("Unreview all")}
    </div>
    {swr.data.map(e => <div className="mb-1">
      <Button onClick={deleteFromList.action(e)}>Remove {e.id}</Button>
    </div>)}
    {first && <div className="mt-4">
      <div className="mb-2">
        <p className="">Sentence: </p>
        <div dangerouslySetInnerHTML={{ __html: first.sentence }}></div>
      </div>
      <div className="">
        <label className="">Old lemma: </label>
        &#39;{first.oldLemma}&#39;
      </div>

      <div className="">
        <label className="">Proposition: </label>
        {isBlacklist ? "Not English" : <>&#39;{first.proposition}&#39;</>}
      </div>
      <div className="mb-3">
        <label className="">User: </label>
        &#39;{first.username}&#39;
      </div>

      <div className="">
        <div className="flex gap-3">
          <Button className="w-[110px]" onClick={whiteFC.action()}>Whitelist</Button>
          {h.input("white")}
        </div>
        <div className="flex gap-3">
          <Button className="w-[110px]" onClick={blackFC.action()}>Blacklist</Button>
          {h.input("black")}
          <DictLink
            className="mt-[5px]"
            word={{ id: black, word: `${black} on Oxford` }}
            type="anchor"
          />
        </div>
        <div className="flex gap-3">
          <Button className="w-[110px]" onClick={overrideFC.action()}>Override</Button>
          {h.input("ovrWord")} <span className="mt-[5px]">as</span>
          {h.input("ovrLemma")}
        </div>
        <div className="flex gap-3">
          <Button className="w-[110px]" onClick={declineFC.action()}>Decline</Button>
        </div>
      </div>
    </div>}
    <div className="text-red-500 min-h-[24px]">{errorMessage}</div>
  </div>
}