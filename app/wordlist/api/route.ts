import { NextPOST } from "@artempoletsky/easyrpc";
import { NextResponse } from "next/server";
import z from "zod";
import { OXFORD_LIST_LIGHT } from "~/lib/paths";
import { rfs } from "~/lib/util";
import { Word } from "../PageWordlist";

const ZEmpty = z.object({});

async function getOxfordList() {
  return {
    words: rfs(OXFORD_LIST_LIGHT) as Word[],
  }
}

export type FGetOxfordList = typeof getOxfordList;


export const POST = NextPOST(NextResponse, {
  getOxfordList: ZEmpty,
}, {
  getOxfordList,
});