import { DictRange } from "lib/language_levels";
import z from "zod";

const zWord = z.string().min(1);
const zWordList = z.enum(DictRange);
export type WordlistsLevel = z.infer<typeof zWordList>;

export const addWords = z.object({
  words: z.array(zWord),
});

export const removeWords = z.object({
  words: z.array(zWord),
});

export const addWordlists = z.object({
  wordlists: z.array(zWordList),
});

export const removeWordlists = z.object({
  wordlists: z.array(zWordList),
});

export type AWords = z.infer<typeof addWords>;
export type AWordlists = z.infer<typeof addWordlists>;

export const modifyUserWords = z.object({
  addedWordlists: z.array(zWordList),
  removedWordlists: z.array(zWordList),
  added: z.array(zWord),
  removed: z.array(zWord),
});

export type AModifyUserWords = z.infer<typeof modifyUserWords>;

