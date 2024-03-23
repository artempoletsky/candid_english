import { NextPOST } from "@artempoletsky/easyrpc";
import { NextResponse } from "next/server";
import { DictRange } from "~/lib/language_levels";
import z from "zod";
import { methodFactory, query } from "~/db";

const AvailableLevels = [...DictRange, "all"] as const;

const ZFiveWords = z.object({
  level: z.enum(AvailableLevels),
});

export type AGetFiveWords = z.infer<typeof ZFiveWords>;

const getFiveWords = methodFactory<AGetFiveWords, string[]>(({ test_words }, { level }, { _ }) => {
  const levels = ["a1", "a2", "b1", "b2", "c1"] as const;

  let ids: string[];
  if (level == "all") {
    ids = levels.map(level => {
      return _.sample(test_words.indexIds("level", level)) as string;
    });
  } else {
    ids = _.sampleSize(test_words.indexIds("level", level), 5);
  }
  return test_words.where("id", ...ids).select(r => r.word);
});

export type FGetFiveWords = typeof getFiveWords;


async function getFiveWordsPage(payload: AGetFiveWords) {
  return {
    words: await getFiveWords(payload),
  }
}

export type FGetFiveWordsPage = typeof getFiveWordsPage;

export const POST = NextPOST({
  getFiveWords: ZFiveWords,
  getFiveWordsPage: ZFiveWords,
}, {
  getFiveWords,
  getFiveWordsPage,
});