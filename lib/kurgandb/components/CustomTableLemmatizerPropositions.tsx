import { RPC, JSONErrorResponse } from "@artempoletsky/easyrpc/client";
import { useErrorResponse, fetchCatch, useVars } from "@artempoletsky/easyrpc/react";
import { API_ENDPOINT } from "kdb/generated";
import { TableComponentProps, adminRPCCustom } from "kdb/globals";


import { ComponentType, ElementType, ReactElement, ReactNode, useEffect, useState } from "react";
import type { LemmatizerProposition } from "app/globals";
import { Button, ButtonProps, TextInputProps } from "@mantine/core";
import TextInput from "kdb/comp/TextInput";

import DictLink from "components/dictlink";


const {
  getUnreviewedLemmatizerPropositions: getData,
  resolveProposition,
  unreviewAll
} = adminRPCCustom().methods("getUnreviewedLemmatizerPropositions", "resolveProposition", "unreviewAll");


type Props = TableComponentProps & {
  unreviewed: LemmatizerProposition[];
}
export default function LemmatizerPropositions({ unreviewed: unreviewedInitial }: Props) {

  const [unreviewed, setUnreviewed] = useState(unreviewedInitial);

  function removeFirst() {

    if (unreviewed.length <= 0) {
      getData({ page: 1 });
    } else {
      setUnreviewed(unreviewed.slice(1));
    }
  }

  const [setErrorResponse, errorMessage, errorRes] = useErrorResponse();
  const fc = fetchCatch(resolveProposition)
    .then(removeFirst)
    .catch(setErrorResponse)
    .buttonComponent(Button);


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
      setUnreviewed(unreviewed.filter(e => e.id != removedId));
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

  const first: LemmatizerProposition = unreviewed && unreviewed[0] as any;

  const [{ black, white, ovrWord, ovrLemma }, h] = useVars({
    initialValues: {
      black: "",
      white: "",
      ovrWord: "",
      ovrLemma: "",
    },
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
    const first = unreviewed && unreviewed[0];
    if (first) {
      h.setAll({
        white: first.word,
        black: first.oldLemma,
        ovrLemma: first.proposition,
        ovrWord: first.word,
      });
    }
  }, [unreviewed]);

  const fcUnreview = fetchCatch(unreviewAll)
    .then(data => {
      setUnreviewed(data);
    })
    .catch(setErrorResponse)
    .buttonComponent(Button);

  const fcRefresh = fcUnreview.method(getData)
    .before(() => ({
      page: 1,
    }))
    .then(data => {
      setUnreviewed(data.unreviewed);
    });


  const isBlacklist = first && !first.proposition;


  return <div>
    To review: {unreviewed.length}
    <div className="mb-3 flex gap-3">
      {fcUnreview.button("Unreview all")}
      {fcRefresh.button("Refresh")}
    </div>
    {unreviewed.map(e => <div key={e.id} className="mb-1">
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