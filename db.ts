import { Predicate, standAloneQuery } from "@artempoletsky/kurgandb"
import { PlainObject } from "../mydb/build/src/utils";
import { Table } from "@artempoletsky/kurgandb/table";
import { LanguageLevel } from "./lib/language_levels";


export type Tables = {
  test_records: Table<number, TestRecord>
  users: Table<string, User>
  arrays: Table<string, VariedArrays>
  test_words: Table<string, TestWord>
  test_questions: Table<string, TestQuestion>
  synonyms: Table<string, SynonymsData>
}

export async function query<Payload extends PlainObject>(predicate: Predicate<Tables, Payload>, payload?: Payload) {
  return standAloneQuery<Tables, Payload>(predicate, payload);
}

export function noPayloadQueryMethod(predicate: Predicate<Tables, {}>) {
  return async function () {
    return await query(predicate);
  }
}

export type TestRecord = {
  test: string
}

export type User = {
  fullName: string
  username: string
  email: string
  knownWords: string[]
  blacklist: string[]
}

export type VariedArrays = {
  name: string
  data: any[]
}

export type TestWord = {
  id: string
  word: string
  part: string
  level: LanguageLevel | "x"
  oxfordLevel: LanguageLevel
}

export type TestQuestion = {
  word: string
  template: string
  correctAnswers: string[]
  difficulty: LanguageLevel
  options: string[][]
}

type RelatedWords = {
  relevant: string[],
  other: string[],
  antonyms: string[],
}

export type SynonymsData = {
  word: string,
  data: Record<"verb" | "noun" | "adjective" | "other", RelatedWords>
}