import { NextPOST, ValidationRule, Validator } from "@artempoletsky/easyrpc";
import { NextResponse } from "next/server";
import { getTestWords } from "~/app/admin/wordlist/api/route";
import { DictRange, Levels } from "~/lib/language_levels";
import _ from "lodash";
import { query } from "~/db";

const AvailableLevels = ["a1", "a2", "b1", "b2", "c1", "all"] as const;
type AGetFiveWords = {
  level: typeof AvailableLevels[number];
};

const isLevelValid: Validator = async ({ value }) => {
  return AvailableLevels.includes(value) || `${value} is not a valid level`;
}

const VGetFiveWords: ValidationRule<AGetFiveWords> = {
  level: ["string", isLevelValid]
};

async function getFiveWords({ level }: AGetFiveWords): Promise<string[]> {
  let words: string[];
  if (level == "all") {
    const res = await getTestWords();
    let by_level: Record<string, string[]> = {};

    for (const word of res) {
      const level = word.level;
      if (!by_level[level]) {
        by_level[level] = [];
      }
      by_level[level].push(word.word);
    }

    words = DictRange.map(level => <string>_.sample(by_level[level]));
    return words;
  }

  return await query(({ test_words }, { payload, _ }) => {
    const allLevel = test_words.where("level", payload.level).select(doc => doc.word);
    return _.sampleSize(allLevel, 5);
  }, { level });
}

export type FGetFiveWords = typeof getFiveWords;

export const POST = NextPOST(NextResponse, {
  getFiveWords: VGetFiveWords
}, {
  getFiveWords
});