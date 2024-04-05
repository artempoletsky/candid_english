import { NextPOST } from "@artempoletsky/easyrpc";
import { NextResponse } from "next/server";
import { getSession } from "app/session/session";
import { query } from "app/db";
import z from "zod";

const ZProposeAdjustment = z.object({
  proposition: z.string(),
  word: z.string(),
  sentence: z.string(),
  oldLemma: z.string(),
});

type AProposeAdjustment = z.infer<typeof ZProposeAdjustment>;

async function proposeAdjustment(args: AProposeAdjustment) {
  const sess = await getSession();

  const id: number = await query(({ lemmatizer_propositions }, payload) => {
    const id = lemmatizer_propositions.insert(payload);
    return id;
  }, {
    ...args,
    session_id: sess.id,
    reviewed: false,
    username: sess.user?.username || "",
  });
  return id;
}

export type FProposeAdjustment = typeof proposeAdjustment;

const API = {
  proposeAdjustment
};
export type API = typeof API;
export const POST = NextPOST({
  proposeAdjustment: ZProposeAdjustment
}, API);