import { Predicate, standAloneQuery, remoteQuery } from "@artempoletsky/kurgandb"

import { Table } from "@artempoletsky/kurgandb/globals";
import { LanguageLevel } from "./lib/language_levels";
import { PlainObject } from "@artempoletsky/kurgandb/globals";


export type Tables = {
  test_records: Table<TestRecord, number>
  users: Table<User, string>
  arrays: Table<VariedArrays, string>
  test_words: Table<TestWord, string>
  test_questions: Table<TestQuestion, string>
  synonyms: Table<SynonymsData, string>
  lemmatizer_propositions: Table<LemmatizerProposition, number>
  user_rights: Table<UserRights, string>
}

export async function query<Payload extends PlainObject, ReturnType>(predicate: Predicate<Tables, Payload, ReturnType>, payload?: Payload) {
  return standAloneQuery<Payload, ReturnType, Tables>(predicate, payload);
}

export function noPayloadQueryMethod<ReturnType>(predicate: Predicate<Tables, {}, ReturnType>) {
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
  correctAnswers: number[]
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

export type LemmatizerProposition = {
  id: number
  word: string
  oldLemma: string
  proposition: string
  sentence: string
  reviewed: boolean
  username: string
  session_id: string
}

export type UserRights = {
  id: string
  isAdmin: boolean
  isModerator: boolean
}