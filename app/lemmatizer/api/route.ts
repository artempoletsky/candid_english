import { NextPOST } from "@artempoletsky/easyrpc";
import { NextResponse } from "next/server";
import { getSession } from "~/app/session/route";
import { query } from "~/db";
import z from "zod";

const ZProposeAdjustment = z.object({
  proposition: z.string(),
  word: z.string(),
  sentence: z.string(),
  oldLemma: z.string(),
});

type AProposeAdjustment = z.infer<typeof ZProposeAdjustment>;

async function proposeAdjustment(args: AProposeAdjustment) {
  const sess = getSession();

  const id: number = await query(({ lemmatizer_propositions }, payload) => {
    const id = lemmatizer_propositions.insert(payload);
    return id;
  }, {
    ...args,
    session_id: sess.id,
    reviewed: false,
    username: sess.username || "",
  });
  return id;
}

export type FProposeAdjustment = typeof proposeAdjustment;

export const POST = NextPOST(NextResponse, {
  proposeAdjustment: ZProposeAdjustment
}, {
  proposeAdjustment
});